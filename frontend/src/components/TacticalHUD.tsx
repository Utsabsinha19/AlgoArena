// ============================================
// AlgoArena - Real-Time Tactical HUD & Mind Reader
// ============================================

import React from 'react';
import { AlgorithmStep, Cell, AlgorithmType } from '../types';

interface TacticalHUDProps {
  algorithm: AlgorithmType;
  currentStepData?: AlgorithmStep | null;
  hoveredCell?: Cell | null;
  openSetCount?: number;
  closedSetCount?: number;
}

/**
 * Generates natural language tactical commentary describing the algorithm's strategy.
 */
function getTacticalInsight(algo: AlgorithmType, step?: AlgorithmStep | null): string {
  if (!step) {
    return `Standing by. ${algo.toUpperCase()} neural engine initialized. Ready to simulate frontier exploration.`;
  }

  const { cell, g, h, f } = step;

  switch (algo) {
    case 'astar':
      if (typeof g === 'number' && typeof h === 'number') {
        return `A* evaluating sector (${cell.x}, ${cell.y}). Past path cost g=${g.toFixed(1)} + Euclidean heuristic h=${h.toFixed(1)} yields priority f=${(f ?? g + h).toFixed(1)}. Directing search toward goal corridor.`;
      }
      return `A* utilizing heuristic vector projection to prune sub-optimal branches at (${cell.x}, ${cell.y}).`;

    case 'dijkstra':
      return `Dijkstra expanding isotropic wavefront at (${cell.x}, ${cell.y}) with cumulative cost ${g?.toFixed(1) ?? '1.0'}. Evaluating uniform cost gradient across all adjacent sectors.`;

    case 'bfs':
      return `BFS propagating concentric frontier wave through depth level ${g ?? 0}. All adjacent equidistant nodes enqueued to guarantee minimum hop-count.`;

    case 'dfs':
      return `DFS driving deep branch penetration along axis toward (${cell.x}, ${cell.y}). Stack depth ${g ?? 0}. Backtrack triggered only when blocked.`;

    case 'greedy':
      return `Greedy Best-First locking onto goal coordinates. Heuristic pull distance: ${h?.toFixed(1) ?? '0.0'}. Bypassing uniform costs to sprint directly toward the objective.`;

    case 'genetic':
      return `Genetic Swarm evaluating chromosome fitness at (${cell.x}, ${cell.y}). Mutation operators swapping direction alleles to overcome barrier topology.`;

    case 'rl':
      return `Q-Learning Agent updating Bellman Q-policy at state (${cell.x}, ${cell.y}). Backpropagating reward gradients for obstacle avoidance.`;

    default:
      return step.description || `Exploration node processed at (${cell.x}, ${cell.y}).`;
  }
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  algorithm,
  currentStepData,
  hoveredCell,
  openSetCount = 0,
  closedSetCount = 0,
}) => {
  const commentary = getTacticalInsight(algorithm, currentStepData);

  return (
    <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 text-xs font-mono">
      {/* Tactical Commentary Ticker */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Mind Reader
        </div>
        <p className="text-slate-300 italic line-clamp-2 md:line-clamp-1 leading-relaxed">
          "{commentary}"
        </p>
      </div>

      {/* Decision Tree Hover Inspector Tooltip */}
      {hoveredCell ? (
        <div className="flex items-center gap-3 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-purple-500/40 shrink-0 text-slate-300 shadow-lg shadow-purple-950/40 animate-fade-in">
          <span className="text-purple-400 font-bold uppercase text-[10px]">
            NODE ({hoveredCell.x}, {hoveredCell.y})
          </span>
          <span className="text-slate-600">|</span>
          <span className="capitalize text-cyan-300">{hoveredCell.type}</span>
          <span className="text-slate-600">|</span>
          <span>Cost: <strong className="text-amber-400">{hoveredCell.cost}x</strong></span>
          {hoveredCell.isVisited && (
            <>
              <span className="text-slate-600">|</span>
              <span>
                f: <strong className="text-cyan-400">{hoveredCell.f.toFixed(1)}</strong> (g:{hoveredCell.g.toFixed(1)} + h:{hoveredCell.h.toFixed(1)})
              </span>
            </>
          )}
        </div>
      ) : (
        /* Frontier Heatmap Stats */
        <div className="flex items-center gap-3 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Open List: <strong className="text-slate-200">{openSetCount}</strong></span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Closed List: <strong className="text-slate-200">{closedSetCount}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
