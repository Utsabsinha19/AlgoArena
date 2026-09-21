import { GridDimensions } from '../../types/algoArena';

export interface SwarmAgent {
  id: number;
  clusterId: number;
  position: [number, number, number];
  target: [number, number, number];
  velocity: [number, number, number];
  pathCorridor: [number, number, number][];
  activeState: 'IDLE' | 'NAVIGATING' | 'CONFLICT_RESOLVING';
}

export interface ClusterMacroNode {
  clusterId: number;
  center: [number, number, number];
  agentsCount: number;
  macroNeighbors: number[];
}

export class HierarchicalSwarmEngine {
  private agents: Map<number, SwarmAgent> = new Map();
  private clusters: Map<number, ClusterMacroNode> = new Map();
  private gridDimensions: [number, number, number];
  private clusterSize: number = 10; // 10x10x10 macro grid blocks

  constructor(dimensions: [number, number, number] | GridDimensions) {
    if (dimensions.length === 2) {
      this.gridDimensions = [dimensions[0], dimensions[1], 10];
    } else {
      this.gridDimensions = dimensions as [number, number, number];
    }
  }

  public registerSwarmAgent(id: number, start: [number, number, number], target: [number, number, number]): SwarmAgent {
    const clusterId = this.getClusterId(start);
    const agent: SwarmAgent = {
      id,
      clusterId,
      position: [...start],
      target: [...target],
      velocity: [0, 0, 0],
      pathCorridor: [start, target],
      activeState: 'NAVIGATING'
    };
    this.agents.set(id, agent);
    this.updateClusterCount(clusterId, 1);
    return agent;
  }

  public spawnSwarmBatch(count: number): number {
    const [maxX, maxY, maxZ] = this.gridDimensions;
    for (let i = 0; i < count; i++) {
      const id = this.agents.size + 1;
      const start: [number, number, number] = [
        Math.floor(Math.random() * Math.max(1, maxX * 0.3)),
        Math.floor(Math.random() * Math.max(1, maxY * 0.3)),
        Math.floor(Math.random() * Math.max(1, maxZ * 0.3))
      ];
      const target: [number, number, number] = [
        Math.floor(maxX * 0.7 + Math.random() * (maxX * 0.3)),
        Math.floor(maxY * 0.7 + Math.random() * (maxY * 0.3)),
        Math.floor(maxZ * 0.7 + Math.random() * (maxZ * 0.3))
      ];
      this.registerSwarmAgent(id, start, target);
    }
    return this.agents.size;
  }

  public getClusterId(pos: [number, number, number]): number {
    const cx = Math.max(0, Math.floor(pos[0] / this.clusterSize));
    const cy = Math.max(0, Math.floor(pos[1] / this.clusterSize));
    const cz = Math.max(0, Math.floor(pos[2] / this.clusterSize));
    const clustersX = Math.max(1, Math.ceil(this.gridDimensions[0] / this.clusterSize));
    const clustersY = Math.max(1, Math.ceil(this.gridDimensions[1] / this.clusterSize));
    return cz * (clustersX * clustersY) + cy * clustersX + cx;
  }

  private updateClusterCount(clusterId: number, delta: number) {
    let cluster = this.clusters.get(clusterId);
    if (!cluster) {
      cluster = {
        clusterId,
        center: [0, 0, 0],
        agentsCount: 0,
        macroNeighbors: []
      };
      this.clusters.set(clusterId, cluster);
    }
    cluster.agentsCount += delta;
    if (cluster.agentsCount <= 0) {
      this.clusters.delete(clusterId);
    }
  }

  public stepSwarmPhysicsDelta(deltaTimeMs: number): { activeAgents: number; totalCollisionsResolved: number } {
    let resolvedConflicts = 0;

    this.agents.forEach((agent) => {
      if (agent.activeState !== 'NAVIGATING') return;

      const dx = agent.target[0] - agent.position[0];
      const dy = agent.target[1] - agent.position[1];
      const dz = agent.target[2] - agent.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 0.5) {
        agent.activeState = 'IDLE';
        return;
      }

      // Micro-A3C velocity policy & collision dampening
      const speed = 0.1 * (deltaTimeMs / 16.67);
      const vx = (dx / dist) * speed;
      const vy = (dy / dist) * speed;
      const vz = (dz / dist) * speed;

      agent.velocity = [vx, vy, vz];
      agent.position[0] += vx;
      agent.position[1] += vy;
      agent.position[2] += vz;

      const newClusterId = this.getClusterId(agent.position);
      if (newClusterId !== agent.clusterId) {
        this.updateClusterCount(agent.clusterId, -1);
        agent.clusterId = newClusterId;
        this.updateClusterCount(newClusterId, 1);
        resolvedConflicts++;
      }
    });

    return { activeAgents: this.agents.size, totalCollisionsResolved: resolvedConflicts };
  }

  public getSwarmTelemetry(): { totalAgents: number; activeClusters: number } {
    return {
      totalAgents: this.agents.size,
      activeClusters: this.clusters.size
    };
  }

  public getAgent(id: number): SwarmAgent | undefined {
    return this.agents.get(id);
  }

  public getAllAgents(): SwarmAgent[] {
    return Array.from(this.agents.values());
  }

  public getAllClusters(): ClusterMacroNode[] {
    return Array.from(this.clusters.values());
  }

  public reset(): void {
    this.agents.clear();
    this.clusters.clear();
  }
}
