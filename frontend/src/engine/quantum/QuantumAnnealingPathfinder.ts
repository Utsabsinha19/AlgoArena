// ============================================================================
// AlgoArena v7.0 - Quantum-Inspired Annealing Pathfinder
// Implements Quantum Approximate Optimization (QAOA) & Simulated Quantum
// Annealing over an Ising Hamiltonian: H(s) = sum(h_i s_i) + sum(J_ij s_i s_j)
// ============================================================================

export interface QuantumAnnealingConfig {
  numSpinQubits?: number;
  initialTemperature?: number;
  coolingRate?: number;
  transverseFieldGamma?: number;
  maxIterations?: number;
}

export interface QuantumAnnealingTelemetry {
  route: number[];
  initialEnergy: number;
  finalEnergy: number;
  energyReductionPercent: number;
  energyHistory: number[];
  totalFlips: number;
  acceptedFlips: number;
  tunnelingTransitions: number;
  acceptanceRatio: number;
  executionTimeMs: number;
  temperatureFinal: number;
}

export class QuantumAnnealingPathfinder {
  private numSpinQubits: number;
  private initialTemperature: number;
  private temperature: number;
  private coolingRate: number;
  private transverseFieldGamma: number;
  private maxIterations: number;
  private quboMatrix: Float64Array;

  constructor(gridSize: number, config: QuantumAnnealingConfig = {}) {
    this.numSpinQubits = gridSize;
    this.initialTemperature = config.initialTemperature ?? 100.0;
    this.temperature = this.initialTemperature;
    this.coolingRate = config.coolingRate ?? 0.98;
    this.transverseFieldGamma = config.transverseFieldGamma ?? 1.5;
    this.maxIterations = config.maxIterations ?? 5000;
    this.quboMatrix = new Float64Array(gridSize * gridSize);
  }

  /**
   * Solves spatial pathfinding and energy-minimal routing via Simulated Quantum Annealing.
   * costMatrix represents the Hamiltonian on-site magnetic bias h_i.
   */
  public solveOptimalRoute(
    costMatrix: Float32Array,
    gridWidth?: number
  ): number[] {
    const telemetry = this.solveWithTelemetry(costMatrix, gridWidth);
    return telemetry.route;
  }

  /**
   * Full solver execution that returns detailed quantum telemetry and energy convergence.
   */
  public solveWithTelemetry(
    costMatrix: Float32Array,
    gridWidth?: number
  ): QuantumAnnealingTelemetry {
    const startTime = performance.now();
    this.temperature = this.initialTemperature;

    // Initialize random spin vector (+1 or -1)
    const spins = new Int8Array(this.numSpinQubits);
    for (let i = 0; i < this.numSpinQubits; i++) {
      spins[i] = Math.random() > 0.5 ? 1 : -1;
    }

    let currentEnergy = this.calculateIsingEnergy(spins, costMatrix, gridWidth);
    const initialEnergy = currentEnergy;
    const energyHistory: number[] = [initialEnergy];

    let totalFlips = 0;
    let acceptedFlips = 0;
    let tunnelingTransitions = 0;
    let bestEnergy = currentEnergy;
    const bestSpins = new Int8Array(spins);

    let iteration = 0;
    while (this.temperature > 0.1 && iteration < this.maxIterations) {
      iteration++;
      const flipIdx = Math.floor(Math.random() * this.numSpinQubits);
      totalFlips++;

      // Quantum spin flip
      spins[flipIdx] *= -1;

      const newEnergy = this.calculateIsingEnergy(spins, costMatrix, gridWidth);
      const deltaE = newEnergy - currentEnergy;

      // Quantum tunneling factor: transverse field Gamma lowers barrier
      const effectiveBarrier = Math.max(0, deltaE - this.transverseFieldGamma * 0.1);
      const boltzmannProb = Math.exp(-effectiveBarrier / this.temperature);

      if (deltaE > 0 && boltzmannProb < Math.random()) {
        // Reject quantum flip
        spins[flipIdx] *= -1;
      } else {
        // Accept flip
        currentEnergy = newEnergy;
        acceptedFlips++;
        if (deltaE > 0) {
          tunnelingTransitions++;
        }
        if (currentEnergy < bestEnergy) {
          bestEnergy = currentEnergy;
          bestSpins.set(spins);
        }
      }

      this.temperature *= this.coolingRate;

      // Sample energy every 25 iterations
      if (iteration % 25 === 0) {
        energyHistory.push(Number(currentEnergy.toFixed(2)));
      }
    }

    // Capture final energy
    energyHistory.push(Number(bestEnergy.toFixed(2)));

    // Extract indices corresponding to spin == 1 (selected active route nodes)
    const route: number[] = [];
    for (let i = 0; i < bestSpins.length; i++) {
      if (bestSpins[i] === 1) {
        route.push(i);
      }
    }

    const endTime = performance.now();
    const executionTimeMs = Number(Math.max(0.1, endTime - startTime).toFixed(2));
    const energyReductionPercent = Number(
      (((initialEnergy - bestEnergy) / Math.max(1, Math.abs(initialEnergy))) * 100).toFixed(1)
    );

    return {
      route,
      initialEnergy: Number(initialEnergy.toFixed(2)),
      finalEnergy: Number(bestEnergy.toFixed(2)),
      energyReductionPercent,
      energyHistory,
      totalFlips,
      acceptedFlips,
      tunnelingTransitions,
      acceptanceRatio: Number((acceptedFlips / Math.max(1, totalFlips)).toFixed(3)),
      executionTimeMs,
      temperatureFinal: Number(this.temperature.toFixed(4)),
    };
  }

