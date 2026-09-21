// ============================================================================
// AlgoArena v6.0 - Autonomous AI Tournament & Broadcast Studio Modal
// Leaderboard Elo, Swiss-System Director, GNN Evaluator, Sandbox & Spatial Controls
// ============================================================================

import React, { useState, useMemo } from 'react';
import { TournamentDirector, CompetitorProfile, MatchResult } from '../../engine/league/TournamentDirector';
import { GNNHeuristicEvaluator } from '../../engine/ai/GNNHeuristicEvaluator';
import { PluginSandbox } from '../../engine/security/PluginSandbox';

interface TournamentLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleBroadcastHUD: () => void;
  isBroadcastHUDActive: boolean;
  onLaunchVR: () => void;
}

type TabType = 'league' | 'gnn' | 'sandbox' | 'broadcast';

export const TournamentLeagueModal: React.FC<TournamentLeagueModalProps> = ({
  isOpen,
  onClose,
  onToggleBroadcastHUD,
  isBroadcastHUDActive,
  onLaunchVR,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('league');
  const director = useMemo(() => new TournamentDirector(), []);
  const gnnEvaluator = useMemo(() => new GNNHeuristicEvaluator(), []);
  const sandbox = useMemo(() => new PluginSandbox(50_000), []);

  const [leaderboard, setLeaderboard] = useState<CompetitorProfile[]>(() => director.getLeaderboard());
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>(() => director.getMatchHistory());
  const [currentRound, setCurrentRound] = useState<number>(() => director.getCurrentRound());

  // GNN Heuristic State
  const [gnnNodeX, setGnnNodeX] = useState<number>(2);
  const [gnnNodeY, setGnnNodeY] = useState<number>(3);
  const [gnnGoalX] = useState<number>(18);
  const [gnnGoalY] = useState<number>(18);
  const [gnnResult, setGnnResult] = useState<{ euclidean: number; gnnHeuristic: number; wallPenalty: number } | null>(null);

  // Sandbox State
  const [sandboxFuelLimit, setSandboxFuelLimit] = useState<number>(25_000);
  const [sandboxLog, setSandboxLog] = useState<{
    status: 'idle' | 'success' | 'exhausted';
    message: string;
    hash: string;
    fuelConsumed: number;
    timeMs: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleSimulateRound = () => {
    director.simulateRound();
    setLeaderboard(director.getLeaderboard());
    setMatchHistory(director.getMatchHistory());
    setCurrentRound(director.getCurrentRound());
  };

  const handleResetTournament = () => {
    director.resetTournament();
    setLeaderboard(director.getLeaderboard());
    setMatchHistory([]);
    setCurrentRound(1);
  };

  const handleEvaluateGNN = () => {
    const obstacles = new Set<number>();
    // Add sample cluster around node
    obstacles.add((gnnNodeY - 1) * 20 + gnnNodeX);
    obstacles.add((gnnNodeY + 1) * 20 + gnnNodeX);
    obstacles.add(gnnNodeY * 20 + (gnnNodeX - 1));

    const dx = Math.abs(gnnNodeX - gnnGoalX);
    const dy = Math.abs(gnnNodeY - gnnGoalY);
    const euclidean = parseFloat(Math.sqrt(dx * dx + dy * dy).toFixed(2));
    const gnnVal = gnnEvaluator.evaluateGridNode(gnnNodeX, gnnNodeY, gnnGoalX, gnnGoalY, 20, 20, obstacles);

    setGnnResult({
      euclidean,
      gnnHeuristic: gnnVal,
      wallPenalty: parseFloat((gnnVal - euclidean).toFixed(2)),
    });
  };

  const handleRunSafeAlgorithm = () => {
    sandbox.setFuelLimit(sandboxFuelLimit);
    const res = sandbox.executeSafely((sb) => {
      let sum = 0;
      for (let i = 0; i < 1_200; i++) {
        sb.consumeFuel(1);
        sum += Math.sqrt(i);
      }
      return { pathCalculated: true, checksum: Math.round(sum) };
    });

    setSandboxLog({
      status: 'success',
      message: `Execution completed successfully. Computed: ${JSON.stringify(res.result)}`,
      hash: res.executionProofHash,
      fuelConsumed: res.fuelConsumed,
      timeMs: res.executionTimeMs,
    });
  };

  const handleRunRunawayAlgorithm = () => {
    sandbox.setFuelLimit(sandboxFuelLimit);
    const res = sandbox.executeSafely((sb) => {
      // Infinite loop simulation
      let iter = 0;
      while (true) {
        sb.consumeFuel(1);
        iter++;
        if (iter > 100_000_000) break;
      }
      return { completed: true };
    });

    setSandboxLog({
      status: 'exhausted',
      message: res.error || 'Fuel quota exceeded',
      hash: res.executionProofHash || 'N/A',
      fuelConsumed: res.fuelConsumed,
      timeMs: res.executionTimeMs,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-mono">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <h2 className="text-xl font-black text-cyan-300 tracking-wide flex items-center gap-2">
                🏆 AUTONOMOUS LEAGUE & BROADCAST STUDIO (V6.0)
              </h2>
              <p className="text-xs text-slate-400">
                Glicko-2 Elo Ladder • GNN Learned Heuristics • Broadcast Stream • WebAssembly Sandbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-sm transition-colors cursor-pointer"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('league')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'league'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            🌐 AUTONOMOUS ELO LEAGUE
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'broadcast'
                ? 'border-red-400 text-red-300 bg-red-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            🎥 STREAM BROADCAST HUD
          </button>
          <button
            onClick={() => setActiveTab('gnn')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'gnn'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            🧠 GNN LEARNED HEURISTICS
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'sandbox'
                ? 'border-purple-400 text-purple-300 bg-purple-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            🛡️ PROOF-OF-EXECUTION SANDBOX
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Autonomous ELO League */}
          {activeTab === 'league' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    TOURNAMENT STAGE:{' '}
                    <strong className="text-cyan-300 text-sm">SWISS ROUND {currentRound}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">
                    ACTIVE BOTS: <strong className="text-emerald-400">{leaderboard.length}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSimulateRound}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>▶</span> SIMULATE SWISS ROUND
                  </button>
                  <button
                    onClick={handleResetTournament}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    ↺ RESET LEAGUE
                  </button>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    PRO ESPORTS LEAGUE STANDINGS
                  </span>
                  <span className="text-[11px] text-slate-400">Glicko-2 Dynamic Rating Engine</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">RANK</th>
                        <th className="p-3">COMPETITOR BOT</th>
                        <th className="p-3">ALGORITHM DNA</th>
                        <th className="p-3">ELO RATING</th>
                        <th className="p-3">W / L / D</th>
                        <th className="p-3">WIN RATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {leaderboard.map((bot, idx) => {
                        const winRate =
                          bot.matchesPlayed > 0
                            ? Math.round((bot.wins / bot.matchesPlayed) * 100)
                            : 0;
                        return (
                          <tr
                            key={bot.id}
                            className={`hover:bg-cyan-950/20 transition-colors ${
                              idx === 0 ? 'bg-amber-950/10' : ''
                            }`}
                          >
                            <td className="p-3 font-bold">
                              {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                            </td>
                            <td className="p-3 font-bold text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              {bot.name}
                            </td>
                            <td className="p-3 uppercase text-cyan-400 font-semibold text-[11px]">
                              {bot.algorithmType}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                                {bot.eloRating}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300 font-mono">
                              <span className="text-emerald-400">{bot.wins}W</span> -{' '}
                              <span className="text-red-400">{bot.losses}L</span> -{' '}
                              <span className="text-slate-400">{bot.draws}D</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-400 h-full rounded-full"
                                    style={{ width: `${winRate}%` }}
                                  />
                                </div>
                                <span className="text-slate-300 text-[11px]">{winRate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Match History Log */}
              {matchHistory.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    RECENT TOURNAMENT RACES ({matchHistory.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                    {matchHistory.slice(-6).reverse().map((m) => {
                      const compA = director.getCompetitor(m.competitorAId);
                      const compB = director.getCompetitor(m.competitorBId);
                      const winnerName = m.winnerId ? director.getCompetitor(m.winnerId)?.name : 'Draw';
                      return (
                        <div
                          key={m.matchId}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex justify-between items-center"
                        >
                          <div>
                            <div className="font-semibold text-slate-200">
                              {compA?.name} <span className="text-slate-500">vs</span> {compB?.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Costs: {m.pathCostA} vs {m.pathCostB} • Times: {m.executionTimeA}ms vs {m.executionTimeB}ms
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                            🏆 {winnerName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Stream Broadcast HUD */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-red-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      ESPORTS LIVE BROADCAST OVERLAY
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Enables a top-anchored, OBS-compatible broadcast overlay displaying real-time Monte Carlo win probability, node exploration velocity, and live tickers.
                    </p>
                  </div>
                  <button
                    onClick={onToggleBroadcastHUD}
                    className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                      isBroadcastHUDActive
                        ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {isBroadcastHUDActive ? '🔴 HUD ACTIVE (CLICK TO DISABLE)' : '⚪ ACTIVATE BROADCAST HUD'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">BROADCAST ENGINE</span>
                    <strong className="text-cyan-400">Monte Carlo Telemetry</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">CAPTURE CAPABILITY</span>
                    <strong className="text-emerald-400">Clean OBS / Twitch Overlay</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">STATUS</span>
                    <strong className={isBroadcastHUDActive ? 'text-red-400' : 'text-slate-400'}>
                      {isBroadcastHUDActive ? 'STREAMING TOP HUD' : 'STANDBY'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Spatial Arena Launcher */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <span>🥽</span> WEBXR SPATIAL ARENA (VR/AR)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Launch immersive 3D spatial computing viewport with holographic inspection table and 6-DOF controllers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onLaunchVR();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/40 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>🥽</span> LAUNCH 3D SPATIAL ARENA
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GNN Learned Heuristics */}
          {activeTab === 'gnn' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
                    GRAPH NEURAL NETWORK LEARNED HEURISTICS (ONNX WEB)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Aggregates spatial graph topology and obstacle resistance via neural message passing:
                    <span className="block my-1 font-mono text-emerald-300">
                      h_GNN(v_i, v_goal) = Φ(AGGREGATE({'{'} f(v_j) : v_j ∈ N(v_i) {'}'}))
                    </span>
                    Prevents classical heuristic local-minimum traps around U-shaped walls.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Node Coord X</label>
                    <input
                      type="number"
                      value={gnnNodeX}
                      onChange={(e) => setGnnNodeX(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Node Coord Y</label>
                    <input
                      type="number"
                      value={gnnNodeY}
                      onChange={(e) => setGnnNodeY(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Goal Coord X</label>
                    <input
                      type="number"
                      disabled
                      value={gnnGoalX}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Goal Coord Y</label>
                    <input
                      type="number"
                      disabled
                      value={gnnGoalY}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleEvaluateGNN}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  ⚡ COMPUTE GNN HEURISTIC POLICY
                </button>

                {gnnResult && (
                  <div className="p-4 rounded-lg bg-slate-950 border border-emerald-500/40 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">NAIVE EUCLIDEAN (L2)</span>
                      <strong className="text-cyan-300 text-sm">{gnnResult.euclidean}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">GNN TOPOLOGY RESISTANCE</span>
                      <strong className="text-emerald-300 text-sm">{gnnResult.gnnHeuristic}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">DETOUR WALL PENALTY</span>
                      <strong className="text-amber-400 text-sm">+{gnnResult.wallPenalty}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Plugin Sandbox */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-purple-500/30 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                    ANTI-CHEAT PLUGIN SANDBOX & PROOF-OF-EXECUTION
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Isolates third-party user plugins within an instruction fuel watchdog and generates deterministic SHA-256 Merkle proofs to prevent client spoofing.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-1/3">
                    <label className="text-[11px] text-slate-400 block mb-1">Fuel Quota (Instructions)</label>
                    <input
                      type="number"
                      value={sandboxFuelLimit}
                      onChange={(e) => setSandboxFuelLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-end gap-3 flex-1">
                    <button
                      onClick={handleRunSafeAlgorithm}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      ✓ TEST SAFE ALGORITHM
                    </button>
                    <button
                      onClick={handleRunRunawayAlgorithm}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      ⚠ TEST RUNAWAY INFINITE LOOP
                    </button>
                  </div>
                </div>

                {sandboxLog && (
                  <div
                    className={`p-4 rounded-lg border text-xs space-y-2 ${
                      sandboxLog.status === 'success'
                        ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                        : 'bg-red-950/30 border-red-500/40 text-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-sm uppercase">
                        {sandboxLog.status === 'success' ? '✓ EXECUTION VERIFIED' : '⚠ QUOTA HALT TRIGGERED'}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        Fuel: {sandboxLog.fuelConsumed} / {sandboxFuelLimit} • Time: {sandboxLog.timeMs}ms
                      </span>
                    </div>
                    <p className="text-xs">{sandboxLog.message}</p>
                    <div className="pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">SHA-256 Merkle Proof Hash: </span>
                      <strong className="text-cyan-300 font-mono">{sandboxLog.hash}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
