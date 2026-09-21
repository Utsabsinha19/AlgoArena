// ============================================================================
// AlgoArena v2.0 - Real-Time "Mind Reader" Tactical Commentary (Section 3.1)
// ============================================================================

import React, { useMemo } from 'react';
import { SearchStepSnapshot } from '../../types/algoArena';
import { AlgorithmType, Cell } from '../../types';

interface TacticalCommentaryProps {
  algorithm: AlgorithmType;
  snapshot: SearchStepSnapshot | null;
  hoveredCell?: Cell | null;
}

export const TacticalCommentary: React.FC<TacticalCommentaryProps> = ({
  algorithm,
  snapshot,
  hoveredCell,
}) => {
  // Automated natural language commentary evaluating snapshot state & diffs
  const commentaryText = useMemo(() => {
    if (!snapshot) {
      return `Telemetry standby. Neural processing core initialized for ${algorithm.toUpperCase()}.`;
    }

    const { cell, g = 0, h = 0, f = 0, stepIndex } = snapshot;

    switch (algorithm) {
      case 'astar':
        return `A* evaluating sector (${cell.x}, ${cell.y}). Past cost g=${g.toFixed(1)} + heuristic h=${h.toFixed(1)} -> priority f(n)=${f.toFixed(1)}. Directing search frontier along minimal vector gradient.`;
      case 'dfs':
        return `DFS entering deep linear branch at (${cell.x}, ${cell.y}) (Stack Depth ${g.toFixed(0)}). High risk of sub-optimal path cost if dead-end is encountered.`;
      case 'dijkstra':
        return `Dijkstra expanding uniform radial wavefront across sector (${cell.x}, ${cell.y}). Cumulative energy cost: ${g.toFixed(1)}. Guaranteed minimal cost priority maintained.`;
      case 'bfs':
        return `BFS propagating isotropic frontier wave at step ${stepIndex}. Depth level: ${g.toFixed(0)}. Concentric unweighted expansion guarantees minimum hop-count.`;
      case 'greedy':
        return `Greedy Best-First locking onto goal vector from (${cell.x}, ${cell.y}). Heuristic distance pull: ${h.toFixed(1)}. Bypassing terrain weights in pursuit of immediate progress.`;
      case 'genetic':
        return `Genetic Swarm evaluating generation chromosome around (${cell.x}, ${cell.y}). Population fitness optimizing through crossover and mutation alleles.`;
      case 'rl':
        return `Q-Learning Agent observing state (${cell.x}, ${cell.y}). Temporal difference Bellman update updating action-value matrix against obstacle rewards.`;
      default:
        return snapshot.description || `Exploration node visited at (${cell.x}, ${cell.y}).`;
    }
  }, [algorithm, snapshot]);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/25 text-xs font-mono shadow-xl">
      {/* Mind Reader Commentary */}
      <div className="flex-1 flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          Mind Reader HUD
        </div>
        <p className="text-slate-300 italic truncate leading-relaxed">
          "{commentaryText}"
        </p>
      </div>

      {/* Decision Tree Hover Inspector Tooltip */}
      {hoveredCell ? (
        <div className="flex items-center gap-2.5 bg-slate-950/90 px-3 py-1 rounded-xl border border-purple-500/40 shrink-0 text-slate-300 text-[11px] animate-fade-in shadow-md">
          <span className="text-purple-400 font-bold uppercase">({hoveredCell.x}, {hoveredCell.y})</span>
          <span className="text-slate-600">|</span>
          <span className="capitalize text-cyan-300">{hoveredCell.type}</span>
          <span className="text-slate-600">|</span>
          <span>Cost: <strong className="text-amber-400">{hoveredCell.cost}x</strong></span>
          {hoveredCell.isVisited && (
            <>
              <span className="text-slate-600">|</span>
              <span>f: <strong className="text-cyan-400">{hoveredCell.f.toFixed(1)}</strong></span>
            </>
          )}
        </div>
      ) : (
        /* Snapshot Telemetry Badges */
        <div className="flex items-center gap-3 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-400 shrink-0">
          <div>Open: <strong className="text-cyan-300">{snapshot?.openSet.length ?? 0}</strong></div>
          <span className="text-slate-700">•</span>
          <div>Closed: <strong className="text-purple-300">{snapshot?.closedSet.length ?? 0}</strong></div>
        </div>
      )}
    </div>
  );
};
