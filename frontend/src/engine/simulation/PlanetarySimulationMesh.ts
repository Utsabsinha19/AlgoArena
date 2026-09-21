// ============================================================================
// AlgoArena v12.0 - Planetary Digital Twin Simulation Mesh
// Simulates multi-region global logistics, autonomous drone fleet delivery,
// and real-time smart city traffic routing across planetary digital twins.
// ============================================================================

export interface DigitalTwinRegion {
  regionId: string;
  name: string;
  activeAgents: number;
  gridCells: number;
  latencyMs: number;
}

export interface PlanetaryRoutingResult {
  routePath: string[];
  estimatedFlightTimeMin: number;
  totalHops: number;
  activeCongestionFactor: number;
}

export class PlanetarySimulationMesh {
  private regions: Map<string, DigitalTwinRegion> = new Map();

  constructor() {
    this.seedDefaultPlanetaryRegions();
  }

  public registerRegion(region: DigitalTwinRegion): void {
    this.regions.set(region.regionId, region);
    console.log(`[PlanetaryMesh]: Registered Region ${region.name} (${region.activeAgents} active agents)`);
  }

  public unregisterRegion(regionId: string): boolean {
    return this.regions.delete(regionId);
  }

  public getRegion(regionId: string): DigitalTwinRegion | undefined {
    return this.regions.get(regionId);
  }

  public getAllRegions(): DigitalTwinRegion[] {
    return Array.from(this.regions.values());
  }

  public getRegionCount(): number {
    return this.regions.size;
  }

  public computeGlobalSwarmRouting(
    originRegionId: string,
    destRegionId: string
  ): PlanetaryRoutingResult {
    const origin = this.regions.get(originRegionId);
    const dest = this.regions.get(destRegionId);

    const originName = origin ? origin.regionId : originRegionId;
    const destName = dest ? dest.regionId : destRegionId;

    const routePath = [originName, 'HUB_ORBITAL_ALPHA', destName];
    const totalAgents = (origin?.activeAgents || 1000) + (dest?.activeAgents || 1000);
    const congestion = Number((totalAgents / 20000).toFixed(2));
    const estimatedFlightTime = Number((12.0 + congestion * 4.5).toFixed(1));

    return {
      routePath,
      estimatedFlightTimeMin: estimatedFlightTime,
      totalHops: routePath.length - 1,
      activeCongestionFactor: congestion
    };
  }

  public getTotalActiveAgents(): number {
    let total = 0;
    this.regions.forEach((r) => {
      total += r.activeAgents;
    });
    return total;
  }

  private seedDefaultPlanetaryRegions(): void {
    const defaults: DigitalTwinRegion[] = [
      { regionId: 'TOKYO_MEGA_01', name: 'Tokyo Megalopolis Mesh', activeAgents: 4500, gridCells: 1000000, latencyMs: 1.2 },
      { regionId: 'LONDON_SMART_02', name: 'Greater London Corridor', activeAgents: 3200, gridCells: 850000, latencyMs: 2.1 },
      { regionId: 'NYC_METRO_03', name: 'New York Autonomous Grid', activeAgents: 5100, gridCells: 1200000, latencyMs: 1.8 },
      { regionId: 'SINGAPORE_LOG_04', name: 'Singapore Maritime Hub', activeAgents: 3800, gridCells: 900000, latencyMs: 0.9 }
    ];
    defaults.forEach((r) => this.registerRegion(r));
  }
}
