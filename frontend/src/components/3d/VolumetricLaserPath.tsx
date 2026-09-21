// ============================================================================
// AlgoArena v3.0 - Volumetric Laser Solution Path (GLSL Shader Material)
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createLaserShaderMaterial } from '../../shaders/LaserPathShader';

interface VolumetricLaserPathProps {
  path: { x: number; y: number }[];
  gridSize: [number, number];
  cellSize?: number;
  glowColor?: string;
}

export const VolumetricLaserPath: React.FC<VolumetricLaserPathProps> = ({
  path,
  gridSize,
  cellSize = 1.0,
  glowColor = '#00ffff',
}) => {
  const shaderMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const outerTubeRef = useRef<THREE.Mesh>(null!);

  const shaderMaterial = useMemo(() => {
    const mat = createLaserShaderMaterial(glowColor, 2.8);
    shaderMatRef.current = mat;
    return mat;
  }, [glowColor]);

  const { curve, points } = useMemo(() => {
    if (path.length < 2) return { curve: null, points: [] };

    const pts = path.map(p => new THREE.Vector3(
      (p.x - gridSize[0] / 2) * cellSize,
      0.45,
      (p.y - gridSize[1] / 2) * cellSize
    ));

    return {
      curve: new THREE.CatmullRomCurve3(pts),
      points: pts,
    };
  }, [path, gridSize, cellSize]);

  // Update GLSL uniform uTime each frame
  useFrame((state) => {
    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (outerTubeRef.current) {
      const s = 1.0 + Math.sin(state.clock.elapsedTime * 6) * 0.12;
      outerTubeRef.current.scale.set(s, s, s);
    }
  });

  if (!curve || points.length < 2) return null;

  return (
    <group>
      {/* Primary GLSL Laser Path with Fresnel Edges & Energy Pulse */}
      <mesh material={shaderMaterial}>
        <tubeGeometry args={[curve, Math.max(30, points.length * 6), 0.16, 12, false]} />
      </mesh>

      {/* Outer Volumetric Electric Halo */}
      <mesh ref={outerTubeRef}>
        <tubeGeometry args={[curve, Math.max(20, points.length * 4), 0.28, 8, false]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.45}
          wireframe
        />
      </mesh>
    </group>
  );
};

