// ============================================
// AlgoArena - Post-Match "Battle Breakdown" Analytics
// ============================================

import React from 'react';
import { AlgorithmType, PerformanceMetrics, AlgorithmResult, FIGHTER_PROFILES } from '../types';

interface BattleBreakdownModalProps {
  isOpen: boolean;
  playerAlgo: AlgorithmType;
  playerMetrics: PerformanceMetrics | null;
  aiAlgo?: AlgorithmType | null;
  aiResult?: AlgorithmResult | null;
  onClose: () => void;
  onRematch: () => void;
}

export const BattleBreakdownModal: React.FC<BattleBreakdownModalProps> = ({
  isOpen,
  playerAlgo,
  playerMetrics,
  aiAlgo,
  aiResult,
  onClose,
  onRematch,
}) => {
  if (!isOpen || !playerMetrics) return null;

  const playerProfile = FIGHTER_PROFILES[playerAlgo];
  const aiProfile = aiAlgo ? FIGHTER_PROFILES[aiAlgo] : null;

  const playerVisited = playerMetrics.nodesVisited;
  const playerCost = playerMetrics.pathCost;
  const playerTime = playerMetrics.executionTime;
  const playerFound = playerMetrics.pathLength > 0;

  const aiVisited = aiResult?.nodesVisited ?? 0;
  const aiCost = aiResult?.cost ?? 0;
  const aiTime = aiResult?.executionTime ?? 0;
  const aiFound = (aiResult?.path.length ?? 0) > 0;

  // Determine winner in Battle mode
  let isPlayerWinner = true;
  if (aiResult) {
    if (!playerFound && aiFound) isPlayerWinner = false;
    else if (playerFound && !aiFound) isPlayerWinner = true;
    else if (playerCost !== aiCost) isPlayerWinner = playerCost < aiCost;
    else isPlayerWinner = playerVisited <= aiVisited;
  }

  // Generate plain-language tactical efficiency callout
  let efficiencyCallout = '';
  if (aiResult && aiAlgo) {
    if (isPlayerWinner) {
      const nodeDiff = aiVisited - playerVisited;
      const pct = aiVisited > 0 ? ((nodeDiff / aiVisited) * 100).toFixed(0) : '0';
      efficiencyCallout = `${playerProfile.name} secured victory over ${aiProfile?.name}! It reached the objective with ${pct}% fewer node expansions (${playerVisited} vs ${aiVisited}), maintaining a superior cost curve.`;
    } else {
      efficiencyCallout = `${aiProfile?.name} out-maneuvered ${playerProfile.name} in this arena layout. Its exploration style circumvented high-cost obstacles with superior efficiency (${aiCost.toFixed(1)} vs ${playerCost.toFixed(1)} cost).`;
    }
  } else {
    efficiencyCallout = playerFound
      ? `${playerProfile.name} located the goal with an optimal path cost of ${playerCost.toFixed(1)} across ${playerVisited} explored nodes in ${playerTime.toFixed(1)}ms.`
      : `${playerProfile.name} traversed ${playerVisited} nodes before concluding no unobstructed path exists to the destination.`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950/70 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isPlayerWinner ? '🏆' : '⚡'}</span>
            <div>
              <h2 className="text-2xl font-black font-['Orbitron'] tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {aiAlgo ? (isPlayerWinner ? 'VICTORY // POST-MORTEM' : 'DEFEAT // BATTLE ANALYSIS') : 'MISSION POST-MORTEM'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Telemetry and tactical breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Comparative Stats Matrix */}
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player Algorithm Box */}
            <div className={`p-4 rounded-2xl border ${isPlayerWinner ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/20' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{playerProfile.avatar}</span>
                  <div>
                    <span className="font-bold text-sm text-white font-['Orbitron']">
                      {playerProfile.name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 block uppercase">
                      Player Vanguard
                    </span>
                  </div>
                </div>
                {isPlayerWinner && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    WINNER
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Nodes Explored:</span>
                  <strong className="text-white">{playerVisited}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Path Cost:</span>
                  <strong className="text-amber-300">{playerCost.toFixed(1)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Execution Time:</span>
                  <strong className="text-cyan-300">{playerTime.toFixed(1)} ms</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Path Length:</span>
                  <strong className="text-purple-300">{playerMetrics.pathLength} steps</strong>
                </div>
              </div>
            </div>

            {/* AI Algorithm Box (if Battle mode) */}
            {aiProfile && aiResult ? (
              <div className={`p-4 rounded-2xl border ${!isPlayerWinner ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/20' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{aiProfile.avatar}</span>
                    <div>
                      <span className="font-bold text-sm text-white font-['Orbitron']">
                        {aiProfile.name}
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 block uppercase">
                        AI Opponent
                      </span>
                    </div>
                  </div>
                  {!isPlayerWinner && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      WINNER
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Nodes Explored:</span>
                    <strong className="text-white">{aiVisited}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Total Path Cost:</span>
                    <strong className="text-amber-300">{aiCost.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Execution Time:</span>
                    <strong className="text-cyan-300">{aiTime.toFixed(1)} ms</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Path Length:</span>
                    <strong className="text-purple-300">{aiResult.path.length} steps</strong>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Mode Summary Box */
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center">
                <div className="text-xs font-mono text-cyan-400 uppercase font-bold mb-2">
                  ⚡ Algorithm Efficiency Index
                </div>
                <div className="text-3xl font-black font-['Orbitron'] text-white">
                  {playerFound ? Math.max(10, Math.floor(1000 / (playerVisited + playerCost))).toFixed(0) : '0'}
                  <span className="text-xs font-normal text-slate-500 ml-2">PTS</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Efficiency score computed from exploration speed versus optimal cost trade-offs.
                </p>
              </div>
            )}
          </div>

          {/* Tactical Efficiency Callout */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
            <span className="text-cyan-400 font-bold uppercase block mb-1">
              📊 Tactical Assessment:
            </span>
            {efficiencyCallout}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            Close Post-Mortem
          </button>
          <button
            onClick={onRematch}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold font-['Orbitron'] text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
          >
            Run Rematch
          </button>
        </div>
      </div>
    </div>
  );
};
