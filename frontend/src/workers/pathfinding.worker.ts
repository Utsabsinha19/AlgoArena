// ============================================================================
// AlgoArena v3.0 - Off-Thread Web Worker Pathfinding Engine (Section 1.1)
// Dispatches search traversals off the UI thread to sustain 60-120 FPS Three.js
// ============================================================================

import { StepSnapshot, WorkerRequest, WorkerResponse } from '../types/algoArena';

// Worker context typing
interface WorkerContext {
  onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse) => void;
}

const ctx = self as unknown as WorkerContext;

ctx.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { type, algorithm, dimensions, startNode, goalNode, weights, heuristicWeight = 1.0 } = e.data;

  if (type === 'START_SEARCH') {
    try {
      runPathfinding(algorithm, dimensions, startNode, goalNode, weights, heuristicWeight);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      ctx.postMessage({
        type: 'SEARCH_ERROR',
        error: errorMsg,
      } as WorkerResponse);
    }
  }
};

function runPathfinding(
  algo: string,
  dim: [number, number],
  start: [number, number],
  goal: [number, number],
  weights: Float32Array,
  hWeight: number
) {
  const width = dim[0];
  const height = dim[1];
  const totalCells = width * height;

  const visited = new Uint8Array(totalCells);
  const parentPointers = new Int32Array(totalCells).fill(-1);
  const gScores = new Float32Array(totalCells).fill(Infinity);
  const openSet: number[] = [];

  const startIndex = start[1] * width + start[0];
  const goalIndex = goal[1] * width + goal[0];

  if (startIndex < 0 || startIndex >= totalCells || goalIndex < 0 || goalIndex >= totalCells) {
    ctx.postMessage({
      type: 'SEARCH_ERROR',
      error: 'Start or goal coordinate out of bounds',
    } as WorkerResponse);
    return;
  }

  gScores[startIndex] = 0;
  openSet.push(startIndex);

  let nodesExplored = 0;
  const startTime = performance.now();
  let found = false;

  // Normalized algorithm key
  const normalizedAlgo = algo.toLowerCase();

  while (openSet.length > 0) {
    let currentIndex: number;

    if (normalizedAlgo.includes('astar') || normalizedAlgo === 'a_star') {
      // Sort by f(n) = g(n) + hWeight * h(n)
      openSet.sort((a, b) => {
        const fA = gScores[a] + getHeuristicCost(a, goalIndex, dim, hWeight);
        const fB = gScores[b] + getHeuristicCost(b, goalIndex, dim, hWeight);
        return fA - fB;
      });
      currentIndex = openSet.shift()!;
    } else if (normalizedAlgo.includes('dijkstra')) {
      // Sort by g(n)
      openSet.sort((a, b) => gScores[a] - gScores[b]);
      currentIndex = openSet.shift()!;
    } else if (normalizedAlgo.includes('greedy')) {
      // Sort purely by h(n)
      openSet.sort((a, b) => {
        return getHeuristicCost(a, goalIndex, dim, 1.0) - getHeuristicCost(b, goalIndex, dim, 1.0);
      });
      currentIndex = openSet.shift()!;
    } else if (normalizedAlgo.includes('dfs')) {
      // LIFO stack
      currentIndex = openSet.pop()!;
    } else {
      // FIFO queue (BFS)
      currentIndex = openSet.shift()!;
    }

    if (visited[currentIndex] === 1) continue;
    visited[currentIndex] = 1;
    nodesExplored++;

    // Post progress snapshot periodically or upon goal found
    if (nodesExplored % 8 === 0 || currentIndex === goalIndex) {
      const snapshot: StepSnapshot = {
        stepIndex: nodesExplored,
        currentNode: currentIndex,
        nodesExplored,
        executionTimeMs: performance.now() - startTime,
        isComplete: currentIndex === goalIndex,
      };
      ctx.postMessage({ type: 'SEARCH_STEP', snapshot } as WorkerResponse);
    }

    if (currentIndex === goalIndex) {
      found = true;
      break;
    }

    // Explore 4-directional neighbors
    const neighbors = getNeighbors(currentIndex, dim);
    for (const neighbor of neighbors) {
      if (visited[neighbor] === 1) continue;
      const cellWeight = weights[neighbor];
      if (!isFinite(cellWeight) || cellWeight >= 999) continue; // Obstacle wall

      const tentativeG = gScores[currentIndex] + cellWeight;
      if (tentativeG < gScores[neighbor] || parentPointers[neighbor] === -1) {
        parentPointers[neighbor] = currentIndex;
        gScores[neighbor] = tentativeG;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;

  // Reconstruct path
  const path: number[] = [];
  let totalCost = 0;

  if (found) {
    let curr = goalIndex;
    while (curr !== -1) {
      path.unshift(curr);
      if (curr !== startIndex) {
        totalCost += weights[curr] || 1;
      }
      curr = parentPointers[curr];
    }
  }

  ctx.postMessage({
    type: 'SEARCH_COMPLETE',
    result: {
      path,
      nodesExplored,
      executionTimeMs,
      cost: totalCost,
    },
  } as WorkerResponse);
}

function getHeuristicCost(
  index: number,
  goalIndex: number,
  dim: [number, number],
  hWeight: number
): number {
  const x1 = index % dim[0];
  const y1 = Math.floor(index / dim[0]);
  const x2 = goalIndex % dim[0];
  const y2 = Math.floor(goalIndex / dim[0]);
  const h = Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan Heuristic
  return hWeight * h;
}

function getNeighbors(index: number, dim: [number, number]): number[] {
  const width = dim[0];
  const height = dim[1];
  const x = index % width;
  const y = Math.floor(index / width);
  const neighbors: number[] = [];

  if (x > 0) neighbors.push(index - 1);
  if (x < width - 1) neighbors.push(index + 1);
  if (y > 0) neighbors.push(index - width);
  if (y < height - 1) neighbors.push(index + width);

  return neighbors;
}
