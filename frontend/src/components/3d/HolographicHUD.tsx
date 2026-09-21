// ============================================================================
// AlgoArena v2.0 - Holographic HUD (Sci-Fi 2D Overlay for 3D Arena)
// ============================================================================

import React from 'react';
import { CameraMode } from '../../types';

interface HolographicHUDProps {
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  gridSize: [number, number];
  activeAlgorithm: string;
  fps?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
}

export const HolographicHUD: React.FC<HolographicHUDProps> = ({
  cameraMode,
  onCameraModeChange,
  gridSize,
  activeAlgorithm,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pointer-events-auto flex-wrap gap-2">
        {/* Arena Badge */}
        <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono shadow-md">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="text-cyan-800 font-bold uppercase tracking-wider">
            R3F 3D ARENA // INSTANCED MESH
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-purple-700 font-semibold uppercase">{activeAlgorithm}</span>
        </div>

        {/* Camera Perspective Presets & Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 text-xs font-mono shadow-md">
          <button
            onClick={() => onCameraModeChange('tactical')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              cameraMode === 'tactical'
                ? 'bg-cyan-100/90 text-cyan-800 border border-cyan-300 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🛰️ Tactical
          </button>
          <button
            onClick={() => onCameraModeChange('isometric')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              cameraMode === 'isometric'
                ? 'bg-purple-100/90 text-purple-800 border border-purple-300 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📐 Isometric
          </button>
          <button
            onClick={() => onCameraModeChange('runner')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              cameraMode === 'runner'
                ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🏃 Runner
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1" />

          {/* Dedicated Zoom Controls */}
          <button
            onClick={onZoomIn}
            title="Zoom In (or mouse scroll up / pinch)"
            aria-label="Zoom In"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-cyan-800 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 font-bold text-sm transition-all"
          >
            ➕
          </button>
          <button
            onClick={onZoomOut}
            title="Zoom Out (or mouse scroll down / spread)"
            aria-label="Zoom Out"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-cyan-800 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 font-bold text-sm transition-all"
          >
            ➖
          </button>
          <button
            onClick={onResetView}
            title="Reset Zoom & Orientation"
            aria-label="Reset View"
            className="px-2 py-1 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs transition-all border border-transparent hover:border-slate-200"
          >
            ⟲ Reset
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pointer-events-auto flex-wrap gap-2">
        {/* Holographic Legend */}
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 shadow-md">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" /> Monolith Wall
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-amber-600 inline-block" /> Gravity Well (Mud 5x)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" /> Plasma Hazard
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" /> Boost Field
          </span>
        </div>

        {/* Sector Telemetry & Interactive Zoom Tip */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-500 shadow-md">
            <span>🖱️ Scroll to Zoom • Drag to Orbit</span>
          </div>
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 shadow-md">
            DIM: <strong className="text-slate-900">{gridSize[0]} × {gridSize[1]}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
