// ============================================================================
// AlgoArena v4.0 - Pathfinding Test & Benchmark Runner Engine (Section 5)
// Deterministic synchronous pathfinding verification runner for tests & QA
// ============================================================================

import { GridDimensions } from '../types/algoArena';

export interface PathfindingTestResult {
  reachedGoal: boolean;
  pathCost: number;
  nodesExplored: number;
  path: number[];
  executionTimeMs: number;
}

export function runPathfindingTest(
  algo: string,
  dim: GridDimensions,
  start: [number, number],
  goal: [number, number],
  weights: Float32Array,
  hWeight: number = 1.0
): PathfindingTestResult {
  const width = dim[0];
  const height = dim[1];
  const totalCells = width * height;

  const startIndex = start[1] * width + start[0];
  const goalIndex = goal[1] * width + goal[0];

  if (startIndex < 0 || startIndex >= totalCells || goalIndex < 0 || goalIndex >= totalCells) {
    return {
      reachedGoal: false,
      pathCost: Infinity,
      nodesExplored: 0,
      path: [],
      executionTimeMs: 0,
    };
  }

  const visited = new Uint8Array(totalCells);
  const parentPointers = new Int32Array(totalCells).fill(-1);
  const gScores = new Float32Array(totalCells).fill(Infinity);
  const openSet: number[] = [];

  gScores[startIndex] = 0;
  openSet.push(startIndex);

  let nodesExplored = 0;
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let found = false;

  const normalizedAlgo = algo.toUpperCase().replace('-', '_');

  const getHeuristic = (idx: number): number => {
    const x1 = idx % width;
    const y1 = Math.floor(idx / width);
    const x2 = goalIndex % width;
    const y2 = Math.floor(goalIndex / width);
    return hWeight * (Math.abs(x1 - x2) + Math.abs(y1 - y2));
  };

  while (openSet.length > 0) {
    let currentIndex: number;

    if (normalizedAlgo === 'A_STAR' || normalizedAlgo === 'ASTAR') {
      // Small tie-breaker heuristic h(n)*0.001 to guarantee directional greediness towards goal
      let bestIdx = 0;
      let minF = Infinity;
      for (let i = 0; i < openSet.length; i++) {
        const node = openSet[i];
        const h = getHeuristic(node);
        const f = gScores[node] + h + h * 0.0001;
        if (f < minF) {
          minF = f;
          bestIdx = i;
        }
      }
      currentIndex = openSet.splice(bestIdx, 1)[0];
    } else if (normalizedAlgo === 'DIJKSTRA') {
      let bestIdx = 0;
      let minG = Infinity;
      for (let i = 0; i < openSet.length; i++) {
        const node = openSet[i];
        if (gScores[node] < minG) {
          minG = gScores[node];
          bestIdx = i;
        }
      }
      currentIndex = openSet.splice(bestIdx, 1)[0];
    } else if (normalizedAlgo === 'GREEDY') {
      let bestIdx = 0;
      let minH = Infinity;
      for (let i = 0; i < openSet.length; i++) {
        const node = openSet[i];
        const h = getHeuristic(node);
        if (h < minH) {
          minH = h;
          bestIdx = i;
        }
      }
      currentIndex = openSet.splice(bestIdx, 1)[0];
    } else if (normalizedAlgo === 'DFS') {
      currentIndex = openSet.pop()!;
    } else {
      // BFS (FIFO)
      currentIndex = openSet.shift()!;
    }

    if (visited[currentIndex] === 1) continue;
    visited[currentIndex] = 1;
    nodesExplored++;

    if (currentIndex === goalIndex) {
      found = true;
      break;
    }

    // Neighbors (Up, Right, Down, Left)
    const cx = currentIndex % width;
    const cy = Math.floor(currentIndex / width);
    const neighbors: number[] = [];

    if (cy > 0) neighbors.push(currentIndex - width);
    if (cx < width - 1) neighbors.push(currentIndex + 1);
    if (cy < height - 1) neighbors.push(currentIndex + width);
    if (cx > 0) neighbors.push(currentIndex - 1);

    for (const neighbor of neighbors) {
      if (visited[neighbor] === 1) continue;
      const cellWeight = weights[neighbor];
      if (!isFinite(cellWeight) || cellWeight >= 999) continue;

      const tentativeG = gScores[currentIndex] + cellWeight;
      if (tentativeG < gScores[neighbor]) {
        parentPointers[neighbor] = currentIndex;
        gScores[neighbor] = tentativeG;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const executionTimeMs = endTime - startTime;

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

  return {
    reachedGoal: found,
    pathCost: totalCost,
    nodesExplored,
    path,
    executionTimeMs,
  };
}
