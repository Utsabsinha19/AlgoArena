// ============================================
// AlgoArena - Grid Utilities
// ============================================

import { Cell, CellType, GridState, CELL_COSTS, DynamicObstacle } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Create empty grid
export function createEmptyGrid(width: number, height: number): GridState {
  const cells: Cell[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        type: 'normal',
        cost: CELL_COSTS.normal,
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

// Initialize grid with start and end
export function initializeGrid(width: number, height: number): GridState {
  const grid = createEmptyGrid(width, height);
  
  // Set start point (top-left area)
  const startX = Math.floor(width * 0.1);
  const startY = Math.floor(height * 0.1);
  grid.cells[startY][startX].type = 'start';
  grid.start = { x: startX, y: startY };
  
  // Set end point (bottom-right area)
  const endX = Math.floor(width * 0.9) - 1;
  const endY = Math.floor(height * 0.9) - 1;
  grid.cells[endY][endX].type = 'end';
  grid.end = { x: endX, y: endY };
  
  return grid;
}

// Set cell type
export function setCellType(
  grid: GridState,
  x: number,
  y: number,
  type: CellType
): GridState {
  if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
    return grid;
  }
  
  const newCells = grid.cells.map(row => row.map(cell => ({ ...cell })));
  const oldType = newCells[y][x].type;
  
  // Handle start/end points
  if (type === 'start') {
    // Clear old start
    if (grid.start) {
      newCells[grid.start.y][grid.start.x].type = 'normal';
    }
    newCells[y][x].type = 'start';
    return {
      ...grid,
      cells: newCells,
      start: { x, y },
    };
  }
  
  if (type === 'end') {
    // Clear old end
    if (grid.end) {
      newCells[grid.end.y][grid.end.x].type = 'normal';
    }
    newCells[y][x].type = 'end';
    return {
      ...grid,
      cells: newCells,
      end: { x, y },
    };
  }
  
  // Don't overwrite start/end with other types
  if (oldType === 'start' || oldType === 'end') {
    return grid;
  }
  
  newCells[y][x].type = type;
  newCells[y][x].cost = CELL_COSTS[type];
  
  return {
    ...grid,
    cells: newCells,
  };
}

// Clear visited/path state
export function clearVisualization(grid: GridState): GridState {
  const newCells = grid.cells.map(row =>
    row.map(cell => ({
      ...cell,
      isVisited: false,
      isPath: false,
      parent: null,
      g: Infinity,
      h: 0,
      f: Infinity,
    }))
  );
  
  return {
    ...grid,
    cells: newCells,
  };
}

// Randomize terrain
export function randomizeTerrain(
  grid: GridState,
  density: number = 0.2
): GridState {
  let newGrid = { ...grid, cells: grid.cells.map(row => row.map(cell => ({ ...cell }))) };
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = newGrid.cells[y][x];
      
      // Skip start and end
      if (cell.type === 'start' || cell.type === 'end') continue;
      
      const rand = Math.random();
      
      if (rand < density * 0.4) {
        newGrid = setCellType(newGrid, x, y, 'wall');
      } else if (rand < density * 0.6) {
        newGrid = setCellType(newGrid, x, y, 'mud');
      } else if (rand < density * 0.65) {
        newGrid = setCellType(newGrid, x, y, 'water');
      } else if (rand < density * 0.7) {
        newGrid = setCellType(newGrid, x, y, 'boost');
      }
    }
  }
  
  return newGrid;
}

// Generate random obstacles
export function generateObstacles(
  grid: GridState,
  count: number,
  type: CellType = 'wall'
): GridState {
  let newGrid = { ...grid };
  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 10;
  
  while (placed < count && attempts < maxAttempts) {
    const x = Math.floor(Math.random() * grid.width);
    const y = Math.floor(Math.random() * grid.height);
    
    if (newGrid.cells[y][x].type === 'normal') {
      newGrid = setCellType(newGrid, x, y, type);
      placed++;
    }
    attempts++;
  }
  
  return newGrid;
}

