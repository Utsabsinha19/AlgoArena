// ============================================
// AlgoArena - Game State Hook
// ============================================

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
} from '../types';
import { initializeGrid, setCellType, clearVisualization, createDynamicObstacles, updateDynamicObstacles } from '../utils/gridUtils';
import { runAlgorithm } from '../algorithms/index';
import { selectBestAlgorithm, runAIBattle, compareResults } from '../algorithms/aiSelector';

const GRID_WIDTH = 25;
const GRID_HEIGHT = 20;

const initialState: GameState = {
  grid: initializeGrid(GRID_WIDTH, GRID_HEIGHT),
  mode: 'classic',
  algorithm: 'astar',
  isRunning: false,
  isPaused: false,
  isComplete: false,
  speed: 50,
  metrics: null,
  currentStep: 0,
  steps: [],
  dynamicObstacles: [],
  timeRemaining: 60,
  score: 0,
  aiAlgorithm: null,
  aiResult: null,
};

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const animationRef = useRef<number | null>(null);
  const stepIndexRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const dynamicUpdateRef = useRef<number>(0);

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
      speed: prev.speed,
    }));
    
    stepIndexRef.current = 0;
  }, []);

  // Set game mode
  const setMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...prev,
      mode,
      isRunning: false,
      isComplete: false,
      metrics: null,
      currentStep: 0,
      steps: [],
      timeRemaining: mode === 'timeAttack' ? 60 : 60,
      dynamicObstacles: mode === 'dynamic' ? createDynamicObstacles(prev.grid, 5) : [],
    }));
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

  // Update cell
  const updateCell = useCallback((x: number, y: number, type: import('../types').CellType) => {
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
    setGameState(prev => ({
      ...prev,
      grid: clearVisualization(prev.grid),
      isRunning: false,
      isComplete: false,
      metrics: null,
      currentStep: 0,
      steps: [],
      aiAlgorithm: null,
      aiResult: null,
    }));
    
    stepIndexRef.current = 0;
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
    }));
  }, []);

  // Get AI suggestion
  const getAISuggestion = useCallback((): AISuggestion => {
    return selectBestAlgorithm(gameState.grid);
  }, [gameState.grid]);

  // Run the pathfinding algorithm
  const runPathfinding = useCallback(() => {
    const { grid, algorithm, mode } = gameState;
    
    if (!grid.start || !grid.end) {
      return;
    }
    
    // Clear previous visualization
    const cleanGrid = clearVisualization(grid);
    
    // Run algorithm
    const steps: AlgorithmStep[] = [];
    const result = runAlgorithm(algorithm, cleanGrid, (step) => {
      steps.push(step);
    });
    
    // For battle mode, also run AI
    let aiResult: AlgorithmResult | null = null;
    let aiAlgorithm: AlgorithmType | null = null;
    
    if (mode === 'battle') {
      const aiBattle = runAIBattle(cleanGrid);
      aiResult = aiBattle.result;
      aiAlgorithm = aiBattle.algorithm;
    }
    
    // Metrics
    const metrics: PerformanceMetrics = {
      nodesVisited: result.nodesVisited,
      pathLength: result.path.length,
      pathCost: result.cost,
      executionTime: result.executionTime,
      algorithm,
      timestamp: Date.now(),
    };
    
    // Calculate score
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
      isComplete: false,
      steps,
      metrics,
      aiAlgorithm,
      aiResult,
      score,
      currentStep: 0,
    }));
    
    startTimeRef.current = performance.now();
    stepIndexRef.current = 0;
  }, [gameState]);

  // Animation loop
  useEffect(() => {
    if (!gameState.isRunning || gameState.isPaused) {
      return;
    }
    
    const animate = () => {
      const { steps, speed, grid, mode, dynamicObstacles } = gameState;
      
      // Handle dynamic mode
      if (mode === 'dynamic') {
        const now = performance.now();
        if (now - dynamicUpdateRef.current > 500) {
          const { obstacles } = updateDynamicObstacles(grid, dynamicObstacles, 500);
          setGameState(prev => ({
            ...prev,
            dynamicObstacles: obstacles,
          }));
          dynamicUpdateRef.current = now;
        }
      }
      
      // Calculate how many steps to process
      const stepsPerFrame = Math.max(1, Math.floor((100 - speed) / 10));
      
      if (stepIndexRef.current < steps.length) {
        const endIndex = Math.min(stepIndexRef.current + stepsPerFrame, steps.length);
        
        // Mark cells as visited
        const newGrid = { ...grid, cells: grid.cells.map(row => row.map(cell => ({ ...cell }))) };
        
        for (let i = 0; i < endIndex; i++) {
          const step = steps[i];
          const cell = newGrid.cells[step.cell.y]?.[step.cell.x];
          if (cell) {
            cell.isVisited = true;
          }
        }
        
        setGameState(prev => ({
          ...prev,
          grid: newGrid,
          currentStep: endIndex,
        }));
        
        stepIndexRef.current = endIndex;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - show path
        const result = runAlgorithm(gameState.algorithm, grid);
        
        const finalGrid = { ...grid, cells: grid.cells.map(row => row.map(cell => ({ ...cell }))) };
        
        // Mark path
        for (const pos of result.path) {
          const cell = finalGrid.cells[pos.y]?.[pos.x];
          if (cell) {
            cell.isPath = true;
          }
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
  }, [gameState.isRunning, gameState.isPaused, gameState.speed, gameState.steps, gameState.algorithm, gameState.mode, gameState.dynamicObstacles]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Time attack timer
  useEffect(() => {
    if (gameState.mode === 'timeAttack' && gameState.isRunning && !gameState.isPaused) {
      const timer = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 0) {
            clearInterval(timer);
            return {
              ...prev,
              isRunning: false,
              isComplete: true,
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState.mode, gameState.isRunning, gameState.isPaused]);

  return {
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
  };
}
