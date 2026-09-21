// ============================================
// AlgoArena - AI Procedural Adaptive Level Generator
// ============================================

import { GridState } from '../types';
import { initializeGrid, setCellType } from './gridUtils';

export type AdaptiveMapArchetype = 'greedyTrap' | 'bfsSwamp' | 'dfsLabyrinth' | 'chokepointRidge';

export interface MapPresetInfo {
  id: AdaptiveMapArchetype;
  title: string;
  subtitle: string;
  tag: string;
  weakness: string;
  description: string;
}

export const ADAPTIVE_PRESETS: MapPresetInfo[] = [
  {
    id: 'greedyTrap',
    title: 'Deceptive Concave Well',
    subtitle: 'Local Minima Trap',
    tag: 'Greedy Counter',
    weakness: 'Greedy Best-First gets trapped by Euclidean distance into dead-end U-cavities.',
    description: 'A deep concave U-wall directly between start and goal with high heuristic attraction but zero egress.',
  },
  {
    id: 'bfsSwamp',
    title: 'Mire of Oblivion',
    subtitle: 'Cost Disparity Expanses',
    tag: 'BFS Counter',
    weakness: 'BFS chooses the shortest physical route straight through extreme mud (cost 5x) instead of taking clear bypasses.',
    description: 'Wide open fields interspersed with massive mud zones (cost 5x) and a circuitous paved highway.',
  },
  {
    id: 'dfsLabyrinth',
    title: 'Stygian Branch Catacombs',
    subtitle: 'Branching Cul-de-Sacs',
    tag: 'DFS Counter',
    weakness: 'DFS drills hundreds of nodes into dead branches while the goal sits adjacent in an unvisited corridor.',
    description: 'Deep comb-like branching corridors facing away from the target to max out recursion depth.',
  },
  {
    id: 'chokepointRidge',
    title: 'Plasma Bridge Chokepoint',
    subtitle: 'Dynamic Bottleneck',
    tag: 'A* / Dijkstra Battleground',
    weakness: 'Bottlenecks with moving energy barriers test obstacle avoidance and re-planning.',
    description: 'Dual razor-thin passes flanked by water chasms, forcing algorithms into tactical path trade-offs.',
  },
];

/**
 * Generates an adaptive map designed to stress-test specific algorithm archetypes.
 */
export function generateAdaptiveMap(archetype: AdaptiveMapArchetype, width = 25, height = 20): GridState {
  let grid = initializeGrid(width, height);
  const start = { x: 2, y: Math.floor(height / 2) };
  const end = { x: width - 3, y: Math.floor(height / 2) };

  grid.start = start;
  grid.end = end;
  grid = setCellType(grid, start.x, start.y, 'start');
  grid = setCellType(grid, end.x, end.y, 'end');

  switch (archetype) {
    case 'greedyTrap': {
      // Create a massive U-shaped concave wall opening to the LEFT (away from goal)
      const centerX = Math.floor(width / 2);
      const topY = 4;
      const bottomY = height - 5;

      // Vertical back wall
      for (let y = topY; y <= bottomY; y++) {
        grid = setCellType(grid, centerX + 2, y, 'wall');
      }
      // Top horizontal arm
      for (let x = centerX - 4; x <= centerX + 2; x++) {
        grid = setCellType(grid, x, topY, 'wall');
      }
      // Bottom horizontal arm
      for (let x = centerX - 4; x <= centerX + 2; x++) {
        grid = setCellType(grid, x, bottomY, 'wall');
      }

      // Add speed boosts on the detour outside the trap
      grid = setCellType(grid, centerX, 2, 'boost');
      grid = setCellType(grid, centerX, height - 3, 'boost');
      grid = setCellType(grid, centerX + 4, Math.floor(height / 2), 'boost');
      break;
    }

    case 'bfsSwamp': {
      // Direct path is covered in heavy mud
      const startX = 6;
      const endX = width - 6;

      for (let y = 3; y < height - 3; y++) {
        for (let x = startX; x <= endX; x++) {
          if (Math.random() < 0.85) {
            grid = setCellType(grid, x, y, 'mud');
          }
        }
      }

      // Perimeter clear routes with boost pads
      for (let x = startX; x <= endX; x += 2) {
        grid = setCellType(grid, x, 1, 'boost');
        grid = setCellType(grid, x, height - 2, 'boost');
      }
      // Water blockades in the mud
      grid = setCellType(grid, Math.floor(width / 2), Math.floor(height / 2) - 2, 'water');
      grid = setCellType(grid, Math.floor(width / 2), Math.floor(height / 2) + 2, 'water');
      break;
    }

    case 'dfsLabyrinth': {
      // Deep branching comb-structure
      for (let x = 5; x < width - 4; x += 3) {
        const isUp = (x / 3) % 2 === 0;
        for (let y = 1; y < height - 1; y++) {
          if (isUp ? y > 3 : y < height - 4) {
            grid = setCellType(grid, x, y, 'wall');
          }
        }
      }
      // Scattered dead ends
      for (let y = 2; y < height - 2; y += 4) {
        grid = setCellType(grid, Math.floor(width / 2), y, 'wall');
      }
      break;
    }

    case 'chokepointRidge': {
      // Water chasm covering most of central column
      const midX = Math.floor(width / 2);
      for (let y = 0; y < height; y++) {
        // Leave 2 narrow bridges
        if (y !== 4 && y !== height - 5) {
          grid = setCellType(grid, midX, y, 'water');
          grid = setCellType(grid, midX + 1, y, 'water');
        } else {
          grid = setCellType(grid, midX, y, 'boost');
        }
      }
      // Obstacle teeth around bridges
      grid = setCellType(grid, midX - 2, 4, 'wall');
      grid = setCellType(grid, midX + 3, height - 5, 'wall');
      break;
    }
  }

  return grid;
}