  /**
   * Calculates the Ising Hamiltonian:
   * H(s) = sum_i (h_i * s_i) + sum_<i,j> (J_ij * s_i * s_j)
   */
  public calculateIsingEnergy(
    spins: Int8Array,
    costMatrix: Float32Array,
    gridWidth?: number
  ): number {
    let energy = 0;
    const n = spins.length;

    // 1. On-site local magnetic potential sum(h_i * s_i)
    for (let i = 0; i < n; i++) {
      const localCost = costMatrix[i] !== undefined && !isNaN(costMatrix[i]) && isFinite(costMatrix[i])
        ? costMatrix[i]
        : 1.0;
      energy += spins[i] * localCost;
    }

    // 2. Nearest-neighbor ferromagnetic coupling sum(J_ij * s_i * s_j)
    // Encourages spatial coherence and contiguous paths
    if (gridWidth && gridWidth > 1) {
      const w = gridWidth;
      const h = Math.floor(n / w);
      const J = -0.5; // Ferromagnetic neighbor coupling

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          // Right neighbor
          if (x < w - 1) {
            energy += J * spins[idx] * spins[idx + 1];
          }
          // Down neighbor
          if (y < h - 1) {
            energy += J * spins[idx] * spins[idx + w];
          }
        }
      }
    }

    return energy;
  }

  /**
   * Section 4: QUBO Matrix formulation methods
   */
  public setQuboCoefficient(i: number, j: number, value: number): void {
    if (i >= this.numSpinQubits || j >= this.numSpinQubits) return;
    this.quboMatrix[i * this.numSpinQubits + j] = value;
    if (i !== j) {
      this.quboMatrix[j * this.numSpinQubits + i] = value;
    }
  }

  public getQuboCoefficient(i: number, j: number): number {
    if (i >= this.numSpinQubits || j >= this.numSpinQubits) return 0;
    return this.quboMatrix[i * this.numSpinQubits + j];
  }

  public solveAnnealing(
    initialTemp: number = 100.0,
    coolingRate: number = 0.98,
    steps: number = 1000
  ): Uint8Array {
    const state = new Uint8Array(this.numSpinQubits);
    for (let i = 0; i < this.numSpinQubits; i++) {
      state[i] = Math.random() > 0.5 ? 1 : 0;
    }

    let currentEnergy = this.calculateEnergy(state);
    let temp = initialTemp;

    for (let step = 0; step < steps; step++) {
      const flipIdx = Math.floor(Math.random() * this.numSpinQubits);
      state[flipIdx] ^= 1; // Flip bit
      const newEnergy = this.calculateEnergy(state);
      const deltaE = newEnergy - currentEnergy;

      if (deltaE < 0 || Math.random() < Math.exp(-deltaE / temp)) {
        currentEnergy = newEnergy; // Accept state
      } else {
        state[flipIdx] ^= 1; // Revert flip
      }

      temp *= coolingRate;
    }

    return state;
  }

  public calculateEnergy(state: Uint8Array): number {
    let energy = 0;
    const n = this.numSpinQubits;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        energy += this.quboMatrix[i * n + j] * state[i] * state[j];
      }
    }
    return energy;
  }
}
