// ============================================================================
// AlgoArena v2.0 - Live Parameter Tuning Sliders (Section 2.1)
// ============================================================================

import React from 'react';
import { AlgorithmTuningConfig, AlgorithmType } from '../../types';

interface ParameterSlidersProps {
  algorithm?: AlgorithmType;
  tuning: AlgorithmTuningConfig;
  onTuningChange: (updated: AlgorithmTuningConfig) => void;
  onResetDefaults?: () => void;
}

export const ParameterSliders: React.FC<ParameterSlidersProps> = ({
  algorithm: _algorithm,
  tuning,
  onTuningChange,
  onResetDefaults,
}) => {
  const update = <K extends keyof AlgorithmTuningConfig>(key: K, val: AlgorithmTuningConfig[K]) => {
    onTuningChange({
      ...tuning,
      [key]: val,
    });
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* A* Heuristic Weight Slider */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/25 shadow-inner">
        <div className="flex justify-between items-center mb-1.5">
          <div>
            <span className="font-bold text-cyan-300">A* Heuristic Weight (w)</span>
            <p className="text-[10px] text-slate-400 font-sans">
              Formula: <code className="text-purple-300">f(n) = g(n) + {tuning.astarWeight.toFixed(2)} · h(n)</code>
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
            w = {tuning.astarWeight.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="4.0"
          step="0.05"
          value={tuning.astarWeight}
          onChange={(e) => update('astarWeight', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
          <span>0.0 (Dijkstra)</span>
          <span>1.0 (Optimal A*)</span>
          <span>4.0 (Greedy Hyper-Drive)</span>
        </div>
      </div>

      {/* DFS Depth Cap */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/25 shadow-inner">
        <div className="flex justify-between items-center mb-1.5">
          <div>
            <span className="font-bold text-purple-300">DFS Search Depth Cap (D_max)</span>
            <p className="text-[10px] text-slate-400 font-sans">
              Constrains recursion stack horizon to prevent pathological loops
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
            {tuning.dfsMaxDepth} nodes
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="1000"
          step="20"
          value={tuning.dfsMaxDepth}
          onChange={(e) => update('dfsMaxDepth', parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
        />
      </div>

      {/* Genetic Evolution Parameters */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/25 shadow-inner space-y-3">
        <div className="text-emerald-300 font-bold flex items-center justify-between">
          <span>🧬 Genetic Evolution Engine</span>
          <span className="text-[10px] text-slate-500">Live Allele Tuning</span>
        </div>

        {/* Mutation Probability */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Mutation Probability (μ):</span>
            <span className="text-emerald-400 font-bold">{(tuning.geneticMutationRate * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={tuning.geneticMutationRate}
            onChange={(e) => update('geneticMutationRate', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Crossover Ratio */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Crossover Ratio (χ):</span>
            <span className="text-emerald-400 font-bold">{(tuning.geneticCrossoverRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.95"
            step="0.05"
            value={tuning.geneticCrossoverRate}
            onChange={(e) => update('geneticCrossoverRate', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Population Size */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Population Size (N):</span>
            <span className="text-emerald-400 font-bold">{tuning.geneticPopulationSize} chromosomes</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            step="2"
            value={tuning.geneticPopulationSize}
            onChange={(e) => update('geneticPopulationSize', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {onResetDefaults && (
        <button
          onClick={onResetDefaults}
          className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-bold text-xs transition-all border border-slate-700/60"
        >
          Reset to Engine Defaults
        </button>
      )}
    </div>
  );
};
