// ============================================
// AlgoArena - Leaderboard Component
// ============================================

import { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode, ALGORITHM_NAMES, MODE_NAMES } from '../types';

// Mock leaderboard data (would come from API in production)
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'PathMaster', score: 9850, algorithm: 'astar', mode: 'classic', date: '2024-01-15' },
  { rank: 2, username: 'GridWalker', score: 9720, algorithm: 'dijkstra', mode: 'classic', date: '2024-01-15' },
  { rank: 3, username: 'AlgoNinja', score: 9650, algorithm: 'astar', mode: 'battle', date: '2024-01-14' },
  { rank: 4, username: 'MazeRunner', score: 9500, algorithm: 'bfs', mode: 'timeAttack', date: '2024-01-14' },
  { rank: 5, username: 'CodeWarrior', score: 9400, algorithm: 'greedy', mode: 'dynamic', date: '2024-01-13' },
  { rank: 6, username: 'TechWizard', score: 9350, algorithm: 'astar', mode: 'classic', date: '2024-01-13' },
  { rank: 7, username: 'ByteHunter', score: 9200, algorithm: 'dijkstra', mode: 'battle', date: '2024-01-12' },
  { rank: 8, username: 'DataDragon', score: 9100, algorithm: 'bfs', mode: 'classic', date: '2024-01-12' },
  { rank: 9, username: 'LogicLord', score: 9000, algorithm: 'astar', mode: 'dynamic', date: '2024-01-11' },
  { rank: 10, username: 'PathFinder', score: 8950, algorithm: 'greedy', mode: 'timeAttack', date: '2024-01-11' },
];

interface LeaderboardProps {
  onClose?: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [filterMode, setFilterMode] = useState<GameMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    setIsLoading(true);
    setTimeout(() => {
      let filtered = mockLeaderboard;
      if (filterMode !== 'all') {
        filtered = mockLeaderboard.filter(e => e.mode === filterMode);
      }
      setEntries(filtered);
      setIsLoading(false);
    }, 300);
  }, [filterMode]);

  return (
    <div className="p-4 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md text-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-800 text-sm font-bold uppercase tracking-wider">
          🏆 Leaderboard
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            filterMode === 'all'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Modes
        </button>
        {(['classic', 'battle', 'timeAttack', 'dynamic'] as GameMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterMode === mode
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {MODE_NAMES[mode]}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            No entries for this mode
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-colors
                ${index < 3 
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200/80 shadow-xs' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }
              `}
            >
              {/* Rank */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${index === 0 ? 'bg-amber-100 text-amber-800' : ''}
                ${index === 1 ? 'bg-slate-200 text-slate-700' : ''}
                ${index === 2 ? 'bg-amber-100 text-amber-700' : ''}
                ${index > 2 ? 'bg-slate-100 text-slate-500' : ''}
              `}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate text-xs">{entry.username}</div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{ALGORITHM_NAMES[entry.algorithm]}</span>
                  <span>•</span>
                  <span>{entry.date}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-base font-bold text-cyan-700">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">pts</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Your Stats */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-xs text-slate-500 mb-1 font-medium">Your Best Score</div>
        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-purple-700">
          0 pts
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Complete games to climb the leaderboard!
        </div>
      </div>
    </div>
  );
}
