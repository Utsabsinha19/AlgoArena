import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';

export interface ColocationProps {
  roomSessionId: string;
  isHost: boolean;
  onClose?: () => void;
}

export const VisionOSColocation: React.FC<ColocationProps> = ({ roomSessionId, isHost, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchorsSynced, setAnchorsSynced] = useState<number>(3);
  const [hologramOpacity, setHologramOpacity] = useState<number>(0.4);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  useEffect(() => {
    console.log(`[VisionOSXR]: Initializing Spatial Anchor sync for room: ${roomSessionId}`);
  }, [roomSessionId]);

  const handleRecalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setAnchorsSynced((prev) => prev + 1);
      setIsCalibrating(false);
    }, 600);
  };

  return (
    <div ref={containerRef} className="w-full h-screen relative bg-black overflow-hidden select-none">
      {/* HUD Header */}
      <div className="absolute top-6 left-6 z-50 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 font-mono text-sm backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold tracking-wider">VISIONOS SPATIAL SESSION ACTIVE</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          ROOM ID: <span className="text-cyan-400 font-semibold">{roomSessionId}</span> | HOST:{' '}
          <span className={isHost ? 'text-amber-400 font-semibold' : 'text-purple-400'}>
            {isHost ? 'YES (ANCHOR MASTER)' : 'CLIENT (COLOCATED)'}
          </span>
        </p>
        <div className="mt-2 flex items-center space-x-4 text-xs text-slate-300">
          <span>Spatial Anchors: <strong className="text-emerald-400">{anchorsSynced} Synced</strong></span>
          <span>Refresh: <strong className="text-cyan-400">90 FPS (Apple M2 Vision-Pro)</strong></span>
        </div>
      </div>

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-50 flex items-center space-x-3">
        <button
          onClick={handleRecalibrate}
          disabled={isCalibrating}
          className="px-4 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-semibold hover:bg-cyan-900/80 transition-all flex items-center space-x-2 shadow-lg"
        >
          <span>{isCalibrating ? 'Recalibrating Anchors...' : 'Recalibrate Spatial Anchor'}</span>
        </button>
        <button
          onClick={() => setHologramOpacity((prev) => (prev > 0.5 ? 0.3 : 0.75))}
          className="px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-mono hover:bg-slate-800 transition-all shadow-lg"
        >
          Toggle Glow ({Math.round(hologramOpacity * 100)}%)
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono font-semibold hover:bg-red-900/80 transition-all shadow-lg"
          >
            Exit XR Colocation
          </button>
        )}
      </div>

      {/* 3D WebXR Holographic Canvas */}
      <Canvas camera={{ position: [0, 1.5, 3], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[0, 2, -1.5]} intensity={1.2} color="#00ffff" />

        {/* Holographic Colocation Pedestal */}
        <mesh position={[0, 0.8, -1.5]}>
          <cylinderGeometry args={[1.2, 1.4, 0.2, 32]} />
          <meshStandardMaterial color="#00ffff" wireframe transparent opacity={hologramOpacity} />
        </mesh>

        {/* Central Spatial Voxel Arena Grid */}
        <mesh position={[0, 0.95, -1.5]}>
          <boxGeometry args={[1.8, 0.05, 1.8]} />
          <meshStandardMaterial color="#0284c7" wireframe transparent opacity={0.5} />
        </mesh>

        {/* Holographic Agent Beacons */}
        <mesh position={[-0.4, 1.1, -1.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.4, 1.1, -1.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.8} />
        </mesh>
      </Canvas>
    </div>
  );
};
