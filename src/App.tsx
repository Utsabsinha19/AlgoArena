// ============================================
// AlgoArena - AI Strategy & Pathfinding Simulator
// Main Application Component
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { CellType, AISuggestion, GridState } from './types';
import { useGame } from './hooks/useGame';
import { GameCanvas } from './components/GameCanvas';
import { Controls } from './components/Controls';
import { Metrics } from './components/Metrics';
import { TerrainPalette } from './components/TerrainPalette';
import { HintModal } from './components/HintModal';
import { Leaderboard } from './components/Leaderboard';
import { LearningPanel } from './components/LearningPanel';
import { MazeGeneratorDialog } from './components/MazeGeneratorDialog';
import { randomizeTerrain, exportGrid, importGrid } from './utils/gridUtils';
import { playSound, enableAudio, toggleMute, getMuteState } from './utils/sounds';
import { compareResults } from './algorithms/aiSelector';

export default function App() {
  const {
    gameState,
    setMode,
    setAlgorithm,
    setSpeed,
    updateCell,
    clearGrid,
    resetGame,
    runPathfinding,
    togglePause,
    loadGrid,
    getAISuggestion,
  } = useGame();

  const [selectedTerrain, setSelectedTerrain] = useState<CellType>('wall');
  const [showHintModal, setShowHintModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMazeDialog, setShowMazeDialog] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  // Enable audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      enableAudio();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((x: number, y: number, _button: number) => {
    if (gameState.isRunning) return;
    updateCell(x, y, selectedTerrain);
    playSound('terrainPlace');
  }, [gameState.isRunning, selectedTerrain, updateCell]);

  // Handle cell drag
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

  // Handle start
  const handleStart = useCallback(() => {
    runPathfinding();
    playSound('start');
  }, [runPathfinding]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetGame();
    playSound('click');
  }, [resetGame]);

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

  // Calculate battle result
  const battleResult = gameState.mode === 'battle' && gameState.aiResult && gameState.metrics
    ? compareResults(gameState.metrics as Parameters<typeof compareResults>[0], gameState.aiResult, gameState.algorithm, gameState.aiAlgorithm!)
    : undefined;

  // Play sounds on completion
  useEffect(() => {
    if (gameState.isComplete) {
      if (gameState.metrics?.pathLength) {
        if (battleResult?.winner === 'player') {
          playSound('victory');
        } else {
          playSound('pathFound');
        }
      } else {
        playSound('noPath');
      }
    }
  }, [gameState.isComplete, gameState.metrics?.pathLength, battleResult?.winner]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold">
              🗺️
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Orbitron'] bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AlgoArena
              </h1>
              <p className="text-xs text-slate-500">AI Strategy & Pathfinding Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={() => setShowMazeDialog(true)}
              disabled={gameState.isRunning}
              className="px-3 py-2 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50 disabled:opacity-50"
            >
              🗺️ Generate Maze
            </button>
            <button
              onClick={handleRandomize}
              disabled={gameState.isRunning}
              className="px-3 py-2 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50 disabled:opacity-50"
            >
              🎲 Randomize
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50"
            >
              📤 Export
            </button>
            <button
              onClick={handleImport}
              disabled={gameState.isRunning}
              className="px-3 py-2 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50 disabled:opacity-50"
            >
              📥 Import
            </button>
            
            <div className="w-px h-6 bg-slate-700 mx-2" />
            
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                showHeatmap 
                  ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' 
                  : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              🔥 Heatmap
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                showLeaderboard 
                  ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50' 
                  : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={handleMuteToggle}
              className="px-3 py-2 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-[280px_1fr_320px] gap-6">
          {/* Left Sidebar - Controls */}
          <div className="space-y-4">
            <Controls
              mode={gameState.mode}
              algorithm={gameState.algorithm}
              speed={gameState.speed}
              isRunning={gameState.isRunning}
              isPaused={gameState.isPaused}
              isComplete={gameState.isComplete}
              timeRemaining={gameState.timeRemaining}
              onModeChange={setMode}
              onAlgorithmChange={setAlgorithm}
              onSpeedChange={setSpeed}
              onStart={handleStart}
              onPause={togglePause}
              onReset={handleReset}
              onClear={handleClear}
              onGetHint={handleGetHint}
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
                onStepForward={() => {}}
                onStepBackward={() => {}}
                onJumpToStep={() => {}}
              />
            )}
          </div>

          {/* Center - Game Canvas */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <GameCanvas
                grid={gameState.grid}
                dynamicObstacles={gameState.dynamicObstacles}
                onCellClick={handleCellClick}
                onCellDrag={handleCellDrag}
                showHeatmap={showHeatmap}
                cellSize={28}
              />
              
              {/* Progress Overlay */}
              {gameState.isRunning && (
                <div className="absolute top-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-cyan-500/20">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Exploring...</span>
                    <span className="text-cyan-400">{gameState.currentStep} / {gameState.steps.length}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-100"
                      style={{ width: `${(gameState.currentStep / gameState.steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Algorithm Info */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <div className="text-sm text-slate-400">
                  Grid: <span className="text-white">{gameState.grid.width} × {gameState.grid.height}</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div className="text-sm text-slate-400">
                  Mode: <span className="text-cyan-400">{gameState.mode}</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div className="text-sm text-slate-400">
                  Algorithm: <span className="text-purple-400">{gameState.algorithm.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Metrics & Leaderboard */}
          <div className="space-y-4">
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

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-slate-800/50 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <div>
            AlgoArena © 2026 - AI Strategy & Pathfinding Simulator
          </div>
          <div className="flex items-center gap-4">
            <span>BFS • DFS • Dijkstra • A* • Greedy</span>
            <span>|</span>
            <span>Built with React + Canvas</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
    </div>
  );
}