// Create dynamic obstacles
export function createDynamicObstacles(
  grid: GridState,
  count: number = 3
): DynamicObstacle[] {
  const obstacles: DynamicObstacle[] = [];
  
  for (let i = 0; i < count; i++) {
    const patterns: Array<'horizontal' | 'vertical' | 'diagonal' | 'random'> = 
      ['horizontal', 'vertical', 'diagonal', 'random'];
    
    const obstacle: DynamicObstacle = {
      id: uuidv4(),
      x: Math.floor(Math.random() * (grid.width - 4)) + 2,
      y: Math.floor(Math.random() * (grid.height - 4)) + 2,
      direction: { 
        x: Math.random() > 0.5 ? 1 : -1, 
        y: Math.random() > 0.5 ? 1 : -1 
      },
      speed: 0.5 + Math.random() * 0.5,
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
    };
    
    obstacles.push(obstacle);
  }
  
  return obstacles;
}

// Update dynamic obstacles positions
export function updateDynamicObstacles(
  grid: GridState,
  obstacles: DynamicObstacle[],
  deltaTime: number
): { grid: GridState; obstacles: DynamicObstacle[] } {
  const newCells = grid.cells.map(row => row.map(cell => ({ ...cell })));
  const newObstacles = obstacles.map(obs => {
    let newX = obs.x;
    let newY = obs.y;
    let newDir = { ...obs.direction };
    
    switch (obs.pattern) {
      case 'horizontal':
        newX += obs.direction.x * obs.speed * deltaTime * 0.05;
        if (newX <= 1 || newX >= grid.width - 2) {
          newDir.x = -newDir.x;
          newX = Math.max(1, Math.min(grid.width - 2, newX));
        }
        break;
      case 'vertical':
        newY += obs.direction.y * obs.speed * deltaTime * 0.05;
        if (newY <= 1 || newY >= grid.height - 2) {
          newDir.y = -newDir.y;
          newY = Math.max(1, Math.min(grid.height - 2, newY));
        }
        break;
      case 'diagonal':
        newX += obs.direction.x * obs.speed * deltaTime * 0.05;
        newY += obs.direction.y * obs.speed * deltaTime * 0.05;
        if (newX <= 1 || newX >= grid.width - 2) {
          newDir.x = -newDir.x;
          newX = Math.max(1, Math.min(grid.width - 2, newX));
        }
        if (newY <= 1 || newY >= grid.height - 2) {
          newDir.y = -newDir.y;
          newY = Math.max(1, Math.min(grid.height - 2, newY));
        }
        break;
      case 'random':
        if (Math.random() < 0.02) {
          newDir.x = Math.random() > 0.5 ? 1 : -1;
          newDir.y = Math.random() > 0.5 ? 1 : -1;
        }
        newX += newDir.x * obs.speed * deltaTime * 0.03;
        newY += newDir.y * obs.speed * deltaTime * 0.03;
        newX = Math.max(1, Math.min(grid.width - 2, newX));
        newY = Math.max(1, Math.min(grid.height - 2, newY));
        break;
    }
    
    return {
      ...obs,
      x: newX,
      y: newY,
      direction: newDir,
    };
  });
  
  return { 
    grid: { ...grid, cells: newCells }, 
    obstacles: newObstacles 
  };
}

// Check if point is blocked by dynamic obstacle
export function isBlockedByDynamicObstacle(
  x: number,
  y: number,
  obstacles: DynamicObstacle[]
): boolean {
  for (const obs of obstacles) {
    const dx = x - obs.x;
    const dy = y - obs.y;
    if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) {
      return true;
    }
  }
  return false;
}

// Export grid as JSON
export function exportGrid(grid: GridState): string {
  const data = {
    width: grid.width,
    height: grid.height,
    cells: grid.cells.map(row => row.map(cell => ({
      type: cell.type,
      cost: cell.cost,
    }))),
    start: grid.start,
    end: grid.end,
  };
  return JSON.stringify(data, null, 2);
}

// Import grid from JSON
export function importGrid(json: string): GridState | null {
  try {
    const data = JSON.parse(json);
    const cells: Cell[][] = [];
    
    for (let y = 0; y < data.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < data.width; x++) {
        const cellData = data.cells[y][x];
        row.push({
          x,
          y,
          type: cellData.type,
          cost: cellData.cost,
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
      width: data.width,
      height: data.height,
      start: data.start,
      end: data.end,
    };
  } catch {
    return null;
  }
}
