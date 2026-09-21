// ============================================
// AlgoArena - Core Type Definitions & Constants
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
export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'greedy' | 'genetic' | 'rl';

// Game Modes
export type GameMode = 'classic' | 'battle' | 'timeAttack' | 'dynamic' | 'learning' | 'boss' | 'relay' | 'showdown';

// View Engine & 3D Camera Modes
export type ViewEngine = '2d' | '3d';
export type CameraMode = 'tactical' | 'isometric' | 'runner';

// Algorithm Result
export interface AlgorithmResult {
  visited: { x: number; y: number }[];
  path: { x: number; y: number }[];
  cost: number;
  pathCost?: number;
  executionTime: number;
  nodesVisited: number;
  steps?: AlgorithmStep[];
}

// Algorithm Step (for learning mode & playback scrubber)
export interface AlgorithmStep {
  type: 'visit' | 'path' | 'explore' | 'found' | 'backtrack';
  cell: { x: number; y: number };
  description: string;
  queue?: { x: number; y: number }[];
  currentCost?: number;
  g?: number;
  h?: number;
  f?: number;
  parent?: { x: number; y: number } | null;
  openSetCount?: number;
  closedSetCount?: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  nodesVisited: number;
  pathLength: number;
  pathCost: number;
  executionTime: number;
  algorithm: AlgorithmType;
  timestamp: number;
  efficiencyRatio?: number;
}

// Algorithm Tuning Configuration (Workshop sliders)
export interface AlgorithmTuningConfig {
  astarWeight: number; // w in g(n) + w * h(n) [0.0 - 4.0]
  heuristicWeight?: number;
  dfsMaxDepth: number; // [10 - 1000]
  dfsBranchOrder: 'standard' | 'reverse' | 'heuristic';
  geneticMutationRate: number; // [0.01 - 0.5]
  geneticCrossoverRate: number; // [0.3 - 0.95]
  geneticPopulationSize: number; // [10 - 60]
  geneticGenerations: number; // [10 - 80]
  rlLearningRate: number; // [0.01 - 0.5]
  rlEpsilon: number; // [0.05 - 0.8]
}

export const DEFAULT_TUNING_CONFIG: AlgorithmTuningConfig = {
  astarWeight: 1.0,
  heuristicWeight: 1.0,
  dfsMaxDepth: 500,
  dfsBranchOrder: 'standard',
  geneticMutationRate: 0.12,
  geneticCrossoverRate: 0.75,
  geneticPopulationSize: 24,
  geneticGenerations: 40,
  rlLearningRate: 0.15,
  rlEpsilon: 0.2,
};

// Algorithm DNA Fighter Profile
export interface FighterDNA {
  id: AlgorithmType;
  type?: AlgorithmType;
  explorationStyle?: string;
  name: string;
  callsign: string;
  droneModel: string;
  avatar: string;
  role: string;
  tagline: string;
  description: string;
  specialty: string;
  stats: {
    speed: number; // 0 - 100
    accuracy: number; // 0 - 100
    frontierDiscipline: number; // 0 - 100
    adaptability: number; // 0 - 100
    hazardEvasion: number; // 0 - 100
  };
  themeColor: string;
  accentColor: string;
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
  highScores: Record<GameMode, number>;
  elo: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Grandmaster';
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

// Dynamic Obstacle
export interface DynamicObstacle {
  id: string;
  x: number;
  y: number;
  direction: { x: number; y: number };
  speed: number;
  pattern: 'horizontal' | 'vertical' | 'diagonal' | 'random' | 'laser';
  width?: number;
  height?: number;
  isLaser?: boolean;
}

// Game State
export interface GameState {
  grid: GridState;
  mode: GameMode;
  algorithm: AlgorithmType;
  tuning: AlgorithmTuningConfig;
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
  
  // 3D / View state
  viewEngine: ViewEngine;
  cameraMode: CameraMode;
  
  // Boss arena state
  bossSectorCollapsed: number;
  bossMaxSectors: number;
  bossCountdown: number;

  // Relay squad state
  relaySquad: AlgorithmType[];
  relayCurrentStage: number;
  relayStageResults: { stage: number; algorithm: AlgorithmType; time: number; cost: number; success: boolean }[];

