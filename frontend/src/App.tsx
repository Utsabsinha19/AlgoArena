// ============================================
// AlgoArena - AI Strategy & Pathfinding Simulator
// Futuristic Cyberpunk Edition
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { CellType, AISuggestion, GridState, Cell } from './types';
import { useGame } from './hooks/useGame';
import { GameCanvas } from './components/GameCanvas';
import { Pathfinding3DArena } from './components/3d/Pathfinding3DArena';
import { Controls } from './components/Controls';
import { Metrics } from './components/Metrics';
import { TerrainPalette } from './components/TerrainPalette';
import { HintModal } from './components/HintModal';
import { Leaderboard } from './components/Leaderboard';
import { LearningPanel } from './components/LearningPanel';
import { MazeGeneratorDialog } from './components/MazeGeneratorDialog';
import { FighterSelectModal } from './components/FighterSelectModal';
import { AlgorithmWorkshop } from './components/AlgorithmWorkshop';
import { PlaybackScrubber } from './components/PlaybackScrubber';
import { BattleBreakdownModal } from './components/analytics/BattleBreakdownModal';
import { SquadRelayDraft } from './components/SquadRelayDraft';
import { MindReaderHUD } from './components/hud/MindReaderHUD';
import { TimeScrubBar } from './components/hud/TimeScrubBar';
import { MultiplayerArenaModal } from './components/multiplayer/MultiplayerArenaModal';
import { MAPFReplayModal } from './components/multiplayer/MAPFReplayModal';
import { TournamentLeagueModal } from './components/league/TournamentLeagueModal';
import { StreamOverlayHUD } from './components/broadcast/StreamOverlayHUD';
import { SpatialArenaVR } from './components/xr/SpatialArenaVR';
import { FrontierV7StudioModal } from './components/v7/FrontierV7StudioModal';
import { useWebWorkerSearch } from './hooks/useWebWorkerSearch';
import { webAudioEngine } from './engine/audio/WebAudioEngine';
import { randomizeTerrain, exportGrid, importGrid } from './utils/gridUtils';
import {
  playSound,
  enableAudio,
  toggleMute,
  getMuteState,
  toggleAmbientDrone,
  isAmbientRunning,
} from './utils/sounds';
import { compareResults } from './algorithms/aiSelector';

