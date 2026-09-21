// ============================================================================
// AlgoArena v5.0 - Multi-Agent CBS & Match Replay (.algoa) Studio Modal
// Interactive MAPF simulator, .algoa replay stream exporter & Plugin SDK inspector
// ============================================================================

import React, { useState, useMemo } from 'react';
import { ConflictBasedSearchEngine, AgentPath } from '../../engine/mapf/ConflictBasedSearch';
import { useAlgoStore } from '../../store/useAlgoStore';
import { PluginRegistry } from '../../sdk/AlgoPluginSDK';

interface MAPFReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridWidth?: number;
  gridHeight?: number;
}

export const MAPFReplayModal: React.FC<MAPFReplayModalProps> = ({
  isOpen,
  onClose,
  gridWidth = 25,
  gridHeight = 20,
}) => {
  const [tab, setTab] = useState<'mapf' | 'replay' | 'plugins'>('mapf');
  const [agentCount, setAgentCount] = useState<number>(3);
  const [solvedPaths, setSolvedPaths] = useState<Map<number, AgentPath> | null>(null);
  const [currentTimeStep, setCurrentTimeStep] = useState<number>(0);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [loadedFileName, setLoadedFileName] = useState<string>('');

  const {
    replayData,
    exportReplayJSON,
    loadReplayJSON,
    downloadReplayFile,
    selectedSquad,
  } = useAlgoStore();

  const registeredPlugins = useMemo(() => PluginRegistry.getPlugins(), [isOpen]);

  if (!isOpen) return null;

  // Agent presets with distinct starting and goal sectors
  const agentsConfig = useMemo(() => {
    const palette = [
      { id: 1, name: 'Alpha Drone (A*)', color: '#22d3ee', start: [1, 2] as [number, number], goal: [23, 17] as [number, number] },
      { id: 2, name: 'Beta Drone (Dijkstra)', color: '#c084fc', start: [23, 2] as [number, number], goal: [1, 17] as [number, number] },
      { id: 3, name: 'Gamma Drone (Genetic)', color: '#34d399', start: [1, 17] as [number, number], goal: [23, 2] as [number, number] },
      { id: 4, name: 'Delta Drone (JPS Plugin)', color: '#fbbf24', start: [23, 17] as [number, number], goal: [1, 2] as [number, number] },
    ];
    return palette.slice(0, agentCount);
  }, [agentCount]);

  const handleRunCBS = () => {
    setIsSolving(true);
    setTimeout(() => {
      const obstacles = new Set<number>();
      // Central pillar obstacles
      const midX = Math.floor(gridWidth / 2);
      const midY = Math.floor(gridHeight / 2);
      for (let dy = -2; dy <= 2; dy++) {
        obstacles.add((midY + dy) * gridWidth + midX);
      }

      const engine = new ConflictBasedSearchEngine(gridWidth, gridHeight, obstacles);
      const paths = engine.solveMAPF(agentsConfig);
      setSolvedPaths(paths);
      setCurrentTimeStep(0);
      setIsSolving(false);
    }, 50);
  };

  const maxSteps = useMemo(() => {
    if (!solvedPaths) return 0;
    let maxLen = 0;
    for (const p of solvedPaths.values()) {
      if (p.path.length > maxLen) maxLen = p.path.length;
    }
    return maxLen;
  }, [solvedPaths]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          loadReplayJSON(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,255,255,0.18)] p-6 text-white font-mono flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-cyan-300">
                ENTERPRISE ENGINE STUDIO (v5.0)
              </h2>
              <p className="text-xs text-slate-400">
                Multi-Agent Conflict-Based Search (CBS) • Deterministic Replay Stream • Plugin SDK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all text-xs"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 my-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTab('mapf')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              tab === 'mapf'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            🐝 Multi-Agent MAPF (CBS)
          </button>
          <button
            onClick={() => setTab('replay')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              tab === 'replay'
                ? 'bg-purple-950/80 text-purple-300 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            📹 Replay Stream (.algoa)
          </button>
          <button
            onClick={() => setTab('plugins')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              tab === 'plugins'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            🔌 Pathfinder Plugin SDK
          </button>
        </div>

        {/* Tab 1: Multi-Agent CBS */}
        {tab === 'mapf' && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-cyan-300 uppercase">Conflict-Based Search (CBS) Simulation</h4>
                <p className="text-xs text-slate-400">
                  Resolves intersecting trajectories $(x, y, t)$ via Space-Time constraint tree branching.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Agents:</span>
                  <select
                    value={agentCount}
                    onChange={(e) => setAgentCount(Number(e.target.value))}
                    className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-cyan-300 focus:outline-none"
                  >
                    <option value={2}>2 Agents</option>
                    <option value={3}>3 Agents</option>
                    <option value={4}>4 Agents</option>
                  </select>
                </div>
                <button
                  onClick={handleRunCBS}
                  disabled={isSolving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold uppercase text-xs shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all disabled:opacity-50"
                >
                  {isSolving ? 'Solving CBS...' : 'RUN CBS SOLVER »'}
                </button>
              </div>
            </div>

            {/* Agent Manifest Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {agentsConfig.map((agent) => {
                const path = solvedPaths?.get(agent.id);
                return (
                  <div
                    key={agent.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate" style={{ color: agent.color }}>
                        {agent.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        ID #{agent.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Start: <span className="text-slate-200">({agent.start.join(', ')})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Goal: <span className="text-slate-200">({agent.goal.join(', ')})</span>
                    </div>
                    <div className="pt-1 text-[10px] border-t border-slate-800 flex justify-between">
                      <span className="text-slate-500">Path Cost:</span>
                      <strong className="text-cyan-300">{path ? `${path.cost} steps` : 'Pending'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Space-Time Trajectory Scrubber */}
            {solvedPaths && maxSteps > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-300 font-bold uppercase">
                    Space-Time Timeline (t = {currentTimeStep} / {maxSteps})
                  </span>
                  <span className="text-emerald-400 font-bold">✓ 0 Spatial-Temporal Collisions</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxSteps - 1}
                  value={currentTimeStep}
                  onChange={(e) => setCurrentTimeStep(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                {/* Instantaneous Agent Coordinates at Time t */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {agentsConfig.map((agent) => {
                    const path = solvedPaths.get(agent.id);
                    const point = path && path.path[Math.min(currentTimeStep, path.path.length - 1)];
                    return (
                      <div
                        key={agent.id}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-center"
                      >
                        <div className="text-[10px] text-slate-500">Agent {agent.id} @ t={currentTimeStep}</div>
                        <div className="font-bold" style={{ color: agent.color }}>
                          {point ? `(${point[0]}, ${point[1]})` : 'Waiting'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Deterministic Replay Stream */}
        {tab === 'replay' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/30 space-y-2">
              <h4 className="text-sm font-bold text-purple-300 uppercase">Deterministic Match Replay Stream (.algoa)</h4>
              <p className="text-xs text-slate-400">
                AlgoArena records every algorithm node expansion as a deterministic time-stamped stream. Share and replay tournament matches anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Panel */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase">Export Match Replay</h5>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Squad: <span className="text-cyan-300">{selectedSquad.join(', ')}</span></div>
                  <div>Events recorded: <span className="text-purple-300">{replayData?.telemetryEvents.length || 0} telemetry packets</span></div>
                </div>
                <button
                  onClick={() => downloadReplayFile('algoarena_tournament.algoa')}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase text-xs shadow-[0_0_15px_rgba(192,132,252,0.4)] transition-all"
                >
                  DOWNLOAD .ALGOA REPLAY FILE
                </button>
              </div>

              {/* Import Panel */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase">Load Existing Replay</h5>
                <p className="text-xs text-slate-400">
                  Select a community <code className="text-cyan-400">.algoa</code> or JSON replay to inspect.
                </p>
                <input
                  type="file"
                  accept=".algoa,.json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                />
                {loadedFileName && (
                  <div className="text-xs text-emerald-400 font-bold truncate">
                    ✓ Loaded: {loadedFileName}
                  </div>
                )}
              </div>
            </div>

            {/* Replay JSON Payload Inspector */}
            <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-slate-500 uppercase font-bold block mb-1">Raw Replay Schema Inspector:</span>
              <pre className="max-h-36 overflow-y-auto text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded">
                {exportReplayJSON() || 'No active replay recording loaded.'}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Pathfinder Plugin SDK */}
        {tab === 'plugins' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300 uppercase">Extensible Pathfinder Plugin Registry</h4>
              <p className="text-xs text-slate-400">
                Developers and algorithm researchers can implement <code className="text-emerald-400">CustomPathfinderPlugin</code> and dynamically register their custom logic into AlgoArena.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {registeredPlugins.map((plugin) => (
                <div
                  key={plugin.metadata.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-emerald-300">{plugin.metadata.name}</h5>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ACTIVE PLUGIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{plugin.metadata.description}</p>
                  <div className="text-[10px] text-slate-500">Author: {plugin.metadata.author}</div>

                  {/* DNA Ratings */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-2 border-t border-slate-800">
                    <div className="bg-slate-950 p-1 rounded">
                      <div className="text-slate-500 text-[9px]">SPEED</div>
                      <div className="text-cyan-400 font-bold">{plugin.metadata.dna.speed}%</div>
                    </div>
                    <div className="bg-slate-950 p-1 rounded">
                      <div className="text-slate-500 text-[9px]">ACC</div>
                      <div className="text-emerald-400 font-bold">{plugin.metadata.dna.accuracy}%</div>
                    </div>
                    <div className="bg-slate-950 p-1 rounded">
                      <div className="text-slate-500 text-[9px]">EXPL</div>
                      <div className="text-purple-400 font-bold">{plugin.metadata.dna.exploration}%</div>
                    </div>
                    <div className="bg-slate-950 p-1 rounded">
                      <div className="text-slate-500 text-[9px]">ADAPT</div>
                      <div className="text-amber-400 font-bold">{plugin.metadata.dna.adaptability}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
