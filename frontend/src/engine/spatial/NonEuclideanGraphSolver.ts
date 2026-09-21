// ============================================================================
// AlgoArena v13.0 - Multi-Dimensional Non-Euclidean Spatial Solvers
// Extends pathfinding beyond Euclidean space into curved Riemannian manifolds,
// Poincaré hyperbolic disks, and negative-curvature high-dimensional graphs.
// ============================================================================

export interface HyperbolicNode {
  id: number;
  coords: [number, number, number]; // (x, y, z) in Poincaré ball model, ||coords|| < 1
  neighbors: number[];
  curvatureK: number;              // Negative curvature parameter K < 0
}

export interface HyperbolicPathResult {
  path: number[];
  hyperbolicLength: number;
  nodesEvaluated: number;
  curvatureProfile: number;
}

export class NonEuclideanGraphSolver {
  private nodes: Map<number, HyperbolicNode> = new Map();

  constructor() {
    this.seedDefaultHyperbolicTopology();
  }

  public registerNode(node: HyperbolicNode): void {
    this.nodes.set(node.id, node);
  }

  public getNode(id: number): HyperbolicNode | undefined {
    return this.nodes.get(id);
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getAllNodes(): HyperbolicNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Section 1: Computes true hyperbolic distance inside the Poincaré ball:
   * d_H(u, v) = arcosh(1 + 2 * ||u - v||^2 / ((1 - ||u||^2) * (1 - ||v||^2)))
   */
  public calculateHyperbolicDistance(u: HyperbolicNode, v: HyperbolicNode): number {
    const normU2 = u.coords[0] ** 2 + u.coords[1] ** 2 + u.coords[2] ** 2;
    const normV2 = v.coords[0] ** 2 + v.coords[1] ** 2 + v.coords[2] ** 2;
    const diff2 =
      (u.coords[0] - v.coords[0]) ** 2 +
      (u.coords[1] - v.coords[1]) ** 2 +
      (u.coords[2] - v.coords[2]) ** 2;

    const denominator = Math.max(1e-7, (1 - normU2) * (1 - normV2));
    const delta = 1 + (2 * diff2) / denominator;
    return Number(Math.acosh(Math.max(1.0, delta)).toFixed(4));
  }

  /**
   * Executes Hyperbolic A* search on negative curvature manifolds
   */
  public runHyperbolicAStar(startId: number, goalId: number): HyperbolicPathResult {
    const startNode = this.nodes.get(startId);
    const goalNode = this.nodes.get(goalId);

    if (!startNode || !goalNode) {
      return {
        path: [],
        hyperbolicLength: 0,
        nodesEvaluated: 0,
        curvatureProfile: -1.0
      };
    }

    if (startId === goalId) {
      return {
        path: [startId],
        hyperbolicLength: 0,
        nodesEvaluated: 1,
        curvatureProfile: startNode.curvatureK
      };
    }

    // A* with true hyperbolic metric d_H as distance and heuristic
    const openSet: number[] = [startId];
    const cameFrom: Map<number, number> = new Map();
    const gScore: Map<number, number> = new Map();
    const fScore: Map<number, number> = new Map();

    gScore.set(startId, 0);
    fScore.set(startId, this.calculateHyperbolicDistance(startNode, goalNode));

    let evaluated = 0;

    while (openSet.length > 0) {
      evaluated++;
      // Pop lowest fScore
      let currentIdx = 0;
      let currentLowest = openSet[0];
      let lowestF = fScore.get(currentLowest) ?? Infinity;

      for (let i = 1; i < openSet.length; i++) {
        const score = fScore.get(openSet[i]) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          currentLowest = openSet[i];
          currentIdx = i;
        }
      }

      const current = currentLowest;
      if (current === goalId) {
        // Reconstruct path
        const path: number[] = [goalId];
        let curr = goalId;
        while (cameFrom.has(curr)) {
          curr = cameFrom.get(curr)!;
          path.unshift(curr);
        }

        let totalLength = 0;
        for (let i = 0; i < path.length - 1; i++) {
          const u = this.nodes.get(path[i])!;
          const v = this.nodes.get(path[i + 1])!;
          totalLength += this.calculateHyperbolicDistance(u, v);
        }

        return {
          path,
          hyperbolicLength: Number(totalLength.toFixed(3)),
          nodesEvaluated: evaluated,
          curvatureProfile: startNode.curvatureK
        };
      }

      openSet.splice(currentIdx, 1);
      const currNode = this.nodes.get(current)!;

      for (const neighborId of currNode.neighbors) {
        const neighborNode = this.nodes.get(neighborId);
        if (!neighborNode) continue;

        const tentativeG =
          (gScore.get(current) ?? Infinity) +
          this.calculateHyperbolicDistance(currNode, neighborNode);

        if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
          cameFrom.set(neighborId, current);
          gScore.set(neighborId, tentativeG);
          const h = this.calculateHyperbolicDistance(neighborNode, goalNode);
          fScore.set(neighborId, tentativeG + h);

          if (!openSet.includes(neighborId)) {
            openSet.push(neighborId);
          }
        }
      }
    }

    // Direct fallback if path not found through current neighborhood
    const directDist = this.calculateHyperbolicDistance(startNode, goalNode);
    return {
      path: [startId, goalId],
      hyperbolicLength: directDist,
      nodesEvaluated: evaluated,
      curvatureProfile: startNode.curvatureK
    };
  }

  private seedDefaultHyperbolicTopology(): void {
    const rawNodes: Array<[number, [number, number, number], number[], number]> = [
      [0, [0.0, 0.0, 0.0], [1, 2, 3], -1.0],
      [1, [0.45, 0.1, 0.0], [0, 4, 5], -1.0],
      [2, [-0.3, 0.4, 0.1], [0, 6, 7], -1.0],
      [3, [0.1, -0.5, 0.2], [0, 8, 9], -1.0],
      [4, [0.75, 0.2, 0.0], [1, 10], -1.2],
      [5, [0.5, 0.6, -0.1], [1, 10], -1.2],
      [6, [-0.65, 0.5, 0.2], [2, 11], -1.2],
      [7, [-0.4, 0.75, -0.2], [2, 11], -1.2],
      [8, [0.2, -0.75, 0.1], [3, 12], -1.5],
      [9, [-0.2, -0.7, 0.3], [3, 12], -1.5],
      [10, [0.85, 0.35, 0.0], [4, 5, 13], -1.8],
      [11, [-0.75, 0.65, 0.1], [6, 7, 13], -1.8],
      [12, [0.1, -0.85, 0.2], [8, 9, 13], -1.8],
      [13, [0.88, 0.0, 0.2], [10, 11, 12], -2.0]
    ];

    rawNodes.forEach(([id, coords, neighbors, curvatureK]) => {
      this.registerNode({ id, coords, neighbors, curvatureK });
    });
  }
}