  // v2.0 Snapshot Buffering & Baseline Metrics
  snapshots: import('./algoArena').SearchStepSnapshot[];
  optimalCost: number;
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
  elo?: number;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Grandmaster';
}

// Cell Colors (Light Theme High-Contrast)
export const CELL_COLORS: Record<CellType, string> = {
  normal: '#ffffff',
  mud: '#d97706',
  water: '#0284c7',
  boost: '#059669',
  wall: '#1e293b',
  start: '#16a34a',
  end: '#e11d48',
};

// Algorithm Names
export const ALGORITHM_NAMES: Record<AlgorithmType, string> = {
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
  dijkstra: "Dijkstra's Algorithm",
  astar: 'A* Algorithm',
  greedy: 'Greedy Best-First',
  genetic: 'Genetic Evolution Swarm',
  rl: 'Reinforcement Learning (Q-Agent)',
};

// Mode Names
export const MODE_NAMES: Record<GameMode, string> = {
  classic: '🎯 Classic Mode',
  battle: '⚔️ Battle Mode',
  timeAttack: '⏱️ Time Attack',
  dynamic: '🌍 Dynamic Mode',
  learning: '🧠 Learning Mode',
  boss: '💥 Boss Meltdown',
  relay: '🏁 Esports Squad Relay',
  showdown: '🧬 AI Showdown (RL vs GA)',
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

// Algorithm DNA Fighters Directory
export const FIGHTER_PROFILES: Record<AlgorithmType, FighterDNA> = {
  astar: {
    id: 'astar',
    name: 'A* Algorithm',
    callsign: 'AEGIS-STAR',
    droneModel: 'Vanguard Mark-IV Directed Vector Drone',
    avatar: '🛰️',
    role: 'Heuristic Tactician',
    tagline: 'Precision through mathematical foresight.',
    description: 'Combines actual distance with estimated heuristic cost to carve the most direct, optimal corridor through dense terrain.',
    specialty: 'Adaptive Heuristic Compass: Zeroes in on the target with minimal node expansions.',
    stats: {
      speed: 88,
      accuracy: 98,
      frontierDiscipline: 95,
      adaptability: 90,
      hazardEvasion: 85,
    },
    themeColor: '#06b6d4', // cyan
    accentColor: '#3b82f6',
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    callsign: 'OMNI-GRID',
    droneModel: 'Bastion Heavy Sweeper Drone',
    avatar: '🛡️',
    role: 'Optimal Fortress',
    tagline: 'No stone left unmeasured. Guaranteed perfection.',
    description: 'Explores radially with unyielding mathematical certainty, always discovering the absolute lowest-cost path across variable terrains.',
    specialty: 'Isotropic Shield Sweep: Computes guaranteed minimal path across weighted mud and boost zones.',
    stats: {
      speed: 72,
      accuracy: 100,
      frontierDiscipline: 90,
      adaptability: 82,
      hazardEvasion: 92,
    },
    themeColor: '#3b82f6', // blue
    accentColor: '#6366f1',
  },
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search',
    callsign: 'HYDRA-WAVE',
    droneModel: 'Sub-Division Swarm Unit',
    avatar: '🌊',
    role: 'Frontier Flood',
    tagline: 'Equal expansion across all horizons.',
    description: 'Emits uniform concentric waves to seek out the fewest-step route, indifferent to individual node weights.',
    specialty: 'Tidal Sweep: Guarantees shortest path in unweighted labyrinths.',
    stats: {
      speed: 80,
      accuracy: 85,
      frontierDiscipline: 82,
      adaptability: 75,
      hazardEvasion: 80,
    },
    themeColor: '#10b981', // emerald
    accentColor: '#14b8a6',
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search',
    callsign: 'PHANTOM-PROBE',
    droneModel: 'Sub-Surface Infiltrator Probe',
    avatar: '⚡',
    role: 'Void Infiltrator',
    tagline: 'Deep dive into unknown sectors. Never look back.',
    description: 'Tunnel-visions deeply along a single thread until blocked, relying on backtrack stacks to recover.',
    specialty: 'Hyper-Penetration: Reaches distant grid sectors in breakneck bursts, occasionally finding lucky tunnels.',
    stats: {
      speed: 95,
      accuracy: 42,
      frontierDiscipline: 30,
      adaptability: 60,
      hazardEvasion: 50,
    },
    themeColor: '#f59e0b', // amber
    accentColor: '#ef4444',
  },
  greedy: {
    id: 'greedy',
    name: 'Greedy Best-First',
    callsign: 'APEX-SEEKER',
    droneModel: 'Interceptor Hyper-Drive Unit',
    avatar: '🦅',
    role: 'Velocity Sniper',
    tagline: 'Eyes locked on target. Consequences ignored.',
    description: 'Hurtles directly toward the goal by heuristic distance alone, gambling efficiency against deceptive dead ends.',
    specialty: 'Euclidean Overdrive: Unmatched acceleration in open spaces.',
    stats: {
      speed: 96,
      accuracy: 68,
      frontierDiscipline: 65,
      adaptability: 65,
      hazardEvasion: 62,
    },
    themeColor: '#ec4899', // pink
    accentColor: '#f43f5e',
  },
  genetic: {
    id: 'genetic',
    name: 'Genetic Evolution Swarm',
    callsign: 'NEURO-CHROMA',
    droneModel: 'Biomorphic Adaptive Nanite Swarm',
    avatar: '🧬',
    role: 'Evolutionary Organism',
    tagline: 'Survival of the fittest pathfinder.',
    description: 'Generates populations of candidate chromosome paths, iteratively applying mutation, crossover, and fitness selection.',
    specialty: 'Mutation Surge: Unlocks unconventional circumventing routes through chaotic dynamic hazards.',
    stats: {
      speed: 68,
      accuracy: 88,
      frontierDiscipline: 78,
      adaptability: 96,
      hazardEvasion: 94,
    },
    themeColor: '#a855f7', // purple
    accentColor: '#8b5cf6',
  },
  rl: {
    id: 'rl',
    name: 'Reinforcement Learning (Q-Agent)',
    callsign: 'Q-MATRIX',
    droneModel: 'Neural Synapse Synthetic Pilot',
    avatar: '🤖',
    role: 'Reinforcement Learner',
    tagline: 'Experiences forge wisdom. Mistakes become vectors.',
    description: 'Navigates through state-action Q-matrices, learning reward distributions from obstacles, terrain costs, and proximity gradients.',
    specialty: 'Temporal Difference Pulse: Dynamically adapts to shifting moving hazards and sector collapses.',
    stats: {
      speed: 86,
      accuracy: 91,
      frontierDiscipline: 89,
      adaptability: 98,
      hazardEvasion: 95,
    },
    themeColor: '#8b5cf6', // violet
    accentColor: '#06b6d4',
  },
};
