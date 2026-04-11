// ============================================
//AlgoArena  - AI Algorithm Selector
// ============================================

import { 
  GridState, 
  AlgorithmType, 
  AISuggestion,
  CELL_COSTS,
  AlgorithmResult
} from '../types';
import { runAlgorithm } from './index';

// Analyze grid characteristics
function analyzeGrid(gridState: GridState) {
  const { cells, width, height, start, end } = gridState;
  
  let totalCells = 0;
  let obstacleCount = 0;
  let wallCount = 0;
  let waterCount = 0;
  let mudCount = 0;
  let boostCount = 0;
  let totalCost = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[y][x];
      totalCells++;
      
      if (cell.type === 'wall') {
        wallCount++;
        obstacleCount++;
      } else if (cell.type === 'water') {
        waterCount++;
        obstacleCount++;
      } else if (cell.type === 'mud') {
        mudCount++;
      } else if (cell.type === 'boost') {
        boostCount++;
      }
      
      if (cell.type !== 'wall' && cell.type !== 'water') {
        totalCost += CELL_COSTS[cell.type];
      }
    }
  }

  const obstacleDensity = obstacleCount / totalCells;
  const avgCost = totalCost / (totalCells - obstacleCount);
  
  // Calculate distance
  let distance = 0;
  if (start && end) {
    distance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
  }

  // Calculate complexity based on terrain variety
  const terrainTypes = [mudCount, waterCount, boostCount, wallCount].filter(c => c > 0).length;
  const complexity = (terrainTypes / 4) * (1 + obstacleDensity);

  return {
    obstacleDensity,
    avgCost,
    distance,
    complexity,
    wallCount,
    waterCount,
    mudCount,
    boostCount,
    totalCells,
  };
}

// AI decision logic
export function selectBestAlgorithm(gridState: GridState): AISuggestion {
  const analysis = analyzeGrid(gridState);
  const { obstacleDensity, avgCost, distance, complexity } = analysis;

  // Decision logic based on grid characteristics
  let bestAlgorithm: AlgorithmType = 'astar';
  let reason = '';
  let confidence = 0.5;

  // If high obstacle density and complex terrain
  if (obstacleDensity > 0.3 && complexity > 0.5) {
    // A* is best for complex environments
    bestAlgorithm = 'astar';
    reason = 'A* excels in complex environments with many obstacles. It combines the completeness of Dijkstra with heuristic guidance for optimal performance.';
    confidence = 0.9;
  }
  // If terrain has varied costs (mud, boost)
  else if (avgCost !== 1 && (analysis.mudCount > 0 || analysis.boostCount > 0)) {
    // Dijkstra handles weighted graphs optimally
    bestAlgorithm = 'dijkstra';
    reason = 'Dijkstra\'s algorithm is optimal for weighted graphs with varying terrain costs. It guarantees finding the lowest total cost path.';
    confidence = 0.85;
  }
  // If simple grid with few obstacles
  else if (obstacleDensity < 0.15 && avgCost === 1) {
    // BFS is optimal for unweighted shortest path
    bestAlgorithm = 'bfs';
    reason = 'BFS is optimal for unweighted grids with few obstacles. It finds the shortest path with minimal computation.';
    confidence = 0.88;
  }
  // If need fast approximation
  else if (distance > 20) {
    // Greedy is fast for long distances
    bestAlgorithm = 'greedy';
    reason = 'Greedy Best-First is efficient for long-distance pathfinding. It quickly moves toward the goal, though it may not always find the optimal path.';
    confidence = 0.7;
  }
  // Medium complexity
  else {
    bestAlgorithm = 'astar';
    reason = 'A* provides the best balance of speed and optimality for medium-complexity environments.';
    confidence = 0.8;
  }

  // Adjust confidence based on grid analysis
  if (complexity < 0.3) {
    confidence = Math.min(confidence + 0.1, 1.0);
  }

  return {
    algorithm: bestAlgorithm,
    reason,
    confidence,
    factors: {
      obstacleDensity,
      avgCost,
      distance,
      complexity,
    },
  };
}

// Run AI battle - returns AI's result
export function runAIBattle(
  gridState: GridState
): { algorithm: AlgorithmType; result: AlgorithmResult } {
  const suggestion = selectBestAlgorithm(gridState);
  const result = runAlgorithm(suggestion.algorithm, gridState);
  
  return {
    algorithm: suggestion.algorithm,
    result,
  };
}

