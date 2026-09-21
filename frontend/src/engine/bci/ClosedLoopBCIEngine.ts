// ============================================================================
// AlgoArena v10.0 - Closed-Loop BCI Adaptive Mutation Engine
// Bi-directional biofeedback loop: Dynamically scales genetic algorithm
// mutation rates (mu) based on theta/beta cognitive workload to maintain
// an optimal flow-state difficulty curve.
// ============================================================================

export type FlowStateZone = 'FLOW_STATE' | 'HIGH_STRESS_OVERLOAD' | 'LOW_AROUSAL_BOREDOM';

export interface CognitiveWorkloadEvaluation {
  cognitiveWorkload: number;
  targetCognitiveLoad: number;
  zone: FlowStateZone;
  adaptedMutationRate: number;
  recommendation: string;
}

export class ClosedLoopBCIEngine {
  private targetCognitiveLoad: number = 0.65; // Target flow-state threshold

  constructor(targetCognitiveLoad: number = 0.65) {
    this.targetCognitiveLoad = targetCognitiveLoad;
  }

  /**
   * Section 4: Dynamically scales genetic mutation rate based on player biofeedback
   */
  public calculateAdaptiveMutationRate(
    thetaPower: number,
    betaPower: number,
    currentMutationRate: number
  ): number {
    const cognitiveWorkload = thetaPower / (betaPower + 1e-6);

    if (cognitiveWorkload > this.targetCognitiveLoad + 0.15) {
      // High mental stress: reduce search complexity to ease cognitive load
      return Math.max(0.01, Number((currentMutationRate * 0.85).toFixed(4)));
    } else if (cognitiveWorkload < this.targetCognitiveLoad - 0.15) {
      // Boredom detected: increase genetic mutation rate to introduce unpredictable challenge
      return Math.min(0.40, Number((currentMutationRate * 1.25).toFixed(4)));
    }
    return currentMutationRate;
  }

  /**
   * Evaluates cognitive workload and identifies the current flow-state zone
   */
  public evaluateCognitiveWorkload(
    thetaPower: number,
    betaPower: number,
    currentMutationRate: number
  ): CognitiveWorkloadEvaluation {
    const cognitiveWorkload = Number((thetaPower / (betaPower + 1e-6)).toFixed(3));
    const adaptedMutationRate = this.calculateAdaptiveMutationRate(
      thetaPower,
      betaPower,
      currentMutationRate
    );

    let zone: FlowStateZone = 'FLOW_STATE';
    let recommendation = 'Cognitive workload in optimal flow-state equilibrium. Maintaining current mutation rate.';

    if (cognitiveWorkload > this.targetCognitiveLoad + 0.15) {
      zone = 'HIGH_STRESS_OVERLOAD';
      recommendation = `High mental stress detected (ratio: ${cognitiveWorkload}). Dampening genetic mutation rate to ${adaptedMutationRate} to ease search complexity.`;
    } else if (cognitiveWorkload < this.targetCognitiveLoad - 0.15) {
      zone = 'LOW_AROUSAL_BOREDOM';
      recommendation = `Low cognitive arousal detected (ratio: ${cognitiveWorkload}). Boosting genetic mutation rate to ${adaptedMutationRate} to introduce dynamic obstacles.`;
    }

    return {
      cognitiveWorkload,
      targetCognitiveLoad: this.targetCognitiveLoad,
      zone,
      adaptedMutationRate,
      recommendation
    };
  }

  public getTargetCognitiveLoad(): number {
    return this.targetCognitiveLoad;
  }

  public setTargetCognitiveLoad(val: number): void {
    this.targetCognitiveLoad = Math.max(0.1, Math.min(2.0, val));
  }
}
