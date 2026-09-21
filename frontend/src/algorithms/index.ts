// ============================================
// AlgoArena - Pathfinding Algorithms & Execution
// ============================================

import { 
  Cell, 
  GridState, 
  AlgorithmResult, 
  AlgorithmType,
  AlgorithmStep,
  AlgorithmTuningConfig,
  DEFAULT_TUNING_CONFIG,
  CELL_COSTS 
} from '../types';
import { runRLAgent } from './rlAgent';
import { runGeneticPathfinder } from './geneticPathfinder';

// Priority Queue for weighted algorithms
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number): void {
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  getItems(): T[] {
    return this.items.map(item => item.element);
  }

  size(): number {
    return this.items.length;
  }
}

// Get neighbors of a cell
function getNeighbors(grid: Cell[][], cell: Cell): Cell[] {
  const neighbors: Cell[] = [];
  const directions = [
    { dx: 0, dy: -1 },  // up
    { dx: 1, dy: 0 },   // right
    { dx: 0, dy: 1 },   // down
    { dx: -1, dy: 0 },  // left
  ];

  // Add diagonal movement
  const diagonals = [
    { dx: -1, dy: -1 }, // top-left
    { dx: 1, dy: -1 },  // top-right
    { dx: -1, dy: 1 },  // bottom-left
    { dx: 1, dy: 1 },   // bottom-right
  ];

  const allDirections = [...directions, ...diagonals];

  for (const { dx, dy } of allDirections) {
    const nx = cell.x + dx;
    const ny = cell.y + dy;

    if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
      const neighbor = grid[ny][nx];
      if (neighbor.type !== 'wall' && neighbor.type !== 'water') {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
}

// Heuristic function (diagonal distance)
function heuristic(a: Cell, b: Cell): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
}

// Get movement cost between adjacent cells
function getMovementCost(from: Cell, to: Cell): number {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const isDiagonal = dx === 1 && dy === 1;
  
  const baseCost = CELL_COSTS[to.type];
  const diagonalMultiplier = isDiagonal ? Math.sqrt(2) : 1;
  
  return baseCost * diagonalMultiplier;
}

// Reconstruct path from end to start
function reconstructPath(endCell: Cell): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  let current: Cell | null = endCell;

  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }

  return path;
}

// Deep clone grid
function cloneGrid(cells: Cell[][]): Cell[][] {
  return cells.map(row =>
    row.map(cell => ({
      ...cell,
      isVisited: false,
      isPath: false,
      parent: null,
      g: Infinity,
      h: Infinity,
      f: Infinity,
    }))
  );
}

// ============================================
// BFS - Breadth-First Search
// ============================================
export function bfs(
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void
): AlgorithmResult {
  const startTime = performance.now();
  const grid = cloneGrid(gridState.cells);
  const visited: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  if (!gridState.start || !gridState.end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0, steps: [] };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];

  startCell.isVisited = true;
  startCell.g = 0;
  startCell.h = heuristic(startCell, endCell);
  startCell.f = startCell.g + startCell.h;

  const queue: Cell[] = [startCell];
  visited.push({ x: startCell.x, y: startCell.y });

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === endCell.x && current.y === endCell.y) {
      const path = reconstructPath(current);
      const endTime = performance.now();

      return {
        visited,
        path,
        cost: path.length - 1,
        executionTime: endTime - startTime,
        nodesVisited: visited.length,
        steps,
      };
    }

    const neighbors = getNeighbors(grid, current);

    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.parent = current;
        neighbor.g = current.g + 1;
        neighbor.h = heuristic(neighbor, endCell);
        neighbor.f = neighbor.g + neighbor.h;

        visited.push({ x: neighbor.x, y: neighbor.y });
        queue.push(neighbor);

        const step: AlgorithmStep = {
          type: 'visit',
          cell: { x: neighbor.x, y: neighbor.y },
          description: `BFS expanding wave to (${neighbor.x}, ${neighbor.y}) - queue depth: ${queue.length}`,
          queue: queue.map(c => ({ x: c.x, y: c.y })),
          g: neighbor.g,
          h: neighbor.h,
          f: neighbor.f,
          parent: { x: current.x, y: current.y },
          openSetCount: queue.length,
          closedSetCount: visited.length,
        };
        steps.push(step);
        onStep?.(step);
      }
    }
  }

  const endTime = performance.now();
  return {
    visited,
    path: [],
    cost: Infinity,
    executionTime: endTime - startTime,
    nodesVisited: visited.length,
    steps,
  };
}

