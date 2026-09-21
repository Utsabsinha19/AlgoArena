// ============================================================================
// AlgoArena v2.0 - Core Types & Snapshot Interface Specification
// ============================================================================

import { AlgorithmType } from './index';

/**
 * High-performance byte representation for 3D InstancedMesh state buffer.
 * 0: Empty
 * 1: Visited
 * 2: Path
 * 3: Wall
 * 4: Mud / High-Cost Weight
 * 5: Water / Plasma Hazard
 * 6: Boost / Speed Pad
 * 7: Start Beacon
 * 8: Goal / End Beacon
 */
export const NODE_STATE_BYTE = {
  EMPTY: 0,
  VISITED: 1,
  PATH: 2,
  WALL: 3,
  MUD: 4,
  WATER: 5,
  BOOST: 6,
  START: 7,
  END: 8,
} as const;

export type NodeStateByte = typeof NODE_STATE_BYTE[keyof typeof NODE_STATE_BYTE];

/**
 * State Snapshot Buffering Interface (Section 2.2 Specification)
 * Captured at every search step to allow instant, non-blocking time-dilation scrubbing.
 */
export interface SearchStepSnapshot {
  stepIndex: number;
  openSet: number[]; // Flattened node indices (y * width + x)
  closedSet: number[]; // Flattened node indices
  currentExecutingNode: number; // Active node index
  parentPointers: Record<number, number>; // childIndex -> parentIndex
  metrics: {
    nodesExplored: number;
    currentCost: number;
    executionTimeMs: number;
  };
  cell: { x: number; y: number };
  g?: number;
  h?: number;
  f?: number;
  description?: string;
  type?: 'visit' | 'explore' | 'path' | 'backtrack' | 'found';
}

/**
 * Post-Match Mathematical Analytics Specification (Section 3.2)
 */
export interface BattleAnalyticsV2 {
  /** Exploration Efficiency Index: (Optimal Path Length / Total Nodes Explored) * 100% */
  explorationEfficiencyIndex: number;
  /** Time-to-Target Velocity: Nodes evaluated per millisecond */
  velocityNodesPerMs: number;
  /** Sub-optimality Penalty: Percentage cost deviation from guaranteed minimal cost */
  subOptimalityPenalty: number;
  /** Absolute Path Cost */
  totalPathCost: number;
  /** Total Nodes Explored */
  totalNodesExplored: number;
  /** Wall Clock Execution Duration (ms) */
  executionDurationMs: number;
  /** Winner Identifier */
  winner?: 'player' | 'ai' | 'draw';
}

/**
 * DQN State Tensor & Action Specification (Section 4.1 & 5)
 */
export type DQNAction = 0 | 1 | 2 | 3; // 0: Up, 1: Right, 2: Down, 3: Left

export interface DQNTransition {
  state: number[]; // [normStartX, normStartY, normGoalX, normGoalY, normCurrX, normCurrY, nearbyObstacleMask]
  action: DQNAction;
  reward: number;
  nextState: number[];
  done: boolean;
}

// ============================================================================
// AlgoArena v3.0 - Multithreading, Shaders, Audio, Binary Sync, and Metrics
// ============================================================================

export type GridDimensions = [number, number];

/**
 * Lightweight step snapshot streamed from Web Worker (Section 1.1)
 */
export interface StepSnapshot {
  stepIndex: number;
  currentNode: number;
  nodesExplored: number;
  executionTimeMs: number;
  isComplete: boolean;
  path?: number[];
}

/**
 * Web Worker Message Protocol (Section 1.1)
 */
export interface WorkerRequest {
  type: 'START_SEARCH' | 'CANCEL_SEARCH';
  algorithm: AlgorithmType | 'A_STAR' | 'DIJKSTRA' | 'BFS' | 'DFS' | 'GREEDY';
  dimensions: GridDimensions;
  startNode: [number, number];
  goalNode: [number, number];
  weights: Float32Array;
  heuristicWeight?: number;
}

export interface WorkerResponse {
  type: 'SEARCH_STEP' | 'SEARCH_COMPLETE' | 'SEARCH_ERROR';
  snapshot?: StepSnapshot;
  result?: {
    path: number[];
    nodesExplored: number;
    executionTimeMs: number;
    cost: number;
  };
  error?: string;
}

/**
 * Binary WebSocket Multiplayer Protocol (Section 4)
 * 12-byte packed binary packet:
 * - MsgType (1B)
 * - AlgoID (1B)
 * - StepIndex (2B)
 * - CurrentNodeIndex (4B)
 * - NodesExploredCount (4B)
 */
export interface BinaryTelemetryPacket {
  msgType: number; // 1: Ping, 2: Sync, 3: Telemetry, 4: Finish
  algoId: number; // 1: BFS, 2: DFS, 3: Dijkstra, 4: A*, 5: Genetic, 6: DQN
  stepIndex: number; // Uint16
  currentNodeIndex: number; // Uint32
  nodesExploredCount: number; // Uint32
}

/**
 * Section 6 Empirical Metrics Specification
 */
export interface V3Analytics {
  /** Exploration Efficiency Index: (L_opt / N_exp) * 100% */
  eei: number;
  /** Space Frontier Complexity: max(|OpenSet|) / TotalGridCells */
  sfc: number;
  /** Sub-Optimality Deviation: ((C_algo - C_dijkstra) / C_dijkstra) * 100% */
  subOptimalityDeviation: number;
  /** Search Acceleration Rate: Delta N_exp / Delta t (nodes/ms) */
  searchAccelerationRate: number;
}

/**
 * Multiplayer Race Squad Member
 */
export interface SquadFighter {
  id: string;
  algorithm: AlgorithmType;
  callsign: string;
  avatarColor: string;
  speedRating: number;
  accuracyRating: number;
  explorationStyle: string;
  currentElo: number;
}

// Re-export all fundamental types for interoperability
export * from './index';

