// ============================================
// AlgoArena - Esports 3-Algorithm Squad Relay Draft & ELO
// ============================================

import React, { useState, useEffect } from 'react';
import { AlgorithmType, FIGHTER_PROFILES } from '../types';
import { playSound } from '../utils/sounds';

interface SquadRelayDraftProps {
  isOpen: boolean;
  onStartRelay: (squad: [AlgorithmType, AlgorithmType, AlgorithmType]) => void;
  onClose: () => void;
}

const STAGES = [
  {
    num: 1,
    title: 'Stage 1: High-Density Maze',
    recommended: 'BFS / DFS',
    trait: 'Rapid unweighted corridor penetration',
  },
  {
    num: 2,
    title: 'Stage 2: Heavy Mud & Cost Mire',
    recommended: 'Dijkstra / A*',
    trait: 'Optimal pathfinding across 5x cost mud and boost pads',
  },
  {
    num: 3,
    title: 'Stage 3: Dynamic Laser Ridge',
    recommended: 'Genetic Swarm / Q-Agent',
    trait: 'Hazard evasion and adaptive dynamic re-routing',
  },
];

export const SquadRelayDraft: React.FC<SquadRelayDraftProps> = ({
  isOpen,
  onStartRelay,
  onClose,
}) => {
  const [squad, setSquad] = useState<[AlgorithmType, AlgorithmType, AlgorithmType]>([
    'bfs',
    'astar',
    'rl',
  ]);
  const [elo, setElo] = useState<number>(1200);

  // Load ELO from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('algoarena_elo');
    if (saved) {
      setElo(parseInt(saved, 10));
    }
  }, []);

  if (!isOpen) return null;

  const allAlgorithms = Object.keys(FIGHTER_PROFILES) as AlgorithmType[];

  const handleSelectAlgo = (stageIndex: 0 | 1 | 2, algo: AlgorithmType) => {
    const next = [...squad] as [AlgorithmType, AlgorithmType, AlgorithmType];
    next[stageIndex] = algo;
    setSquad(next);
    playSound('click');
  };

  const handleLaunchRelay = () => {
    playSound('start');
    onStartRelay(squad);
    onClose();
  };

  // ELO Rank Badge
  const getRankBadge = (val: number) => {
    if (val >= 2000) return { title: 'Grandmaster Cyber-Runner', color: '#ec4899', icon: '👑' };
    if (val >= 1600) return { title: 'Diamond Tactician', color: '#06b6d4', icon: '💎' };
    if (val >= 1400) return { title: 'Gold Vector', color: '#eab308', icon: '🥇' };
    if (val >= 1200) return { title: 'Silver Navigator', color: '#94a3b8', icon: '🥈' };
    return { title: 'Bronze Cadet', color: '#b45309', icon: '🥉' };
  };

  const rank = getRankBadge(elo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-950/70 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏁</span>
            <div>
              <h2 className="text-2xl font-black font-['Orbitron'] tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ESPORTS SQUAD RELAY DRAFT
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Assemble a 3-algorithm relay roster to conquer procedural stages
              </p>
            </div>
          </div>

          {/* ELO Rating Badge */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
            <span className="text-lg">{rank.icon}</span>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Competitive ELO</div>
              <div className="text-sm font-bold font-['Orbitron'] text-white">
                {elo} <span className="text-xs font-normal" style={{ color: rank.color }}>({rank.title})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Stage Relay Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {STAGES.map((stage, idx) => {
            const selectedAlgo = squad[idx as 0 | 1 | 2];
            const fighter = FIGHTER_PROFILES[selectedAlgo];

            return (
              <div
                key={stage.num}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                      Leg {stage.num}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Rec: {stage.recommended}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-['Orbitron'] mb-1">
                    {stage.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4">{stage.trait}</p>

                  {/* Selected Algorithm Pill */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center gap-2.5 mb-3">
                    <span className="text-2xl">{fighter.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-white truncate font-['Orbitron']">
                        {fighter.name}
                      </div>
                      <div className="text-[10px] font-mono text-purple-400 uppercase">
                        {fighter.callsign}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Selector */}
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Draft Fighter:
                  </label>
                  <select
                    value={selectedAlgo}
                    onChange={(e) => handleSelectAlgo(idx as 0 | 1 | 2, e.target.value as AlgorithmType)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {allAlgorithms.map((a) => (
                      <option key={a} value={a}>
                        {FIGHTER_PROFILES[a].name} ({FIGHTER_PROFILES[a].callsign})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunchRelay}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-black font-['Orbitron'] text-xs uppercase tracking-wider transition-all shadow-xl shadow-purple-500/30"
          >
            Deploy 3-Algorithm Squad Relay ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
