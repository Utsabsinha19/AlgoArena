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
  const isIdle = !metrics && !isComplete;

  return (
    <div className="p-4 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 space-y-4 shadow-xl text-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800 text-sm font-bold uppercase tracking-wider">
          Performance Metrics
        </h3>
        {isIdle && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            Standby
          </span>
        )}
      </div>

      {isIdle && (
        <p className="text-slate-600 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          ⚡ Run or scrub an algorithm to inspect real-time benchmarking telemetry.
        </p>
      )}

      {/* Score */}
      {isComplete && (
        <div className="text-center p-4 bg-gradient-to-r from-cyan-50 via-purple-50 to-pink-50 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Score</div>
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-purple-700 mt-1">
            {score.toLocaleString()}
          </div>
        </div>
      )}

      {/* Player Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Nodes Visited"
          value={metrics ? metrics.nodesVisited : '--'}
          icon="🔍"
          color="cyan"
        />
        <MetricCard
          label="Path Length"
          value={metrics ? metrics.pathLength : '--'}
          icon="📏"
          color="green"
        />
        <MetricCard
          label="Path Cost"
          value={metrics && metrics.pathCost !== undefined ? metrics.pathCost.toFixed(1) : '--'}
          icon="💰"
          color="yellow"
        />
        <MetricCard
          label="Exec Time"
          value={metrics ? `${metrics.executionTime.toFixed(2)}ms` : '--'}
          icon="⚡"
          color="purple"
        />
      </div>

      {/* Algorithm Used */}
      {metrics && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Algorithm Used</div>
          <div className="text-cyan-800 font-bold">
            {ALGORITHM_NAMES[metrics.algorithm]}
          </div>
        </div>
      )}

      {/* Battle Mode Results */}
      {battleResult && aiAlgorithm && aiResult && (
        <div className="mt-4 space-y-3">
          <h4 className="text-purple-800 text-sm font-bold uppercase tracking-wider">
            ⚔️ Battle Results
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-3 rounded-xl border ${
              battleResult.winner === 'player' 
                ? 'bg-emerald-50 border-emerald-300' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs text-slate-500">You</div>
              <div className="text-lg font-bold text-slate-900">{battleResult.playerScore.toFixed(0)}</div>
              <div className="text-xs text-cyan-700 font-semibold">{ALGORITHM_NAMES[metrics?.algorithm || 'astar']}</div>
            </div>
            
            <div className={`p-3 rounded-xl border ${
              battleResult.winner === 'ai' 
                ? 'bg-rose-50 border-rose-300' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs text-slate-500">AI</div>
              <div className="text-lg font-bold text-slate-900">{battleResult.aiScore.toFixed(0)}</div>
              <div className="text-xs text-purple-700 font-semibold">{ALGORITHM_NAMES[aiAlgorithm]}</div>
            </div>
          </div>

          <div className={`text-center p-2 rounded-xl font-bold text-xs ${
            battleResult.winner === 'player' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : battleResult.winner === 'ai'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {battleResult.winner === 'player' && '🏆 You Win!'}
            {battleResult.winner === 'ai' && '🤖 AI Wins!'}
            {battleResult.winner === 'tie' && '🤝 It\'s a Tie!'}
          </div>

          {/* AI Metrics Comparison */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-600">AI Nodes: <strong>{aiResult.nodesVisited}</strong></div>
              <div className="text-slate-600">AI Cost: <strong>{(aiResult.pathCost ?? aiResult.cost).toFixed(1)}</strong></div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-600">Your Nodes: <strong>{metrics?.nodesVisited}</strong></div>
              <div className="text-slate-600">Your Cost: <strong>{metrics?.pathCost?.toFixed(1)}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Path Status */}
      {isComplete && (
        <div className={`p-3 rounded-xl border text-center font-bold text-sm ${
          metrics?.pathLength 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {metrics?.pathLength ? '✅ Path Found!' : '❌ No Path Found'}
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
    cyan: 'text-cyan-700 border-cyan-200 bg-cyan-50/60',
    green: 'text-emerald-700 border-emerald-200 bg-emerald-50/60',
    yellow: 'text-amber-700 border-amber-200 bg-amber-50/60',
    purple: 'text-purple-700 border-purple-200 bg-purple-50/60',
  };

  return (
    <div className={`p-3 rounded-xl border shadow-xs ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-xl font-black mt-1 ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </div>
    </div>
  );
}
