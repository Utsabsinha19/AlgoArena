// ============================================
// AlgoArena - Reinforcement Learning (Q-Agent)
// ============================================

import { GridState, AlgorithmResult, AlgorithmStep, CELL_COSTS } from '../types';

export interface QState {
  x: number;
  y: number;
}

const ACTIONS = [
  { dx: 0, dy: -1, name: 'UP' },
  { dx: 1, dy: 0, name: 'RIGHT' },
  { dx: 0, dy: 1, name: 'DOWN' },
  { dx: -1, dy: 0, name: 'LEFT' },
  { dx: 1, dy: -1, name: 'UP_RIGHT' },
  { dx: 1, dy: 1, name: 'DOWN_RIGHT' },
  { dx: -1, dy: 1, name: 'DOWN_LEFT' },
  { dx: -1, dy: -1, name: 'UP_LEFT' },
];

/**
 * Runs a Q-learning agent on the grid to discover an optimal or near-optimal path.
 */
export function runRLAgent(
  grid: GridState,
  learningRate = 0.2,
  epsilon = 0.2,
  episodes = 250
): AlgorithmResult {
  const startTime = performance.now();
  const { cells, width, height, start, end } = grid;

  if (!start || !end) {
    return {
      visited: [],
      path: [],
      cost: 0,
      executionTime: 0,
      nodesVisited: 0,
      steps: [],
    };
  }

  // Q-table: key `${x},${y}`, value: number[] of length ACTIONS.length
  const qTable: Record<string, number[]> = {};
  const getKey = (x: number, y: number) => `${x},${y}`;

  const getQValues = (x: number, y: number): number[] => {
    const key = getKey(x, y);
    if (!qTable[key]) {
      qTable[key] = new Array(ACTIONS.length).fill(0);
    }
    return qTable[key];
  };

  const discountFactor = 0.95;
  const visitedSet = new Set<string>();
  const visitedList: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  const isValid = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const type = cells[y][x].type;
    return type !== 'wall' && type !== 'water';
  };

  // Distance heuristic for reward shaping
  const distToEnd = (x: number, y: number) => Math.hypot(end.x - x, end.y - y);

  // Train episodes
  for (let ep = 0; ep < episodes; ep++) {
    let currX = start.x;
    let currY = start.y;
    let epSteps = 0;
    const maxEpSteps = width * height;

    while (!(currX === end.x && currY === end.y) && epSteps < maxEpSteps) {
      epSteps++;
      const qValues = getQValues(currX, currY);

      // Epsilon-greedy action selection
      let actionIdx = 0;
      if (Math.random() < epsilon) {
        actionIdx = Math.floor(Math.random() * ACTIONS.length);
      } else {
        let maxVal = -Infinity;
        for (let i = 0; i < qValues.length; i++) {
          if (qValues[i] > maxVal) {
            maxVal = qValues[i];
            actionIdx = i;
          }
        }
      }

      const action = ACTIONS[actionIdx];
      const nextX = currX + action.dx;
      const nextY = currY + action.dy;

      let reward = -1;
      let nextMaxQ = 0;

      if (!isValid(nextX, nextY)) {
        reward = -25; // Bumped into wall/water
        // Q-update for invalid move
        qValues[actionIdx] += learningRate * (reward - qValues[actionIdx]);
        break;
      } else {
        const cell = cells[nextY][nextX];
        const cellCost = CELL_COSTS[cell.type] || 1;
        reward = -cellCost;

        // Reward shaping: getting closer to goal
        const prevDist = distToEnd(currX, currY);
        const newDist = distToEnd(nextX, nextY);
        reward += (prevDist - newDist) * 3;

        if (nextX === end.x && nextY === end.y) {
          reward += 200; // Goal reached
        }

        const nextQValues = getQValues(nextX, nextY);
        nextMaxQ = Math.max(...nextQValues);

        // Bellman update
        qValues[actionIdx] += learningRate * (reward + discountFactor * nextMaxQ - qValues[actionIdx]);

        currX = nextX;
        currY = nextY;

        const posKey = getKey(currX, currY);
        if (!visitedSet.has(posKey)) {
          visitedSet.add(posKey);
          visitedList.push({ x: currX, y: currY });

          if (steps.length < 400) {
            steps.push({
              type: 'explore',
              cell: { x: currX, y: currY },
              description: `Q-Agent updating policy at (${currX}, ${currY}). Reward: ${reward.toFixed(1)}, max Q: ${nextMaxQ.toFixed(2)}`,
              g: epSteps,
              h: newDist,
              f: epSteps + newDist,
            });
          }
        }
      }
    }
  }

  // Extract greedy path following learned Q-values
  const path: { x: number; y: number }[] = [{ x: start.x, y: start.y }];
  let px = start.x;
  let py = start.y;
  const pathVisited = new Set<string>([getKey(px, py)]);
  let totalCost = 0;

  for (let step = 0; step < width * height; step++) {
    if (px === end.x && py === end.y) break;
    const qValues = getQValues(px, py);

    // Pick best valid action
    let bestActionIdx = -1;
    let bestVal = -Infinity;

    for (let i = 0; i < ACTIONS.length; i++) {
      const act = ACTIONS[i];
      const nx = px + act.dx;
      const ny = py + act.dy;
      if (isValid(nx, ny) && !pathVisited.has(getKey(nx, ny))) {
        if (qValues[i] > bestVal) {
          bestVal = qValues[i];
          bestActionIdx = i;
        }
      }
    }

    if (bestActionIdx === -1) {
      // Fallback: move towards end
      let fallbackIdx = -1;
      let minH = Infinity;
      for (let i = 0; i < ACTIONS.length; i++) {
        const act = ACTIONS[i];
        const nx = px + act.dx;
        const ny = py + act.dy;
        if (isValid(nx, ny) && !pathVisited.has(getKey(nx, ny))) {
          const h = distToEnd(nx, ny);
          if (h < minH) {
            minH = h;
            fallbackIdx = i;
          }
        }
      }
      if (fallbackIdx === -1) break;
      bestActionIdx = fallbackIdx;
    }

    const chosen = ACTIONS[bestActionIdx];
    px += chosen.dx;
    py += chosen.dy;
    pathVisited.add(getKey(px, py));
    path.push({ x: px, y: py });
    totalCost += CELL_COSTS[cells[py][px].type] || 1;
  }

  const reached = path[path.length - 1].x === end.x && path[path.length - 1].y === end.y;

  return {
    visited: visitedList,
    path: reached ? path : [],
    cost: reached ? totalCost : 0,
    executionTime: performance.now() - startTime,
    nodesVisited: visitedList.length,
    steps,
  };
}
