// ============================================
// AlgoArena - Pathfinding Algorithms
// ============================================

import { 
  Cell, 
  GridState, 
  AlgorithmResult, 
  AlgorithmType,
  AlgorithmStep,
  CELL_COSTS 
} from '../types';

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

// Heuristic function (Manhattan distance with diagonal adjustment)
function heuristic(a: Cell, b: Cell): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  // Diagonal distance heuristic
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

// Deep clone grid for algorithm isolation
function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map(row => 
    row.map(cell => ({
      ...cell,
      parent: null,
      g: Infinity,
      h: 0,
      f: Infinity,
      isVisited: false,
      isPath: false,
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
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0 };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];

  const queue: Cell[] = [startCell];
  startCell.isVisited = true;

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
      };
    }

    const neighbors = getNeighbors(grid, current);

    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.parent = current;
        visited.push({ x: neighbor.x, y: neighbor.y });
        queue.push(neighbor);

        const step: AlgorithmStep = {
          type: 'visit',
          cell: { x: neighbor.x, y: neighbor.y },
          description: `Visiting cell (${neighbor.x}, ${neighbor.y})`,
          queue: queue.map(c => ({ x: c.x, y: c.y })),
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
  };
}

// ============================================
// DFS - Depth-First Search
// ============================================
export function dfs(
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void
): AlgorithmResult {
  const startTime = performance.now();
  const grid = cloneGrid(gridState.cells);
  const visited: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  if (!gridState.start || !gridState.end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0 };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];

  const stack: Cell[] = [startCell];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current.isVisited) continue;
    current.isVisited = true;
    visited.push({ x: current.x, y: current.y });

    const step: AlgorithmStep = {
      type: 'visit',
      cell: { x: current.x, y: current.y },
      description: `Exploring cell (${current.x}, ${current.y})`,
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
      };
    }

    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.parent = current;
        stack.push(neighbor);
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
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0 };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];

  startCell.g = 0;
  const pq = new PriorityQueue<Cell>();
  pq.enqueue(startCell, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;

    if (current.isVisited) continue;
    current.isVisited = true;
    visited.push({ x: current.x, y: current.y });

    const step: AlgorithmStep = {
      type: 'visit',
      cell: { x: current.x, y: current.y },
      description: `Processing cell (${current.x}, ${current.y}) with cost ${current.g.toFixed(2)}`,
      currentCost: current.g,
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
      };
    }

    const neighbors = getNeighbors(grid, current);

    for (const neighbor of neighbors) {
      const moveCost = getMovementCost(current, neighbor);
      const newCost = current.g + moveCost;

      if (newCost < neighbor.g) {
        neighbor.g = newCost;
        neighbor.parent = current;
        pq.enqueue(neighbor, newCost);
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
  };
}

// ============================================
// A* Algorithm
// ============================================
export function astar(
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void
): AlgorithmResult {
  const startTime = performance.now();
  const grid = cloneGrid(gridState.cells);
  const visited: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  if (!gridState.start || !gridState.end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0 };
  }

  const startCell = grid[gridState.start.y][gridState.start.x];
  const endCell = grid[gridState.end.y][gridState.end.x];

  startCell.g = 0;
  startCell.h = heuristic(startCell, endCell);
  startCell.f = startCell.g + startCell.h;

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
      description: `A* visiting (${current.x}, ${current.y}) - g: ${current.g.toFixed(2)}, h: ${current.h.toFixed(2)}, f: ${current.f.toFixed(2)}`,
      currentCost: current.f,
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
        neighbor.f = neighbor.g + neighbor.h;
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
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0 };
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
      description: `Greedy exploring (${current.x}, ${current.y}) - heuristic: ${current.h.toFixed(2)}`,
      currentCost: current.h,
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
  };
}

// ============================================
// Run Algorithm by Type
// ============================================
export function runAlgorithm(
  type: AlgorithmType,
  gridState: GridState,
  onStep?: (step: AlgorithmStep) => void
): AlgorithmResult {
  switch (type) {
    case 'bfs':
      return bfs(gridState, onStep);
    case 'dfs':
      return dfs(gridState, onStep);
    case 'dijkstra':
      return dijkstra(gridState, onStep);
    case 'astar':
      return astar(gridState, onStep);
    case 'greedy':
      return greedyBestFirst(gridState, onStep);
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
};
