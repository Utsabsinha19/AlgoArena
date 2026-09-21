// ============================================================================
// AlgoArena v5.0 - Multi-Agent Conflict-Based Search (CBS) MAPF Engine (Section 2)
// Resolves 3D spatio-temporal collisions (x, y, t) across multiple simultaneous agents
// ============================================================================

export interface Constraint {
  agentId: number;
  x: number;
  y: number;
  t: number; // Time step
  fromX?: number; // Optional origin coordinate for edge constraints (u -> v)
  fromY?: number;
}

export interface AgentPath {
  agentId: number;
  path: [number, number, number][]; // [x, y, t]
  cost: number;
}

export interface CBSNode {
  constraints: Constraint[];
  paths: Map<number, AgentPath>;
  cost: number;
}

export interface AgentSpec {
  id: number;
  start: [number, number];
  goal: [number, number];
}

export interface Conflict {
  agent1: number;
  agent2: number;
  x: number;
  y: number;
  t: number;
  constraint1: Constraint;
  constraint2: Constraint;
}

export class ConflictBasedSearchEngine {
  private gridWidth: number;
  private gridHeight: number;
  private obstacles: Set<number>;

  constructor(width: number, height: number, obstacles: Set<number>) {
    this.gridWidth = width;
    this.gridHeight = height;
    this.obstacles = obstacles;
  }

  public solveMAPF(agents: AgentSpec[]): Map<number, AgentPath> {
    const root: CBSNode = {
      constraints: [],
      paths: new Map(),
      cost: 0,
    };

    // Low-Level Search: Space-Time A* for each agent
    for (const agent of agents) {
      const path = this.spaceTimeAStar(agent, []);
      root.paths.set(agent.id, path);
      root.cost += path.cost;
    }

    const openTree: CBSNode[] = [root];
    let iterations = 0;
    const maxIterations = 1000; // Guard against unbounded tree expansion

    while (openTree.length > 0 && iterations < maxIterations) {
      iterations++;
      openTree.sort((a, b) => a.cost - b.cost);
      const curr = openTree.shift()!;

      // Validate paths for conflicts
      const conflict = this.findFirstConflict(curr.paths);
      if (!conflict) {
        return curr.paths; // Solution found! Guaranteed 0 collisions
      }

      // Branch 1: Constraint on Agent 1
      const child1Constraints = [...curr.constraints, conflict.constraint1];
      const child1Paths = new Map(curr.paths);
      const agent1Spec = agents.find((a) => a.id === conflict.agent1);
      if (agent1Spec) {
        const newPath1 = this.spaceTimeAStar(agent1Spec, child1Constraints);
        if (newPath1.cost < Infinity) {
          child1Paths.set(conflict.agent1, newPath1);
          openTree.push({
            constraints: child1Constraints,
            paths: child1Paths,
            cost: Array.from(child1Paths.values()).reduce((sum, p) => sum + p.cost, 0),
          });
        }
      }

      // Branch 2: Constraint on Agent 2
      const child2Constraints = [...curr.constraints, conflict.constraint2];
      const child2Paths = new Map(curr.paths);
      const agent2Spec = agents.find((a) => a.id === conflict.agent2);
      if (agent2Spec) {
        const newPath2 = this.spaceTimeAStar(agent2Spec, child2Constraints);
        if (newPath2.cost < Infinity) {
          child2Paths.set(conflict.agent2, newPath2);
          openTree.push({
            constraints: child2Constraints,
            paths: child2Paths,
            cost: Array.from(child2Paths.values()).reduce((sum, p) => sum + p.cost, 0),
          });
        }
      }
    }

    return root.paths;
  }

