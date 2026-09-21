// ============================================
// AlgoArena - Maze Generator (DFS-based)
// ============================================

import { GridState, Cell, CELL_COSTS } from '../types';

// Create empty maze grid (all walls)
function createMazeGrid(width: number, height: number): GridState {
  const cells: Cell[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        type: 'wall',
        cost: CELL_COSTS.wall,
        isVisited: false,
        isPath: false,
        parent: null,
        g: Infinity,
        h: 0,
        f: Infinity,
      });
    }
    cells.push(row);
  }
  
  return {
    cells,
    width,
    height,
    start: null,
    end: null,
  };
}

// Get unvisited neighbors for maze generation (2-cell distance)
function getMazeNeighbors(cells: Cell[][], x: number, y: number, width: number, height: number): { nx: number; ny: number; dx: number; dy: number }[] {
  const neighbors: { nx: number; ny: number; dx: number; dy: number }[] = [];
  
  const directions = [
    { dx: 0, dy: -2 },  // up
    { dx: 2, dy: 0 },   // right
    { dx: 0, dy: 2 },   // down
    { dx: -2, dy: 0 },  // left
  ];
  
  for (const { dx, dy } of directions) {
    const nx = x + dx;
    const ny = y + dy;
    
    if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
      if (cells[ny][nx].type === 'wall') {
        neighbors.push({ nx, ny, dx: dx / 2, dy: dy / 2 });
      }
    }
  }
  
  return neighbors;
}

// Shuffle array
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate maze using DFS recursive backtracker
export function generateMaze(width: number, height: number): GridState {
  // Ensure odd dimensions for proper maze
  const mazeWidth = width % 2 === 0 ? width + 1 : width;
  const mazeHeight = height % 2 === 0 ? height + 1 : height;
  
  const grid = createMazeGrid(mazeWidth, mazeHeight);
  const stack: { x: number; y: number }[] = [];
  
  // Start from (1, 1)
  const startX = 1;
  const startY = 1;
  
  grid.cells[startY][startX].type = 'normal';
  grid.cells[startY][startX].cost = CELL_COSTS.normal;
  
  stack.push({ x: startX, y: startY });
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getMazeNeighbors(grid.cells, current.x, current.y, mazeWidth, mazeHeight);
    
    if (neighbors.length > 0) {
      const shuffledNeighbors = shuffle(neighbors);
      const { nx, ny, dx, dy } = shuffledNeighbors[0];
      
      // Remove wall between current and neighbor
      grid.cells[current.y + dy][current.x + dx].type = 'normal';
      grid.cells[current.y + dy][current.x + dx].cost = CELL_COSTS.normal;
      
      grid.cells[ny][nx].type = 'normal';
      grid.cells[ny][nx].cost = CELL_COSTS.normal;
      
      stack.push({ x: nx, y: ny });
    } else {
      stack.pop();
    }
  }
  
  // Set start and end points
  grid.cells[1][1].type = 'start';
  grid.start = { x: 1, y: 1 };
  
  grid.cells[mazeHeight - 2][mazeWidth - 2].type = 'end';
  grid.end = { x: mazeWidth - 2, y: mazeHeight - 2 };
  
  // Add some terrain variety
  addTerrainVariety(grid, 0.05);
  
  return grid;
}

// Add terrain variety to maze
function addTerrainVariety(grid: GridState, density: number): void {
  for (let y = 1; y < grid.height - 1; y++) {
    for (let x = 1; x < grid.width - 1; x++) {
      const cell = grid.cells[y][x];
      
      if (cell.type !== 'normal') continue;
      
      const rand = Math.random();
      
      if (rand < density) {
        cell.type = 'mud';
        cell.cost = CELL_COSTS.mud;
      } else if (rand < density * 1.2) {
        cell.type = 'boost';
        cell.cost = CELL_COSTS.boost;
      }
    }
  }
}

// Generate maze with specific difficulty
export function generateMazeWithDifficulty(
  width: number,
  height: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): GridState {
  let grid = generateMaze(width, height);
  
  switch (difficulty) {
    case 'easy':
      // Add more open paths
      addExtraPaths(grid, 0.05);
      break;
    case 'hard':
      // Add more obstacles and longer paths
      addExtraWalls(grid, 0.03);
      addTerrainVariety(grid, 0.08);
      break;
    default:
      // Medium is default
      break;
  }
  
  return grid;
}

// Add extra paths to make maze easier
function addExtraPaths(grid: GridState, density: number): void {
  for (let y = 2; y < grid.height - 2; y++) {
    for (let x = 2; x < grid.width - 2; x++) {
      if (grid.cells[y][x].type === 'wall' && Math.random() < density) {
        // Check if this creates a valid path
        const neighbors = [
          grid.cells[y - 1][x],
          grid.cells[y + 1][x],
          grid.cells[y][x - 1],
          grid.cells[y][x + 1],
        ];
        
        const openNeighbors = neighbors.filter(n => n.type !== 'wall' && n.type !== 'water');
        
        if (openNeighbors.length >= 2) {
          grid.cells[y][x].type = 'normal';
          grid.cells[y][x].cost = CELL_COSTS.normal;
        }
      }
    }
  }
}

// Add extra walls to make maze harder
function addExtraWalls(grid: GridState, density: number): void {
  for (let y = 2; y < grid.height - 2; y++) {
    for (let x = 2; x < grid.width - 2; x++) {
      if (grid.cells[y][x].type === 'normal' && Math.random() < density) {
        // Don't block start/end
        if ((x === grid.start?.x && y === grid.start?.y) ||
            (x === grid.end?.x && y === grid.end?.y)) {
          continue;
        }
        
        // Check if this would block the only path
        const neighbors = [
          grid.cells[y - 1][x],
          grid.cells[y + 1][x],
          grid.cells[y][x - 1],
          grid.cells[y][x + 1],
        ];
        
        const openNeighbors = neighbors.filter(n => n.type !== 'wall' && n.type !== 'water');
        
        if (openNeighbors.length > 2) {
          grid.cells[y][x].type = 'wall';
          grid.cells[y][x].cost = CELL_COSTS.wall;
        }
      }
    }
  }
}

// Create a spiral pattern maze
export function generateSpiralMaze(width: number, height: number): GridState {
  const grid = createMazeGrid(width, height);
  
  let top = 1;
  let bottom = height - 2;
  let left = 1;
  let right = width - 2;
  
  let dir = 0; // 0: right, 1: down, 2: left, 3: up
  
  let x = 1;
  let y = 1;
  
  while (top <= bottom && left <= right) {
    grid.cells[y][x].type = 'normal';
    grid.cells[y][x].cost = CELL_COSTS.normal;
    
    switch (dir) {
      case 0: // right
        if (x < right) {
          x++;
        } else {
          dir = 1;
          top += 2;
          y++;
        }
        break;
      case 1: // down
        if (y < bottom) {
          y++;
        } else {
          dir = 2;
          right -= 2;
          x--;
        }
        break;
      case 2: // left
        if (x > left) {
          x--;
        } else {
          dir = 3;
          bottom -= 2;
          y--;
        }
        break;
      case 3: // up
        if (y > top) {
          y--;
        } else {
          dir = 0;
          left += 2;
          x++;
        }
        break;
    }
  }
  
  // Set start and end
  grid.cells[1][1].type = 'start';
  grid.start = { x: 1, y: 1 };
  
  grid.cells[height - 2][width - 2].type = 'end';
  grid.end = { x: width - 2, y: height - 2 };
  
  return grid;
}
