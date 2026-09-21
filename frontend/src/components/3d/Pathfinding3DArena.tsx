// ============================================================================
// AlgoArena v2.0 - React Three Fiber 3D Holographic Arena
// High-Performance InstancedMesh Engine
// ============================================================================

import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GridState, CameraMode, DynamicObstacle } from '../../types';
import { NODE_STATE_BYTE } from '../../types/algoArena';
import { VolumetricLaserPath } from './VolumetricLaserPath';
import { HolographicHUD } from './HolographicHUD';
import { use3DArenaControls } from '../../hooks/use3DArenaControls';

interface Pathfinding3DArenaProps {
  grid: GridState;
  dynamicObstacles?: DynamicObstacle[];
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  onCellClick?: (x: number, y: number, button: number) => void;
  onHoverCell?: (cell: import('../../types').Cell | null) => void;
  leadNode?: { x: number; y: number } | null;
  activeAlgorithm?: string;
}

// Internal scene component containing InstancedMesh & R3F hooks
function ArenaScene({
  grid,
  dynamicObstacles = [],
  cameraMode,
  leadNode,
  onCellClick,
  onRegisterControls,
}: {
  grid: GridState;
  dynamicObstacles?: DynamicObstacle[];
  cameraMode: CameraMode;
  leadNode?: { x: number; y: number } | null;
  onCellClick?: (x: number, y: number, button: number) => void;
  onRegisterControls?: (api: { zoomIn: () => void; zoomOut: () => void; resetView: () => void }) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { width, height, cells } = grid;
  const totalCells = width * height;

  const {
    controlsRef,
    updateCameraStep,
    stopTransition,
    zoomIn,
    zoomOut,
    resetView,
    defaultPosition,
  } = use3DArenaControls({
    gridWidth: width,
    gridHeight: height,
    mode: cameraMode,
    leadNode,
  });

  useEffect(() => {
    onRegisterControls?.({ zoomIn, zoomOut, resetView });
  }, [onRegisterControls, zoomIn, zoomOut, resetView]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorHelper = useMemo(() => new THREE.Color(), []);

  // Compute typed nodeStates Uint8Array representation
  const { nodeStates, pathCoords, gravityWells } = useMemo(() => {
    const states = new Uint8Array(width * height);
    const path: { x: number; y: number }[] = [];
    const wells: { x: number; y: number }[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const cell = cells[y][x];

        if (cell.type === 'wall') {
          states[idx] = NODE_STATE_BYTE.WALL;
        } else if (cell.type === 'water') {
          states[idx] = NODE_STATE_BYTE.WATER;
        } else if (cell.type === 'mud') {
          states[idx] = NODE_STATE_BYTE.MUD;
          wells.push({ x, y });
        } else if (cell.type === 'boost') {
          states[idx] = NODE_STATE_BYTE.BOOST;
        } else if (cell.type === 'start') {
          states[idx] = NODE_STATE_BYTE.START;
        } else if (cell.type === 'end') {
          states[idx] = NODE_STATE_BYTE.END;
        } else if (cell.isPath) {
          states[idx] = NODE_STATE_BYTE.PATH;
        } else if (cell.isVisited) {
          states[idx] = NODE_STATE_BYTE.VISITED;
        } else {
          states[idx] = NODE_STATE_BYTE.EMPTY;
        }

        if (cell.isPath) {
          path.push({ x, y });
        }
      }
    }

    return { nodeStates: states, pathCoords: path, gravityWells: wells };
  }, [cells, width, height]);

  // Update InstancedMesh matrices and colors
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const state = nodeStates[idx];

        const posX = x - width / 2;
        const posZ = y - height / 2;

        let scaleY = 0.15;
        let posY = 0.075;
        let hexColor = '#ffffff'; // Clean white floor tile

        switch (state) {
          case NODE_STATE_BYTE.WALL:
            scaleY = 1.6;
            posY = 0.8;
            hexColor = '#334155'; // Dark slate monolith
            break;
          case NODE_STATE_BYTE.WATER:
            scaleY = 0.3;
            posY = 0.15;
            hexColor = '#0284c7';
            break;
          case NODE_STATE_BYTE.MUD:
            scaleY = 0.08;
            posY = 0.04;
            hexColor = '#d97706';
            break;
          case NODE_STATE_BYTE.BOOST:
            scaleY = 0.25;
            posY = 0.125;
            hexColor = '#059669';
            break;
          case NODE_STATE_BYTE.START:
            scaleY = 0.5;
            posY = 0.25;
            hexColor = '#16a34a';
            break;
          case NODE_STATE_BYTE.END:
            scaleY = 0.5;
            posY = 0.25;
            hexColor = '#e11d48';
            break;
          case NODE_STATE_BYTE.PATH:
            scaleY = 0.35;
            posY = 0.175;
            hexColor = '#7c3aed';
            break;
          case NODE_STATE_BYTE.VISITED:
            scaleY = 0.22;
            posY = 0.11;
            hexColor = '#93c5fd';
            break;
        }

        dummy.position.set(posX, posY, posZ);
        dummy.scale.set(0.92, scaleY, 0.92);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);

        colorHelper.set(hexColor);
        mesh.setColorAt(idx, colorHelper);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodeStates, width, height, dummy, colorHelper]);

  // Smooth camera orientation transition using use3DArenaControls
  useFrame(({ camera }) => {
    updateCameraStep(camera, cameraMode, leadNode, cameraMode === 'runner' ? 0.08 : 0.05);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={defaultPosition} fov={48} />
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        zoomSpeed={1.2}
        enablePan={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={250}
        maxPolarAngle={Math.PI / 2.05}
        onStart={stopTransition}
      />

      {/* Crisp Studio Lighting for Light Theme */}
      <ambientLight intensity={0.85} color="#ffffff" />
      <directionalLight position={[15, 25, 15]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-15, 20, -15]} intensity={0.6} color="#e0e7ff" />
      <pointLight position={[0, 10, 0]} intensity={0.8} color="#6366f1" distance={50} />

      {/* High-Performance InstancedMesh Grid */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalCells]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) {
            const x = e.instanceId % width;
            const y = Math.floor(e.instanceId / width);
            onCellClick?.(x, y, 0);
          }
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.35} metalness={0.15} />
      </instancedMesh>

      {/* Dynamic Gravity Wells (Inverted funnel 3D cone geometry) */}
      {gravityWells.map((well) => (
        <group key={`${well.x},${well.y}`} position={[well.x - width / 2, 0.05, well.y - height / 2]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.42, 0.45, 12, 1, true]} />
            <meshBasicMaterial color="#b45309" wireframe transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.45, 16]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Start and Goal Vertical Holographic Beacons */}
      {grid.start && (
        <mesh position={[grid.start.x - width / 2, 1.2, grid.start.y - height / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 2.4, 16]} />
          <meshBasicMaterial color="#16a34a" wireframe transparent opacity={0.75} />
        </mesh>
      )}
      {grid.end && (
        <mesh position={[grid.end.x - width / 2, 1.2, grid.end.y - height / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 2.4, 16]} />
          <meshBasicMaterial color="#e11d48" wireframe transparent opacity={0.75} />
        </mesh>
      )}

      {/* Volumetric Glowing Laser Ribbon */}
      <VolumetricLaserPath path={pathCoords} gridSize={[width, height]} glowColor="#7c3aed" />

      {/* Dynamic Moving Hazard Drones */}
      {dynamicObstacles.map((obs) => (
        <mesh key={obs.id} position={[obs.x - width / 2, 0.8, obs.y - height / 2]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#e11d48" wireframe />
        </mesh>
      ))}
    </>
  );
}

export const Pathfinding3DArena: React.FC<Pathfinding3DArenaProps> = ({
  grid,
  dynamicObstacles = [],
  cameraMode,
  onCameraModeChange,
  onCellClick,
  leadNode,
  activeAlgorithm = 'A* Search',
}) => {
  const [controlsApi, setControlsApi] = React.useState<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
  } | null>(null);

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100/80">
      {/* Sci-Fi 2D Holographic HUD Overlay */}
      <HolographicHUD
        cameraMode={cameraMode}
        onCameraModeChange={onCameraModeChange}
        gridSize={[grid.width, grid.height]}
        activeAlgorithm={activeAlgorithm}
        onZoomIn={controlsApi?.zoomIn}
        onZoomOut={controlsApi?.zoomOut}
        onResetView={controlsApi?.resetView}
      />

      {/* React Three Fiber WebGL Canvas */}
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#e2e8f0']} />
        <fogExp2 attach="fog" args={['#e2e8f0', 0.008]} />
        <ArenaScene
          grid={grid}
          dynamicObstacles={dynamicObstacles}
          cameraMode={cameraMode}
          leadNode={leadNode}
          onCellClick={onCellClick}
          onRegisterControls={setControlsApi}
        />
      </Canvas>
    </div>
  );
};
