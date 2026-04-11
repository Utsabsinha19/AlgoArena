// ============================================
// AlgoArena - Learning Mode Panel
// ============================================

import { AlgorithmStep, AlgorithmType, ALGORITHM_NAMES } from '../types';
import { getAlgorithmExplanation } from '../algorithms/aiSelector';
import { GridState } from '../types';

interface LearningPanelProps {
  steps: AlgorithmStep[];
  currentStep: number;
  algorithm: AlgorithmType;
  grid: GridState;
  isRunning: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpToStep: (step: number) => void;
}

export function LearningPanel({
  steps,
  currentStep,
  algorithm,
  grid,
  isRunning,
}: LearningPanelProps) {
  const currentStepData = steps[currentStep];
  const explanation = getAlgorithmExplanation(algorithm, grid);
  const progress = steps.length > 0 ? (currentStep / steps.length) * 100 : 0;

  return (
    <div className="p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-purple-500/20 space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-2xl">🧠</div>
        <h3 className="text-purple-400 text-sm font-semibold uppercase tracking-wider">
          Learning Mode
        </h3>
      </div>

      {/* Algorithm Explanation */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="text-xs text-slate-400 mb-1">About {ALGORITHM_NAMES[algorithm]}</div>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">
          {explanation}
        </p>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Progress</span>
          <span className="text-purple-400">{currentStep} / {steps.length}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      {currentStepData && (
        <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${
              currentStepData.type === 'visit' ? 'bg-cyan-400' :
              currentStepData.type === 'path' ? 'bg-green-400' :
              currentStepData.type === 'explore' ? 'bg-yellow-400' :
              'bg-purple-400'
            }`} />
            <span className="text-xs text-purple-300 uppercase font-medium">
              {currentStepData.type}
            </span>
          </div>
          <p className="text-sm text-white">
            {currentStepData.description}
          </p>
          {currentStepData.currentCost !== undefined && (
            <div className="mt-2 text-xs text-slate-400">
              Current Cost: <span className="text-cyan-400">{currentStepData.currentCost.toFixed(2)}</span>
            </div>
          )}
          {currentStepData.queue && currentStepData.queue.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-slate-400 mb-1">Queue ({currentStepData.queue.length} items)</div>
              <div className="flex flex-wrap gap-1">
                {currentStepData.queue.slice(0, 10).map((cell, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
                    ({cell.x}, {cell.y})
                  </span>
                ))}
                {currentStepData.queue.length > 10 && (
                  <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-500">
                    +{currentStepData.queue.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex gap-2">
        <button
          disabled={currentStep === 0 || isRunning}
          className="flex-1 px-3 py-2 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⏮️ Previous
        </button>
        <button
          disabled={currentStep >= steps.length || isRunning}
          className="flex-1 px-3 py-2 bg-purple-700/50 text-purple-300 text-sm font-medium rounded-lg hover:bg-purple-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next ⏭️
        </button>
      </div>

      {/* Legend */}
      <div className="p-3 bg-slate-800/30 rounded-lg">
        <div className="text-xs text-slate-400 mb-2">Legend</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-cyan-400" />
            <span className="text-slate-300">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-400" />
            <span className="text-slate-300">Path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-400" />
            <span className="text-slate-300">Exploring</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-purple-400" />
            <span className="text-slate-300">Found</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="text-xs text-slate-500 p-2 bg-slate-800/30 rounded">
        💡 Tip: Watch how the algorithm explores cells and builds the optimal path step by step.
      </div>
    </div>
  );
}
