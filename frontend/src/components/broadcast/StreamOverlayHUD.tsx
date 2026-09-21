// ============================================================================
// AlgoArena v6.0 - Stream Broadcast Overlay HUD (Section 4)
// TV / Esports-style broadcast graphics, live win-probability meter & telemetry ticker
// ============================================================================

import React from 'react';

export interface BroadcastHUDProps {
  matchName: string;
  algoAName: string;
  algoBName: string;
  winProbabilityA: number; // 0.0 to 1.0
  nodesExploredA: number;
  nodesExploredB: number;
  speedA?: number;
  speedB?: number;
  pathCostA?: number;
  pathCostB?: number;
  tickerMessage?: string;
  onClose?: () => void;
}

export const StreamOverlayHUD: React.FC<BroadcastHUDProps> = ({
  matchName,
  algoAName,
  algoBName,
  winProbabilityA,
  nodesExploredA,
  nodesExploredB,
  speedA = 100,
  speedB = 100,
  pathCostA,
  pathCostB,
  tickerMessage = '⚡ ALGOARENA PRO ESPORTS LEAGUE • AUTONOMOUS SWISS TOURNAMENT • GNN HEURISTICS ENGAGED',
  onClose,
}) => {
  const probA = Math.max(1, Math.min(99, Math.round(winProbabilityA * 100)));
  const probB = 100 - probA;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none font-mono text-white select-none">
      {/* Top Banner Gradient */}
      <div className="bg-gradient-to-b from-black/95 via-slate-950/80 to-transparent pb-6 pt-3 px-6 backdrop-blur-[2px] border-b border-cyan-500/30">
        <div className="max-w-6xl mx-auto">
          {/* Status Row */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-bold uppercase tracking-wider text-[10px]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                LIVE BROADCAST
              </span>
              <span className="text-cyan-400 font-bold tracking-wider">{matchName}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[10px] hidden sm:inline">
                FRAME-RATE: <strong className="text-emerald-400">60 FPS</strong>
              </span>
              {onClose && (
                <button
                  onClick={onClose}
                  className="pointer-events-auto px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-600 transition-colors"
                  title="Close Broadcast HUD"
                >
                  ✕ HIDE
                </button>
              )}
            </div>
          </div>

          {/* Main Versus & Win Probability Centerpiece */}
          <div className="grid grid-cols-12 items-center gap-4 py-1">
            {/* Fighter A */}
            <div className="col-span-4 text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-cyan-300 tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  {algoAName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  PLAYER 1
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>
                  NODES: <strong className="text-white">{nodesExploredA.toLocaleString()}</strong>
                </span>
                {pathCostA !== undefined && (
                  <span>
                    COST: <strong className="text-cyan-300">{pathCostA}</strong>
                  </span>
                )}
                <span>
                  VEL: <strong className="text-cyan-400">{speedA}%</strong>
                </span>
              </div>
            </div>

            {/* Win Probability Bar (Center) */}
            <div className="col-span-4 px-2">
              <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {probA}% WIN PROB
                </span>
                <span className="text-slate-500 font-normal text-[10px]">MONTE CARLO</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  {probB}% WIN PROB
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-900/90 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/80 shadow-[0_0_12px_rgba(0,0,0,0.8)] flex">
                <div
                  className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-l-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  style={{ width: `${probA}%` }}
                />
                <div
                  className="bg-gradient-to-l from-emerald-600 to-emerald-400 h-full rounded-r-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  style={{ width: `${probB}%` }}
                />
              </div>
            </div>

            {/* Fighter B */}
            <div className="col-span-4 text-right">
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  PLAYER 2
                </span>
                <span className="text-xl font-black text-emerald-300 tracking-wide drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                  {algoBName}
                </span>
              </div>
              <div className="flex items-center justify-end gap-3 text-xs text-slate-400 mt-0.5">
                <span>
                  VEL: <strong className="text-emerald-400">{speedB}%</strong>
                </span>
                {pathCostB !== undefined && (
                  <span>
                    COST: <strong className="text-emerald-300">{pathCostB}</strong>
                  </span>
                )}
                <span>
                  NODES: <strong className="text-white">{nodesExploredB.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom News/Telemetry Ticker */}
      <div className="bg-black/80 border-t border-b border-cyan-500/20 py-1 overflow-hidden backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4 text-[10px] text-cyan-400/90 font-medium tracking-wider px-6">
          <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
            ESPORTS TICKER
          </span>
          <span className="truncate">{tickerMessage}</span>
        </div>
      </div>
    </div>
  );
};
