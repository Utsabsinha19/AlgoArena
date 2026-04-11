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
    <div className="p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
          🏆 Leaderboard
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            filterMode === 'all'
              ? 'bg-cyan-500/30 text-cyan-300'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          All Modes
        </button>
        {(['classic', 'battle', 'timeAttack', 'dynamic'] as GameMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterMode === mode
                ? 'bg-cyan-500/30 text-cyan-300'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {MODE_NAMES[mode]}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No entries for this mode
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${index < 3 
                  ? 'bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/10' 
                  : 'bg-slate-800/30 hover:bg-slate-800/50'
                }
              `}
            >
              {/* Rank */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${index === 0 ? 'bg-yellow-500/30 text-yellow-400' : ''}
                ${index === 1 ? 'bg-slate-400/30 text-slate-300' : ''}
                ${index === 2 ? 'bg-amber-700/30 text-amber-500' : ''}
                ${index > 2 ? 'bg-slate-700/50 text-slate-500' : ''}
              `}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{entry.username}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{ALGORITHM_NAMES[entry.algorithm]}</span>
                  <span>•</span>
                  <span>{entry.date}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-400">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">pts</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Your Stats */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="text-xs text-slate-400 mb-1">Your Best Score</div>
        <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          0 pts
        </div>
        <div className="text-xs text-slate-500">
          Complete games to climb the leaderboard!
        </div>
      </div>
    </div>
  );
}
