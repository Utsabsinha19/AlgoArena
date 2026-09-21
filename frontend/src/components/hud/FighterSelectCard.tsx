// ============================================================================
// AlgoArena v4.0 - "Algorithm DNA" Fighter Select Card (Section 4.1)
// Sci-fi esports card with inline SVG Radar Chart & dynamic stat bars
// ============================================================================

import React from 'react';
import { FighterDNA } from '../../types';

export interface AlgorithmDNAProps {
  name?: string;
  type?: string;
  speed?: number; // 0 - 100
  accuracy?: number; // 0 - 100
  exploration?: number; // 0 - 100
  adaptability?: number; // 0 - 100
  isSelected: boolean;
  onSelect: () => void;
  // Optional compatibility props for FighterDNA consumers
  fighter?: FighterDNA;
  eloRating?: number;
}

export const FighterSelectCard: React.FC<AlgorithmDNAProps> = ({
  name: propName,
  type: propType,
  speed: propSpeed,
  accuracy: propAccuracy,
  exploration: propExploration,
  adaptability: propAdaptability,
  isSelected,
  onSelect,
  fighter,
  eloRating = 1500,
}) => {
  // Extract values from direct props or fighter profile
  const name = propName ?? fighter?.name ?? 'UNKNOWN AGENT';
  const type = propType ?? fighter?.callsign ?? fighter?.id?.toUpperCase() ?? 'ALGO';
  const speed = propSpeed ?? fighter?.stats?.speed ?? 75;
  const accuracy = propAccuracy ?? fighter?.stats?.accuracy ?? 80;
  const exploration = propExploration ?? fighter?.stats?.frontierDiscipline ?? 70;
  const adaptability = propAdaptability ?? fighter?.stats?.adaptability ?? 65;
  const themeColor = fighter?.themeColor ?? '#06b6d4';

  // Compute 4-axis SVG Radar Chart points: Center=(50,50), MaxRadius=36
  const cx = 50;
  const cy = 50;
  const maxR = 36;
  const topY = cy - maxR * (speed / 100);
  const rightX = cx + maxR * (accuracy / 100);
  const bottomY = cy + maxR * (exploration / 100);
  const leftX = cx - maxR * (adaptability / 100);
  const polygonPoints = `${cx},${topY} ${rightX},${cy} ${cx},${bottomY} ${leftX},${cy}`;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer backdrop-blur-md relative overflow-hidden group ${
        isSelected
          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(0,255,255,0.4)] scale-[1.02]'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900/80'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {fighter?.avatar && (
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ backgroundColor: `${themeColor}22`, border: `1px solid ${themeColor}44` }}
            >
              {fighter.avatar}
            </span>
          )}
          <div>
            <h3 className="text-base font-bold text-cyan-300 font-mono tracking-wide">{name}</h3>
            {fighter && <p className="text-[10px] text-slate-400 font-mono">{fighter.role}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
            {type}
          </span>
          {eloRating && (
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
              ELO {eloRating}
            </span>
          )}
        </div>
      </div>

      {/* Visual Radar Chart & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center my-3">
        {/* SVG Radar Chart Representation */}
        <div className="sm:col-span-2 flex justify-center py-1">
          <svg viewBox="0 0 100 100" className="w-20 h-20 overflow-visible">
            {/* Background Grid webs */}
            <circle cx="50" cy="50" r="36" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            <line x1="50" y1="14" x2="50" y2="86" stroke="#1e293b" strokeWidth="0.75" />
            <line x1="14" y1="50" x2="86" y2="50" stroke="#1e293b" strokeWidth="0.75" />

            {/* Radar Data Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(6, 182, 212, 0.25)"
              stroke="#22d3ee"
              strokeWidth="1.5"
              className="transition-all duration-300"
            />
            {/* Vertices */}
            <circle cx={cx} cy={topY} r="2" fill="#22d3ee" />
            <circle cx={rightX} cy={cy} r="2" fill="#34d399" />
            <circle cx={cx} cy={bottomY} r="2" fill="#c084fc" />
            <circle cx={leftX} cy={cy} r="2" fill="#fbbf24" />
          </svg>
        </div>

        {/* Linear Stat Indicators */}
        <div className="sm:col-span-3 space-y-1 text-[11px] font-mono">
          <div>
            <div className="flex justify-between text-slate-300">
              <span className="text-[10px] text-slate-400">SPEED</span>
              <span className="text-cyan-400 font-bold">{speed}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-cyan-400 h-1.5 rounded transition-all duration-300" style={{ width: `${speed}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300">
              <span className="text-[10px] text-slate-400">ACCURACY</span>
              <span className="text-emerald-400 font-bold">{accuracy}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded transition-all duration-300" style={{ width: `${accuracy}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300">
              <span className="text-[10px] text-slate-400">EXPLORATION</span>
              <span className="text-purple-400 font-bold">{exploration}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-purple-400 h-1.5 rounded transition-all duration-300" style={{ width: `${exploration}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300">
              <span className="text-[10px] text-slate-400">ADAPTABILITY</span>
              <span className="text-amber-400 font-bold">{adaptability}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-amber-400 h-1.5 rounded transition-all duration-300" style={{ width: `${adaptability}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-500">DNA PROTOCOL v4.0</span>
        <span className={`uppercase font-bold tracking-wider ${isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
          {isSelected ? '✓ SELECTED' : '+ DRAFT SQUAD'}
        </span>
      </div>
    </div>
  );
};
