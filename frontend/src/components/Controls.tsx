// ============================================
// AlgoArena - Enhanced Control Panel Component
// ============================================

import React from 'react';
import { GameMode, AlgorithmType, MODE_NAMES, ALGORITHM_NAMES, ViewEngine } from '../types';
import { ADAPTIVE_PRESETS, AdaptiveMapArchetype } from '../utils/adaptiveLevelGen';

interface ControlsProps {
  mode: GameMode;
  algorithm: AlgorithmType;
  speed: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  timeRemaining?: number;
  bossCountdown?: number;
  viewEngine: ViewEngine;
  onModeChange: (mode: GameMode) => void;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onSpeedChange: (speed: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onClear: () => void;
  onGetHint: () => void;
  onOpenFighterSelect: () => void;
  onOpenWorkshop: () => void;
  onOpenRelayDraft: () => void;
  onOpenMAPFStudio?: () => void;
  onOpenLeagueStudio?: () => void;
  onOpenFrontierStudio?: () => void;
  onLoadAdaptivePreset: (presetId: AdaptiveMapArchetype) => void;
  onToggleViewEngine: (engine: ViewEngine) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  mode,
  algorithm,
  speed,
  isRunning,
  isPaused,
  isComplete,
  timeRemaining,
  bossCountdown,
  viewEngine,
  onModeChange,
  onAlgorithmChange,
  onSpeedChange,
  onStart,
  onPause,
  onReset,
  onClear,
  onGetHint,
  onOpenFighterSelect,
  onOpenWorkshop,
  onOpenRelayDraft,
  onOpenMAPFStudio,
  onOpenLeagueStudio,
  onOpenFrontierStudio,
  onLoadAdaptivePreset,
  onToggleViewEngine,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl text-slate-800">
      {/* 2D vs 3D View Engine Switcher */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200">
        <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
          Arena Engine
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleViewEngine('2d')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              viewEngine === '2d'
                ? 'bg-white text-cyan-800 border border-cyan-300 shadow-sm shadow-cyan-500/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗺️ 2D Tactical
          </button>
          <button
            onClick={() => onToggleViewEngine('3d')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              viewEngine === '3d'
                ? 'bg-white text-purple-800 border border-purple-300 shadow-sm shadow-purple-500/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌐 3D Hologram
          </button>
        </div>
      </div>

      {/* Futuristic Feature Quick Launchers */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={onOpenFighterSelect}
          disabled={isRunning}
          title="Algorithm Fighter DNA & Stats"
          className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-xs overflow-hidden"
        >
          <span className="text-sm">🧬</span>
          <span className="truncate max-w-full">Fighters</span>
        </button>
        <button
          onClick={onOpenWorkshop}
          disabled={isRunning}
          title="Algorithm Parameter Workshop"
          className="p-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-xs overflow-hidden"
        >
          <span className="text-sm">🛠️</span>
          <span className="truncate max-w-full">Workshop</span>
        </button>
        <button
          onClick={onOpenRelayDraft}
          disabled={isRunning}
          title="Squad Relay Draft & Co-op Pathfinding"
          className="p-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-xs overflow-hidden"
        >
          <span className="text-sm">🏁</span>
          <span className="truncate max-w-full">Relay Draft</span>
        </button>
        <button
          onClick={onOpenMAPFStudio}
          disabled={isRunning}
          title="Multi-Agent Path Finding (MAPF)"
          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-xs overflow-hidden"
        >
          <span className="text-sm">🐝</span>
          <span className="truncate max-w-full">MAPF</span>
        </button>
        <button
          onClick={onOpenLeagueStudio}
          disabled={isRunning}
          title="Tournament League & Elo Standings"
          className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-xs overflow-hidden"
        >
          <span className="text-sm">🏆</span>
          <span className="truncate max-w-full">League</span>
        </button>
        <button
          onClick={onOpenFrontierStudio}
          disabled={isRunning}
          title="v7 Frontier Labs"
          className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-xs overflow-hidden"
        >
          <span className="text-sm">🌌</span>
          <span className="truncate max-w-full">v7 Frontier</span>
        </button>
      </div>

      {/* Game Mode Selector */}
      <div className="space-y-1.5">
        <label className="text-cyan-800 text-xs font-bold font-mono uppercase tracking-wider">
          Game Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
          {(Object.keys(MODE_NAMES) as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              disabled={isRunning}
              className={`
                px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left truncate
                ${mode === m
                  ? 'bg-cyan-600 text-white border border-cyan-600 shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {MODE_NAMES[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Algorithm Selector */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-purple-800 text-xs font-bold font-mono uppercase tracking-wider">
            Primary Vanguard
          </label>
          <button
            onClick={onOpenFighterSelect}
            className="text-[10px] text-cyan-700 hover:underline font-mono font-semibold"
          >
            Inspect DNA ↗
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
          {(Object.keys(ALGORITHM_NAMES) as AlgorithmType[]).map((a) => (
            <button
              key={a}
              onClick={() => onAlgorithmChange(a)}
              disabled={isRunning}
              className={`
                px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left truncate
                ${algorithm === a
                  ? 'bg-purple-600 text-white border border-purple-600 shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {ALGORITHM_NAMES[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Adaptive Map Presets (Counter-Testing) */}
      <div className="space-y-1.5">
        <label className="text-amber-800 text-xs font-bold font-mono uppercase tracking-wider">
          AI Adaptive Arena Presets
        </label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              onLoadAdaptivePreset(e.target.value as AdaptiveMapArchetype);
              e.target.value = '';
            }
          }}
          disabled={isRunning}
          defaultValue=""
          className="w-full px-3 py-2 rounded-xl bg-white text-slate-800 border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <option value="" disabled>Select Counter-Test Map...</option>
          {ADAPTIVE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.title} ({preset.tag})
            </option>
          ))}
        </select>
      </div>

      {/* Speed Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-700 font-semibold uppercase">Velocity</span>
          <span className="text-cyan-700 font-bold">{speed}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
          disabled={isRunning}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-50"
        />
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {!isRunning ? (
          <button
            onClick={onStart}
            disabled={isComplete}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold font-['Orbitron'] text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▶ Run Simulation
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold font-['Orbitron'] text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        )}

        <button
          onClick={onReset}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold font-['Orbitron'] text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20"
        >
          🔄 Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onClear}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold rounded-xl transition-all border border-slate-300"
        >
          🧹 Clear Path
        </button>
        <button
          onClick={onGetHint}
          disabled={isRunning}
          className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-mono text-xs font-semibold rounded-xl transition-all border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💡 AI Advice
        </button>
      </div>

      {/* Boss / Time Countdown Warning */}
      {(mode === 'timeAttack' || mode === 'boss') && (
        <div className={`p-2.5 rounded-xl border text-center font-mono ${mode === 'boss' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
          <div className="text-[10px] uppercase font-bold text-slate-600">
            {mode === 'boss' ? '💥 Sector Collapse Warning' : '⏱️ Mission Countdown'}
          </div>
          <div className="text-2xl font-black font-['Orbitron'] text-slate-900">
            {mode === 'boss' ? `${bossCountdown ?? 12}s until melt` : `${timeRemaining ?? 60}s`}
          </div>
        </div>
      )}
    </div>
  );
};
