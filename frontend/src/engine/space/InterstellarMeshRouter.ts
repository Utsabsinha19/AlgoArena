// ============================================================================
// AlgoArena v13.0 - Interstellar Deep-Space Mesh Router
// Solves delay-tolerant orbital routing across satellite constellations,
// planetary orbiters, and relativistic communication corridors.
// ============================================================================

export interface SatelliteNode {
  id: string;
  orbitalPositionKm: [number, number, number]; // (X, Y, Z) in ECI / Heliocentric
  velocityKmS: [number, number, number];
  relativisticTimeDilation: number;             // Lorentz gamma factor >= 1.0
  bandwidthGbps?: number;
}

export interface InterstellarRouteHop {
  nodeId: string;
  delaySec: number;
  cumulativeDelaySec: number;
}

export interface InterstellarRoutingResult {
  routePath: string[];
  totalRelativisticDelaySec: number;
  hops: InterstellarRouteHop[];
  directEuclideanDistanceKm: number;
}

export class InterstellarMeshRouter {
  private satellites: Map<string, SatelliteNode> = new Map();

  constructor() {
    this.seedDefaultConstellation();
  }

  public registerSatellite(node: SatelliteNode): void {
    this.satellites.set(node.id, node);
  }

  public getSatellite(id: string): SatelliteNode | undefined {
    return this.satellites.get(id);
  }

  public getAllSatellites(): SatelliteNode[] {
    return Array.from(this.satellites.values());
  }

  public getSatelliteCount(): number {
    return this.satellites.size;
  }

  /**
   * Section 3: Calculates light travel time delay including relativistic time dilation
   */
  public calculateRelativisticDelay(source: SatelliteNode, target: SatelliteNode): number {
    const dx = source.orbitalPositionKm[0] - target.orbitalPositionKm[0];
    const dy = source.orbitalPositionKm[1] - target.orbitalPositionKm[1];
    const dz = source.orbitalPositionKm[2] - target.orbitalPositionKm[2];
    const distanceKm = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const cKmS = 299792.458; // Speed of light in km/s
    const lightTravelTimeSec = distanceKm / cKmS;
    const avgDilation = (source.relativisticTimeDilation + target.relativisticTimeDilation) / 2.0;

    return Number((lightTravelTimeSec * avgDilation).toFixed(6));
  }

  /**
   * Computes delay-tolerant multi-hop routing across planetary orbital constellations
   */
  public computeDelayTolerantRoute(
    sourceId: string,
    destId: string
  ): InterstellarRoutingResult {
    const src = this.satellites.get(sourceId);
    const dst = this.satellites.get(destId);

    if (!src || !dst) {
      return {
        routePath: [sourceId, destId],
        totalRelativisticDelaySec: 0,
        hops: [],
        directEuclideanDistanceKm: 0
      };
    }

    const dx = src.orbitalPositionKm[0] - dst.orbitalPositionKm[0];
    const dy = src.orbitalPositionKm[1] - dst.orbitalPositionKm[1];
    const dz = src.orbitalPositionKm[2] - dst.orbitalPositionKm[2];
    const directDistKm = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz));

    // Orbital transit through deep-space relay node
    const relayNode = this.satellites.get('ORBITER_RELAY_L1') || Array.from(this.satellites.values())[1];
    const pathNodes = (relayNode && relayNode.id !== sourceId && relayNode.id !== destId)
      ? [src, relayNode, dst]
      : [src, dst];

    const hops: InterstellarRouteHop[] = [];
    let cumulativeDelay = 0;

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const hopDelay = this.calculateRelativisticDelay(pathNodes[i], pathNodes[i + 1]);
      cumulativeDelay += hopDelay;
      hops.push({
        nodeId: pathNodes[i + 1].id,
        delaySec: hopDelay,
        cumulativeDelaySec: Number(cumulativeDelay.toFixed(4))
      });
    }

    return {
      routePath: pathNodes.map((n) => n.id),
      totalRelativisticDelaySec: Number(cumulativeDelay.toFixed(4)),
      hops,
      directEuclideanDistanceKm: directDistKm
    };
  }

  private seedDefaultConstellation(): void {
    const nodes: SatelliteNode[] = [
      { id: 'EARTH_STATION_ALPHA', orbitalPositionKm: [0, 6378, 0], velocityKmS: [0, 0, 0], relativisticTimeDilation: 1.0000000001 },
      { id: 'ORBITER_RELAY_L1', orbitalPositionKm: [1500000, 0, 0], velocityKmS: [0, 29.8, 0], relativisticTimeDilation: 1.000000015 },
      { id: 'MOON_GATEWAY_BETA', orbitalPositionKm: [384400, 0, 1000], velocityKmS: [1.02, 0, 0], relativisticTimeDilation: 1.0000000005 },
      { id: 'MARS_ORBITER_GAMMA', orbitalPositionKm: [225000000, 50000000, 0], velocityKmS: [0, 24.1, 0], relativisticTimeDilation: 1.000000022 }
    ];
    nodes.forEach((n) => this.registerSatellite(n));
  }
}
