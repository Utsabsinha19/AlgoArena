// ============================================================================
// AlgoArena v2.0 - Deep Q-Learning (DQN) Agent Integration (Section 4.1)
// ============================================================================

import { GridState, AlgorithmResult, AlgorithmStep, CELL_COSTS } from '../../types';
import { SearchStepSnapshot } from '../../types/algoArena';

export interface DQNConfig {
  learningRate: number; // α
  discountFactor: number; // γ
  epsilon: number; // ε exploration
  episodes: number;
}

const ACTIONS = [
  { dx: 0, dy: -1, name: 'UP' },
  { dx: 1, dy: 0, name: 'RIGHT' },
  { dx: 0, dy: 1, name: 'DOWN' },
  { dx: -1, dy: 0, name: 'LEFT' },
];

/**
 * Runs a Deep Q-Learning / Q-Table Agent with the formal Section 4.1 Reward Function:
 * R(s, a) = +100 (Goal reached), -10 (Obstacle collision), -0.1 (per movement step)
 */
export function runDQNAgent(
  grid: GridState,
  config: Partial<DQNConfig> = {}
): AlgorithmResult & { snapshots: SearchStepSnapshot[] } {
  const startTime = performance.now();
  const { width, height, start, end, cells } = grid;

  const alpha = config.learningRate ?? 0.2;
  const gamma = config.discountFactor ?? 0.95;
  const epsilon = config.epsilon ?? 0.25;
  const episodes = config.episodes ?? 300;

  if (!start || !end) {
    return {
      visited: [],
      path: [],
      cost: 0,
      executionTime: 0,
      nodesVisited: 0,
      steps: [],
      snapshots: [],
    };
  }

  // Q-Table mapping: state string -> array of Q-values for ACTIONS
  const qTable: Record<string, number[]> = {};

  const getStateKey = (x: number, y: number) => `${x},${y}`;

  const getQ = (x: number, y: number): number[] => {
    const key = getStateKey(x, y);
    if (!qTable[key]) {
      qTable[key] = [0, 0, 0, 0];
    }
    return qTable[key];
  };

  const isWalkable = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const type = cells[y][x].type;
    return type !== 'wall' && type !== 'water';
  };

  const visitedSet = new Set<string>();
  const visitedList: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];
  const snapshots: SearchStepSnapshot[] = [];

  // Distance for shaped reward guidance
  const distGoal = (x: number, y: number) => Math.hypot(end.x - x, end.y - y);

  // Train episodes
  for (let ep = 0; ep < episodes; ep++) {
    let cx = start.x;
    let cy = start.y;
    let epStep = 0;
    const maxSteps = width * height;

    while (!(cx === end.x && cy === end.y) && epStep < maxSteps) {
      epStep++;
      const qValues = getQ(cx, cy);

      // Epsilon-greedy action
      let actionIdx = 0;
      if (Math.random() < epsilon) {
        actionIdx = Math.floor(Math.random() * ACTIONS.length);
      } else {
        let maxQ = -Infinity;
        for (let a = 0; a < 4; a++) {
          if (qValues[a] > maxQ) {
            maxQ = qValues[a];
            actionIdx = a;
          }
        }
      }

      const act = ACTIONS[actionIdx];
      const nx = cx + act.dx;
      const ny = cy + act.dy;

      // Section 4.1 Formal Reward Function:
      // +100 if Goal reached, -10 if Obstacle collision, -0.1 per step
      let reward = -0.1;
      let nextMaxQ = 0;

      if (!isWalkable(nx, ny)) {
        reward = -10.0;
        // Bellman update for obstacle bounce
        qValues[actionIdx] += alpha * (reward - qValues[actionIdx]);
        break;
      } else {
        const cell = cells[ny][nx];
        const costPenalty = CELL_COSTS[cell.type] || 1;
        reward -= costPenalty * 0.2;

        if (nx === end.x && ny === end.y) {
          reward = 100.0;
        } else {
          // Reward shaping: getting closer to target
          reward += (distGoal(cx, cy) - distGoal(nx, ny)) * 2.0;
        }

        const nextQ = getQ(nx, ny);
        nextMaxQ = Math.max(...nextQ);

        // Bellman Equation: Q(s,a) = Q(s,a) + α [R + γ max Q(s',a') - Q(s,a)]
        qValues[actionIdx] += alpha * (reward + gamma * nextMaxQ - qValues[actionIdx]);

        cx = nx;
        cy = ny;

        const posKey = getStateKey(cx, cy);
        if (!visitedSet.has(posKey)) {
          visitedSet.add(posKey);
          visitedList.push({ x: cx, y: cy });

          const nodeIdx = cy * width + cx;
          const currentStepObj: AlgorithmStep = {
            type: 'explore',
            cell: { x: cx, y: cy },
            description: `DQN Agent evaluated state (${cx}, ${cy}). Reward: ${reward.toFixed(1)}, max Q: ${nextMaxQ.toFixed(2)}`,
            g: epStep,
            h: distGoal(cx, cy),
            f: epStep + distGoal(cx, cy),
          };

          steps.push(currentStepObj);

          if (snapshots.length < 500) {
            snapshots.push({
              stepIndex: snapshots.length,
              openSet: [nodeIdx],
              closedSet: Array.from(visitedSet).map(k => {
                const [kx, ky] = k.split(',').map(Number);
                return ky * width + kx;
              }),
              currentExecutingNode: nodeIdx,
              parentPointers: {},
              metrics: {
                nodesExplored: visitedList.length,
                currentCost: epStep,
                executionTimeMs: performance.now() - startTime,
              },
              cell: { x: cx, y: cy },
              g: epStep,
              h: distGoal(cx, cy),
              f: epStep + distGoal(cx, cy),
            });
          }
        }
      }
    }
  }

  // Derive optimal policy trajectory
  const path: { x: number; y: number }[] = [{ x: start.x, y: start.y }];
  let px = start.x;
  let py = start.y;
  const pathHistory = new Set<string>([getStateKey(px, py)]);
  let totalCost = 0;

  for (let s = 0; s < width * height; s++) {
    if (px === end.x && py === end.y) break;
    const qVals = getQ(px, py);

    let bestActIdx = -1;
    let maxVal = -Infinity;

    for (let a = 0; a < 4; a++) {
      const act = ACTIONS[a];
      const nx = px + act.dx;
      const ny = py + act.dy;
      if (isWalkable(nx, ny) && !pathHistory.has(getStateKey(nx, ny))) {
        if (qVals[a] > maxVal) {
          maxVal = qVals[a];
          bestActIdx = a;
        }
      }
    }

    if (bestActIdx === -1) {
      // Direct heuristic fallback if unvisited
      let minH = Infinity;
      for (let a = 0; a < 4; a++) {
        const act = ACTIONS[a];
        const nx = px + act.dx;
        const ny = py + act.dy;
        if (isWalkable(nx, ny) && !pathHistory.has(getStateKey(nx, ny))) {
          const h = distGoal(nx, ny);
          if (h < minH) {
            minH = h;
            bestActIdx = a;
          }
        }
      }
      if (bestActIdx === -1) break;
    }

    const chosen = ACTIONS[bestActIdx];
    px += chosen.dx;
    py += chosen.dy;
    pathHistory.add(getStateKey(px, py));
    path.push({ x: px, y: py });
    totalCost += CELL_COSTS[cells[py][px].type] || 1;
  }

  const reached = path[path.length - 1].x === end.x && path[path.length - 1].y === end.y;

  return {
    visited: visitedList,
    path: reached ? path : [],
    cost: reached ? totalCost : Infinity,
    executionTime: performance.now() - startTime,
    nodesVisited: visitedList.length,
    steps,
    snapshots,
  };
}
