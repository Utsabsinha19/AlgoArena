// ============================================
// AlgoArena - Performance Metrics Component
// ============================================

import { PerformanceMetrics, AlgorithmType, AlgorithmResult, ALGORITHM_NAMES } from '../types';

interface MetricsProps {
  metrics: PerformanceMetrics | null;
  score: number;
  isComplete: boolean;
  aiAlgorithm?: AlgorithmType | null;
  aiResult?: AlgorithmResult | null;
  battleResult?: {
    winner: 'player' | 'ai' | 'tie';
    playerScore: number;
    aiScore: number;
  };
}

export function Metrics({
  metrics,
  score,
  isComplete,
  aiAlgorithm,
  aiResult,
  battleResult,
}: MetricsProps) {
  if (!metrics && !isComplete) {
    return (
      <div className="p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20">
        <h3 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-3">
          Performance Metrics
        </h3>
        <p className="text-slate-500 text-sm">
          Run a pathfinding algorithm to see metrics
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20 space-y-4">
      <h3 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
        Performance Metrics
      </h3>

      {/* Score */}
      {isComplete && (
        <div className="text-center p-4 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-lg border border-cyan-500/20">
          <div className="text-slate-400 text-sm">Score</div>
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {score.toLocaleString()}
          </div>
        </div>
      )}

      {/* Player Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Nodes Visited"
          value={metrics?.nodesVisited ?? 0}
          icon="🔍"
          color="cyan"
        />
        <MetricCard
          label="Path Length"
          value={metrics?.pathLength ?? 0}
          icon="📏"
          color="green"
        />
        <MetricCard
          label="Path Cost"
          value={metrics?.pathCost ? metrics.pathCost.toFixed(1) : 'N/A'}
          icon="💰"
          color="yellow"
        />
        <MetricCard
          label="Exec Time"
          value={`${(metrics?.executionTime ?? 0).toFixed(2)}ms`}
          icon="⚡"
          color="purple"
        />
      </div>

      {/* Algorithm Used */}
      {metrics && (
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-400">Algorithm Used</div>
          <div className="text-cyan-300 font-semibold">
            {ALGORITHM_NAMES[metrics.algorithm]}
          </div>
        </div>
      )}

      {/* Battle Mode Results */}
      {battleResult && aiAlgorithm && aiMetrics && (
        <div className="mt-4 space-y-3">
          <h4 className="text-purple-400 text-sm font-semibold uppercase tracking-wider">
            ⚔️ Battle Results
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-3 rounded-lg border ${
              battleResult.winner === 'player' 
                ? 'bg-green-900/30 border-green-500/50' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              <div className="text-xs text-slate-400">You</div>
              <div className="text-lg font-bold text-white">{battleResult.playerScore.toFixed(0)}</div>
              <div className="text-xs text-cyan-400">{ALGORITHM_NAMES[metrics?.algorithm || 'astar']}</div>
            </div>
            
            <div className={`p-3 rounded-lg border ${
              battleResult.winner === 'ai' 
                ? 'bg-red-900/30 border-red-500/50' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              <div className="text-xs text-slate-400">AI</div>
              <div className="text-lg font-bold text-white">{battleResult.aiScore.toFixed(0)}</div>
              <div className="text-xs text-purple-400">{ALGORITHM_NAMES[aiAlgorithm]}</div>
            </div>
          </div>

          <div className={`text-center p-2 rounded-lg ${
            battleResult.winner === 'player' 
              ? 'bg-green-900/50 text-green-400' 
              : battleResult.winner === 'ai'
              ? 'bg-red-900/50 text-red-400'
              : 'bg-yellow-900/50 text-yellow-400'
          }`}>
            {battleResult.winner === 'player' && '🏆 You Win!'}
            {battleResult.winner === 'ai' && '🤖 AI Wins!'}
            {battleResult.winner === 'tie' && '🤝 It\'s a Tie!'}
          </div>

          {/* AI Metrics Comparison */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="text-slate-400">AI Nodes: {aiMetrics.nodesVisited}</div>
              <div className="text-slate-400">AI Cost: {aiMetrics.pathCost.toFixed(1)}</div>
            </div>
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="text-slate-400">Your Nodes: {metrics?.nodesVisited}</div>
              <div className="text-slate-400">Your Cost: {metrics?.pathCost?.toFixed(1)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Path Status */}
      {isComplete && (
        <div className={`p-3 rounded-lg ${
          metrics?.pathLength 
            ? 'bg-green-900/30 border border-green-500/30' 
            : 'bg-red-900/30 border border-red-500/30'
        }`}>
          {metrics?.pathLength ? (
            <div className="text-green-400 text-center">
              ✅ Path Found!
            </div>
          ) : (
            <div className="text-red-400 text-center">
              ❌ No Path Found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'cyan' | 'green' | 'yellow' | 'purple';
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/30',
    green: 'text-green-400 border-green-500/30',
    yellow: 'text-yellow-400 border-yellow-500/30',
    purple: 'text-purple-400 border-purple-500/30',
  };

  return (
    <div className={`p-3 bg-slate-800/50 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>{icon}</span>
        {label}
      </div>
      <div className={`text-xl font-bold ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </div>
    </div>
  );
}