// ============================================
// DFS - Depth-First Search
// ============================================
export function dfs(
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void,
  tuning?: Partial<AlgorithmTuningConfig>
): AlgorithmResult {
  const startTime = performance.now();
  const grid = cloneGrid(gridState.cells);
  const visited: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  if (!gridState.start || !gridState.end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0, steps: [] };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];
  const maxDepth = tuning?.dfsMaxDepth ?? 500;

  startCell.g = 0;
  startCell.h = heuristic(startCell, endCell);
  startCell.f = startCell.h;

  const stack: { cell: Cell; depth: number }[] = [{ cell: startCell, depth: 0 }];

  while (stack.length > 0) {
    const { cell: current, depth } = stack.pop()!;

    if (current.isVisited) continue;
    current.isVisited = true;
    visited.push({ x: current.x, y: current.y });

    const step: AlgorithmStep = {
      type: 'visit',
      cell: { x: current.x, y: current.y },
      description: `DFS drilling depth ${depth} at (${current.x}, ${current.y})`,
      g: depth,
      h: heuristic(current, endCell),
      f: depth + heuristic(current, endCell),
      parent: current.parent ? { x: current.parent.x, y: current.parent.y } : null,
      openSetCount: stack.length,
      closedSetCount: visited.length,
    };
    steps.push(step);
    onStep?.(step);

    if (current.x === endCell.x && current.y === endCell.y) {
      const path = reconstructPath(current);
      const endTime = performance.now();

      return {
        visited,
        path,
        cost: path.length - 1,
        executionTime: endTime - startTime,
        nodesVisited: visited.length,
        steps,
      };
    }

    if (depth < maxDepth) {
      const neighbors = getNeighbors(grid, current);
      // Optional branch ordering
      if (tuning?.dfsBranchOrder === 'heuristic') {
        neighbors.sort((a, b) => heuristic(b, endCell) - heuristic(a, endCell));
      } else if (tuning?.dfsBranchOrder === 'reverse') {
        neighbors.reverse();
      }

      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.parent = current;
          neighbor.g = depth + 1;
          stack.push({ cell: neighbor, depth: depth + 1 });
        }
      }
    }
  }

  const endTime = performance.now();
  return {
    visited,
    path: [],
    cost: Infinity,
    executionTime: endTime - startTime,
    nodesVisited: visited.length,
    steps,
  };
}

// ============================================
// Dijkstra's Algorithm
// ============================================
export function dijkstra(
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void
): AlgorithmResult {
  const startTime = performance.now();
  const grid = cloneGrid(gridState.cells);
  const visited: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  if (!gridState.start || !gridState.end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0, steps: [] };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];

  startCell.g = 0;
  startCell.f = 0;

  const pq = new PriorityQueue<Cell>();
  pq.enqueue(startCell, 0);

  const visitedSet = new Set<string>();

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentKey = `${current.x},${current.y}`;

    if (visitedSet.has(currentKey)) continue;
    visitedSet.add(currentKey);
    visited.push({ x: current.x, y: current.y });

    const step: AlgorithmStep = {
      type: 'visit',
      cell: { x: current.x, y: current.y },
      description: `Dijkstra evaluating (${current.x}, ${current.y}) - cumulative cost: ${current.g.toFixed(2)}`,
      currentCost: current.g,
      g: current.g,
      h: 0,
      f: current.g,
      parent: current.parent ? { x: current.parent.x, y: current.parent.y } : null,
      openSetCount: pq.size(),
      closedSetCount: visited.length,
    };
    steps.push(step);
    onStep?.(step);

    if (current.x === endCell.x && current.y === endCell.y) {
      const path = reconstructPath(current);
      const endTime = performance.now();

      return {
        visited,
        path,
        cost: current.g,
        executionTime: endTime - startTime,
        nodesVisited: visited.length,
        steps,
      };
    }

    const neighbors = getNeighbors(grid, current);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (visitedSet.has(neighborKey)) continue;

      const moveCost = getMovementCost(current, neighbor);
      const tentativeG = current.g + moveCost;

      if (tentativeG < neighbor.g) {
        neighbor.g = tentativeG;
        neighbor.f = tentativeG;
        neighbor.parent = current;
        pq.enqueue(neighbor, neighbor.g);
      }
    }
  }

  const endTime = performance.now();
  return {
    visited,
    path: [],
    cost: Infinity,
    executionTime: endTime - startTime,
    nodesVisited: visited.length,
    steps,
  };
}

