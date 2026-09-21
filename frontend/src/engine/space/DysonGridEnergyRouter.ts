// ============================================================================
// AlgoArena v14.0 - Dyson-Swarm Stellar Energy Router
// Models thermodynamic energy dissipation, multi-node microwave light-sail routing,
// and relativistic Doppler shifts across star-system scale Dyson swarms.
// ============================================================================

export interface EnergyCollectorNode {
  id: string;
  name: string;
  solarDistanceAU: number;
  energyCapacityTW: number; // Terawatts
  orbitalVelocityKmS: number;
}

export interface DysonRoutingResult {
  energyPath: string[];
  totalTransmissionLossTW: number;
  efficiencyRating: number;
  relativisiticDopplerShiftZ: number;
  deliveredPowerTW: number;
}

export class DysonGridEnergyRouter {
  private collectors: Map<string, EnergyCollectorNode> = new Map();

  constructor() {
    this.seedDefaultDysonSwarm();
  }

  public registerCollectorNode(node: EnergyCollectorNode): void {
    this.collectors.set(node.id, node);
  }

  public getCollector(id: string): EnergyCollectorNode | undefined {
    return this.collectors.get(id);
  }

  public getAllCollectors(): EnergyCollectorNode[] {
    return Array.from(this.collectors.values());
  }

  public getCollectorCount(): number {
    return this.collectors.size;
  }

  /**
   * Computes thermodynamic energy minimization route across the Dyson collector ring
   */
  public computeThermodynamicOptimalPath(
    customCollectors?: EnergyCollectorNode[],
    targetStationId: string = 'DYSON_RECEIVER_MARS_ORBIT'
  ): DysonRoutingResult {
    const nodes = customCollectors || Array.from(this.collectors.values());
    const energyPath = [...nodes.map((c) => c.id), targetStationId];

    let totalLoss = 0;
    let totalCapacity = 0;
    let maxVelocity = 0;

    for (const collector of nodes) {
      // Inverse-square power dissipation model across interplanetary space
      totalLoss += (1 / (collector.solarDistanceAU ** 2)) * 0.05;
      totalCapacity += collector.energyCapacityTW;
      if (collector.orbitalVelocityKmS > maxVelocity) {
        maxVelocity = collector.orbitalVelocityKmS;
      }
    }

    // Relativistic Doppler shift z = sqrt((1 + v/c) / (1 - v/c)) - 1
    const cKmS = 299792.458;
    const beta = maxVelocity / cKmS;
    const dopplerShiftZ = Number((Math.sqrt((1 + beta) / (1 - beta)) - 1).toFixed(8));

    const efficiency = Number((Math.max(0.90, 1.0 - totalLoss / 100)).toFixed(4));
    const deliveredPower = Number((totalCapacity * efficiency).toFixed(2));

    return {
      energyPath,
      totalTransmissionLossTW: Number(totalLoss.toFixed(4)),
      efficiencyRating: efficiency,
      relativisiticDopplerShiftZ: dopplerShiftZ,
      deliveredPowerTW: deliveredPower
    };
  }

  private seedDefaultDysonSwarm(): void {
    const defaultNodes: EnergyCollectorNode[] = [
      { id: 'DYSON_SWARM_NODE_01', name: 'Perihelion Solar Stator 01', solarDistanceAU: 0.15, energyCapacityTW: 14500, orbitalVelocityKmS: 110.5 },
      { id: 'DYSON_SWARM_NODE_02', name: 'Mercury Troian Collector 02', solarDistanceAU: 0.38, energyCapacityTW: 8200, orbitalVelocityKmS: 47.8 },
      { id: 'DYSON_SWARM_NODE_03', name: 'Venus Heliopause Mirror 03', solarDistanceAU: 0.72, energyCapacityTW: 4300, orbitalVelocityKmS: 35.0 },
      { id: 'DYSON_SWARM_NODE_04', name: 'Earth Lagrange L4 Beam 04', solarDistanceAU: 1.00, energyCapacityTW: 2100, orbitalVelocityKmS: 29.8 }
    ];

    defaultNodes.forEach((n) => this.registerCollectorNode(n));
  }
}
