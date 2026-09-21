// ============================================================================
// AlgoArena v3.0 - Time Scrub Bar HUD (Section 7)
// Non-blocking time-dilation scrubber with step forward/backward & rate tuning
// ============================================================================

import React from 'react';

interface TimeScrubBarProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  executionTimeMs?: number;
}

export const TimeScrubBar: React.FC<TimeScrubBarProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onSeek,
  onSpeedChange,
  executionTimeMs = 0,
}) => {
  if (totalSteps <= 0) return null;

  const speedOptions = [0.25, 0.5, 1.0, 2.0, 4.0];
  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-4 text-slate-800">
      <div className="flex flex-col gap-3">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
            <span className="text-cyan-800 font-bold uppercase tracking-wider">TIME DILATION SCRUBBER</span>
            <span className="text-slate-500">| Step {currentStep + 1} of {totalSteps}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>T-Elapsed: <span className="text-cyan-700 font-bold">{executionTimeMs.toFixed(1)}ms</span></span>
            <span>Rate: <span className="text-purple-700 font-bold">{playbackSpeed}x</span></span>
          </div>
        </div>

        {/* Progress Scrub Slider */}
        <div className="relative flex items-center group">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            style={{
              background: `linear-gradient(to right, #0284c7 0%, #7c3aed ${progressPercent}%, #e2e8f0 ${progressPercent}%, #e2e8f0 100%)`,
            }}
          />
        </div>

        {/* Controls Ribbon */}
        <div className="flex items-center justify-between pt-1">
          {/* Playback Transport Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onStepBackward}
              disabled={currentStep <= 0}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-mono flex items-center gap-1 shadow-xs"
              title="Step Backward"
            >
              ⏮ Step -1
            </button>

            <button
              onClick={onPlayPause}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm text-white ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </button>

            <button
              onClick={onStepForward}
              disabled={currentStep >= totalSteps - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-mono flex items-center gap-1 shadow-xs"
              title="Step Forward"
            >
              Step +1 ⏭
            </button>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                  playbackSpeed === speed
                    ? 'bg-cyan-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