// ============================================
// A* Algorithm with Heuristic Weight Slider (g + w * h)
// ============================================
export function astar(
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void,
  tuning?: Partial<AlgorithmTuningConfig>
): AlgorithmResult {
  const startTime = performance.now();
  const grid = cloneGrid(gridState.cells);
  const visited: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  if (!gridState.start || !gridState.end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0, steps: [] };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];
  const weight = tuning?.astarWeight ?? 1.0;

  startCell.g = 0;
  startCell.h = heuristic(startCell, endCell);
  startCell.f = startCell.g + weight * startCell.h;

  const openSet = new PriorityQueue<Cell>();
  openSet.enqueue(startCell, startCell.f);

  const closedSet = new Set<string>();

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue()!;
    const currentKey = `${current.x},${current.y}`;

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    visited.push({ x: current.x, y: current.y });

    const step: AlgorithmStep = {
      type: 'visit',
      cell: { x: current.x, y: current.y },
      description: `A* (w=${weight.toFixed(1)}) exploring (${current.x}, ${current.y}) | g: ${current.g.toFixed(1)}, h: ${current.h.toFixed(1)}, f: ${current.f.toFixed(1)}`,
      currentCost: current.f,
      g: current.g,
      h: current.h,
      f: current.f,
      parent: current.parent ? { x: current.parent.x, y: current.parent.y } : null,
      openSetCount: openSet.size(),
      closedSetCount: visited.length,
    };
    steps.push(step);
    onStep?.(step);

    if (current.x === endCell.x && current.y === endCell.y) {
      const path = reconstructPath(current);
      const endTime = performance.now();

      return {
        visited,
        path,
        cost: current.g,
        executionTime: endTime - startTime,
        nodesVisited: visited.length,
        steps,
      };
    }

    const neighbors = getNeighbors(grid, current);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;

      const moveCost = getMovementCost(current, neighbor);
      const tentativeG = current.g + moveCost;

      if (tentativeG < neighbor.g) {
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, endCell);
        neighbor.f = neighbor.g + weight * neighbor.h;
        neighbor.parent = current;
        openSet.enqueue(neighbor, neighbor.f);
      }
    }
  }

  const endTime = performance.now();
  return {
    visited,
    path: [],
    cost: Infinity,
    executionTime: endTime - startTime,
    nodesVisited: visited.length,
    steps,
  };
}

// ============================================
// Greedy Best-First Search
// ============================================
export function greedyBestFirst(
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void
): AlgorithmResult {
  const startTime = performance.now();
  const grid = cloneGrid(gridState.cells);
  const visited: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  if (!gridState.start || !gridState.end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0, steps: [] };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];

  startCell.h = heuristic(startCell, endCell);

  const pq = new PriorityQueue<Cell>();
  pq.enqueue(startCell, startCell.h);

  const visitedSet = new Set<string>();

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentKey = `${current.x},${current.y}`;

    if (visitedSet.has(currentKey)) continue;
    visitedSet.add(currentKey);
    visited.push({ x: current.x, y: current.y });

    const step: AlgorithmStep = {
      type: 'visit',
      cell: { x: current.x, y: current.y },
      description: `Greedy vector targeting (${current.x}, ${current.y}) | heuristic: ${current.h.toFixed(1)}`,
      currentCost: current.h,
      g: 0,
      h: current.h,
      f: current.h,
      parent: current.parent ? { x: current.parent.x, y: current.parent.y } : null,
      openSetCount: pq.size(),
      closedSetCount: visited.length,
    };
    steps.push(step);
    onStep?.(step);

    if (current.x === endCell.x && current.y === endCell.y) {
      const path = reconstructPath(current);
      let pathCost = 0;
      for (let i = 1; i < path.length; i++) {
        const prev = grid[path[i - 1].y][path[i - 1].x];
        const curr = grid[path[i].y][path[i].x];
        pathCost += getMovementCost(prev, curr);
      }
      const endTime = performance.now();

      return {
        visited,
        path,
        cost: pathCost,
        executionTime: endTime - startTime,
        nodesVisited: visited.length,
        steps,
      };
    }

    const neighbors = getNeighbors(grid, current);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (!visitedSet.has(neighborKey)) {
        neighbor.h = heuristic(neighbor, endCell);
        neighbor.parent = current;
        pq.enqueue(neighbor, neighbor.h);
      }
    }
  }

  const endTime = performance.now();
  return {
    visited,
    path: [],
    cost: Infinity,
    executionTime: endTime - startTime,
    nodesVisited: visited.length,
    steps,
  };
}

// ============================================
// Run Algorithm by Type with Workshop Tuning
// ============================================
export function runAlgorithm(
  type: AlgorithmType,
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void,
  tuning?: Partial<AlgorithmTuningConfig>
): AlgorithmResult {
  const mergedTuning = { ...DEFAULT_TUNING_CONFIG, ...tuning };

  switch (type) {
    case 'bfs':
      return bfs(gridState, onStep);
    case 'dfs':
      return dfs(gridState, onStep, mergedTuning);
    case 'dijkstra':
      return dijkstra(gridState, onStep);
    case 'astar':
      return astar(gridState, onStep, mergedTuning);
    case 'greedy':
      return greedyBestFirst(gridState, onStep);
    case 'genetic':
      return runGeneticPathfinder(
        gridState,
        mergedTuning.geneticPopulationSize,
        mergedTuning.geneticGenerations,
        mergedTuning.geneticMutationRate,
        mergedTuning.geneticCrossoverRate
      );
    case 'rl':
      return runRLAgent(
        gridState,
        mergedTuning.rlLearningRate,
        mergedTuning.rlEpsilon
      );
    default:
      return bfs(gridState, onStep);
  }
}

// Export all algorithms
export const algorithms = {
  bfs,
  dfs,
  dijkstra,
  astar,
  greedyBestFirst,
  genetic: runGeneticPathfinder,
  rl: runRLAgent,
};
