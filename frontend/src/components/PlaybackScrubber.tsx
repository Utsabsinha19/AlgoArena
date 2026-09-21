// ============================================
// AlgoArena - Time-Dilation & Precision Playback Scrubber
// ============================================

import React from 'react';
import { playSound } from '../utils/sounds';

interface PlaybackScrubberProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMultiplier: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onScrub: (step: number) => void;
  onSpeedMultiplierChange: (speed: number) => void;
}

const SPEED_PRESETS = [0.1, 0.5, 1.0, 2.0, 5.0];

export const PlaybackScrubber: React.FC<PlaybackScrubberProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speedMultiplier,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onScrub,
  onSpeedMultiplierChange,
}) => {
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const handleStepPrev = () => {
    onStepBackward();
    playSound('step');
  };

  const handleStepNext = () => {
    onStepForward();
    playSound('step');
  };

  return (
    <div className="flex flex-col gap-2 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md text-slate-800">
      {/* Top Row: Controls & Stats */}
      <div className="flex items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStepPrev}
            disabled={currentStep <= 0}
            title="Step Backward (0.1x Frame)"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-all border border-slate-200 shadow-xs"
          >
            ⏮
          </button>

          <button
            onClick={onPlayPause}
            className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm text-white ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-cyan-600 hover:bg-cyan-700'
            }`}
          >
            <span>{isPlaying ? '⏸ PAUSE' : '▶ PLAY'}</span>
          </button>

          <button
            onClick={handleStepNext}
            disabled={currentStep >= totalSteps && totalSteps > 0}
            title="Step Forward (0.1x Frame)"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-all border border-slate-200 shadow-xs"
          >
            ⏭
          </button>
        </div>

        {/* Step Counter Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
          <span className="text-cyan-700 font-bold">FRAME:</span>
          <span className="font-semibold text-slate-900">{currentStep}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">{totalSteps > 0 ? totalSteps : '0'}</span>
        </div>

        {/* Time-Dilation Speed Presets */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 font-semibold">Rate:</span>
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onSpeedMultiplierChange(preset)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-all ${
                speedMultiplier === preset
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrub Timeline Bar */}
      <div className="relative flex items-center pt-1">
        <input
          type="range"
          min="0"
          max={totalSteps > 0 ? totalSteps : 100}
          value={currentStep}
          onChange={(e) => onScrub(parseInt(e.target.value, 10))}
          className="w-full h-2 rounded-lg bg-slate-200 accent-cyan-600 cursor-pointer"
        />
        <div
          className="absolute left-0 top-1 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg pointer-events-none opacity-50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