export default function App() {
  const {
    gameState,
    setMode,
    setAlgorithm,
    setSpeed,
    setTuning,
    setViewEngine,
    setCameraMode,
    updateCell,
    clearGrid,
    resetGame,
    runPathfinding,
    togglePause,
    loadGrid,
    loadAdaptivePreset,
    getAISuggestion,
    scrubToStep,
    stepForward,
    stepBackward,
    runRelaySquad,
  } = useGame();

  const [selectedTerrain, setSelectedTerrain] = useState<CellType>('wall');
  const [showHintModal, setShowHintModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMazeDialog, setShowMazeDialog] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  // Futuristic Roadmap Modal States
  const [showFighterModal, setShowFighterModal] = useState(false);
  const [showWorkshop, setShowWorkshop] = useState(false);
  const [showRelayDraft, setShowRelayDraft] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showMAPFStudio, setShowMAPFStudio] = useState(false);
  const [showLeagueStudio, setShowLeagueStudio] = useState(false);
  const [showBroadcastHUD, setShowBroadcastHUD] = useState(false);
  const [showSpatialVR, setShowSpatialVR] = useState(false);
  const [showFrontierStudio, setShowFrontierStudio] = useState(false);
  const [useWorkerMode, setUseWorkerMode] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Inspector & Audio states
  const [, setHoveredCell] = useState<Cell | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isAmbientActive, setIsAmbientActive] = useState(isAmbientRunning());

  // WebGL context detection with graceful 2D canvas fallback (Section 8)
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        setViewEngine('2d');
      }
    } catch {
      setWebglSupported(false);
      setViewEngine('2d');
    }
  }, [setViewEngine]);

  // Web Worker Multithreaded Search (Section 1.1)
  const {
    startWorkerSearch,
    cancelSearch: cancelWorkerSearch,
    isSearching: isWorkerSearching,
    progress: workerProgress,
    workerSupported,
  } = useWebWorkerSearch({
    onStep: (snapshot) => {
      webAudioEngine.playNodeExpansionSound(
        snapshot.currentNode % gameState.grid.width,
        gameState.grid.width,
        15
      );
    },
    onComplete: () => {
      webAudioEngine.playVictoryStinger();
    },
  });

  // Enable audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      enableAudio();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  // Handle cell click (for both 2D and 3D)
  const handleCellClick = useCallback((x: number, y: number, _button: number) => {
    if (gameState.isRunning) return;
    updateCell(x, y, selectedTerrain);
    playSound('terrainPlace');
  }, [gameState.isRunning, selectedTerrain, updateCell]);

  // Handle cell drag in 2D
  const handleCellDrag = useCallback((x: number, y: number) => {
    if (gameState.isRunning) return;
    updateCell(x, y, selectedTerrain);
  }, [gameState.isRunning, selectedTerrain, updateCell]);

  // Handle AI hint
  const handleGetHint = useCallback(() => {
    const suggestion = getAISuggestion();
    setAiSuggestion(suggestion);
    setShowHintModal(true);
    playSound('click');
  }, [getAISuggestion]);

  // Apply AI suggestion
  const handleApplySuggestion = useCallback(() => {
    if (aiSuggestion) {
      setAlgorithm(aiSuggestion.algorithm);
    }
    setShowHintModal(false);
    playSound('click');
  }, [aiSuggestion, setAlgorithm]);

  // Handle start (main thread or off-thread Web Worker)
  const handleStart = useCallback(() => {
    if (useWorkerMode && workerSupported) {
      startWorkerSearch(
        gameState.algorithm,
        gameState.grid,
        gameState.tuning?.heuristicWeight ?? 1.0
      );
    } else {
      runPathfinding();
    }
  }, [useWorkerMode, workerSupported, startWorkerSearch, gameState.algorithm, gameState.grid, gameState.tuning, runPathfinding]);

  // Handle reset
  const handleReset = useCallback(() => {
    cancelWorkerSearch();
    resetGame();
    playSound('click');
  }, [cancelWorkerSearch, resetGame]);

  // Handle clear
  const handleClear = useCallback(() => {
    clearGrid();
    playSound('click');
  }, [clearGrid]);

  // Handle randomize
  const handleRandomize = useCallback(() => {
    const randomized = randomizeTerrain(gameState.grid, 0.25);
    loadGrid(randomized);
    playSound('mazeGenerated');
  }, [gameState.grid, loadGrid]);

  // Handle export
  const handleExport = useCallback(() => {
    const json = exportGrid(gameState.grid);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AlgoArena-map.json';
    a.click();
    URL.revokeObjectURL(url);
    playSound('click');
  }, [gameState.grid]);

  // Handle import
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          const grid = importGrid(json);
          if (grid) {
            loadGrid(grid);
            playSound('mazeGenerated');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [loadGrid]);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    const newMuted = toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      playSound('click');
    }
  }, []);

  // Handle synthwave ambient drone toggle
  const handleAmbientToggle = useCallback(() => {
    const active = toggleAmbientDrone();
    setIsAmbientActive(active);
  }, []);

  // Battle comparison computation
  const battleResult = (gameState.mode === 'battle' || gameState.mode === 'showdown') && gameState.aiResult && gameState.metrics
    ? compareResults(
        gameState.metrics as unknown as Parameters<typeof compareResults>[0],
        gameState.aiResult,
        gameState.algorithm,
        gameState.aiAlgorithm!
      )
    : undefined;

  // Auto-open breakdown modal on completion
  useEffect(() => {
    if (gameState.isComplete && gameState.metrics) {
      setShowBreakdown(true);
    }
  }, [gameState.isComplete, gameState.metrics]);

  const currentStepData = gameState.steps[gameState.currentStep - 1] ?? null;
  const leadNode = currentStepData ? currentStepData.cell : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 text-slate-900 font-sans selection:bg-cyan-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-400/5 to-transparent rounded-full" />
      </div>

      {/* Cyber Header */}
      <header className="relative z-10 px-4 sm:px-6 py-3 border-b border-slate-200/90 bg-white/85 backdrop-blur-xl shadow-xs">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-xl shadow-md shadow-cyan-500/20 text-white">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-['Orbitron'] tracking-wider bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ALGOARENA
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-50 text-cyan-800 border border-cyan-200">
                  v3.0 Production
                </span>
                {!webglSupported && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                    2D Fallback
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Where Algorithms Compete. Intelligence Evolves.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* v3.0 Esports Multiplayer Arena Button */}
            <button
              onClick={() => setShowMultiplayer(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 hover:from-cyan-500/25 hover:to-purple-500/25 text-cyan-900 hover:text-cyan-950 text-xs font-mono font-bold rounded-xl transition-all border border-cyan-300/80 shadow-xs flex items-center gap-1.5"
            >
              <span>⚔️ Esports Arena (v3.0)</span>
            </button>

            {/* v3.0 Web Worker Off-Thread Search Toggle */}
            <button
              onClick={() => setUseWorkerMode(!useWorkerMode)}
              title="Toggle Web Worker Off-Thread Execution for 60-120 FPS"
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-xl transition-all border flex items-center gap-1.5 shadow-xs ${
                useWorkerMode
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>⚡ Worker {useWorkerMode ? 'ON' : 'OFF'}</span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-0.5" />

            {/* Quick Action Navigation Buttons */}
            <button
              onClick={() => setShowMazeDialog(true)}
              disabled={gameState.isRunning || isWorkerSearching}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-medium rounded-xl transition-all border border-slate-200 shadow-xs disabled:opacity-50"
            >
              🗺️ Maze Gen
            </button>
            <button
              onClick={handleRandomize}
              disabled={gameState.isRunning || isWorkerSearching}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-medium rounded-xl transition-all border border-slate-200 shadow-xs disabled:opacity-50"
            >
              🎲 Random
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-medium rounded-xl transition-all border border-slate-200 shadow-xs"
            >
              📤 Export
            </button>
            <button
              onClick={handleImport}
              disabled={gameState.isRunning || isWorkerSearching}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-medium rounded-xl transition-all border border-slate-200 shadow-xs disabled:opacity-50"
            >
              📥 Import
            </button>

            <div className="w-px h-6 bg-slate-200 mx-0.5" />

            {/* Ambient Synth Drone Toggle */}
            <button
              onClick={handleAmbientToggle}
              title="Toggle Cyberpunk Ambient Synth Drone"
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all border flex items-center gap-1.5 shadow-xs ${
                isAmbientActive
                  ? 'bg-purple-50 text-purple-900 border-purple-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🎹 Synth</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isAmbientActive ? 'bg-purple-500' : 'bg-slate-300'}`} />
            </button>

            {/* Heatmap & Leaderboard */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all border shadow-xs ${
                showHeatmap
                  ? 'bg-orange-50 text-orange-900 border-orange-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🔥 Heatmap
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all border shadow-xs ${
                showLeaderboard
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🏆 Rankings
            </button>
            <button
              onClick={() => setShowFrontierStudio(true)}
              title="AlgoArena v7.0 Frontier Labs (WebGPU, BCI, Quantum, Generative AI, Web3)"
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 hover:bg-indigo-100 text-indigo-900 text-xs font-mono font-bold rounded-xl transition-all border border-indigo-200 shadow-xs flex items-center gap-1.5"
            >
              <span>🌌</span>
              <span>v7 Frontier</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </button>
            <button
              onClick={handleMuteToggle}
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-all border border-slate-200 shadow-xs"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="relative z-10 max-w-[1680px] w-full mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)_300px] xl:grid-cols-[300px_minmax(0,1fr)_320px] gap-5 items-start">
          {/* Left Column - Controls & Palettes */}
          <div className="space-y-4 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1">
            <Controls
              mode={gameState.mode}
              algorithm={gameState.algorithm}
              speed={gameState.speed}
              isRunning={gameState.isRunning}
              isPaused={gameState.isPaused}
              isComplete={gameState.isComplete}
              timeRemaining={gameState.timeRemaining}
              bossCountdown={gameState.bossCountdown}
              viewEngine={gameState.viewEngine}
              onModeChange={setMode}
              onAlgorithmChange={setAlgorithm}
              onSpeedChange={setSpeed}
              onStart={handleStart}
              onPause={togglePause}
              onReset={handleReset}
              onClear={handleClear}
              onGetHint={handleGetHint}
              onOpenFighterSelect={() => setShowFighterModal(true)}
              onOpenWorkshop={() => setShowWorkshop(true)}
              onOpenRelayDraft={() => setShowRelayDraft(true)}
              onOpenMAPFStudio={() => setShowMAPFStudio(true)}
              onOpenLeagueStudio={() => setShowLeagueStudio(true)}
              onOpenFrontierStudio={() => setShowFrontierStudio(true)}
              onLoadAdaptivePreset={loadAdaptivePreset}
              onToggleViewEngine={setViewEngine}
            />

            <TerrainPalette
              selectedTerrain={selectedTerrain}
              onTerrainSelect={setSelectedTerrain}
              disabled={gameState.isRunning}
            />

            {gameState.mode === 'learning' && (
              <LearningPanel
                steps={gameState.steps}
                currentStep={gameState.currentStep}
                algorithm={gameState.algorithm}
                grid={gameState.grid}
                isRunning={gameState.isRunning}
                onStepForward={stepForward}
                onStepBackward={stepBackward}
                onJumpToStep={scrubToStep}
              />
            )}
          </div>

          {/* Center Column - Arena (2D Canvas or 3D Three.js), HUD, and Scrubber */}
          <div className="flex flex-col items-center gap-4 w-full min-w-0">
            {/* Real-time Mind Reader Commentary HUD with Section 6 Empirical Metrics */}
            <div className="w-full">
              <MindReaderHUD
                algorithm={gameState.algorithm}
                activeSnapshot={gameState.snapshots[gameState.currentStep - 1] ?? null}
                optimalCost={gameState.optimalCost}
                optimalPathLength={gameState.optimalCost}
                totalGridCells={gameState.grid.width * gameState.grid.height}
                isOpenSetSize={gameState.snapshots[gameState.currentStep - 1]?.openSet?.length ?? 1}
                isSearching={gameState.isRunning || isWorkerSearching}
              />
            </div>

            {/* Arena View (Toggle between 3D Holographic R3F InstancedMesh or 2D Tactical Canvas) */}
            <div className="relative w-full flex justify-center">
              {gameState.viewEngine === '3d' ? (
                <Pathfinding3DArena
                  grid={gameState.grid}
                  dynamicObstacles={gameState.dynamicObstacles}
                  cameraMode={gameState.cameraMode}
                  onCameraModeChange={setCameraMode}
                  onCellClick={handleCellClick}
                  leadNode={leadNode}
                  activeAlgorithm={gameState.algorithm}
                />
              ) : (
                <GameCanvas
                  grid={gameState.grid}
                  dynamicObstacles={gameState.dynamicObstacles}
                  onCellClick={handleCellClick}
                  onCellDrag={handleCellDrag}
                  onHoverCell={setHoveredCell}
                  showHeatmap={showHeatmap}
                  cellSize={28}
                />
              )}

              {/* Exploration Progress Pill */}
              {(gameState.isRunning || isWorkerSearching) && (
                <div className="absolute top-2 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-cyan-300 shadow-lg text-slate-800">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-600 font-medium">
                      {isWorkerSearching ? '⚡ Off-Thread Worker Processing...' : 'Simulating Neural Frontier...'}
                    </span>
                    <span className="text-cyan-700 font-bold">
                      {isWorkerSearching && workerProgress
                        ? `${workerProgress.nodesExplored} nodes`
                        : `${gameState.currentStep} / ${gameState.steps.length} nodes`}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-100 shadow-sm"
                      style={{
                        width: isWorkerSearching && workerProgress
                          ? `${Math.min(100, (workerProgress.nodesExplored / 300) * 100)}%`
                          : `${gameState.steps.length > 0 ? (gameState.currentStep / gameState.steps.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Precision Time-Dilation Playback Scrubber */}
            <div className="w-full">
              <PlaybackScrubber
                currentStep={gameState.currentStep}
                totalSteps={gameState.steps.length}
                isPlaying={gameState.isRunning && !gameState.isPaused}
                speedMultiplier={speedMultiplier}
                onPlayPause={togglePause}
                onStepForward={stepForward}
                onStepBackward={stepBackward}
                onScrub={scrubToStep}
                onSpeedMultiplierChange={(mult) => {
                  setSpeedMultiplier(mult);
                  setSpeed(Math.min(100, Math.max(10, Math.round(mult * 50))));
                }}
              />
            </div>

            {/* v3.0 Floating Time Scrub Bar during Active/Snapshot Review */}
            {gameState.snapshots.length > 0 && (
              <TimeScrubBar
                currentStep={Math.max(0, gameState.currentStep - 1)}
                totalSteps={gameState.snapshots.length}
                isPlaying={gameState.isRunning && !gameState.isPaused}
                playbackSpeed={speedMultiplier}
                onPlayPause={togglePause}
                onStepForward={stepForward}
                onStepBackward={stepBackward}
                onSeek={(step) => scrubToStep(step + 1)}
                onSpeedChange={(speed) => {
                  setSpeedMultiplier(speed);
                  setSpeed(Math.min(100, Math.max(10, Math.round(speed * 50))));
                }}
                executionTimeMs={gameState.snapshots[gameState.currentStep - 1]?.metrics.executionTimeMs || 0}
              />
            )}

            {/* Quick Status Bar */}
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 text-xs font-mono text-slate-600 shadow-sm">
              <div className="flex items-center gap-3">
                <span>Sector: <strong className="text-slate-900 font-bold">{gameState.grid.width}×{gameState.grid.height}</strong></span>
                <span>•</span>
                <span>Mode: <strong className="text-cyan-700 uppercase font-bold">{gameState.mode}</strong></span>
                <span>•</span>
                <span>Vanguard: <strong className="text-purple-700 uppercase font-bold">{gameState.algorithm}</strong></span>
              </div>
              <button
                onClick={() => setShowBreakdown(true)}
                disabled={!gameState.metrics}
                className="text-cyan-700 hover:text-cyan-800 font-bold uppercase disabled:opacity-40"
              >
                View Post-Mortem 📊
              </button>
            </div>
          </div>

          {/* Right Column - Metrics & Leaderboard */}
          <div className="space-y-4 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1">
            <Metrics
              metrics={gameState.metrics}
              score={gameState.score}
              isComplete={gameState.isComplete}
              aiAlgorithm={gameState.aiAlgorithm}
              aiResult={gameState.aiResult}
              battleResult={battleResult}
            />

            {showLeaderboard && (
              <Leaderboard onClose={() => setShowLeaderboard(false)} />
            )}
          </div>
        </div>
      </main>

      {/* Futuristic Modals */}
      {showFighterModal && (
        <FighterSelectModal
          isOpen={showFighterModal}
          selectedAlgorithm={gameState.algorithm}
          onSelectAlgorithm={(algo) => setAlgorithm(algo)}
          onClose={() => setShowFighterModal(false)}
        />
      )}

      {showWorkshop && (
        <AlgorithmWorkshop
          isOpen={showWorkshop}
          algorithm={gameState.algorithm}
          tuning={gameState.tuning}
          onTuningChange={setTuning}
          onClose={() => setShowWorkshop(false)}
        />
      )}

      {showBreakdown && gameState.metrics && (
        <BattleBreakdownModal
          isOpen={showBreakdown}
          playerAlgo={gameState.algorithm}
          playerMetrics={gameState.metrics}
          aiAlgo={gameState.aiAlgorithm}
          aiResult={gameState.aiResult}
          optimalDijkstraCost={gameState.optimalCost}
          onClose={() => setShowBreakdown(false)}
          onRematch={() => {
            setShowBreakdown(false);
            runPathfinding();
          }}
        />
      )}

      {showRelayDraft && (
        <SquadRelayDraft
          isOpen={showRelayDraft}
          onStartRelay={(squad) => runRelaySquad(squad)}
          onClose={() => setShowRelayDraft(false)}
        />
      )}

      {showHintModal && aiSuggestion && (
        <HintModal
          suggestion={aiSuggestion}
          onClose={() => setShowHintModal(false)}
          onApply={handleApplySuggestion}
        />
      )}

      {showMazeDialog && (
        <MazeGeneratorDialog
          width={gameState.grid.width}
          height={gameState.grid.height}
          onGenerate={(grid: GridState) => {
            loadGrid(grid);
            playSound('mazeGenerated');
          }}
          onClose={() => setShowMazeDialog(false)}
        />
      )}

      {/* v3.0 Esports Multiplayer Arena Modal */}
      {showMultiplayer && (
        <MultiplayerArenaModal
          isOpen={showMultiplayer}
          onClose={() => setShowMultiplayer(false)}
        />
      )}

      {/* v5.0 Multi-Agent CBS & Replay Studio Modal */}
      {showMAPFStudio && (
        <MAPFReplayModal
          isOpen={showMAPFStudio}
          gridWidth={gameState.grid.width}
          gridHeight={gameState.grid.height}
          onClose={() => setShowMAPFStudio(false)}
        />
      )}

      {/* v6.0 Stream Broadcast Overlay HUD */}
      {showBroadcastHUD && (
        <StreamOverlayHUD
          matchName="ALGOARENA PRO LEAGUE • GRAND FINALS"
          algoAName={gameState.algorithm.toUpperCase()}
          algoBName="GNN SENTINEL"
          winProbabilityA={0.58}
          nodesExploredA={gameState.metrics?.nodesVisited ?? gameState.currentStep ?? 42}
          nodesExploredB={Math.round((gameState.metrics?.nodesVisited ?? gameState.currentStep ?? 40) * 0.9 + 15)}
          speedA={Math.round(gameState.speed * 100)}
          speedB={95}
          pathCostA={gameState.metrics?.pathCost ?? 35}
          pathCostB={Math.max(1, (gameState.metrics?.pathCost ?? 35) - 2)}
          onClose={() => setShowBroadcastHUD(false)}
        />
      )}

      {/* v6.0 Autonomous Tournament League & Broadcast Studio Modal */}
      {showLeagueStudio && (
        <TournamentLeagueModal
          isOpen={showLeagueStudio}
          onClose={() => setShowLeagueStudio(false)}
          onToggleBroadcastHUD={() => setShowBroadcastHUD((prev) => !prev)}
          isBroadcastHUDActive={showBroadcastHUD}
          onLaunchVR={() => setShowSpatialVR(true)}
        />
      )}

      {/* v6.0 WebXR Spatial Computing Arena */}
      {showSpatialVR && (
        <SpatialArenaVR onClose={() => setShowSpatialVR(false)} />
      )}

      {/* v7.0 Frontier Labs Studio Modal */}
      {showFrontierStudio && (
        <FrontierV7StudioModal
          isOpen={showFrontierStudio}
          onClose={() => setShowFrontierStudio(false)}
          gridWidth={gameState.grid.width}
          gridHeight={gameState.grid.height}
          currentAlgorithm={gameState.algorithm}
          onApplyGeneratedLevel={(newGrid) => {
            loadGrid(newGrid);
            playSound('mazeGenerated');
          }}
          onSyncHeuristicWeight={(weight) => {
            setTuning({ ...gameState.tuning, heuristicWeight: weight });
          }}
        />
      )}
    </div>
  );
}
