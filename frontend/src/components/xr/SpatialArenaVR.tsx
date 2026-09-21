// ============================================================================
// AlgoArena v6.0 - WebXR Spatial Computing Arena (Section 3)
// Immersive 3D VR/AR inspection table & spatial pathfinding frontier visualization
// ============================================================================

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { createXRStore, XR } from '@react-three/xr';

interface SpatialArenaVRProps {
  onClose?: () => void;
  activePath?: [number, number][];
}

export const SpatialArenaVR: React.FC<SpatialArenaVRProps> = ({ onClose, activePath }) => {
  const xrStore = useMemo(() => createXRStore(), []);

  // Demo holographic path if none provided
  const demoPath: [number, number, number][] = useMemo(() => {
    if (activePath && activePath.length > 0) {
      return activePath.map(([x, y]) => [(x - 12) * 0.15, 1.05, (y - 10) * 0.15]);
    }
    // S-curve trajectory
    const pts: [number, number, number][] = [];
    for (let t = 0; t <= 20; t++) {
      const x = (t - 10) * 0.18;
      const z = Math.sin(t * 0.3) * 1.2;
      pts.push([x, 1.05, z]);
    }
    return pts;
  }, [activePath]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col font-mono text-white">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h1 className="text-lg font-black tracking-wider text-cyan-300">
              WEBXR SPATIAL ARENA (V6.0)
            </h1>
            <p className="text-xs text-slate-400">
              Holographic 3D Inspection • Spatial Motion Controllers • 6-DOF Frontier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => xrStore.enterVR()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🥽</span> ENTER VR
          </button>

          <button
            onClick={() => xrStore.enterAR()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>📱</span> ENTER AR
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-600 text-xs transition-colors cursor-pointer"
            >
              ✕ EXIT SPATIAL
            </button>
          )}
        </div>
      </div>

      {/* 3D WebXR Viewport */}
      <div className="flex-1 w-full h-full">
        <Canvas camera={{ position: [0, 2.5, 3.5], fov: 60 }}>
          <XR store={xrStore}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 15, 10]} intensity={1.5} color="#38bdf8" />
            <pointLight position={[-10, 10, -10]} intensity={0.8} color="#a855f7" />

            {/* Holographic Table Base */}
            <mesh position={[0, 0.95, 0]}>
              <cylinderGeometry args={[2.2, 2.4, 0.1, 32]} />
              <meshStandardMaterial color="#030712" roughness={0.2} metalness={0.8} />
            </mesh>

            {/* Cyber Grid Hologram on Table */}
            <gridHelper args={[4, 20, '#06b6d4', '#1e293b']} position={[0, 1.01, 0]} />

            {/* Path Frontier Nodes */}
            {demoPath.map((pos, idx) => (
              <mesh key={idx} position={pos}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial
                  color={idx === 0 ? '#10b981' : idx === demoPath.length - 1 ? '#ef4444' : '#06b6d4'}
                  emissive={idx === 0 ? '#059669' : idx === demoPath.length - 1 ? '#dc2626' : '#0891b2'}
                  emissiveIntensity={0.8}
                />
              </mesh>
            ))}

            {/* Holographic Projection Pedestal Rings */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.5, 2.6, 64]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[3.0, 3.05, 64]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
            </mesh>
          </XR>
        </Canvas>
      </div>
    </div>
  );
};
