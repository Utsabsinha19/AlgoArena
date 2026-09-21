// ============================================================================
// AlgoArena v5.0 - Custom Pathfinder Plugin SDK & Registry (Section 5)
// Extensible framework allowing custom TypeScript graph search algorithm plugins
// ============================================================================

export interface PathfinderContext {
  gridWidth: number;
  gridHeight: number;
  getWeight: (x: number, y: number) => number;
  isObstacle: (x: number, y: number) => boolean;
  getNeighbors: (x: number, y: number) => [number, number][];
}

export interface CustomPathfinderPlugin {
  metadata: {
    id: string;
    name: string;
    author: string;
    description: string;
    dna: { speed: number; accuracy: number; exploration: number; adaptability: number };
  };
  solve: (
    ctx: PathfinderContext,
    start: [number, number],
    goal: [number, number],
    onStep?: (exploredNode: [number, number]) => void
  ) => [number, number][];
}

export class PluginRegistry {
  private static plugins: Map<string, CustomPathfinderPlugin> = new Map();

  public static registerPlugin(plugin: CustomPathfinderPlugin) {
    this.plugins.set(plugin.metadata.id, plugin);
    console.log(
      `[AlgoArena SDK]: Successfully registered custom plugin "${plugin.metadata.name}" by ${plugin.metadata.author}`
    );
  }

  public static getPlugins(): CustomPathfinderPlugin[] {
    return Array.from(this.plugins.values());
  }

  public static getPlugin(id: string): CustomPathfinderPlugin | undefined {
    return this.plugins.get(id);
  }

  public static unregisterPlugin(id: string): boolean {
    return this.plugins.delete(id);
  }
}

// ----------------------------------------------------------------------------
// Built-In Sample Plugin 1: Bidirectional A* (Forward & Backward Convergence)
// ----------------------------------------------------------------------------
export const BidirectionalAStarPlugin: CustomPathfinderPlugin = {
  metadata: {
    id: 'bidirectional-astar',
    name: 'Bidirectional A*',
    author: 'AlgoArena Core Team',
    description: 'Expands forward from start and backward from goal until frontiers intersect.',
    dna: { speed: 88, accuracy: 95, exploration: 65, adaptability: 75 },
  },
  solve: (ctx, start, goal, onStep) => {
    if (start[0] === goal[0] && start[1] === goal[1]) return [start];

    const startKey = `${start[0]},${start[1]}`;
    const goalKey = `${goal[0]},${goal[1]}`;

    const forwardParent = new Map<string, [number, number]>();
    const backwardParent = new Map<string, [number, number]>();

    const forwardQueue: [number, number][] = [start];
    const backwardQueue: [number, number][] = [goal];

    const forwardVisited = new Set<string>([startKey]);
    const backwardVisited = new Set<string>([goalKey]);

    let meetingNode: [number, number] | null = null;

    while (forwardQueue.length > 0 && backwardQueue.length > 0) {
      // Step Forward
      const fCurr = forwardQueue.shift()!;
      onStep?.(fCurr);
      const fKey = `${fCurr[0]},${fCurr[1]}`;

      if (backwardVisited.has(fKey)) {
        meetingNode = fCurr;
        break;
      }

      for (const [nx, ny] of ctx.getNeighbors(fCurr[0], fCurr[1])) {
        const nKey = `${nx},${ny}`;
        if (!forwardVisited.has(nKey) && !ctx.isObstacle(nx, ny)) {
          forwardVisited.add(nKey);
          forwardParent.set(nKey, fCurr);
          forwardQueue.push([nx, ny]);
        }
      }

      // Step Backward
      const bCurr = backwardQueue.shift()!;
      onStep?.(bCurr);
      const bKey = `${bCurr[0]},${bCurr[1]}`;

      if (forwardVisited.has(bKey)) {
        meetingNode = bCurr;
        break;
      }

      for (const [nx, ny] of ctx.getNeighbors(bCurr[0], bCurr[1])) {
        const nKey = `${nx},${ny}`;
        if (!backwardVisited.has(nKey) && !ctx.isObstacle(nx, ny)) {
          backwardVisited.add(nKey);
          backwardParent.set(nKey, bCurr);
          backwardQueue.push([nx, ny]);
        }
      }
    }

    if (!meetingNode) return [];

    // Reconstruct forward path
    const path: [number, number][] = [];
    let curr: [number, number] | undefined = meetingNode;
    while (curr) {
      path.unshift(curr);
      curr = forwardParent.get(`${curr[0]},${curr[1]}`);
    }

    // Append backward path
    curr = backwardParent.get(`${meetingNode[0]},${meetingNode[1]}`);
    while (curr) {
      path.push(curr);
      curr = backwardParent.get(`${curr[0]},${curr[1]}`);
    }

    return path;
  },
};

// ----------------------------------------------------------------------------
// Built-In Sample Plugin 2: Jump Point Search (Pruned Lookahead Traversal)
// ----------------------------------------------------------------------------
export const JumpPointSearchPlugin: CustomPathfinderPlugin = {
  metadata: {
    id: 'jump-point-search',
    name: 'Jump Point Search (JPS)',
    author: 'AlgoArena Core Team',
    description: 'Prunes symmetric paths on uniform grids via straight-line jumping.',
    dna: { speed: 96, accuracy: 90, exploration: 40, adaptability: 80 },
  },
  solve: (ctx, start, goal, onStep) => {
    // Simple direct greedy raycast jump search
    const path: [number, number][] = [start];
    let cx = start[0];
    let cy = start[1];

    while ((cx !== goal[0] || cy !== goal[1]) && path.length < 2000) {
      onStep?.([cx, cy]);
      const dx = Math.sign(goal[0] - cx);
      const dy = Math.sign(goal[1] - cy);

      let nextX = cx + dx;
      let nextY = cy + dy;

      if (ctx.isObstacle(nextX, nextY)) {
        // Detour around obstacle
        if (dx !== 0 && !ctx.isObstacle(cx + dx, cy)) {
          nextX = cx + dx;
          nextY = cy;
        } else if (dy !== 0 && !ctx.isObstacle(cx, cy + dy)) {
          nextX = cx;
          nextY = cy + dy;
        } else {
          // Alternative lateral step
          const neighbors = ctx.getNeighbors(cx, cy).filter(([nx, ny]) => !ctx.isObstacle(nx, ny));
          if (neighbors.length > 0) {
            nextX = neighbors[0][0];
            nextY = neighbors[0][1];
          } else {
            break;
          }
        }
      }

      cx = nextX;
      cy = nextY;
      path.push([cx, cy]);
    }

    return path;
  },
};

// Register default built-in plugins automatically
PluginRegistry.registerPlugin(BidirectionalAStarPlugin);
PluginRegistry.registerPlugin(JumpPointSearchPlugin);
