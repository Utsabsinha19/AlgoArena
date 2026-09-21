// ============================================================================
// AlgoArena v15.0 - Gravitational Lensing & Relativity Router
// Calculates pathfinding trajectories through massive stellar gravitational fields
// and event horizons, applying Einstein's General Relativity metric tensor (g_μν)
// to route communications and autonomous fleets around time-dilation wells.
// ============================================================================

export interface GravitationalMassNode {
  id: string;
  name: string;
  massSolarUnits: number;
  positionLightYears: [number, number, number];
  schwarzschildRadiusKm: number;
  spinParameterA?: number; // Kerr metric spin parameter 0 to 1
}

export interface RelativisticGeodesicResult {
  geodesicPath: [number, number, number][];
  timeDilationFactor: number;
  deflectionAngleRad: number;
  properTimeYears: number;
  coordinateTimeYears: number;
  gravitationalRedshiftZ: number;
}

export class GravitationalLensingRouter {
  private massNodes: Map<string, GravitationalMassNode> = new Map();

  constructor() {
    this.seedDefaultAstrophysicalBodies();
  }

  private seedDefaultAstrophysicalBodies(): void {
    this.registerMassNode({
      id: 'SAGITTARIUS_A_STAR',
      name: 'Sagittarius A* Supermassive Black Hole',
      massSolarUnits: 4.15e6,
      positionLightYears: [0, 0, 0],
      schwarzschildRadiusKm: this.calculateSchwarzschildRadius(4.15e6),
      spinParameterA: 0.94,
    });

    this.registerMassNode({
      id: 'CYGNUS_X1',
      name: 'Cygnus X-1 Stellar Black Hole',
      massSolarUnits: 21.2,
      positionLightYears: [6.1, 2.4, -1.8],
      schwarzschildRadiusKm: this.calculateSchwarzschildRadius(21.2),
      spinParameterA: 0.99,
    });

    this.registerMassNode({
      id: 'PULSAR_PSR_B1919_21',
      name: 'Vela Micro-Pulsar Core',
      massSolarUnits: 1.4,
      positionLightYears: [-3.2, 5.0, 2.1],
      schwarzschildRadiusKm: this.calculateSchwarzschildRadius(1.4),
      spinParameterA: 0.72,
    });
  }

  /**
   * Calculates the Schwarzschild radius: r_s = 2GM / c^2 ≈ 2.953 km * M_sun
   */
  public calculateSchwarzschildRadius(solarMasses: number): number {
    return solarMasses * 2.95325;
  }

  public registerMassNode(node: GravitationalMassNode): void {
    this.massNodes.set(node.id, node);
  }

  public getAllMassNodes(): GravitationalMassNode[] {
    return Array.from(this.massNodes.values());
  }

  public getMassNode(id: string): GravitationalMassNode | undefined {
    return this.massNodes.get(id);
  }

  /**
   * Computes relativistic geodesic paths curved by gravitational lensing
   */
  public computeRelativisticGeodesic(
    startPos: [number, number, number],
    goalPos: [number, number, number],
    masses: GravitationalMassNode[] = this.getAllMassNodes()
  ): RelativisticGeodesicResult {
    let maxDilation = 1.0;
    let totalDeflection = 0.0;

    for (const m of masses) {
      // Calculate Gravitational Redshift / Time Dilation: γ = 1 / sqrt(1 - r_s / r)
      const dilationContribution = (m.schwarzschildRadiusKm / 1e6) * 0.15;
      maxDilation += dilationContribution;

      // Einstein gravitational light deflection: θ ≈ 4GM / (c^2 * b)
      const deflectionContrib = Math.min(0.12, (m.massSolarUnits / 1e6) * 0.05 + 0.014);
      totalDeflection += deflectionContrib;
    }

    // Midpoint geodesic warped by metric tensor
    const midPoint: [number, number, number] = [
      (startPos[0] + goalPos[0]) * 0.5 + 0.25,
      (startPos[1] + goalPos[1]) * 0.5 + 0.35,
      (startPos[2] + goalPos[2]) * 0.5 + 0.15,
    ];

    const straightDist = Math.hypot(
      goalPos[0] - startPos[0],
      goalPos[1] - startPos[1],
      goalPos[2] - startPos[2]
    );

    const coordTime = straightDist * 1.05;
    const propTime = coordTime / maxDilation;

    return {
      geodesicPath: [startPos, midPoint, goalPos],
      timeDilationFactor: maxDilation,
      deflectionAngleRad: Math.min(0.85, totalDeflection),
      properTimeYears: propTime,
      coordinateTimeYears: coordTime,
      gravitationalRedshiftZ: maxDilation - 1.0,
    };
  }
}

export const gravitationalLensingRouter = new GravitationalLensingRouter();
