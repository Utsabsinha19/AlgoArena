// ============================================
// AlgoArena - "Algorithm DNA" Fighter Select Screen
// ============================================

import React, { useState } from 'react';
import { AlgorithmType, FIGHTER_PROFILES, FighterDNA } from '../types';
import { playSound } from '../utils/sounds';
import { FighterSelectCard } from './workshop/FighterSelectCard';

interface FighterSelectModalProps {
  isOpen: boolean;
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  onClose: () => void;
}

// 5-Axis SVG Radar Chart Component
function RadarChart({ stats, color }: { stats: FighterDNA['stats']; color: string }) {
  const axes = [
    { label: 'Speed', val: stats.speed },
    { label: 'Accuracy', val: stats.accuracy },
    { label: 'Frontier', val: stats.frontierDiscipline },
    { label: 'Adaptability', val: stats.adaptability },
    { label: 'Evasion', val: stats.hazardEvasion },
  ];

  const size = 160;
  const center = size / 2;
  const radius = 55;
  const totalAxes = axes.length;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon points
  const points = axes.map((axis, i) => {
    const { x, y } = getCoordinates(i, axis.val / 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric guide webs */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const webPoints = axes.map((_, i) => {
            const { x, y } = getCoordinates(i, level);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={webPoints}
              fill="none"
              stroke="#334155"
              strokeWidth="0.75"
              strokeDasharray={level === 1.0 ? 'none' : '2 2'}
            />
          );
        })}

        {/* Axis spokes */}
        {axes.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="0.75"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill={color}
          fillOpacity="0.35"
          stroke={color}
          strokeWidth="2"
        />

        {/* Corner dots & labels */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, axis.val / 100);
          const labelPos = getCoordinates(i, 1.28);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill={color} />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fill="#94a3b8"
                fontWeight="600"
                className="font-mono"
              >
                {axis.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export const FighterSelectModal: React.FC<FighterSelectModalProps> = ({
  isOpen,
  selectedAlgorithm,
  onSelectAlgorithm,
  onClose,
}) => {
  const [activeFighter, setActiveFighter] = useState<AlgorithmType>(selectedAlgorithm);

  if (!isOpen) return null;

  const fighters = Object.values(FIGHTER_PROFILES);
  const currentFighter = FIGHTER_PROFILES[activeFighter];

  const handleSelectFighter = (algo: AlgorithmType) => {
    setActiveFighter(algo);
    playSound('click');
  };

  const handleConfirm = () => {
    onSelectAlgorithm(activeFighter);
    playSound('achievement');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-2xl font-black font-['Orbitron'] tracking-wider bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              ALGORITHM DNA // FIGHTER SELECT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700/50"
          >
            ✕
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-6 gap-6">
          {/* Fighter List / Character Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-2.5 max-h-[520px] overflow-y-auto pr-2">
            {fighters.map((fighter) => (
              <FighterSelectCard
                key={fighter.id}
                fighter={fighter}
                isSelected={fighter.id === activeFighter}
                onSelect={() => handleSelectFighter(fighter.id)}
              />
            ))}
          </div>

          {/* Active Fighter Dossier Card */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div>
              {/* Fighter Header Info */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{currentFighter.avatar}</span>
                    <div>
                      <h3 className="text-2xl font-black font-['Orbitron'] text-white">
                        {currentFighter.name}
                      </h3>
                      <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                        {currentFighter.callsign} // {currentFighter.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic mt-2">
                    "{currentFighter.tagline}"
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-500 uppercase block">Model</span>
                  <span className="text-[11px] font-semibold text-purple-300 font-mono">
                    {currentFighter.droneModel}
                  </span>
                </div>
              </div>

              {/* Radar Chart & Stat Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center">
                <RadarChart stats={currentFighter.stats} color={currentFighter.themeColor} />

                <div className="space-y-3">
                  {Object.entries(currentFighter.stats).map(([statKey, val]) => (
                    <div key={statKey}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400 capitalize">
                          {statKey.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-bold text-cyan-300">{val}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${val}%`,
                            backgroundColor: currentFighter.themeColor,
                            boxShadow: `0 0 8px ${currentFighter.themeColor}`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Algorithm Specialty */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] uppercase font-bold text-cyan-400 font-mono tracking-wider mb-1">
                  ⚡ Algorithm Specialty & DNA
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {currentFighter.specialty}
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {currentFighter.description}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl font-bold font-['Orbitron'] text-sm tracking-wider uppercase transition-all shadow-lg text-white"
                style={{
                  background: `linear-gradient(135deg, ${currentFighter.themeColor}, #a855f7)`,
                  boxShadow: `0 0 20px ${currentFighter.themeColor}55`,
                }}
              >
                Deploy {currentFighter.callsign}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
