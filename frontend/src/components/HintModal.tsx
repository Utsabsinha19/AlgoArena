// ============================================
// AlgoArena - AI Hint Modal Component
// ============================================

import { AISuggestion, ALGORITHM_NAMES } from '../types';

interface HintModalProps {
  suggestion: AISuggestion | null;
  onClose: () => void;
  onApply: () => void;
}

export function HintModal({ suggestion, onClose, onApply }: HintModalProps) {
  if (!suggestion) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Suggestion</h2>
            <p className="text-sm text-purple-400">Based on grid analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Recommended Algorithm */}
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-xl border border-purple-500/20">
            <div className="text-sm text-slate-400 mb-1">Recommended Algorithm</div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {ALGORITHM_NAMES[suggestion.algorithm]}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-xs text-slate-500">Confidence:</div>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  style={{ width: `${suggestion.confidence * 100}%` }}
                />
              </div>
              <div className="text-xs text-cyan-400">
                {(suggestion.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="text-sm text-slate-400 mb-2">Reasoning</div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {suggestion.reason}
            </p>
          </div>

          {/* Grid Analysis */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500">Obstacle Density</div>
              <div className="text-lg font-bold text-cyan-400">
                {(suggestion.factors.obstacleDensity * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500">Avg. Terrain Cost</div>
              <div className="text-lg font-bold text-yellow-400">
                {suggestion.factors.avgCost.toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500">Distance</div>
              <div className="text-lg font-bold text-green-400">
                {suggestion.factors.distance} cells
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500">Complexity</div>
              <div className="text-lg font-bold text-purple-400">
                {suggestion.factors.complexity.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:from-purple-400 hover:to-cyan-400 transition-colors shadow-lg shadow-purple-500/30"
          >
            Apply Suggestion
          </button>
        </div>
      </div>
    </div>
  );
}
