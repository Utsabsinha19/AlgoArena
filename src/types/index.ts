// ============================================
// AlgoArena - Core Type Definitions
// ============================================

// Cell Types
export type CellType = 'normal' | 'mud' | 'water' | 'boost' | 'wall' | 'start' | 'end';

// Cell interface
export interface Cell {
  x: number;
  y: number;
  type: CellType;
  cost: number;
  isVisited: boolean;
  isPath: boolean;
  parent: Cell | null;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // Total cost
}

// Grid State
export interface GridState {
  cells: Cell[][];
  width: number;
  height: number;
  start: { x: number; y: number } | null;
  end: { x: number; y: number } | null;
}

// Algorithm Types
export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'greedy';

// Game Modes
export type GameMode = 'classic' | 'battle' | 'timeAttack' | 'dynamic' | 'learning';

// Algorithm Result
export interface AlgorithmResult {
  visited: { x: number; y: number }[];
  path: { x: number; y: number }[];
  cost: number;
  executionTime: number;
  nodesVisited: number;
}

// Algorithm Step (for learning mode)
export interface AlgorithmStep {
  type: 'visit' | 'path' | 'explore' | 'found';
  cell: { x: number; y: number };
  description: string;
  queue?: { x: number; y: number }[];
  currentCost?: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  nodesVisited: number;
  pathLength: number;
  pathCost: number;
  executionTime: number;
  algorithm: AlgorithmType;
  timestamp: number;
}

// User Score
export interface Score {
  _id?: string;
  userId: string;
  username: string;
  mode: GameMode;
  algorithm: AlgorithmType;
  score: number;
  pathCost: number;
  timeTaken: number;
  gridSize: string;
  createdAt: Date;
}

// User
export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  highScores: {
    classic: number;
    battle: number;
    timeAttack: number;
    dynamic: number;
    learning: number;
  };
}

// Map Template
export interface MapTemplate {
  _id?: string;
  name: string;
  grid: CellType[][];
  difficulty: number;
  createdBy: string;
  createdAt: Date;
}

// Game State
export interface GameState {
  grid: GridState;
  mode: GameMode;
  algorithm: AlgorithmType;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  speed: number;
  metrics: PerformanceMetrics | null;
  currentStep: number;
  steps: AlgorithmStep[];
  dynamicObstacles: DynamicObstacle[];
  timeRemaining: number;
  score: number;
  aiAlgorithm: AlgorithmType | null;
  aiResult: AlgorithmResult | null;
}

// Dynamic Obstacle
export interface DynamicObstacle {
  id: string;
  x: number;
  y: number;
  direction: { x: number; y: number };
  speed: number;
  pattern: 'horizontal' | 'vertical' | 'diagonal' | 'random';
}

// Animation State
export interface AnimationState {
  currentVisitedIndex: number;
  currentPathIndex: number;
  isAnimatingVisited: boolean;
  isAnimatingPath: boolean;
  lastFrameTime: number;
}

// AI Suggestion
export interface AISuggestion {
  algorithm: AlgorithmType;
  reason: string;
  confidence: number;
  factors: {
    obstacleDensity: number;
    avgCost: number;
    distance: number;
    complexity: number;
  };
}

// Leaderboard Entry
export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  algorithm: AlgorithmType;
  mode: GameMode;
  date: string;
}

// Theme Colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  glow: string;
}

// Cell Colors
export const CELL_COLORS: Record<CellType, string> = {
  normal: '#1a1a2e',
  mud: '#5c4033',
  water: '#0077be',
  boost: '#00ff88',
  wall: '#2d2d44',
  start: '#00ff00',
  end: '#ff0055',
};

// Algorithm Names
export const ALGORITHM_NAMES: Record<AlgorithmType, string> = {
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
  dijkstra: "Dijkstra's Algorithm",
  astar: 'A* Algorithm',
  greedy: 'Greedy Best-First',
};

// Mode Names
export const MODE_NAMES: Record<GameMode, string> = {
  classic: '🎯 Classic Mode',
  battle: '⚔️ Battle Mode',
  timeAttack: '⏱️ Time Attack',
  dynamic: '🌍 Dynamic Mode',
  learning: '🧠 Learning Mode',
};

// Cost for each cell type
export const CELL_COSTS: Record<CellType, number> = {
  normal: 1,
  mud: 5,
  water: Infinity,
  boost: 0.5,
  wall: Infinity,
  start: 1,
  end: 1,
};