  public findFirstConflict(paths: Map<number, AgentPath>): Conflict | null {
    const agentList = Array.from(paths.entries());
    if (agentList.length === 0) return null;

    let maxT = 0;
    for (const [, p] of agentList) {
      if (p.path.length > maxT) maxT = p.path.length;
    }

    const getPosAt = (agentPath: AgentPath, t: number): [number, number] => {
      if (t < agentPath.path.length) {
        return [agentPath.path[t][0], agentPath.path[t][1]];
      }
      const last = agentPath.path[agentPath.path.length - 1];
      return [last[0], last[1]];
    };

    // Check time steps from t=0 to maxT
    for (let t = 0; t <= maxT; t++) {
      // 1. Check Vertex Conflicts at time t
      for (let i = 0; i < agentList.length; i++) {
        for (let j = i + 1; j < agentList.length; j++) {
          const [a1, path1] = agentList[i];
          const [a2, path2] = agentList[j];
          const pos1 = getPosAt(path1, t);
          const pos2 = getPosAt(path2, t);

          if (pos1[0] === pos2[0] && pos1[1] === pos2[1]) {
            return {
              agent1: a1,
              agent2: a2,
              x: pos1[0],
              y: pos1[1],
              t,
              constraint1: { agentId: a1, x: pos1[0], y: pos1[1], t },
              constraint2: { agentId: a2, x: pos2[0], y: pos2[1], t },
            };
          }
        }
      }

      // 2. Check Edge Conflicts between t and t+1
      for (let i = 0; i < agentList.length; i++) {
        for (let j = i + 1; j < agentList.length; j++) {
          const [a1, path1] = agentList[i];
          const [a2, path2] = agentList[j];

          const p1A = getPosAt(path1, t);
          const p1B = getPosAt(path1, t + 1);
          const p2A = getPosAt(path2, t);
          const p2B = getPosAt(path2, t + 1);

          // Check if agents swapped positions: A moves u->v, B moves v->u
          if (
            p1A[0] === p2B[0] &&
            p1A[1] === p2B[1] &&
            p1B[0] === p2A[0] &&
            p1B[1] === p2A[1] &&
            !(p1A[0] === p1B[0] && p1A[1] === p1B[1])
          ) {
            return {
              agent1: a1,
              agent2: a2,
              x: p1B[0],
              y: p1B[1],
              t: t + 1,
              constraint1: {
                agentId: a1,
                fromX: p1A[0],
                fromY: p1A[1],
                x: p1B[0],
                y: p1B[1],
                t: t + 1,
              },
              constraint2: {
                agentId: a2,
                fromX: p2A[0],
                fromY: p2A[1],
                x: p2B[0],
                y: p2B[1],
                t: t + 1,
              },
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Space-Time A* Search incorporating discrete time steps (x, y, t)
   * Explores 4 cardinal directions + wait-in-place (5 actions total)
   */
  public spaceTimeAStar(agent: AgentSpec, constraints: Constraint[]): AgentPath {
    const startX = agent.start[0];
    const startY = agent.start[1];
    const goalX = agent.goal[0];
    const goalY = agent.goal[1];

    const vertexConstraints = new Set<string>();
    const edgeConstraints = new Set<string>();
    let maxGoalConstraintTime = 0;

    for (const c of constraints) {
      if (c.agentId === agent.id) {
        if (c.fromX !== undefined && c.fromY !== undefined) {
          edgeConstraints.add(`${c.fromX},${c.fromY}->${c.x},${c.y}@${c.t}`);
        } else {
          vertexConstraints.add(`${c.x},${c.y}@${c.t}`);
          if (c.x === goalX && c.y === goalY && c.t > maxGoalConstraintTime) {
            maxGoalConstraintTime = c.t;
          }
        }
      }
    }

    // Node in space-time: [x, y, t, g, h, parent]
    interface STNode {
      x: number;
      y: number;
      t: number;
      g: number;
      h: number;
      parent: STNode | null;
    }

    const openSet: STNode[] = [];
    const visited = new Set<string>();

    const startH = Math.abs(startX - goalX) + Math.abs(startY - goalY);
    const startNode: STNode = { x: startX, y: startY, t: 0, g: 0, h: startH, parent: null };
    openSet.push(startNode);

    const maxTime = 120; // Horizon limit
    let bestGoalNode: STNode | null = null;

    while (openSet.length > 0) {
      // Pop lowest f = g + h, tie-break on lower h
      let bestIdx = 0;
      let minF = openSet[0].g + openSet[0].h;
      let minH = openSet[0].h;
      for (let i = 1; i < openSet.length; i++) {
        const f = openSet[i].g + openSet[i].h;
        if (f < minF || (f === minF && openSet[i].h < minH)) {
          minF = f;
          minH = openSet[i].h;
          bestIdx = i;
        }
      }

      const curr = openSet.splice(bestIdx, 1)[0];
      const stateKey = `${curr.x},${curr.y},${curr.t}`;
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      if (curr.x === goalX && curr.y === goalY && curr.t >= maxGoalConstraintTime) {
        // Goal reached without remaining constraints
        bestGoalNode = curr;
        break;
      }

      if (curr.t >= maxTime) continue;

      // 5 Actions: Up, Right, Down, Left, Wait
      const moves = [
        { dx: 0, dy: -1 }, // Up
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 0, dy: 0 },  // Wait
      ];

      for (const m of moves) {
        const nx = curr.x + m.dx;
        const ny = curr.y + m.dy;
        const nt = curr.t + 1;

        if (nx < 0 || nx >= this.gridWidth || ny < 0 || ny >= this.gridHeight) continue;
        const cellIdx = ny * this.gridWidth + nx;
        if (this.obstacles.has(cellIdx)) continue; // Static obstacle

        // Check vertex dynamic constraint
        if (vertexConstraints.has(`${nx},${ny}@${nt}`)) continue;

        // Check edge dynamic constraint
        if (edgeConstraints.has(`${curr.x},${curr.y}->${nx},${ny}@${nt}`)) continue;

        const nextKey = `${nx},${ny},${nt}`;
        if (visited.has(nextKey)) continue;

        const dist = Math.abs(nx - goalX) + Math.abs(ny - goalY);
        const waitPenalty =
          nx === goalX && ny === goalY && nt < maxGoalConstraintTime
            ? maxGoalConstraintTime - nt
            : 0;
        const h = dist + waitPenalty;

        openSet.push({
          x: nx,
          y: ny,
          t: nt,
          g: curr.g + 1,
          h,
          parent: curr,
        });
      }
    }

    if (!bestGoalNode) {
      return { agentId: agent.id, path: [[startX, startY, 0]], cost: Infinity };
    }

    // Path reconstruction
    const path: [number, number, number][] = [];
    let tracer: STNode | null = bestGoalNode;
    while (tracer) {
      path.unshift([tracer.x, tracer.y, tracer.t]);
      tracer = tracer.parent;
    }

    return { agentId: agent.id, path, cost: path.length - 1 };
  }
}
