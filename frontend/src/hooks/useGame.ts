// ============================================================================
// AlgoArena v2.0 - Enhanced Game State Hook with Snapshot Buffering & Spatial Audio
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GridState,
  GameMode,
  AlgorithmType,
  GameState,
  AlgorithmResult,
  PerformanceMetrics,
  AISuggestion,
  AlgorithmStep,
  ViewEngine,
  CameraMode,
  AlgorithmTuningConfig,
  DEFAULT_TUNING_CONFIG,
  CellType,
} from '../types';
import { SearchStepSnapshot } from '../types/algoArena';
import { initializeGrid, setCellType, clearVisualization, createDynamicObstacles, updateDynamicObstacles } from '../utils/gridUtils';
import { runAlgorithm, dijkstra } from '../algorithms/index';
import { selectBestAlgorithm, runAIBattle, compareResults } from '../algorithms/aiSelector';
import { playSynthwaveVictory, playGlitchDefeat, playSound } from '../utils/sounds';
import { NodeAudioSynth } from '../engine/audio/NodeAudioSynth';
import { runDQNAgent } from '../engine/algorithms/dqnAgent';
import { generateAdaptiveArena, AdaptiveWeaknessType } from '../engine/algorithms/adaptiveGenerator';
import { generateAdaptiveMap, AdaptiveMapArchetype } from '../utils/adaptiveLevelGen';
import { collapseNextSector, createBossLaserHazards } from '../utils/bossArena';

const GRID_WIDTH = 25;
const GRID_HEIGHT = 20;