// Compare player vs AI
export function compareResults(
  playerResult: AlgorithmResult,
  aiResult: AlgorithmResult,
  playerAlgorithm: AlgorithmType,
  aiAlgorithm: AlgorithmType
): {
  winner: 'player' | 'ai' | 'tie';
  playerScore: number;
  aiScore: number;
  analysis: string;
} {
  // Score calculation
  // Lower cost is better, lower time is better, fewer nodes visited is better
  
  const playerPathScore = playerResult.path.length > 0 ? 100 / (playerResult.cost || 1) : 0;
  const aiPathScore = aiResult.path.length > 0 ? 100 / (aiResult.cost || 1) : 0;
  
  const playerSpeedScore = Math.max(0, 100 - playerResult.executionTime);
  const aiSpeedScore = Math.max(0, 100 - aiResult.executionTime);
  
  const playerEfficiencyScore = Math.max(0, 100 - playerResult.nodesVisited * 0.5);
  const aiEfficiencyScore = Math.max(0, 100 - aiResult.nodesVisited * 0.5);
  
  const playerScore = playerPathScore * 0.5 + playerSpeedScore * 0.3 + playerEfficiencyScore * 0.2;
  const aiScore = aiPathScore * 0.5 + aiSpeedScore * 0.3 + aiEfficiencyScore * 0.2;
  
  let winner: 'player' | 'ai' | 'tie' = 'tie';
  let analysis = '';
  
  if (playerScore > aiScore * 1.1) {
    winner = 'player';
    analysis = `Excellent! Your ${playerAlgorithm.toUpperCase()} algorithm outperformed AI's ${aiAlgorithm.toUpperCase()} by ${((playerScore - aiScore) / aiScore * 100).toFixed(1)}%!`;
  } else if (aiScore > playerScore * 1.1) {
    winner = 'ai';
    analysis = `AI's ${aiAlgorithm.toUpperCase()} won this round. It was more efficient for this grid configuration.`;
  } else {
    winner = 'tie';
    analysis = `Close match! Both algorithms performed similarly on this grid.`;
  }
  
  return {
    winner,
    playerScore,
    aiScore,
    analysis,
  };
}

// Get algorithm explanation
export function getAlgorithmExplanation(
  algorithm: AlgorithmType,
  gridState: GridState
): string {
  const analysis = analyzeGrid(gridState);
  
  const explanations: Record<AlgorithmType, string> = {
    bfs: `Breadth-First Search explores all nodes at the current depth before moving deeper.
    
For your grid:
- Obstacle density: ${(analysis.obstacleDensity * 100).toFixed(1)}%
- Grid size: ${gridState.width}x${gridState.height}

BFS guarantees the shortest path in unweighted graphs but doesn't consider terrain costs. Best for simple grids with uniform movement costs.`,

    dfs: `Depth-First Search explores as far as possible along each branch before backtracking.

For your grid:
- Complexity: ${analysis.complexity.toFixed(2)}
- Distance: ${analysis.distance} cells

DFS doesn't guarantee the shortest path but uses less memory. Useful for maze-solving or when any path will do.`,

    dijkstra: `Dijkstra's Algorithm finds the shortest path in weighted graphs.

For your grid:
- Average terrain cost: ${analysis.avgCost.toFixed(2)}
- Varied terrain: ${analysis.mudCount > 0 || analysis.boostCount > 0 ? 'Yes' : 'No'}

Dijkstra considers terrain costs (mud=5, boost=0.5) and guarantees optimal path. Best when path cost matters more than speed.`,

    astar: `A* combines Dijkstra's completeness with heuristic guidance.

For your grid:
- Heuristic distance: ${analysis.distance} cells
- Complexity: ${analysis.complexity.toFixed(2)}

A* uses a heuristic (estimated distance) to guide search toward the goal. Often faster than Dijkstra while still optimal. Best all-around choice.`,

    greedy: `Greedy Best-First Search always moves toward the goal.

For your grid:
- Direct distance: ${analysis.distance} cells
- Obstacles: ${analysis.obstacleDensity > 0.2 ? 'Many' : 'Few'}

Greedy is fast but doesn't guarantee optimal path. Best for quick approximations or when obstacles are sparse.`,
  };
  
  return explanations[algorithm];
}
