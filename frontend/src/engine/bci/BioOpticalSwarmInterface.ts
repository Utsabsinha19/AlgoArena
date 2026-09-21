// ============================================================================
// AlgoArena v13.0 - Swarm-Mind Bio-Optical Neural Braiding
// Synchronizes multi-user brainwaves (EEG / fNIRS) into a braided collective
// consciousness, translating team-wide cognitive coherence into swarm formations.
// ============================================================================

export interface PlayerBrainwaveStream {
  playerId: string;
  coherenceIndex: number;  // Phase-locking value (0.0 to 1.0)
  alphaPeakHz: number;     // Dominant alpha rhythm
  gammaBurstPower: number; // Gamma power (30 - 100 Hz)
}

export interface SwarmFormationModulation {
  swarmRadius: number;
  speedMultiplier: number;
  formationType: 'DELTA_VEE' | 'CIRCULAR_SHIELD' | 'DISPERSED_SURGE';
  collectiveFocus: number;
  activePilots: number;
}

export class BioOpticalSwarmInterface {
  private connectedStreams: Map<string, PlayerBrainwaveStream> = new Map();

  constructor() {
    this.seedDefaultStreams();
  }

  public connectStream(stream: PlayerBrainwaveStream): void {
    this.connectedStreams.set(stream.playerId, stream);
  }

  public disconnectStream(playerId: string): boolean {
    return this.connectedStreams.delete(playerId);
  }

  public getStream(playerId: string): PlayerBrainwaveStream | undefined {
    return this.connectedStreams.get(playerId);
  }

  public getAllStreams(): PlayerBrainwaveStream[] {
    return Array.from(this.connectedStreams.values());
  }

  public getConnectedPilotCount(): number {
    return this.connectedStreams.size;
  }

  /**
   * Section 2: Computes multi-user collective coherence using gamma burst weighting
   */
  public computeCollectiveCoherence(): number {
    let totalCoherence = 0;
    const streams = Array.from(this.connectedStreams.values());
    if (streams.length === 0) return 0;

    for (const s of streams) {
      totalCoherence += s.coherenceIndex * (s.gammaBurstPower / 50.0);
    }
    const avg = totalCoherence / streams.length;
    return Number(Math.min(1.0, Math.max(0.0, avg)).toFixed(3));
  }

  /**
   * Modulates autonomous multi-agent swarm formations dynamically based on collective focus
   */
  public modulateSwarmFormation(collectiveFocus?: number): SwarmFormationModulation {
    const focus = collectiveFocus ?? this.computeCollectiveCoherence();

    if (focus > 0.8) {
      return {
        swarmRadius: 2.5,
        speedMultiplier: 2.4,
        formationType: 'DELTA_VEE',
        collectiveFocus: focus,
        activePilots: this.connectedStreams.size
      };
    } else if (focus > 0.45) {
      return {
        swarmRadius: 4.8,
        speedMultiplier: 1.6,
        formationType: 'CIRCULAR_SHIELD',
        collectiveFocus: focus,
        activePilots: this.connectedStreams.size
      };
    }

    return {
      swarmRadius: 8.0,
      speedMultiplier: 1.0,
      formationType: 'DISPERSED_SURGE',
      collectiveFocus: focus,
      activePilots: this.connectedStreams.size
    };
  }

  private seedDefaultStreams(): void {
    const defaults: PlayerBrainwaveStream[] = [
      { playerId: 'Pilot_Alpha_01', coherenceIndex: 0.92, alphaPeakHz: 10.4, gammaBurstPower: 48.5 },
      { playerId: 'Pilot_Bravo_02', coherenceIndex: 0.88, alphaPeakHz: 10.1, gammaBurstPower: 45.2 },
      { playerId: 'Pilot_Charlie_03', coherenceIndex: 0.84, alphaPeakHz: 9.8, gammaBurstPower: 42.0 },
      { playerId: 'Pilot_Delta_04', coherenceIndex: 0.79, alphaPeakHz: 10.2, gammaBurstPower: 39.5 }
    ];
    defaults.forEach((s) => this.connectStream(s));
  }
}
