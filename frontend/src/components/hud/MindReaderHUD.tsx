// ============================================================================
// AlgoArena v4.0 - Natural Language "Mind Reader" HUD with Voice Synth (Section 4.2)
// Real-time tactical commentary stream, Web Speech API audio HUD & metrics
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SearchStepSnapshot, V3Analytics } from '../../types/algoArena';
import { AlgorithmType } from '../../types';

export interface MindReaderHUDProps {
  logs?: string[];
  enableVoice?: boolean;
  activeSnapshot?: SearchStepSnapshot | null;
  algorithm?: AlgorithmType;
  optimalPathLength?: number;
  optimalCost?: number;
  totalGridCells?: number;
  isOpenSetSize?: number;
  isSearching?: boolean;
}

export const MindReaderHUD: React.FC<MindReaderHUDProps> = ({
  logs,
  enableVoice: initialEnableVoice = false,
  activeSnapshot,
  algorithm = 'astar',
  optimalPathLength = 20,
  optimalCost = 20,
  totalGridCells = 500,
  isOpenSetSize = 1,
  isSearching = false,
}) => {
  const [latestLog, setLatestLog] = useState<string>('Initializing tactical feed...');
  const [voiceActive, setVoiceActive] = useState<boolean>(initialEnableVoice);
  const lastSpokenRef = useRef<string>('');

  // Section 6 Empirical Metrics calculation
  const analytics: V3Analytics = useMemo(() => {
    const nodesExplored = activeSnapshot?.metrics?.nodesExplored || 1;
    const currentCost = activeSnapshot?.metrics?.currentCost || 0;
    const timeMs = Math.max(1, activeSnapshot?.metrics?.executionTimeMs || 1);

    const eei = (optimalPathLength / nodesExplored) * 100;
    const sfc = (isOpenSetSize / totalGridCells) * 100;
    const subOpt = optimalCost > 0 ? Math.max(0, ((currentCost - optimalCost) / optimalCost) * 100) : 0;
    const acceleration = nodesExplored / timeMs;

    return {
      eei: Math.min(100, eei),
      sfc: Math.min(100, sfc),
      subOptimalityDeviation: subOpt,
      searchAccelerationRate: acceleration,
    };
  }, [activeSnapshot, optimalPathLength, optimalCost, totalGridCells, isOpenSetSize]);

  // Derive dynamic tactical text based on algorithm & snapshot
  const activeCommentary = useMemo(() => {
    if (!activeSnapshot) {
      return 'Mind Reader initialized. Awaiting algorithm deployment signal...';
    }

    const { cell, g, h, f } = activeSnapshot;
    const nodes = activeSnapshot.metrics?.nodesExplored ?? 0;
    const x = cell?.x ?? 0;
    const y = cell?.y ?? 0;

    switch (algorithm) {
      case 'astar':
        return `A* evaluating sector (${x}, ${y}) with priority f(n)=${(f ?? (g ?? 0) + (h ?? 0)).toFixed(1)} [g=${(g ?? 0).toFixed(0)}, h=${(h ?? 0).toFixed(0)}]. Minimal vector gradient locked.`;
      case 'dfs':
        return `DFS executing linear stack recursion at depth ${nodes} across sector (${x}, ${y}). High frontier divergence risk.`;
      case 'bfs':
        return `BFS radially propagating isotropic wavefront at step ${nodes}. Frontier queue width: ${isOpenSetSize} nodes.`;
      case 'dijkstra':
        return `Dijkstra consolidating minimal cost wavefront at (${x}, ${y}) with cumulative path cost ${activeSnapshot.metrics?.currentCost ?? 0}.`;
      case 'greedy':
        return `Greedy Best-First descending Manhattan gradient directly toward goal from (${x}, ${y}), h(n)=${(h ?? 0).toFixed(1)}.`;
      case 'genetic':
        return `Genetic Swarm evolving chromosome population allele across sector (${x}, ${y}). Crossover active.`;
      case 'rl':
        return `DQN Agent executing neural inference from state (${x}, ${y}). Policy Q-value optimal.`;
      default:
        return activeSnapshot.description || `Search frontier expanding through sector (${x}, ${y}). Nodes evaluated: ${nodes}.`;
    }
  }, [activeSnapshot, algorithm, isOpenSetSize]);

  // Synchronize logs & Web Speech API Voice synthesis
  useEffect(() => {
    const currentMessage = logs && logs.length > 0 ? logs[logs.length - 1] : activeCommentary;

    if (currentMessage && currentMessage !== latestLog) {
      setLatestLog(currentMessage);

      // Speak message if voice is enabled and message changed meaningfully
      if (voiceActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (lastSpokenRef.current !== currentMessage) {
          lastSpokenRef.current = currentMessage;
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(currentMessage);
          utterance.rate = 1.1;
          utterance.pitch = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [logs, activeCommentary, latestLog, voiceActive]);

  const toggleVoice = () => {
    const nextState = !voiceActive;
    setVoiceActive(nextState);
    if (!nextState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 text-slate-800 font-mono shadow-md transition-all">
      {/* Top Banner with Status, Voice Toggle, and Algorithm Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75 ${
                isSearching ? 'animate-ping' : ''
              }`}
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-600" />
          </span>
          <span className="font-bold tracking-wider text-cyan-800 uppercase">
            MIND READER HUD
          </span>
          <span className="text-slate-500 text-[10px]">| v4.0 VOICE HUD</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Web Speech API Voice Toggle */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
              voiceActive
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title="Toggle Web Speech API Voice Commentary"
          >
            <span>{voiceActive ? '🔊' : '🔇'}</span>
            <span>{voiceActive ? 'VOICE ON' : 'VOICE OFF'}</span>
          </button>

          <span className="px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-bold uppercase">
            {algorithm}
          </span>
        </div>
      </div>

      {/* Main Tactical Feed Display */}
      <div className="my-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800 shadow-xs">
        <span className="text-cyan-700 font-bold shrink-0">[TACTICAL HUD]:</span>
        <p className="truncate flex-1 italic text-slate-700">{latestLog}</p>
      </div>

      {/* Section 6 Empirical Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
        {/* EEI */}
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">EEI (Efficiency)</div>
          <div className="text-base font-extrabold text-cyan-700 mt-0.5">
            {analytics.eei.toFixed(1)}%
          </div>
          <div className="text-[9px] text-slate-400">L_opt / N_exp</div>
        </div>

        {/* SFC */}
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">SFC (Frontier)</div>
          <div className="text-base font-extrabold text-purple-700 mt-0.5">
            {analytics.sfc.toFixed(1)}%
          </div>
          <div className="text-[9px] text-slate-400">|OpenSet| / Grid</div>
        </div>

        {/* Delta */}
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">δ (Sub-Optimal)</div>
          <div
            className={`text-base font-extrabold mt-0.5 ${
              analytics.subOptimalityDeviation === 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            +{analytics.subOptimalityDeviation.toFixed(1)}%
          </div>
          <div className="text-[9px] text-slate-400">vs Dijkstra Cost</div>
        </div>

        {/* A_search */}
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">A_search (Accel)</div>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5">
            {analytics.searchAccelerationRate.toFixed(1)} <span className="text-[10px]">n/ms</span>
          </div>
          <div className="text-[9px] text-slate-400">ΔN_exp / Δt</div>
        </div>
      </div>
    </div>
  );
};
