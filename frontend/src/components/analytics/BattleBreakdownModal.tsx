// ============================================================================
// AlgoArena v2.0 - Post-Match "Battle Breakdown" Analytics (Section 3.2)
// ============================================================================

import React from 'react';
import { AlgorithmType, PerformanceMetrics, AlgorithmResult, FIGHTER_PROFILES } from '../../types';

interface BattleBreakdownModalProps {
  isOpen: boolean;
  playerAlgo: AlgorithmType;
  playerMetrics: PerformanceMetrics | null;
  aiAlgo?: AlgorithmType | null;
  aiResult?: AlgorithmResult | null;
  optimalDijkstraCost?: number; // Baseline minimal cost
  onClose: () => void;
  onRematch: () => void;
}

export const BattleBreakdownModal: React.FC<BattleBreakdownModalProps> = ({
  isOpen,
  playerAlgo,
  playerMetrics,
  aiAlgo,
  aiResult,
  optimalDijkstraCost,
  onClose,
  onRematch,
}) => {
  if (!isOpen || !playerMetrics) return null;

  const playerProfile = FIGHTER_PROFILES[playerAlgo];
  const aiProfile = aiAlgo ? FIGHTER_PROFILES[aiAlgo] : null;

  const playerVisited = playerMetrics.nodesVisited;
  const playerCost = playerMetrics.pathCost;
  const playerTime = Math.max(0.1, playerMetrics.executionTime);
  const playerPathLen = playerMetrics.pathLength;
  const playerFound = playerPathLen > 0;

  // Section 3.2 Metrics Calculation:
  // 1. Exploration Efficiency Index (EEI) = (Optimal Path Length / Total Nodes Explored) * 100%
  const playerEEI = playerVisited > 0 ? ((playerPathLen / playerVisited) * 100).toFixed(1) : '0.0';

  // 2. Time-to-Target Velocity (Vt) = Nodes evaluated per millisecond
  const playerVt = (playerVisited / playerTime).toFixed(2);

  // 3. Sub-optimality Penalty = % cost deviation from Dijkstra guaranteed baseline
  const baselineCost = optimalDijkstraCost && optimalDijkstraCost > 0 ? optimalDijkstraCost : playerCost;
  const playerSubOptimality = baselineCost > 0
    ? Math.max(0, (((playerCost - baselineCost) / baselineCost) * 100)).toFixed(1)
    : '0.0';

  // AI metrics
  const aiVisited = aiResult?.nodesVisited ?? 0;
  const aiCost = aiResult?.cost ?? 0;
  const aiTime = Math.max(0.1, aiResult?.executionTime ?? 1);
  const aiPathLen = aiResult?.path.length ?? 0;
  const aiFound = aiPathLen > 0;
  const aiEEI = aiVisited > 0 ? ((aiPathLen / aiVisited) * 100).toFixed(1) : '0.0';
  const aiVt = (aiVisited / aiTime).toFixed(2);
  const aiSubOptimality = baselineCost > 0
    ? Math.max(0, (((aiCost - baselineCost) / baselineCost) * 100)).toFixed(1)
    : '0.0';

  let isPlayerWinner = true;
  if (aiResult) {
    if (!playerFound && aiFound) isPlayerWinner = false;
    else if (playerFound && !aiFound) isPlayerWinner = true;
    else if (playerCost !== aiCost) isPlayerWinner = playerCost < aiCost;
    else isPlayerWinner = playerVisited <= aiVisited;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-cyan-500/35 shadow-2xl shadow-cyan-950/70 p-6 overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isPlayerWinner ? '🏆' : '⚡'}</span>
            <div>
              <h2 className="text-xl font-black font-['Orbitron'] tracking-wider bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                {aiAlgo ? (isPlayerWinner ? 'VICTORY // TELEMETRY POST-MORTEM' : 'DEFEAT // BATTLE ANALYSIS') : 'MISSION POST-MORTEM'}
              </h2>
              <p className="text-[11px] text-slate-400">
                v2.0 Algorithmic Performance Quantification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player Card */}
            <div className={`p-4 rounded-2xl border ${isPlayerWinner ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/15' : 'bg-slate-950/70 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{playerProfile.avatar}</span>
                  <div>
                    <span className="font-bold text-sm text-white font-['Orbitron'] block">
                      {playerProfile.name}
                    </span>
                    <span className="text-[10px] text-cyan-400 uppercase font-bold">Player Vanguard</span>
                  </div>
                </div>
                {isPlayerWinner && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    WINNER
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Exploration Efficiency (EEI):</span>
                  <strong className="text-cyan-300 font-bold">{playerEEI}%</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Velocity (V_t):</span>
                  <strong className="text-purple-300 font-bold">{playerVt} nodes/ms</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Sub-optimality Penalty:</span>
                  <strong className={Number(playerSubOptimality) === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    +{playerSubOptimality}%
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Path Cost:</span>
                  <strong className="text-amber-300">{playerCost.toFixed(1)}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Nodes Explored:</span>
                  <strong className="text-white">{playerVisited}</strong>
                </div>
              </div>
            </div>

            {/* AI Opponent Card */}
            {aiProfile && aiResult ? (
              <div className={`p-4 rounded-2xl border ${!isPlayerWinner ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/15' : 'bg-slate-950/70 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{aiProfile.avatar}</span>
                    <div>
                      <span className="font-bold text-sm text-white font-['Orbitron'] block">
                        {aiProfile.name}
                      </span>
                      <span className="text-[10px] text-purple-400 uppercase font-bold">AI Opponent</span>
                    </div>
                  </div>
                  {!isPlayerWinner && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      WINNER
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Exploration Efficiency (EEI):</span>
                    <strong className="text-cyan-300 font-bold">{aiEEI}%</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Velocity (V_t):</span>
                    <strong className="text-purple-300 font-bold">{aiVt} nodes/ms</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Sub-optimality Penalty:</span>
                    <strong className={Number(aiSubOptimality) === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      +{aiSubOptimality}%
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Total Path Cost:</span>
                    <strong className="text-amber-300">{aiCost.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Nodes Explored:</span>
                    <strong className="text-white">{aiVisited}</strong>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Mode Analytics Card */
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-center">
                <div className="text-xs text-cyan-400 uppercase font-bold mb-1">
                  ⚡ Theoretical Assessment
                </div>
                <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>
                    <strong>EEI ({playerEEI}%):</strong> Measures path directness. Heuristic search (A*) optimizes EEI, while Dijkstra explores radially.
                  </p>
                  <p>
                    <strong>Sub-optimality (+{playerSubOptimality}%):</strong> Deviation from the mathematically guaranteed minimum energy route.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
          >
            Dismiss
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
