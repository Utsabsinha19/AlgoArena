// ============================================================================
// AlgoArena v8.0 - Meta-Engine & Neural Infrastructure Test Suite
// WebGPU 3D Voxel WGSL Compute, On-Device WebLLM Level Architect,
// Web Bluetooth EEG BCI, QAOA QUBO Ising Annealer & Dynamic NFT Genomes
// ============================================================================

import { describe, test, expect, beforeEach } from 'vitest';
import { WebGPUVoxelGrid, PATHFINDING_3D_WGSL } from '../src/engine/gpu/WebGPUVoxelGrid';
import { GenerativeLevelArchitect } from '../src/engine/ai/GenerativeLevelArchitect';
import { BCINeuralInterface } from '../src/engine/bci/BCINeuralInterface';
import { QuantumAnnealingPathfinder } from '../src/engine/quantum/QuantumAnnealingPathfinder';
import { EVMContractAdapter } from '../src/engine/web3/EVMContractAdapter';

describe('AlgoArena v8.0 Meta-Engine Architecture Verification', () => {
  // --------------------------------------------------------------------------
  // 1. WebGPU 3D Voxel WGSL Compute Pipeline
  // --------------------------------------------------------------------------
  describe('WebGPU 3D Voxel WGSL Compute Pipeline', () => {
    let voxelGrid: WebGPUVoxelGrid;

    beforeEach(() => {
      voxelGrid = new WebGPUVoxelGrid();
    });

    test('initializes and reports 3D engine status', async () => {
      await voxelGrid.initialize();
      const status = voxelGrid.getStatus();
      expect(status.initialized).toBe(true);
      expect(typeof status.nativeWebGPU).toBe('boolean');
    });

    test('contains 3D WGSL compute shader with 6-directional atomic neighbor relaxation', () => {
      expect(PATHFINDING_3D_WGSL).toContain('struct GridUniforms');
      expect(PATHFINDING_3D_WGSL).toContain('@compute @workgroup_size(8, 8, 1)');
      expect(PATHFINDING_3D_WGSL).toContain('array<vec3<i32>, 6>');
      expect(PATHFINDING_3D_WGSL).toContain('atomicMin(&distances[neighborIdx], newDist)');
    });

    test('executes 3D wavefront propagation pass and returns volumetric telemetry', async () => {
      await voxelGrid.initialize();
      const telemetry = await voxelGrid.runWavefrontPass([32, 32, 4], 8);

      expect(telemetry.dimensions).toEqual([32, 32, 4]);
      expect(telemetry.totalVoxels).toBe(4096);
      expect(telemetry.voxelsVisited).toBeGreaterThan(1);
      expect(telemetry.wavefrontPasses).toBeGreaterThan(0);
      expect(telemetry.executionTimeMs).toBeGreaterThan(0);
      expect(telemetry.throughputVoxelsPerSec).toBeGreaterThan(0);
      expect(telemetry.hardwareBackend).toBeDefined();
    });

    test('scales to dense volumetric 128x128x8 (131k voxels) grid execution', async () => {
      await voxelGrid.initialize();
      const telemetry = await voxelGrid.runWavefrontPass([128, 128, 8], 10);

      expect(telemetry.totalVoxels).toBe(131072);
      expect(telemetry.voxelsVisited).toBeGreaterThan(50);
      expect(telemetry.wavefrontPasses).toBe(10);
    });
  });

  // --------------------------------------------------------------------------
  // 2. On-Device WebLLM Generative Level Architect
  // --------------------------------------------------------------------------
  describe('On-Device WebLLM Generative Level Architect', () => {
    let architect: GenerativeLevelArchitect;

    beforeEach(() => {
      architect = new GenerativeLevelArchitect();
    });

    test('initializes model weights and reports progress callback', async () => {
      let progressReport = '';
      await architect.initializeModel((p) => {
        progressReport = p;
      });

      expect(architect.isEngineReady()).toBe(true);
      expect(progressReport.length).toBeGreaterThan(0);
    });

    test('synthesizes GeneratedMapTopology with biome tag and high-cost zones', async () => {
      const topology = await architect.generateMapFromPrompt(
        'Construct a cyberpunk neon grid with high-speed pathways and plasma traps',
        [24, 24]
      );

      expect(topology.name).toBeDefined();
      expect(topology.dimensions).toEqual([24, 24]);
      expect(topology.biomeTag).toBe('CYBERPUNK_NEON');
      expect(topology.obstacles.length).toBeGreaterThan(0);
      expect(Array.isArray(topology.highCostZones)).toBe(true);
      expect(topology.startNode).toEqual([1, 1]);
      expect(topology.goalNode).toEqual([22, 22]);
    });

    test('correctly assigns PLASMA_WASTELAND biome for volcanic/lava prompts', async () => {
      const topology = await architect.generateMapFromPrompt(
        'Volcanic lava wasteland with boiling magma rivers and obsidian ruins',
        [20, 20]
      );

      expect(topology.biomeTag).toBe('PLASMA_WASTELAND');
    });

    test('correctly assigns NEURAL_MAZE biome for citadel/fortress prompts', async () => {
      const topology = await architect.generateMapFromPrompt(
        'Neural maze fortress with concentric defenses and security gates',
        [20, 20]
      );

      expect(topology.biomeTag).toBe('NEURAL_MAZE');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Web Bluetooth EEG BCI Neural Interface
  // --------------------------------------------------------------------------
  describe('Web Bluetooth EEG BCI Neural Interface', () => {
    let bci: BCINeuralInterface;

    beforeEach(() => {
      bci = new BCINeuralInterface();
    });

    test('maps Focus Index (beta/alpha) to heuristic weight w in [1.0, 5.0]', () => {
      // Formula: w = min(5.0, max(1.0, 1.0 + (focusIndex - 0.5) * 1.6))
      expect(bci.mapFocusIndexToHeuristicWeight(0.5)).toBe(1.0);
      expect(bci.mapFocusIndexToHeuristicWeight(3.0)).toBe(5.0);
      expect(bci.mapFocusIndexToHeuristicWeight(1.75)).toBe(3.0);
      expect(bci.mapFocusIndexToHeuristicWeight(0.1)).toBe(1.0);
      expect(bci.mapFocusIndexToHeuristicWeight(10.0)).toBe(5.0);
    });

    test('extracts EEGDataPacket with spectral power ratio', () => {
      bci.setManualFocusLevel(80);
      const packet = bci.getEEGDataPacket();

      expect(packet.alphaPower).toBeGreaterThan(0);
      expect(packet.betaPower).toBeGreaterThan(0);
      expect(packet.focusIndex).toBeGreaterThan(0);
      expect(packet.focusIndex).toBe(Number((packet.betaPower / packet.alphaPower).toFixed(2)));
    });

    test('connectHeadset activates telemetry stream and triggers focus updates', async () => {
      let receivedFocus = 0;
      let receivedWeight = 0;

      await bci.connectHeadset((focus, hWeight) => {
        receivedFocus = focus;
        receivedWeight = hWeight;
      });

      // Trigger telemetry update
      bci.setManualFocusLevel(75);

      expect(receivedFocus).toBeGreaterThan(0);
      expect(receivedWeight).toBeGreaterThanOrEqual(1.0);
      expect(receivedWeight).toBeLessThanOrEqual(5.0);

      bci.disconnect();
    });
  });

  // --------------------------------------------------------------------------
  // 4. Quantum-Inspired QAOA Annealing Pathfinder
  // --------------------------------------------------------------------------
  describe('Quantum-Inspired QAOA Annealing Pathfinder', () => {
    test('manipulates QUBO matrix coefficients symmetrically', () => {
      const solver = new QuantumAnnealingPathfinder(8);

      solver.setQuboCoefficient(0, 1, 4.5);
      expect(solver.getQuboCoefficient(0, 1)).toBe(4.5);
      expect(solver.getQuboCoefficient(1, 0)).toBe(4.5); // Symmetric coupling

      solver.setQuboCoefficient(2, 2, -10.0); // On-site linear term
      expect(solver.getQuboCoefficient(2, 2)).toBe(-10.0);
    });

    test('solves QUBO annealing problem and returns valid binary bitstring', () => {
      const numVars = 16;
      const solver = new QuantumAnnealingPathfinder(numVars);

      // Create quadratic penalty favoring bit 0 = 1 and bit 1 = 0
      solver.setQuboCoefficient(0, 0, -20.0); // strongly encourage bit 0
      solver.setQuboCoefficient(1, 1, 20.0);  // strongly penalize bit 1

      const bitstring = solver.solveAnnealing(50.0, 0.90, 500);

      expect(bitstring.length).toBe(numVars);
      expect(bitstring instanceof Uint8Array).toBe(true);
      // Verify bit values are strictly 0 or 1
      for (let i = 0; i < numVars; i++) {
        expect([0, 1]).toContain(bitstring[i]);
      }
      // Bit 0 should be 1, Bit 1 should be 0 due to strong biases
      expect(bitstring[0]).toBe(1);
      expect(bitstring[1]).toBe(0);
    });

    test('calculates quadratic binary energy sum(Q_ij * q_i * q_j)', () => {
      const solver = new QuantumAnnealingPathfinder(2);
      solver.setQuboCoefficient(0, 0, 3.0);
      solver.setQuboCoefficient(1, 1, 2.0);
      solver.setQuboCoefficient(0, 1, -5.0);

      // state = [1, 1]: energy = 3*1*1 + 2*1*1 + (-5)*1*1 + (-5)*1*1 = 3 + 2 - 10 = -5
      const energy = solver.calculateEnergy(new Uint8Array([1, 1]));
      expect(energy).toBe(-5.0);
    });
  });

  // --------------------------------------------------------------------------
  // 5. EVM Smart Contract & Dynamic NFT DNA
  // --------------------------------------------------------------------------
  describe('EVM Smart Contract & Dynamic NFT DNA', () => {
    let adapter: EVMContractAdapter;

    beforeEach(() => {
      adapter = new EVMContractAdapter();
    });

    test('records match outcome and mutates genome speed and accuracy on victory', () => {
      const tokenId = '001';
      const initialCard = adapter.getMintedCollection().find((c) => c.tokenId === tokenId)!;
      const initialSpeed = initialCard.speedRating;
      const initialAccuracy = initialCard.accuracyRating;

      // Simulate match victory
      const outcome = adapter.recordMatchOutcome(tokenId, true);

      expect(outcome.mutated).toBe(true);
      expect(outcome.genome.matchesPlayed).toBe(1);
      expect(outcome.genome.wins).toBe(1);
      expect(outcome.genome.speed).toBe(initialSpeed + 1);
      expect(outcome.genome.accuracy).toBe(initialAccuracy + 1);
      expect(outcome.event).toContain('GenomeMutated');

      // Verify card was updated in the collection
      const updatedCard = adapter.getMintedCollection().find((c) => c.tokenId === tokenId)!;
      expect(updatedCard.speedRating).toBe(initialSpeed + 1);
    });

    test('records match defeat without mutating algorithm genome traits', () => {
      const tokenId = '002';
      const initialCard = adapter.getMintedCollection().find((c) => c.tokenId === tokenId)!;
      const initialSpeed = initialCard.speedRating;

      // Simulate defeat
      const outcome = adapter.recordMatchOutcome(tokenId, false);

      expect(outcome.mutated).toBe(false);
      expect(outcome.genome.matchesPlayed).toBe(1);
      expect(outcome.genome.wins).toBe(0);
      expect(outcome.genome.speed).toBe(initialSpeed);
      expect(outcome.event).toContain('MatchRecorded');
    });

    test('retrieves on-chain genome state by tokenId', () => {
      adapter.recordMatchOutcome('003', true);
      const genome = adapter.getGenome('003');

      expect(genome).toBeDefined();
      expect(genome?.tokenId).toBe('003');
      expect(genome?.matchesPlayed).toBe(1);
    });
  });
});
