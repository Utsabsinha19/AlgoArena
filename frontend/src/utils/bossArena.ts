// ============================================
// AlgoArena - Boss Meltdown & Sector Collapse Manager
// ============================================

import { GridState, DynamicObstacle } from '../types';
import { setCellType } from './gridUtils';

export interface SectorCollapseState {
  currentTier: number;
  maxTiers: number;
  countdown: number; // seconds remaining before next tier collapses
  isMeltdownActive: boolean;
}

/**
 * Collapses the outermost intact perimeter of the grid into molten void (water/wall hazard).
 */
export function collapseNextSector(grid: GridState, tier: number): GridState {
  let updatedGrid = { ...grid, cells: grid.cells.map(row => row.map(cell => ({ ...cell }))) };
  const { width, height, start, end } = grid;

  const top = tier;
  const bottom = height - 1 - tier;
  const left = tier;
  const right = width - 1 - tier;

  if (top > bottom || left > right) return updatedGrid;

  for (let x = left; x <= right; x++) {
    // Top border
    if (!(start && start.x === x && start.y === top) && !(end && end.x === x && end.y === top)) {
      updatedGrid = setCellType(updatedGrid, x, top, 'water');
    }
    // Bottom border
    if (!(start && start.x === x && start.y === bottom) && !(end && end.x === x && end.y === bottom)) {
      updatedGrid = setCellType(updatedGrid, x, bottom, 'water');
    }
  }

  for (let y = top; y <= bottom; y++) {
    // Left border
    if (!(start && start.x === left && start.y === y) && !(end && end.x === left && end.y === y)) {
      updatedGrid = setCellType(updatedGrid, left, y, 'water');
    }
    // Right border
    if (!(start && start.x === right && start.y === y) && !(end && end.x === right && end.y === y)) {
      updatedGrid = setCellType(updatedGrid, right, y, 'water');
    }
  }

  return updatedGrid;
}

/**
 * Creates oscillating laser barriers that sweep back and forth across sectors.
 */
export function createBossLaserHazards(width: number, height: number): DynamicObstacle[] {
  return [
    {
      id: 'boss-laser-1',
      x: Math.floor(width / 3),
      y: 2,
      direction: { x: 0, y: 1 },
      speed: 1.2,
      pattern: 'laser',
      isLaser: true,
    },
    {
      id: 'boss-laser-2',
      x: Math.floor((width * 2) / 3),
      y: height - 3,
      direction: { x: 0, y: -1 },
      speed: 1.5,
      pattern: 'laser',
      isLaser: true,
    },
    {
      id: 'boss-hazard-orb-1',
      x: Math.floor(width / 2),
      y: Math.floor(height / 2),
      direction: { x: 1, y: 1 },
      speed: 1.0,
      pattern: 'diagonal',
    },
  ];
}
