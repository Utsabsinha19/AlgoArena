// ============================================================================
// AlgoArena v2.0 - Adaptive Procedural Level Generator (Section 4.2)
// ============================================================================

import { GridState } from '../../types';
import { initializeGrid, setCellType } from '../../utils/gridUtils';

export type AdaptiveWeaknessType = 'astarTrap' | 'bfsBottleneck' | 'dfsChasm' | 'costMire';

export interface AdaptivePresetSpec {
  id: AdaptiveWeaknessType;
  title: string;
  tagline: string;
  vulnerabilityTarget: string;
  description: string;
}

export const ADAPTIVE_SPECS: AdaptivePresetSpec[] = [
  {
    id: 'astarTrap',
    title: 'Symmetrical Concave Abyss',
    tagline: 'A* Euclidean Trap',
    vulnerabilityTarget: 'A* and Greedy Best-First Search',
    description: 'Symmetrical concave walls opening away from the goal. Directly deceives Euclidean distance heuristic calculations, forcing heavy backtracking.',
  },
  {
    id: 'bfsBottleneck',
    title: 'Vast Atrium & Singular Chokepoint',
    tagline: 'BFS Horizon Flood',
    vulnerabilityTarget: 'Breadth-First Search',
    description: 'A colossal open room that forces BFS to explore hundreds of radial nodes before squeezing through a single-cell bottleneck.',
  },
  {
    id: 'dfsChasm',
    title: 'Perpendicular Forking Catacombs',
    tagline: 'DFS Recursion Abyss',
    vulnerabilityTarget: 'Depth-First Search',
    description: 'Deep winding cul-de-sacs designed to drive DFS recursion stack to maximum depth limit away from the adjacent goal.',
  },
  {
    id: 'costMire',
    title: 'Weighted Gravity Fields',
    tagline: 'Dijkstra Arena Benchmark',
    vulnerabilityTarget: 'Unweighted BFS vs. Weighted Dijkstra',
    description: 'Expansive fields of 5x cost mud and boost pads where hop-count paths are severely penalized in energy cost.',
  },
];

/**
 * Procedurally generates counter-testing arenas specified in Section 4.2
 */
export function generateAdaptiveArena(type: AdaptiveWeaknessType, width = 25, height = 20): GridState {
  let grid = initializeGrid(width, height);
  const start = { x: 2, y: Math.floor(height / 2) };
  const end = { x: width - 3, y: Math.floor(height / 2) };

  grid.start = start;
  grid.end = end;
  grid = setCellType(grid, start.x, start.y, 'start');
  grid = setCellType(grid, end.x, end.y, 'end');

  switch (type) {
    case 'astarTrap': {
      // Symmetrical concave well facing west (away from goal)
      const midX = Math.floor(width / 2);
      const topY = 4;
      const bottomY = height - 5;

      // Vertical back wall
      for (let y = topY; y <= bottomY; y++) {
        grid = setCellType(grid, midX + 2, y, 'wall');
      }
      // Top and bottom horizontal arms extending west
      for (let x = midX - 5; x <= midX + 2; x++) {
        grid = setCellType(grid, x, topY, 'wall');
        grid = setCellType(grid, x, bottomY, 'wall');
      }

      // Exterior detour boosts
      grid = setCellType(grid, midX - 1, 2, 'boost');
      grid = setCellType(grid, midX - 1, height - 3, 'boost');
      break;
    }

    case 'bfsBottleneck': {
      // Massive open room on left, dividing wall with single bottleneck pass in center
      const wallX = Math.floor(width / 2);
      const passY = Math.floor(height / 2);

      for (let y = 0; y < height; y++) {
        if (y !== passY) {
          grid = setCellType(grid, wallX, y, 'wall');
        } else {
          grid = setCellType(grid, wallX, y, 'boost');
        }
      }

      // Mud pockets scattered on the right side
      for (let y = 3; y < height - 3; y += 2) {
        for (let x = wallX + 3; x < width - 4; x += 3) {
          grid = setCellType(grid, x, y, 'mud');
        }
      }
      break;
    }

    case 'dfsChasm': {
      // Alternating deep comb teeth
      for (let x = 6; x < width - 4; x += 3) {
        const isOpenTop = (x / 3) % 2 === 0;
        for (let y = 0; y < height; y++) {
          if (isOpenTop ? y > 3 : y < height - 4) {
            grid = setCellType(grid, x, y, 'wall');
          }
        }
      }
      break;
    }

    case 'costMire': {
      // Direct path completely smothered in mud (cost 5x)
      for (let y = 3; y < height - 3; y++) {
        for (let x = 5; x < width - 5; x++) {
          if (Math.random() < 0.75) {
            grid = setCellType(grid, x, y, 'mud');
          }
        }
      }

      // Perimeter clear speed route
      for (let x = 5; x < width - 5; x += 2) {
        grid = setCellType(grid, x, 1, 'boost');
        grid = setCellType(grid, x, height - 2, 'boost');
      }
      break;
    }
  }

  return grid;
}
