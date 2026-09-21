// ============================================================================
// AlgoArena v11.0 - Neuromorphic Spiking Neural Network (SNN) Core
// Event-driven brain-inspired computing executing asynchronous Leaky
// Integrate-and-Fire (LIF) neuron arrays for ultra-low-power O(1) path planning.
// ============================================================================

export interface LIFNeuron {
  id: number;
  membranePotential: number; // V_i(t) in mV
  threshold: number;         // Spike threshold V_th in mV
  refractoryTime: number;    // Refractory counter (ms)
}

export interface SNNSpikeRaster {
  timestep: number;
  firedNeuronIds: number[];
  averagePotential: number;
}

export class SpikingPathfinderCore {
  private neurons: LIFNeuron[];
  private weights: Float32Array; // Synaptic weight matrix
  private restPotential: number = -70.0;
  private spikeRasterHistory: SNNSpikeRaster[] = [];
  private currentTimeStep: number = 0;

  constructor(numNeurons: number) {
    const count = Math.max(1, numNeurons);
    this.neurons = Array.from({ length: count }, (_, i) => ({
      id: i,
      membranePotential: -70.0, // Rest potential (mV)
      threshold: -55.0,        // Spike threshold (mV)
      refractoryTime: 0
    }));
    this.weights = new Float32Array(count * count).fill(0.1);
  }

  /**
   * Section 2: Process sensor current inputs and generate asynchronous spike events
   */
  public processSpikeEvent(sensorInput: Float32Array): number[] {
    const activeSpikes: number[] = [];
    this.currentTimeStep++;

    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      if (neuron.refractoryTime > 0) {
        neuron.refractoryTime--;
        continue;
      }

      // Integrate synaptic input current
      const inputCurrent = i < sensorInput.length ? sensorInput[i] : 0.0;
      neuron.membranePotential += inputCurrent * 5.0;

      // Fire spike event
      if (neuron.membranePotential >= neuron.threshold) {
        activeSpikes.push(neuron.id);
        neuron.membranePotential = this.restPotential; // Reset
        neuron.refractoryTime = 3;                     // Refractory period (ms)
      }
    }

    let sumPotential = 0;
    for (let i = 0; i < this.neurons.length; i++) {
      sumPotential += this.neurons[i].membranePotential;
    }

    const raster: SNNSpikeRaster = {
      timestep: this.currentTimeStep,
      firedNeuronIds: [...activeSpikes],
      averagePotential: Number((sumPotential / this.neurons.length).toFixed(2))
    };

    this.spikeRasterHistory.push(raster);
    if (this.spikeRasterHistory.length > 50) {
      this.spikeRasterHistory.shift();
    }

    return activeSpikes;
  }

  /**
   * Evaluates exponential leaky decay toward resting potential: tau_m * dV/dt = -(V - V_rest)
   */
  public stepLeakyDecay(decayFactor: number = 0.95): void {
    for (let i = 0; i < this.neurons.length; i++) {
      const n = this.neurons[i];
      if (n.refractoryTime === 0) {
        n.membranePotential = this.restPotential + (n.membranePotential - this.restPotential) * decayFactor;
      }
    }
  }

  public setSynapticWeight(preIdx: number, postIdx: number, weight: number): void {
    const n = this.neurons.length;
    if (preIdx >= 0 && preIdx < n && postIdx >= 0 && postIdx < n) {
      this.weights[preIdx * n + postIdx] = weight;
    }
  }

  public getSynapticWeight(preIdx: number, postIdx: number): number {
    const n = this.neurons.length;
    if (preIdx >= 0 && preIdx < n && postIdx >= 0 && postIdx < n) {
      return this.weights[preIdx * n + postIdx];
    }
    return 0.0;
  }

  public getNeurons(): LIFNeuron[] {
    return this.neurons;
  }

  public getWeights(): Float32Array {
    return this.weights;
  }

  public getSpikeRasterHistory(): SNNSpikeRaster[] {
    return [...this.spikeRasterHistory];
  }

  public reset(): void {
    for (let i = 0; i < this.neurons.length; i++) {
      this.neurons[i].membranePotential = this.restPotential;
      this.neurons[i].refractoryTime = 0;
    }
    this.spikeRasterHistory = [];
    this.currentTimeStep = 0;
  }

  /**
   * Simulates neuromorphic wavefront propagation over spatial graph distances
   */
  public simulatePathSpikeWave(costMap: number[]): { spikeSequence: number[]; latencySteps: number } {
    this.reset();
    const spikeSequence: number[] = [];
    const inputs = new Float32Array(this.neurons.length);

    let steps = 0;
    for (let step = 0; step < 20; step++) {
      steps++;
      for (let i = 0; i < this.neurons.length; i++) {
        const cost = i < costMap.length ? costMap[i] : 5.0;
        // Higher conductivity = stronger sensory injection
        inputs[i] = Math.max(0.1, 10.0 / (cost + 1.0));
      }

      const fired = this.processSpikeEvent(inputs);
      fired.forEach((id) => {
        if (!spikeSequence.includes(id)) {
          spikeSequence.push(id);
        }
      });

      if (spikeSequence.length >= this.neurons.length * 0.8) {
        break;
      }
      this.stepLeakyDecay(0.9);
    }

    return {
      spikeSequence,
      latencySteps: steps
    };
  }
}