const initialState: GameState = {
  grid: initializeGrid(GRID_WIDTH, GRID_HEIGHT),
  mode: 'classic',
  algorithm: 'astar',
  tuning: DEFAULT_TUNING_CONFIG,
  isRunning: false,
  isPaused: false,
  isComplete: false,
  speed: 60,
  metrics: null,
  currentStep: 0,
  steps: [],
  dynamicObstacles: [],
  timeRemaining: 60,
  score: 0,
  aiAlgorithm: null,
  aiResult: null,

  viewEngine: '2d',
  cameraMode: 'isometric',

  bossSectorCollapsed: 0,
  bossMaxSectors: 4,
  bossCountdown: 12,

  relaySquad: ['bfs', 'astar', 'rl'],
  relayCurrentStage: 0,
  relayStageResults: [],

  snapshots: [],
  optimalCost: 0,
};

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const animationRef = useRef<number | null>(null);
  const stepIndexRef = useRef(0);
  const dynamicUpdateRef = useRef<number>(0);
  const bossTimerRef = useRef<number>(0);
  const stepsCacheRef = useRef<AlgorithmStep[]>([]);
  const cleanGridCacheRef = useRef<GridState | null>(null);

  // Reset game
  const resetGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setGameState(prev => ({
      ...initialState,
      grid: initializeGrid(GRID_WIDTH, GRID_HEIGHT),
      mode: prev.mode,
      algorithm: prev.algorithm,
      tuning: prev.tuning,
      speed: prev.speed,
      viewEngine: prev.viewEngine,
      cameraMode: prev.cameraMode,
    }));

    stepIndexRef.current = 0;
    stepsCacheRef.current = [];
  }, []);

  // Set game mode
  const setMode = useCallback((mode: GameMode) => {
    setGameState(prev => {
      let obstacles = prev.dynamicObstacles;
      let grid = prev.grid;

      if (mode === 'dynamic') {
        obstacles = createDynamicObstacles(prev.grid, 5);
      } else if (mode === 'boss') {
        obstacles = createBossLaserHazards(GRID_WIDTH, GRID_HEIGHT);
      } else {
        obstacles = [];
      }

      if (mode === 'showdown') {
        return {
          ...prev,
          mode,
          algorithm: 'rl',
          aiAlgorithm: 'genetic',
          isRunning: false,
          isComplete: false,
          metrics: null,
          currentStep: 0,
          steps: [],
          snapshots: [],
          dynamicObstacles: obstacles,
        };
      }

      return {
        ...prev,
        mode,
        grid,
        isRunning: false,
        isComplete: false,
        metrics: null,
        currentStep: 0,
        steps: [],
        snapshots: [],
        timeRemaining: mode === 'timeAttack' ? 60 : (mode === 'boss' ? 45 : 60),
        dynamicObstacles: obstacles,
        bossSectorCollapsed: 0,
      };
    });
  }, []);

  // Set algorithm
  const setAlgorithm = useCallback((algorithm: AlgorithmType) => {
    setGameState(prev => ({
      ...prev,
      algorithm,
    }));
  }, []);

  // Set speed
  const setSpeed = useCallback((speed: number) => {
    setGameState(prev => ({
      ...prev,
      speed,
    }));
  }, []);

  // Set tuning config
  const setTuning = useCallback((tuning: AlgorithmTuningConfig) => {
    setGameState(prev => ({
      ...prev,
      tuning,
    }));
  }, []);

  // View Engine toggle (2D vs 3D)
  const setViewEngine = useCallback((viewEngine: ViewEngine) => {
    setGameState(prev => ({
      ...prev,
      viewEngine,
    }));
    playSound('click');
  }, []);

  // 3D Camera Mode
  const setCameraMode = useCallback((cameraMode: CameraMode) => {
    setGameState(prev => ({
      ...prev,
      cameraMode,
    }));
    playSound('click');
  }, []);

  // Update cell
  const updateCell = useCallback((x: number, y: number, type: CellType) => {
    setGameState(prev => {
      if (prev.isRunning) return prev;
      const newGrid = setCellType(prev.grid, x, y, type);
      return {
        ...prev,
        grid: newGrid,
      };
    });
  }, []);

  // Clear visualization
  const clearGrid = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setGameState(prev => ({
      ...prev,
      grid: clearVisualization(prev.grid),
      isRunning: false,
      isPaused: false,
      isComplete: false,
      metrics: null,
      currentStep: 0,
      steps: [],
      snapshots: [],
      aiAlgorithm: null,
      aiResult: null,
    }));
    stepIndexRef.current = 0;
    stepsCacheRef.current = [];
  }, []);

  // Load custom grid
  const loadGrid = useCallback((grid: GridState) => {
    setGameState(prev => ({
      ...prev,
      grid,
      isRunning: false,
      isComplete: false,
      metrics: null,
      currentStep: 0,
      steps: [],
      snapshots: [],
    }));
  }, []);

  // Load Adaptive Map Preset (Counter-test maps)
  const loadAdaptivePreset = useCallback((presetId: AdaptiveWeaknessType | AdaptiveMapArchetype) => {
    let generated: GridState;
    if (presetId === 'greedyTrap' || presetId === 'bfsSwamp' || presetId === 'dfsLabyrinth' || presetId === 'chokepointRidge') {
      generated = generateAdaptiveMap(presetId, GRID_WIDTH, GRID_HEIGHT);
    } else {
      generated = generateAdaptiveArena(presetId, GRID_WIDTH, GRID_HEIGHT);
    }

    setGameState(prev => ({
      ...prev,
      grid: generated,
      isRunning: false,
      isComplete: false,
      metrics: null,
      currentStep: 0,
      steps: [],
      snapshots: [],
    }));
    playSound('mazeGenerated');
  }, []);

  // Get AI suggestion
  const getAISuggestion = useCallback((): AISuggestion => {
    return selectBestAlgorithm(gameState.grid);
  }, [gameState.grid]);

  // Scrub to exact step index in execution timeline
  const scrubToStep = useCallback((targetIndex: number) => {
    const steps = stepsCacheRef.current;
    const baseGrid = cleanGridCacheRef.current;
    if (!baseGrid || steps.length === 0) return;

    const clampedIndex = Math.max(0, Math.min(targetIndex, steps.length));
    const newGrid = { ...baseGrid, cells: baseGrid.cells.map(row => row.map(cell => ({ ...cell }))) };

    for (let i = 0; i < clampedIndex; i++) {
      const step = steps[i];
      const cell = newGrid.cells[step.cell.y]?.[step.cell.x];
      if (cell) {
        cell.isVisited = true;
        if (typeof step.g === 'number') cell.g = step.g;
        if (typeof step.h === 'number') cell.h = step.h;
        if (typeof step.f === 'number') cell.f = step.f;
      }
    }

    stepIndexRef.current = clampedIndex;
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      currentStep: clampedIndex,
      isPaused: true,
    }));
  }, []);

  const stepForward = useCallback(() => {
    scrubToStep(stepIndexRef.current + 1);
  }, [scrubToStep]);

  const stepBackward = useCallback(() => {
    scrubToStep(stepIndexRef.current - 1);
  }, [scrubToStep]);

  // Run pathfinding
  const runPathfinding = useCallback(() => {
    const { grid, algorithm, mode, tuning } = gameState;
    if (!grid.start || !grid.end) return;

    const cleanGrid = clearVisualization(grid);
    cleanGridCacheRef.current = cleanGrid;

    // Run baseline Dijkstra to compute ground-truth optimal cost
    const dijkstraBaseline = dijkstra(cleanGrid);
    const optimalCost = dijkstraBaseline.cost !== Infinity ? dijkstraBaseline.cost : 0;

    // Run primary algorithm with tuning
    const steps: AlgorithmStep[] = [];
    let result: AlgorithmResult;

    if (algorithm === 'rl') {
      result = runDQNAgent(cleanGrid, {
        learningRate: tuning.rlLearningRate,
        epsilon: tuning.rlEpsilon,
      });
      steps.push(...(result.steps || []));
    } else {
      result = runAlgorithm(algorithm, cleanGrid, (step) => {
        steps.push(step);
      }, tuning);
    }

    stepsCacheRef.current = steps;

    // Construct state snapshots buffer (Section 2.2 Specification)
    const snapshots: SearchStepSnapshot[] = steps.map((s, idx) => {
      const nodeIndex = s.cell.y * grid.width + s.cell.x;
      return {
        stepIndex: idx,
        openSet: s.queue ? s.queue.map(c => c.y * grid.width + c.x) : [nodeIndex],
        closedSet: steps.slice(0, idx + 1).map(item => item.cell.y * grid.width + item.cell.x),
        currentExecutingNode: nodeIndex,
        parentPointers: s.parent ? { [nodeIndex]: s.parent.y * grid.width + s.parent.x } : {},
        metrics: {
          nodesExplored: idx + 1,
          currentCost: s.g ?? idx + 1,
          executionTimeMs: result.executionTime,
        },
        cell: s.cell,
        g: s.g,
        h: s.h,
        f: s.f,
        description: s.description,
        type: s.type,
      };
    });

    // AI Opponent in battle or showdown mode
    let aiResult: AlgorithmResult | null = null;
    let aiAlgorithm: AlgorithmType | null = null;

    if (mode === 'battle') {
      const aiBattle = runAIBattle(cleanGrid);
      aiResult = aiBattle.result;
      aiAlgorithm = aiBattle.algorithm;
    } else if (mode === 'showdown') {
      aiAlgorithm = 'genetic';
      aiResult = runAlgorithm('genetic', cleanGrid, undefined, tuning);
    }

    const metrics: PerformanceMetrics = {
      nodesVisited: result.nodesVisited,
      pathLength: result.path.length,
      pathCost: result.cost,
      executionTime: result.executionTime,
      algorithm,
      timestamp: Date.now(),
      efficiencyRatio: result.nodesVisited > 0 ? (result.path.length / result.nodesVisited) : 0,
    };

    let score = 0;
    if (result.path.length > 0) {
      score = Math.max(0, 1000 - result.nodesVisited - Math.floor(result.executionTime) - Math.floor(result.cost * 10));
      if (mode === 'battle' && aiResult) {
        const comparison = compareResults(result, aiResult, algorithm, aiAlgorithm!);
        score = Math.floor(comparison.playerScore * 10);
      }
    }

    setGameState(prev => ({
      ...prev,
      grid: cleanGrid,
      isRunning: true,
      isPaused: false,
      isComplete: false,
      steps,
      snapshots,
      metrics,
      aiAlgorithm,
      aiResult,
      score,
      optimalCost,
      currentStep: 0,
      bossSectorCollapsed: 0,
      bossCountdown: 12,
    }));

    stepIndexRef.current = 0;
    playSound('start');
  }, [gameState]);

  // Run 3-Stage Esports Squad Relay
  const runRelaySquad = useCallback((squad: [AlgorithmType, AlgorithmType, AlgorithmType]) => {
    setMode('relay');
    setGameState(prev => ({
      ...prev,
      relaySquad: squad,
      relayCurrentStage: 0,
      relayStageResults: [],
    }));

    // Generate Stage 1 map
    loadAdaptivePreset('dfsChasm');
    setAlgorithm(squad[0]);
  }, [setMode, loadAdaptivePreset, setAlgorithm]);

  // Main Animation Loop
  useEffect(() => {
    if (!gameState.isRunning || gameState.isPaused) return;

    const animate = () => {
      const { steps, speed, grid, mode, dynamicObstacles, algorithm, tuning, bossSectorCollapsed, bossMaxSectors } = gameState;

      // Handle Dynamic moving obstacles
      if (mode === 'dynamic' || mode === 'boss') {
        const now = performance.now();
        if (now - dynamicUpdateRef.current > 400) {
          const { obstacles } = updateDynamicObstacles(grid, dynamicObstacles, 400);
          setGameState(prev => ({
            ...prev,
            dynamicObstacles: obstacles,
          }));
          dynamicUpdateRef.current = now;
        }
      }

      // Handle Boss Meltdown Sector Collapse
      if (mode === 'boss' && bossSectorCollapsed < bossMaxSectors) {
        const now = performance.now();
        if (now - bossTimerRef.current > 6000) {
          bossTimerRef.current = now;
          const nextTier = bossSectorCollapsed + 1;
          const collapsedGrid = collapseNextSector(grid, nextTier - 1);
          setGameState(prev => ({
            ...prev,
            grid: collapsedGrid,
            bossSectorCollapsed: nextTier,
          }));
          playSound('defeat');
        }
      }

      const stepsPerFrame = Math.max(1, Math.floor((100 - speed) / 6));

      if (stepIndexRef.current < steps.length) {
        const endIndex = Math.min(stepIndexRef.current + stepsPerFrame, steps.length);
        const newGrid = { ...grid, cells: grid.cells.map(row => row.map(cell => ({ ...cell }))) };

        for (let i = 0; i < endIndex; i++) {
          const step = steps[i];
          const cell = newGrid.cells[step.cell.y]?.[step.cell.x];
          if (cell) {
            cell.isVisited = true;
            if (typeof step.g === 'number') cell.g = step.g;
            if (typeof step.h === 'number') cell.h = step.h;
            if (typeof step.f === 'number') cell.f = step.f;
          }
        }

        // Section 1.2 Web Audio API Procedural Synth: FM Radar + StereoPannerNode
        const currentStepObj = steps[endIndex - 1];
        if (currentStepObj) {
          const progressRatio = endIndex / steps.length;
          NodeAudioSynth.triggerNodeRadar(progressRatio, currentStepObj.cell.x, grid.width, 1.2);
        }

        setGameState(prev => ({
          ...prev,
          grid: newGrid,
          currentStep: endIndex,
        }));

        stepIndexRef.current = endIndex;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - compute final solution path
        const result = runAlgorithm(algorithm, grid, undefined, tuning);
        const finalGrid = { ...grid, cells: grid.cells.map(row => row.map(cell => ({ ...cell }))) };

        if (result.path.length > 0) {
          for (const pos of result.path) {
            const cell = finalGrid.cells[pos.y]?.[pos.x];
            if (cell) cell.isPath = true;
          }
          playSynthwaveVictory();
        } else {
          playGlitchDefeat();
        }

        setGameState(prev => ({
          ...prev,
          grid: finalGrid,
          isRunning: false,
          isComplete: true,
        }));

        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    gameState.isRunning,
    gameState.isPaused,
    gameState.speed,
    gameState.steps,
    gameState.algorithm,
    gameState.mode,
    gameState.dynamicObstacles,
    gameState.tuning,
    gameState.bossSectorCollapsed,
    gameState.bossMaxSectors,
  ]);

  // Pause / Resume toggle
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
    playSound('click');
  }, []);

  return {
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
  };
}
