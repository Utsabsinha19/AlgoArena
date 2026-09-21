// ============================================================================
// AlgoArena v2.0 - Algorithm DNA Fighter Select Card
// ============================================================================

import React from 'react';
import { FighterDNA } from '../../types';

interface FighterSelectCardProps {
  fighter: FighterDNA;
  isSelected: boolean;
  onSelect: () => void;
}

export const FighterSelectCard: React.FC<FighterSelectCardProps> = ({
  fighter,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-2xl cursor-pointer transition-all border ${
        isSelected
          ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${fighter.themeColor}22`, border: `1px solid ${fighter.themeColor}55` }}
        >
          {fighter.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white font-['Orbitron'] truncate">
              {fighter.name}
            </span>
            <span
              className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ color: fighter.themeColor, backgroundColor: `${fighter.themeColor}1a` }}
            >
              {fighter.callsign}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{fighter.role}</p>
        </div>
      </div>

      {/* Mini Stat Bars */}
      <div className="space-y-1.5 font-mono text-[10px]">
        <div className="flex justify-between text-slate-400">
          <span>Speed:</span>
          <strong className="text-cyan-300">{fighter.stats.speed}%</strong>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fighter.stats.speed}%`, backgroundColor: fighter.themeColor }}
          />
        </div>

        <div className="flex justify-between text-slate-400">
          <span>Accuracy:</span>
          <strong className="text-purple-300">{fighter.stats.accuracy}%</strong>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fighter.stats.accuracy}%`, backgroundColor: fighter.themeColor }}
          />
        </div>
      </div>
    </div>
  );
};
