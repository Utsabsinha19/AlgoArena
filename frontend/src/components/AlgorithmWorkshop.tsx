// ============================================
// AlgoArena v2.0 - Visual Algorithm Workshop (Tuning Sliders)
// ============================================

import React from 'react';
import { AlgorithmType, AlgorithmTuningConfig, DEFAULT_TUNING_CONFIG } from '../types';
import { playSound } from '../utils/sounds';
import { ParameterSliders } from './workshop/ParameterSliders';

interface AlgorithmWorkshopProps {
  isOpen: boolean;
  algorithm: AlgorithmType;
  tuning: AlgorithmTuningConfig;
  onTuningChange: (newTuning: AlgorithmTuningConfig) => void;
  onClose: () => void;
}

export const AlgorithmWorkshop: React.FC<AlgorithmWorkshopProps> = ({
  isOpen,
  algorithm,
  tuning,
  onTuningChange,
  onClose,
}) => {
  if (!isOpen) return null;

  const resetDefaults = () => {
    onTuningChange(DEFAULT_TUNING_CONFIG);
    playSound('click');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <div>
              <h3 className="text-xl font-bold font-['Orbitron'] text-white">
                Algorithm Workshop // Live Tuning
              </h3>
              <p className="text-xs text-cyan-400 font-mono">
                Tuning active engine: <span className="uppercase font-bold">{algorithm}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all text-xs"
          >
            ✕
          </button>
        </div>

        {/* Sliders Container with ParameterSliders Component */}
        <div className="py-5 max-h-[60vh] overflow-y-auto pr-2">
          <ParameterSliders
            algorithm={algorithm}
            tuning={tuning}
            onTuningChange={onTuningChange}
            onResetDefaults={resetDefaults}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={resetDefaults}
            className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/70 hover:bg-slate-800 transition-all"
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold font-['Orbitron'] text-xs uppercase tracking-wider hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
