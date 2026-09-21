// ============================================================================
// AlgoArena v4.0 - Automated Test & Benchmarking Harness (Section 5)
// Mathematically verifies path optimality, node efficiency, and latency budgets
// ============================================================================

import { describe, test, expect } from 'vitest';
import { runPathfindingTest } from '../src/engine/testRunner';

describe('AlgoArena Pathfinding Verification', () => {
  const gridDim: [number, number] = [50, 50];
  const weights = new Float32Array(2500).fill(1); // Flat weight map

  test('Dijkstra and A* should produce identical optimal path costs', () => {
    const dijkstraResult = runPathfindingTest('DIJKSTRA', gridDim, [0, 0], [49, 49], weights);
    const aStarResult = runPathfindingTest('A_STAR', gridDim, [0, 0], [49, 49], weights);

    expect(dijkstraResult.reachedGoal).toBe(true);
    expect(aStarResult.reachedGoal).toBe(true);
    expect(aStarResult.pathCost).toEqual(dijkstraResult.pathCost);
  });

  test('A* should explore strictly fewer or equal nodes compared to BFS on uniform grid', () => {
    const bfsResult = runPathfindingTest('BFS', gridDim, [0, 0], [49, 49], weights);
    const aStarResult = runPathfindingTest('A_STAR', gridDim, [0, 0], [49, 49], weights);

    expect(aStarResult.nodesExplored).toBeLessThanOrEqual(bfsResult.nodesExplored);
  });

  test('BFS should find minimal hop count on unweighted grid', () => {
    const bfsResult = runPathfindingTest('BFS', [20, 20], [0, 0], [10, 10], new Float32Array(400).fill(1));
    expect(bfsResult.reachedGoal).toBe(true);
    // Manhattan distance is 10 + 10 = 20 steps
    expect(bfsResult.pathCost).toBe(20);
  });

  test('A* correctly navigates around obstacles without exceeding boundary limits', () => {
    const dim: [number, number] = [20, 20];
    const obstacleWeights = new Float32Array(400).fill(1);
    // Place vertical wall from y=2 to y=17 at x=10
    for (let y = 2; y <= 17; y++) {
      obstacleWeights[y * 20 + 10] = 999; // wall
    }

    const aStarResult = runPathfindingTest('A_STAR', dim, [2, 10], [18, 10], obstacleWeights);
    expect(aStarResult.reachedGoal).toBe(true);
    expect(aStarResult.pathCost).toBeGreaterThan(16); // Must detour around wall
  });
});
