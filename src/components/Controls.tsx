// ============================================
// AlgoArena - Control Panel Component
// ============================================

import { GameMode, AlgorithmType, MODE_NAMES, ALGORITHM_NAMES } from '../types';

interface ControlsProps {
  mode: GameMode;
  algorithm: AlgorithmType;
  speed: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  timeRemaining?: number;
  onModeChange: (mode: GameMode) => void;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onSpeedChange: (speed: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onClear: () => void;
  onGetHint: () => void;
}

export function Controls({
  mode,
  algorithm,
  speed,
  isRunning,
  isPaused,
  isComplete,
  timeRemaining,
  onModeChange,
  onAlgorithmChange,
  onSpeedChange,
  onStart,
  onPause,
  onReset,
  onClear,
  onGetHint,
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20">
      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
          Game Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MODE_NAMES) as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              disabled={isRunning}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${mode === m 
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300'
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
      <div className="space-y-2">
        <label className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
          Algorithm
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ALGORITHM_NAMES) as AlgorithmType[]).map((a) => (
            <button
              key={a}
              onClick={() => onAlgorithmChange(a)}
              disabled={isRunning}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${algorithm === a 
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {ALGORITHM_NAMES[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Slider */}
      <div className="space-y-2">
        <label className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
          Animation Speed: {speed}%
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
          disabled={isRunning}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
        />
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            disabled={isComplete}
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all duration-200 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▶️ Start
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-yellow-500/30"
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
        )}
        
        <button
          onClick={onReset}
          className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-lg hover:from-red-400 hover:to-rose-500 transition-all duration-200 shadow-lg shadow-red-500/30"
        >
          🔄 Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onClear}
          className="px-4 py-2 bg-slate-700/50 text-slate-300 font-medium rounded-lg hover:bg-slate-600/50 transition-all duration-200 border border-slate-600/50"
        >
          🧹 Clear Path
        </button>
        <button
          onClick={onGetHint}
          disabled={isRunning}
          className="px-4 py-2 bg-purple-700/50 text-purple-300 font-medium rounded-lg hover:bg-purple-600/50 transition-all duration-200 border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💡 AI Hint
        </button>
      </div>

      {/* Time Attack Timer */}
      {mode === 'timeAttack' && (
        <div className="mt-2 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
          <div className="text-center">
            <div className="text-red-400 text-sm font-medium">Time Remaining</div>
            <div className={`text-3xl font-bold font-mono ${timeRemaining && timeRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeRemaining ?? 60}s
            </div>
          </div>
        </div>
      )}

      {/* Mode Instructions */}
      <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="text-xs text-slate-400">
          {mode === 'classic' && '🎯 Find the shortest path from start to end.'}
          {mode === 'battle' && '⚔️ Compete against AI! Choose your algorithm wisely.'}
          {mode === 'timeAttack' && '⏱️ Solve the maze before time runs out!'}
          {mode === 'dynamic' && '🌍 Obstacles move! Adapt your strategy.'}
          {mode === 'learning' && '🧠 Learn step-by-step how algorithms work.'}
        </div>
      </div>
    </div>
  );
}
