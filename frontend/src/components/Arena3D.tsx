// ============================================
// AlgoArena - 3D Cyberpunk Holographic Arena (Three.js)
// ============================================

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GridState, Cell, DynamicObstacle, CameraMode } from '../types';

interface Arena3DProps {
  grid: GridState;
  dynamicObstacles?: DynamicObstacle[];
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  onCellClick?: (x: number, y: number, button: number) => void;
  onHoverCell?: (cell: Cell | null) => void;
  leadNode?: { x: number; y: number } | null;
  showHeatmap?: boolean;
}

export const Arena3D: React.FC<Arena3DProps> = ({
  grid,
  dynamicObstacles = [],
  cameraMode,
  onCameraModeChange,
  onCellClick,
  onHoverCell,
  leadNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameId = useRef<number | null>(null);

  // References for interactive raycasting
  const cellMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const laserBeamsGroupRef = useRef<THREE.Group | null>(null);
  const obstaclesGroupRef = useRef<THREE.Group | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const { width, height, cells } = grid;
  const CELL_3D_SIZE = 1.6;
  const halfW = (width * CELL_3D_SIZE) / 2;
  const halfH = (height * CELL_3D_SIZE) / 2;

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 600);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814); // Deep space cyberpunk void
    scene.fog = new THREE.FogExp2(0x050814, 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(0, 32, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Cyberpunk Lighting
    const ambient = new THREE.AmbientLight(0x182442, 1.2);
    scene.add(ambient);

    const cyanSpot = new THREE.SpotLight(0x00f3ff, 2.5, 120, Math.PI / 3, 0.5);
    cyanSpot.position.set(-halfW, 40, -halfH);
    cyanSpot.castShadow = true;
    scene.add(cyanSpot);

    const purpleSpot = new THREE.SpotLight(0xa855f7, 2.8, 120, Math.PI / 3, 0.5);
    purpleSpot.position.set(halfW, 40, halfH);
    purpleSpot.castShadow = true;
    scene.add(purpleSpot);

    const floorLight = new THREE.PointLight(0x00f3ff, 1.2, 50);
    floorLight.position.set(0, 10, 0);
    scene.add(floorLight);

    // Cyberpunk Grid Plane
    const gridHelper = new THREE.GridHelper(Math.max(width, height) * CELL_3D_SIZE * 1.5, 40, 0x00f3ff, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Groups for dynamic geometry
    const laserBeams = new THREE.Group();
    scene.add(laserBeams);
    laserBeamsGroupRef.current = laserBeams;

    const obstaclesGroup = new THREE.Group();
    scene.add(obstaclesGroup);
    obstaclesGroupRef.current = obstaclesGroup;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera slerp towards target camera position
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.06);
        cameraRef.current.lookAt(targetCamLookRef.current);
      }

      // Rotate lasers and beacons
      if (laserBeamsGroupRef.current) {
        laserBeamsGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
            child.rotation.y += delta * 1.5;
          }
        });
      }

      // Animate dynamic obstacles
      if (obstaclesGroupRef.current) {
        obstaclesGroupRef.current.children.forEach((obsMesh, i) => {
          obsMesh.rotation.y += delta * 2;
          obsMesh.position.y = 1.0 + Math.sin(elapsed * 4 + i) * 0.3;
        });
      }

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };
    animFrameId.current = requestAnimationFrame(animate);

    // Resize observer
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newRect = container.getBoundingClientRect();
      cameraRef.current.aspect = newRect.width / (newRect.height || 1);
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newRect.width, newRect.height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
    };
  }, [width, height]);

  // Update Camera Target based on Camera Mode or Lead Node
  useEffect(() => {
    const center = new THREE.Vector3(0, 0, 0);

    if (cameraMode === 'tactical') {
      // Top-down tactical view
      targetCamPosRef.current.set(0, Math.max(width, height) * 1.6, 0.01);
      targetCamLookRef.current.copy(center);
    } else if (cameraMode === 'isometric') {
      // 45° Cyberpunk angle
      targetCamPosRef.current.set(halfW * 0.9, Math.max(width, height) * 1.1, halfH * 1.5);
      targetCamLookRef.current.copy(center);
    } else if (cameraMode === 'runner' && leadNode) {
      // First-person drone chase view
      const leadX = leadNode.x * CELL_3D_SIZE - halfW;
      const leadZ = leadNode.y * CELL_3D_SIZE - halfH;
      targetCamPosRef.current.set(leadX - 3, 5, leadZ + 6);
      targetCamLookRef.current.set(leadX, 1, leadZ);
    } else {
      targetCamPosRef.current.set(halfW * 0.9, Math.max(width, height) * 1.1, halfH * 1.5);
      targetCamLookRef.current.copy(center);
    }
  }, [cameraMode, leadNode, width, height, halfW, halfH]);

  // Re-render cells & volumetric energy path when grid changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old meshes
    cellMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    cellMeshesRef.current.clear();

    const boxGeo = new THREE.BoxGeometry(CELL_3D_SIZE * 0.92, 1, CELL_3D_SIZE * 0.92);
    const cylinderGeo = new THREE.CylinderGeometry(CELL_3D_SIZE * 0.35, CELL_3D_SIZE * 0.35, 2.5, 16);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y][x];
        const posX = x * CELL_3D_SIZE - halfW;
        const posZ = y * CELL_3D_SIZE - halfH;

        let heightExtrusion = 0.15;
        let color = 0x131a30;
        let emissive = 0x000000;
        let emissiveIntensity = 0;
        let opacity = 0.9;
        let transparent = false;

        if (cell.type === 'wall') {
          heightExtrusion = 1.8;
          color = 0x334155;
          emissive = 0x1e293b;
          emissiveIntensity = 0.4;
        } else if (cell.type === 'water') {
          // Translucent cyber plasma barrier
          heightExtrusion = 0.35;
          color = 0x0284c7;
          emissive = 0x00f3ff;
          emissiveIntensity = 0.7;
          transparent = true;
          opacity = 0.65;
        } else if (cell.type === 'mud') {
          // Gravitational well (sunken, dense gold)
          heightExtrusion = 0.08;
          color = 0x78350f;
          emissive = 0xb45309;
          emissiveIntensity = 0.5;
        } else if (cell.type === 'boost') {
          // Elevated jump pad
          heightExtrusion = 0.3;
          color = 0x059669;
          emissive = 0x10b981;
          emissiveIntensity = 1.0;
        } else if (cell.type === 'start') {
          heightExtrusion = 0.5;
          color = 0x22c55e;
          emissive = 0x22c55e;
          emissiveIntensity = 1.2;
        } else if (cell.type === 'end') {
          heightExtrusion = 0.5;
          color = 0xf43f5e;
          emissive = 0xf43f5e;
          emissiveIntensity = 1.2;
        }

        // Highlight visited nodes with neon energy
        if (cell.isVisited && cell.type !== 'start' && cell.type !== 'end' && cell.type !== 'wall') {
          color = 0x0284c7;
          emissive = 0x06b6d4;
          emissiveIntensity = 0.8;
          heightExtrusion = Math.max(heightExtrusion, 0.25);
        }

        // Highlight solution path with intense golden-cyan glow
        if (cell.isPath && cell.type !== 'start' && cell.type !== 'end') {
          color = 0x00f3ff;
          emissive = 0x00ffff;
          emissiveIntensity = 1.5;
          heightExtrusion = 0.45;
        }

        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity,
          roughness: 0.3,
          metalness: 0.8,
          transparent,
          opacity,
        });

        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.scale.set(1, heightExtrusion, 1);
        mesh.position.set(posX, heightExtrusion / 2, posZ);
        mesh.castShadow = heightExtrusion > 0.5;
        mesh.receiveShadow = true;
        mesh.userData = { x, y, cell };

        scene.add(mesh);
        cellMeshesRef.current.set(`${x},${y}`, mesh);

        // Add vertical holographic beacons for start and end
        if (cell.type === 'start' || cell.type === 'end') {
          const beaconMat = new THREE.MeshBasicMaterial({
            color: cell.type === 'start' ? 0x22c55e : 0xf43f5e,
            transparent: true,
            opacity: 0.7,
            wireframe: true,
          });
          const beacon = new THREE.Mesh(cylinderGeo, beaconMat);
          beacon.position.set(posX, 1.4, posZ);
          scene.add(beacon);
          cellMeshesRef.current.set(`beacon_${x},${y}`, beacon);
        }
      }
    }

    // Build Volumetric Solution Laser Ribbon
    if (laserBeamsGroupRef.current) {
      laserBeamsGroupRef.current.clear();

      const pathCells: { x: number; y: number }[] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (cells[y][x].isPath) {
            pathCells.push({ x, y });
          }
        }
      }

      if (pathCells.length > 1) {
        // Construct curve points
        const points = pathCells.map(p => new THREE.Vector3(
          p.x * CELL_3D_SIZE - halfW,
          0.8,
          p.y * CELL_3D_SIZE - halfH
        ));

        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, points.length * 4, 0.18, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          wireframe: false,
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        laserBeamsGroupRef.current.add(tubeMesh);

        // Halo outer wireframe
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          wireframe: true,
          transparent: true,
          opacity: 0.5,
        });
        const haloMesh = new THREE.Mesh(tubeGeo, haloMat);
        haloMesh.scale.set(1.4, 1.4, 1.4);
        laserBeamsGroupRef.current.add(haloMesh);
      }
    }
  }, [cells, width, height, halfW, halfH]);

  // Update Dynamic Obstacles in 3D
  useEffect(() => {
    if (!obstaclesGroupRef.current) return;
    const group = obstaclesGroupRef.current;
    group.clear();

    const sphereGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true });

    dynamicObstacles.forEach((obs) => {
      const posX = obs.x * CELL_3D_SIZE - halfW;
      const posZ = obs.y * CELL_3D_SIZE - halfH;

      const mesh = new THREE.Mesh(sphereGeo, laserMat);
      mesh.position.set(posX, 1.2, posZ);
      group.add(mesh);

      if (obs.isLaser) {
        // Red laser hazard line
        const lineGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
        const laserCylinder = new THREE.Mesh(lineGeo, lineMat);
        laserCylinder.position.set(posX, 1.2, posZ);
        laserCylinder.rotation.z = Math.PI / 2;
        group.add(laserCylinder);
      }
    });
  }, [dynamicObstacles, halfW, halfH]);

  // Interactive Raycasting for clicking & hovering cells
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const meshes = Array.from(cellMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData && typeof hit.userData.x === 'number') {
        onCellClick?.(hit.userData.x, hit.userData.y, e.button);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const meshes = Array.from(cellMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData?.cell) {
        onHoverCell?.(hit.userData.cell);
        return;
      }
    }
    onHoverCell?.(null);
  };

  return (
    <div className="relative w-full h-[560px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 bg-slate-950">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="w-full h-full cursor-crosshair"
      />

      {/* Cyberpunk HUD Overlay Header */}
      <div className="absolute top-3 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-cyan-300 font-bold uppercase tracking-wider">Holographic 3D Arena</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300">Three.js WebGL Engine</span>
      </div>

      {/* Camera Mode Switcher Buttons */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 text-xs font-medium">
        <button
          onClick={() => onCameraModeChange('tactical')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            cameraMode === 'tactical'
              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🛰️ Top-Down
        </button>
        <button
          onClick={() => onCameraModeChange('isometric')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            cameraMode === 'isometric'
              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📐 45° Isometric
        </button>
        <button
          onClick={() => onCameraModeChange('runner')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            cameraMode === 'runner'
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🏃 Node Runner
        </button>
      </div>

      {/* 3D Legend Pill */}
      <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" /> Monolith Wall</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-700 inline-block" /> Mud (5x Cost)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" /> Plasma Barrier</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Boost Pad</span>
      </div>
    </div>
  );
};
