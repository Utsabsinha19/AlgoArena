// ============================================================================
// AlgoArena v11.0 - Direct fNIRS Neural-Emotion Bio-Feedback Engine
// Integrates functional Near-Infrared Spectroscopy (fNIRS) optical brain imaging
// and Heart Rate Variability (HRV) telemetry to create an affective bio-feedback loop.
// ============================================================================

export interface BiometricState {
  oxygenatedHemoglobin: number;   // Delta HbO in micromolar (Prefrontal cortex activation)
  deoxygenatedHemoglobin: number; // Delta Hb in micromolar
  heartRateVariabilityMs: number; // HRV RMSSD in ms
}

export type AffectiveZone = 'ZEN_FLOW' | 'COGNITIVE_OVERLOAD' | 'OPTIMAL_ENGAGEMENT' | 'DROWSY_BOREDOM';

export interface EmotionalResonanceReport {
  focusScore: number;
  stressIndex: number;
  affectiveState: AffectiveZone;
  description: string;
}

export class NeuralEmotionSynthesizer {
  private biometricHistory: BiometricState[] = [];

  /**
   * Section 4: Computes focus score and stress index from fNIRS and HRV biometrics
   */
  public computeEmotionalResonance(bio: BiometricState): { focusScore: number; stressIndex: number } {
    const focusScore = Math.min(1.0, Math.max(0.0, bio.oxygenatedHemoglobin / (bio.deoxygenatedHemoglobin + 1e-5)));
    const stressIndex = Math.max(0.0, Math.min(1.0, 1.0 - (bio.heartRateVariabilityMs / 100.0)));

    return {
      focusScore: Number(focusScore.toFixed(3)),
      stressIndex: Number(stressIndex.toFixed(3))
    };
  }

  /**
   * Section 4: Dynamically scales algorithm DNA mutation and crossover based on affective resonance
   */
  public adjustGeneticEvolutionDNA(
    focusScore: number,
    stressIndex: number,
    currentDna: { mutationRate: number; crossoverRate: number }
  ): void {
    if (stressIndex > 0.75) {
      // High stress: Stabilize genetic pool to prevent rapid environment shift
      currentDna.mutationRate = Number((currentDna.mutationRate * 0.90).toFixed(4));
      currentDna.crossoverRate = Number((currentDna.crossoverRate * 1.05).toFixed(4));
    } else if (focusScore > 0.80) {
      // High cognitive focus: Elevate environmental challenge
      currentDna.mutationRate = Number((currentDna.mutationRate * 1.15).toFixed(4));
    }
  }

  /**
   * Evaluates comprehensive affective state for UI feedback and telemetry
   */
  public diagnoseAffectiveState(bio: BiometricState): EmotionalResonanceReport {
    const { focusScore, stressIndex } = this.computeEmotionalResonance(bio);
    this.biometricHistory.push(bio);
    if (this.biometricHistory.length > 50) {
      this.biometricHistory.shift();
    }

    let affectiveState: AffectiveZone = 'OPTIMAL_ENGAGEMENT';
    let description = 'Optimal cognitive engagement. Prefrontal cortex oxygenation balanced with autonomic cardiac stability.';

    if (stressIndex > 0.75) {
      affectiveState = 'COGNITIVE_OVERLOAD';
      description = `High sympathetic activation (HRV: ${bio.heartRateVariabilityMs}ms). Stabilizing genetic mutation to reduce cognitive fatigue.`;
    } else if (focusScore > 0.85 && stressIndex < 0.45) {
      affectiveState = 'ZEN_FLOW';
      description = `Zen flow state: High prefrontal Delta-HbO (${bio.oxygenatedHemoglobin.toFixed(2)}) coupled with relaxed vagal tone.`;
    } else if (focusScore < 0.35 && stressIndex < 0.30) {
      affectiveState = 'DROWSY_BOREDOM';
      description = 'Low cognitive workload detected. Increasing algorithmic mutation challenge to stimulate attention.';
    }

    return {
      focusScore,
      stressIndex,
      affectiveState,
      description
    };
  }

  public getBiometricHistory(): BiometricState[] {
    return [...this.biometricHistory];
  }

  public static simulateDynamicBiometrics(
    activityLevel: 'rest' | 'intense_race' | 'fatigued'
  ): BiometricState {
    switch (activityLevel) {
      case 'intense_race':
        return {
          oxygenatedHemoglobin: 0.92 + (Math.random() - 0.5) * 0.08,
          deoxygenatedHemoglobin: 0.25 + (Math.random() - 0.5) * 0.05,
          heartRateVariabilityMs: 38 + Math.round(Math.random() * 8)
        };
      case 'fatigued':
        return {
          oxygenatedHemoglobin: 0.45 + (Math.random() - 0.5) * 0.10,
          deoxygenatedHemoglobin: 0.75 + (Math.random() - 0.5) * 0.10,
          heartRateVariabilityMs: 22 + Math.round(Math.random() * 6)
        };
      case 'rest':
      default:
        return {
          oxygenatedHemoglobin: 0.65 + (Math.random() - 0.5) * 0.05,
          deoxygenatedHemoglobin: 0.60 + (Math.random() - 0.5) * 0.05,
          heartRateVariabilityMs: 75 + Math.round(Math.random() * 12)
        };
    }
  }
}
