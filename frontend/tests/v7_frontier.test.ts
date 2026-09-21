// ============================================================================
// AlgoArena v7.0 - Frontier Labs Verification Test Suite
// WebGPU Parallel Compute Grid, Generative LLM Level Architect,
// Web Bluetooth BCI Neural Interface, Quantum Annealer & Web3 NFT DNA
// ============================================================================

import { describe, test, expect, beforeEach } from 'vitest';
import { WebGPUComputeGrid, PATHFINDING_WGSL } from '../src/engine/compute/WebGPUComputeGrid';
import { GenerativeLevelArchitect, GENERATIVE_LEVEL_PRESETS } from '../src/engine/ai/GenerativeLevelArchitect';
import { BCINeuralInterface } from '../src/engine/bci/BCINeuralInterface';
import { QuantumAnnealingPathfinder } from '../src/engine/quantum/QuantumAnnealingPathfinder';
import { EVMContractAdapter } from '../src/engine/web3/EVMContractAdapter';

describe('AlgoArena v7.0 Frontier Labs Verification', () => {
  // --------------------------------------------------------------------------
  // 1. WebGPU Parallel Compute Grid
  // --------------------------------------------------------------------------
  describe('WebGPU Parallel Compute Grid', () => {
    let computeGrid: WebGPUComputeGrid;

    beforeEach(() => {
      computeGrid = new WebGPUComputeGrid();
    });

    test('initializes and reports pipeline status', async () => {
      await computeGrid.initialize();
      const status = computeGrid.getPipelineStatus();
      expect(status.initialized).toBe(true);
      expect(typeof status.nativeWebGPU).toBe('boolean');
    });

    test('contains valid WGSL compute shader definitions', () => {
      expect(PATHFINDING_WGSL).toContain('struct Cell');
      expect(PATHFINDING_WGSL).toContain('@compute @workgroup_size(16, 16)');
      expect(PATHFINDING_WGSL).toContain('grid[index].visited = 1u');
    });

    test('executes parallel wavefront propagation across grid cells', async () => {
      await computeGrid.initialize();
      const telemetry = await computeGrid.runComputeWavefront(50, 50, 20);

      expect(telemetry.totalCells).toBe(2500);
      expect(telemetry.wavefrontSteps).toBeGreaterThan(0);
      expect(telemetry.cellsVisited).toBeGreaterThan(1);
      expect(telemetry.executionTimeMs).toBeGreaterThan(0);
      expect(telemetry.throughputNodesPerSec).toBeGreaterThan(0);
      expect(telemetry.hardwareBackend).toBeDefined();
    });

    test('scales to high-density 500x500 grid execution', async () => {
      await computeGrid.initialize();
      const telemetry = await computeGrid.runComputeWavefront(500, 500, 15);

      expect(telemetry.totalCells).toBe(250000);
      expect(telemetry.cellsVisited).toBeGreaterThan(50);
      expect(telemetry.wavefrontSteps).toBe(15);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Generative LLM Level Architect
  // --------------------------------------------------------------------------
  describe('Generative LLM Level Architect', () => {
    let architect: GenerativeLevelArchitect;

    beforeEach(() => {
      architect = new GenerativeLevelArchitect();
    });

    test('provides comprehensive preset prompt library', () => {
      expect(GENERATIVE_LEVEL_PRESETS.length).toBeGreaterThanOrEqual(4);
      const cyberpunkPreset = GENERATIVE_LEVEL_PRESETS.find((p) => p.id === 'cyberpunk_labyrinth');
      expect(cyberpunkPreset).toBeDefined();
      expect(cyberpunkPreset?.prompt).toContain('cyberpunk');
    });

    test('synthesizes cyberpunk level schema with custom theme palette and plasma rivers', async () => {
      const schema = await architect.generateLevelFromPrompt({
        userPrompt: 'Build a cyberpunk labyrinth with high-cost plasma rivers and local minima traps',
        dimensions: [30, 30],
        difficultyMultiplier: 1.5,
      });

      expect(schema.mapName).toContain('CyberpunkLabyrinth');
      expect(schema.obstacleIndices.length).toBeGreaterThan(0);
      expect(schema.themePalette.primary).toBe('#00f3ff');
      expect(schema.themePalette.secondary).toBe('#ff007f');
      expect(schema.themePalette.plasma).toBe('#ffe600');
      expect(schema.metadata.wallDensity).toBeGreaterThan(0);

      // Start and goal nodes must be preserved
      const width = 30;
      const startIndex = schema.startNode[1] * width + schema.startNode[0];
      const goalIndex = schema.goalNode[1] * width + schema.goalNode[0];
      expect(schema.obstacleIndices).not.toContain(startIndex);
      expect(schema.obstacleIndices).not.toContain(goalIndex);
    });

    test('synthesizes volcanic caldera with molten lava high-cost terrain', async () => {
      const schema = await architect.generateLevelFromPrompt({
        userPrompt: 'Sculpt a volcanic caldera with winding molten lava streams and basalt walls',
        dimensions: [25, 25],
        difficultyMultiplier: 1.0,
      });

      expect(schema.metadata.archetype).toBe('Volcanic Caldera');
      expect(schema.themePalette.primary).toBe('#f97316');

      // Check for dynamic high-cost terrain (> 10.0)
      let foundHighCost = false;
      for (let i = 0; i < schema.terrainWeightMap.length; i++) {
        if (schema.terrainWeightMap[i] > 10.0 && isFinite(schema.terrainWeightMap[i])) {
          foundHighCost = true;
          break;
        }
      }
      expect(foundHighCost).toBe(true);
    });

    test('converts generated level schema into valid AlgoArena GridState', async () => {
      const schema = await architect.generateLevelFromPrompt({
        userPrompt: 'Create a neural fortress with blast gates',
        dimensions: [20, 20],
        difficultyMultiplier: 1.0,
      });

      const gridState = architect.schemaToGridState(schema, 20, 20);
      expect(gridState.width).toBe(20);
      expect(gridState.height).toBe(20);
      expect(gridState.start).toEqual({ x: schema.startNode[0], y: schema.startNode[1] });
      expect(gridState.end).toEqual({ x: schema.goalNode[0], y: schema.goalNode[1] });
      expect(gridState.cells[schema.startNode[1]][schema.startNode[0]].type).toBe('start');
      expect(gridState.cells[schema.goalNode[1]][schema.goalNode[0]].type).toBe('end');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Web Bluetooth BCI Neural Interface
  // --------------------------------------------------------------------------
  describe('Web Bluetooth BCI Neural Interface', () => {
    let bci: BCINeuralInterface;

    beforeEach(() => {
      bci = new BCINeuralInterface();
    });

    test('initializes with default focus and frequency metrics', () => {
      const telemetry = bci.getTelemetry();
      expect(telemetry.focusLevel).toBeGreaterThanOrEqual(0);
      expect(telemetry.focusLevel).toBeLessThanOrEqual(100);
      expect(telemetry.alphaWave).toBeGreaterThan(0);
      expect(telemetry.betaWave).toBeGreaterThan(0);
      expect(telemetry.thetaWave).toBeGreaterThan(0);
    });

    test('calculates dynamic heuristic weight according to specification', () => {
      // Formula: w = 0.5 + (focus / 100) * 2.0
      bci.setManualFocusLevel(100);
      expect(bci.getDynamicHeuristicWeight()).toBe(2.5);

      bci.setManualFocusLevel(0);
      expect(bci.getDynamicHeuristicWeight()).toBe(0.5);

      bci.setManualFocusLevel(50);
      expect(bci.getDynamicHeuristicWeight()).toBe(1.5);
    });

    test('notifies subscribers on telemetry updates', () => {
      let receivedFocus = -1;
      const unsubscribe = bci.subscribe((telem) => {
        receivedFocus = telem.focusLevel;
      });

      bci.setManualFocusLevel(85);
      expect(receivedFocus).toBe(85);
      unsubscribe();
    });

    test('activates virtual BCI stream and disconnects cleanly', () => {
      bci.activateVirtualBCI('Test Virtual Headset');
      let telem = bci.getTelemetry();
      expect(telem.signalQuality).toBe('optimal');
      expect(telem.connectedDevice).toBe('Test Virtual Headset');

      bci.disconnect();
      telem = bci.getTelemetry();
      expect(telem.signalQuality).toBe('disconnected');
      expect(telem.connectedDevice).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // 4. Quantum-Inspired Annealing Pathfinder
  // --------------------------------------------------------------------------
  describe('Quantum-Inspired Annealing Pathfinder', () => {
    test('calculates Ising Hamiltonian energy correctly', () => {
      const annealer = new QuantumAnnealingPathfinder(4);
      const spins = new Int8Array([1, 1, 1, 1]);
      const costMatrix = new Float32Array([2.0, 3.0, 4.0, 5.0]);

      // Energy = sum(h_i * s_i) = 2 + 3 + 4 + 5 = 14 (gridWidth omitted)
      const energy = annealer.calculateIsingEnergy(spins, costMatrix);
      expect(energy).toBe(14.0);
    });

    test('simulates quantum annealing convergence and reduces energy', () => {
      const numQubits = 64;
      const annealer = new QuantumAnnealingPathfinder(numQubits, {
        initialTemperature: 100.0,
        coolingRate: 0.95,
        maxIterations: 1000,
      });

      const costMatrix = new Float32Array(numQubits);
      for (let i = 0; i < numQubits; i++) {
        costMatrix[i] = 1.0 + Math.random() * 10.0;
      }

      const telemetry = annealer.solveWithTelemetry(costMatrix, 8);

      expect(telemetry.route).toBeDefined();
      expect(telemetry.initialEnergy).toBeDefined();
      expect(telemetry.finalEnergy).toBeLessThanOrEqual(telemetry.initialEnergy);
      expect(telemetry.totalFlips).toBeGreaterThan(0);
      expect(telemetry.acceptedFlips).toBeGreaterThan(0);
      expect(telemetry.energyHistory.length).toBeGreaterThan(1);
    });

    test('solveOptimalRoute extracts active route indices', () => {
      const annealer = new QuantumAnnealingPathfinder(16);
      const costMatrix = new Float32Array(16).fill(1.0);

      const route = annealer.solveOptimalRoute(costMatrix, 4);
      expect(Array.isArray(route)).toBe(true);
      for (const idx of route) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(16);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Decentralized Web3 Smart Contracts & NFT DNA
  // --------------------------------------------------------------------------
  describe('Decentralized Web3 Smart Contracts & NFT DNA', () => {
    let adapter: EVMContractAdapter;

    beforeEach(() => {
      adapter = new EVMContractAdapter();
    });

    test('connects to Web3 wallet provider or testnet fallback', async () => {
      const address = await adapter.connectWallet(true);
      expect(address).toBeDefined();
      expect(address?.startsWith('0x')).toBe(true);
      expect(adapter.getUserAddress()).toBe(address);
      expect(adapter.getNetwork()).toBe('Arbitrum One');
    });

    test('generates deterministic chromosome hash for algorithm traits', () => {
      const hash1 = adapter.generateChromosomeHash('A_STAR_TEST', 95, 98, 1850);
      const hash2 = adapter.generateChromosomeHash('A_STAR_TEST', 95, 98, 1850);
      const hash3 = adapter.generateChromosomeHash('DIJKSTRA_TEST', 70, 100, 1700);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1.startsWith('0xDNA_')).toBe(true);
    });

    test('mints algorithm DNA as an on-chain NFT collectible card', async () => {
      await adapter.connectWallet(true);
      const initialCount = adapter.getMintedCollection().length;

      const { txHash, nft } = await adapter.mintAlgorithmDNA({
        tokenId: '999',
        name: 'Quantum A* Test Paragon',
        algorithmType: 'astar',
        chromosomeHash: '0xDNA_TEST_HASH',
        speedRating: 98,
        accuracyRating: 99,
        eloScore: 1920,
        rarity: 'Quantum Mythic',
        generation: 1,
        mutationRate: 0.01,
      });

      expect(txHash.startsWith('0x')).toBe(true);
      expect(nft.tokenId).toBe('999');
      expect(nft.rarity).toBe('Quantum Mythic');
      expect(adapter.getMintedCollection().length).toBe(initialCount + 1);
    });

    test('verifies tournament prize pool smart contract on Arbitrum', async () => {
      const pool = await adapter.verifyPrizePoolContract('0xArbitrum_Contract_777');
      expect(pool.isVerified).toBe(true);
      expect(pool.prizePoolEth).toBeGreaterThan(0);
      expect(pool.network).toBe('Arbitrum One');
    });
  });
});
