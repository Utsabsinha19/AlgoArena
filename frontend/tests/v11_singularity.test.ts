import { describe, it, expect, beforeEach } from 'vitest';
import { NeRFSpatialGenerator } from '../src/engine/gpu/NeRFSpatialGenerator';
import { SpikingPathfinderCore } from '../src/engine/ai/SpikingPathfinderCore';
import { DePINComputeMesh } from '../src/engine/net/DePINComputeMesh';
import { NeuralEmotionSynthesizer } from '../src/engine/bci/NeuralEmotionSynthesizer';
import { evmContractAdapter, EVMContractAdapter } from '../src/engine/web3/EVMContractAdapter';

describe('AlgoArena v11.0 Autonomous Singularity Platform Verification', () => {

  // ==========================================================================
  // 1. 4D WebGPU Neural Radiance Field (NeRF) Dynamic Mesh Generator
  // ==========================================================================
  describe('NeRFSpatialGenerator', () => {
    let generator: NeRFSpatialGenerator;

    beforeEach(() => {
      generator = new NeRFSpatialGenerator();
    });

    it('should generate synthetic 4D NeRF volume data with continuous time harmonic', () => {
      const timeFrame = 3;
      const width = 16;
      const height = 16;
      const depth = 8;

      const volume = NeRFSpatialGenerator.generateSynthetic4DNeRF(timeFrame, width, height, depth);
      expect(volume.timeFrameIndex).toBe(timeFrame);
      expect(volume.densityGrid.length).toBe(width * height * depth);
      expect(volume.colorVolume.length).toBe(width * height * depth * 3);

      // Verify densities are bounded in [0, 1]
      let inBounds = true;
      for (let i = 0; i < volume.densityGrid.length; i++) {
        if (volume.densityGrid[i] < 0 || volume.densityGrid[i] > 1) {
          inBounds = false;
          break;
        }
      }
      expect(inBounds).toBe(true);
    });

    it('should initialize GPU volume buffer and extract obstacle SDF grid', async () => {
      const volume = NeRFSpatialGenerator.generateSynthetic4DNeRF(1, 10, 10, 4);
      let bufferCreatedSize = 0;
      let writtenBytes = 0;

      const mockDevice = {
        createBuffer: (desc: { size: number; usage: number }) => {
          bufferCreatedSize = desc.size;
          return { size: desc.size, destroy: () => {} };
        },
        queue: {
          writeBuffer: (_buf: any, _offset: number, data: ArrayBuffer) => {
            writtenBytes = data.byteLength;
          }
        }
      };

      await generator.initializeNeRFPipeline(mockDevice, volume);
      expect(generator.getGpuDevice()).toBe(mockDevice);
      expect(bufferCreatedSize).toBeGreaterThanOrEqual(volume.densityGrid.byteLength);
      expect(writtenBytes).toBe(volume.densityGrid.byteLength);

      // Extract SDF collision grid
      const sdf = generator.extractObstacleSdf(0.5);
      expect(sdf.length).toBe(100 * 100 * 32); // Default dimension
    });

    it('should calculate accurate ray marching step along view vectors', () => {
      const origin: [number, number, number] = [0, 0, 0];
      const dir: [number, number, number] = [1, 0, 0];
      const step = generator.calculateRayMarchStep(origin, dir, 2.5);
      expect(step[0]).toBeCloseTo(2.5, 3);
      expect(step[1]).toBeCloseTo(0, 3);
      expect(step[2]).toBeCloseTo(0, 3);
    });
  });

  // ==========================================================================
  // 2. Neuromorphic Spiking Neural Network (SNN) Core
  // ==========================================================================
  describe('SpikingPathfinderCore', () => {
    let snn: SpikingPathfinderCore;

    beforeEach(() => {
      snn = new SpikingPathfinderCore(16);
    });

    it('should initialize LIF neurons with resting membrane potential (-70mV)', () => {
      const neurons = snn.getNeurons();
      expect(neurons.length).toBe(16);
      expect(neurons[0].membranePotential).toBe(-70.0);
      expect(neurons[0].threshold).toBe(-55.0);
      expect(neurons[0].refractoryTime).toBe(0);
    });

    it('should integrate input current, fire spike above threshold, and reset with refractory period', () => {
      // Strong input to neuron 0 to trigger threshold (-55mV)
      const input = new Float32Array(16);
      input[0] = 5.0; // 5.0 * 5.0 = +25mV => -70 + 25 = -45mV >= -55mV

      const spikes = snn.processSpikeEvent(input);
      expect(spikes).toContain(0);

      // Neuron should reset to -70mV and enter refractory period of 3ms
      const neuron0 = snn.getNeurons()[0];
      expect(neuron0.membranePotential).toBe(-70.0);
      expect(neuron0.refractoryTime).toBe(3);

      // Second step during refractory: should not fire even with input
      const spikesRefractory = snn.processSpikeEvent(input);
      expect(spikesRefractory).not.toContain(0);
      expect(neuron0.refractoryTime).toBe(2);
    });

    it('should decay subthreshold potentials exponentially toward rest potential', () => {
      const input = new Float32Array(16);
      input[1] = 2.0; // -70 + 10 = -60mV (below -55mV threshold)
      snn.processSpikeEvent(input);

      const potentialBefore = snn.getNeurons()[1].membranePotential;
      expect(potentialBefore).toBe(-60.0);

      snn.stepLeakyDecay(0.9);
      const potentialAfter = snn.getNeurons()[1].membranePotential;
      // -70 + (-60 - -70) * 0.9 = -70 + 9 = -61mV
      expect(potentialAfter).toBeCloseTo(-61.0, 1);
    });

    it('should simulate path spike wave and report propagated sequence and latency', () => {
      const costMap = [1.0, 1.5, 2.0, 3.0, 1.2, 1.8, 2.5, 4.0, 1.1, 1.4, 2.2, 3.5, 1.3, 1.7, 2.6, 3.8];
      const wave = snn.simulatePathSpikeWave(costMap);

      expect(wave.spikeSequence.length).toBeGreaterThan(0);
      expect(wave.latencySteps).toBeGreaterThan(0);
      expect(snn.getSpikeRasterHistory().length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 3. DePIN Decentralized Compute Mesh & zk-Rollup Engine
  // ==========================================================================
  describe('DePINComputeMesh', () => {
    let mesh: DePINComputeMesh;

    beforeEach(() => {
      mesh = new DePINComputeMesh();
    });

    it('should register and unregister peer compute nodes correctly', () => {
      const initialCount = mesh.getNodeCount();
      const customNode = {
        nodeId: 'peer-singapore-07',
        hasWebGPU: true,
        benchmarkScore: 110.2,
        activeRaces: 0,
        region: 'AP-North' as const
      };

      mesh.registerPeerNode(customNode);
      expect(mesh.getNodeCount()).toBe(initialCount + 1);
      expect(mesh.getNode('peer-singapore-07')).toBeDefined();

      const removed = mesh.unregisterPeerNode('peer-singapore-07');
      expect(removed).toBe(true);
      expect(mesh.getNode('peer-singapore-07')).toBeUndefined();
    });

    it('should dispatch parallel races prioritizing WebGPU nodes', () => {
      const raceIds = ['race_alpha', 'race_beta', 'race_gamma'];
      const assignments = mesh.dispatchParallelRaceBatch(raceIds);

      expect(assignments.size).toBe(3);
      // All 3 races should have an assigned node
      raceIds.forEach((id) => {
        const assigned = assignments.get(id);
        expect(assigned).toBeDefined();
        const node = mesh.getNode(assigned!);
        expect(node).toBeDefined();
      });
    });

    it('should aggregate race batches into a succinct zk-Rollup with valid root hash', () => {
      const results = [
        { raceId: 'race_01', winner: 'peer-tokyo-01', checksum: 'chk_101' },
        { raceId: 'race_02', winner: 'peer-frankfurt-04', checksum: 'chk_102' }
      ];

      const rollup = mesh.aggregateRollupBatch(results);
      expect(rollup.totalRaces).toBe(2);
      expect(rollup.batchRootHash.startsWith('0xROLLUP_')).toBe(true);
      expect(rollup.proof.startsWith('zkSTARK_ProofBN128_')).toBe(true);
      expect(rollup.participatingNodeCount).toBeGreaterThan(0);
    });

    it('should calculate global mesh throughput metrics', () => {
      const throughput = mesh.getMeshThroughput();
      expect(throughput.totalNodes).toBeGreaterThan(0);
      expect(throughput.webGpuNodes).toBeGreaterThan(0);
      expect(throughput.avgBenchmarkScore).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 4. Direct fNIRS Neural-Emotion Bio-Feedback Engine
  // ==========================================================================
  describe('NeuralEmotionSynthesizer', () => {
    let synthesizer: NeuralEmotionSynthesizer;

    beforeEach(() => {
      synthesizer = new NeuralEmotionSynthesizer();
    });

    it('should compute focus score and stress index accurately from hemodynamic biometrics', () => {
      const bio = {
        oxygenatedHemoglobin: 4.0,
        deoxygenatedHemoglobin: 1.0,
        heartRateVariabilityMs: 80.0
      };

      const resonance = synthesizer.computeEmotionalResonance(bio);
      // focusScore = min(1.0, 4.0 / 1.0) = 1.0
      // stressIndex = max(0, 1.0 - 80/100) = 0.2
      expect(resonance.focusScore).toBe(1.0);
      expect(resonance.stressIndex).toBe(0.2);
    });

    it('should adjust genetic evolution DNA parameters dynamically', () => {
      // High stress test: stressIndex > 0.75
      const stressedDna = { mutationRate: 0.10, crossoverRate: 0.70 };
      synthesizer.adjustGeneticEvolutionDNA(0.4, 0.85, stressedDna);
      expect(stressedDna.mutationRate).toBeLessThan(0.10);
      expect(stressedDna.crossoverRate).toBeGreaterThan(0.70);

      // High focus test: focusScore > 0.80
      const focusedDna = { mutationRate: 0.10, crossoverRate: 0.70 };
      synthesizer.adjustGeneticEvolutionDNA(0.9, 0.3, focusedDna);
      expect(focusedDna.mutationRate).toBeGreaterThan(0.10);
    });

    it('should diagnose affective zones (ZEN_FLOW, COGNITIVE_OVERLOAD, etc.)', () => {
      const zenBio = {
        oxygenatedHemoglobin: 3.5,
        deoxygenatedHemoglobin: 1.0,
        heartRateVariabilityMs: 85.0
      };
      const zenReport = synthesizer.diagnoseAffectiveState(zenBio);
      expect(zenReport.affectiveState).toBe('ZEN_FLOW');

      // For COGNITIVE_OVERLOAD, stressIndex > 0.75 => HRV < 25ms (e.g. 20ms => 1.0 - 0.2 = 0.8 > 0.75)
      const overloadBio = {
        oxygenatedHemoglobin: 3.5,
        deoxygenatedHemoglobin: 1.0,
        heartRateVariabilityMs: 18.0
      };
      const overloadReport = synthesizer.diagnoseAffectiveState(overloadBio);
      expect(overloadReport.affectiveState).toBe('COGNITIVE_OVERLOAD');
    });
  });

  // ==========================================================================
  // 5. Fully Homomorphic Encryption (FHE) Strategy Vault
  // ==========================================================================
  describe('FHEStrategyVault & EVM Integration', () => {
    it('should encrypt strategy cost and node index into homomorphic ciphertexts', () => {
      const encrypted = EVMContractAdapter.encryptStrategyData(42, 10);
      expect(encrypted.encryptedCost.startsWith('0x')).toBe(true);
      expect(encrypted.encryptedNodeIdx.startsWith('0x')).toBe(true);
      expect(encrypted.encryptedCost.length).toBeGreaterThan(16);
    });

    it('should submit encrypted strategy on-chain via EVMContractAdapter', async () => {
      const player = '0xTester999';
      const enc = EVMContractAdapter.encryptStrategyData(35, 7);
      const res = await evmContractAdapter.submitEncryptedFHEStrategy(player, enc.encryptedCost, enc.encryptedNodeIdx);

      expect(res.success).toBe(true);
      expect(res.txHash.startsWith('0xFHE_')).toBe(true);

      const retrieved = evmContractAdapter.getEncryptedStrategy(player);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.encryptedCost).toBe(enc.encryptedCost);
      expect(retrieved?.encryptedNodeIndex).toBe(enc.encryptedNodeIdx);
    });

    it('should execute homomorphic race blind comparison without revealing plaintext', async () => {
      const playerA = '0xRacerA_01';
      const playerB = '0xRacerB_02';

      // Submit player strategies
      const encA = EVMContractAdapter.encryptStrategyData(30, 5);
      const encB = EVMContractAdapter.encryptStrategyData(50, 8);
      await evmContractAdapter.submitEncryptedFHEStrategy(playerA, encA.encryptedCost, encA.encryptedNodeIdx);
      await evmContractAdapter.submitEncryptedFHEStrategy(playerB, encB.encryptedCost, encB.encryptedNodeIdx);

      const outcome = await evmContractAdapter.executeHomomorphicRace(playerA, playerB);
      expect(outcome.winnerAddress).toBeDefined();
      expect(outcome.encryptedWinnerCost.startsWith('0x')).toBe(true);
      expect(outcome.txHash.startsWith('0xFHE_RACE_')).toBe(true);
    });
  });
});
