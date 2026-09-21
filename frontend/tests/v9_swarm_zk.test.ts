import { describe, it, expect, beforeEach } from 'vitest';
import { HierarchicalSwarmEngine } from '../src/engine/swarm/HierarchicalSwarmEngine';
import { WebGPUWFCGenerator, WFC_GENERATOR_WGSL } from '../src/engine/gpu/WebGPUWFCGenerator';
import { ZeroKnowledgeVerifier } from '../src/engine/zk/ZeroKnowledgeVerifier';
import { evmContractAdapter } from '../src/engine/web3/EVMContractAdapter';

describe('AlgoArena v9.0 Autonomous Swarm Meta-Engine & Zero-Knowledge Platform', () => {

  // ==========================================================================
  // 1. Hierarchical Multi-Agent Swarm Intelligence (H-MAPF + A3C)
  // ==========================================================================
  describe('HierarchicalSwarmEngine', () => {
    let engine: HierarchicalSwarmEngine;

    beforeEach(() => {
      engine = new HierarchicalSwarmEngine([100, 100, 30]);
    });

    it('should register a swarm agent with correct spatial cluster ID', () => {
      const agent = engine.registerSwarmAgent(1, [15, 25, 5], [90, 90, 20]);
      expect(agent.id).toBe(1);
      expect(agent.activeState).toBe('NAVIGATING');
      expect(agent.position).toEqual([15, 25, 5]);

      // 10x10x10 cluster: cx=1, cy=2, cz=0 -> clusterId = cz*(cX*cY) + cy*cX + cx = 0 + 2*10 + 1 = 21
      expect(agent.clusterId).toBe(21);

      const telem = engine.getSwarmTelemetry();
      expect(telem.totalAgents).toBe(1);
      expect(telem.activeClusters).toBe(1);
    });

    it('should scale and spawn batch of 5,000+ agents', () => {
      const count = engine.spawnSwarmBatch(5000);
      expect(count).toBe(5000);

      const telem = engine.getSwarmTelemetry();
      expect(telem.totalAgents).toBe(5000);
      expect(telem.activeClusters).toBeGreaterThan(0);
    });

    it('should step swarm physics delta and update positions & clusters', () => {
      engine.registerSwarmAgent(1, [5, 5, 5], [50, 50, 50]);
      const initialPos = [...engine.getAgent(1)!.position];

      const stats = engine.stepSwarmPhysicsDelta(50);
      expect(stats.activeAgents).toBe(1);

      const updatedAgent = engine.getAgent(1)!;
      expect(updatedAgent.position[0]).toBeGreaterThan(initialPos[0]);
      expect(updatedAgent.position[1]).toBeGreaterThan(initialPos[1]);
      expect(updatedAgent.position[2]).toBeGreaterThan(initialPos[2]);
    });

    it('should transition agent to IDLE state when target is reached', () => {
      engine.registerSwarmAgent(1, [10, 10, 10], [10.2, 10.1, 10.1]);
      // Distance < 0.5
      engine.stepSwarmPhysicsDelta(16.67);
      const agent = engine.getAgent(1)!;
      expect(agent.activeState).toBe('IDLE');
    });

    it('should reset all agents and clusters cleanly', () => {
      engine.spawnSwarmBatch(100);
      expect(engine.getSwarmTelemetry().totalAgents).toBe(100);
      engine.reset();
      expect(engine.getSwarmTelemetry().totalAgents).toBe(0);
      expect(engine.getSwarmTelemetry().activeClusters).toBe(0);
    });
  });

  // ==========================================================================
  // 2. WebGPU Parallel Wave Function Collapse (WFC) Generator
  // ==========================================================================
  describe('WebGPU Parallel WFC Level Generator', () => {
    let wfc: WebGPUWFCGenerator;

    beforeEach(() => {
      wfc = new WebGPUWFCGenerator();
    });

    it('should contain valid WGSL compute shader code with bitmask operations', () => {
      expect(WFC_GENERATOR_WGSL).toContain('struct WFCParams');
      expect(WFC_GENERATOR_WGSL).toContain('fn countOneBits');
      expect(WFC_GENERATOR_WGSL).toContain('fn firstTrailingBit');
      expect(WFC_GENERATOR_WGSL).toContain('@compute @workgroup_size(8, 8, 1)');
    });

    it('should generate collapsed grid using parallel CPU fallback', async () => {
      const { collapsedGrid, telemetry } = await wfc.generate({
        gridSizeX: 16,
        gridSizeY: 16,
        gridSizeZ: 1,
        numTileTypes: 4,
        entropySeed: 98765
      });

      expect(collapsedGrid.length).toBe(256);
      expect(telemetry.totalCells).toBe(256);
      expect(telemetry.collapsedCells).toBe(256);
      expect(telemetry.dimensions).toEqual([16, 16, 1]);

      for (let i = 0; i < collapsedGrid.length; i++) {
        expect(collapsedGrid[i]).toBeGreaterThanOrEqual(0);
        expect(collapsedGrid[i]).toBeLessThan(4);
      }
    });

    it('should convert collapsed grid to pathfinding maze obstacles without blocking start/end', () => {
      const { collapsedGrid } = wfc.generateCPU({
        gridSizeX: 10,
        gridSizeY: 10,
        gridSizeZ: 1,
        numTileTypes: 3,
        entropySeed: 443322
      });

      const obstacles = wfc.convertToObstacles(collapsedGrid, [10, 10], 1);
      expect(Array.isArray(obstacles)).toBe(true);

      // Verify (0,0) and (9,9) are never blocked
      const blocksStart = obstacles.some(([x, y]) => x === 0 && y === 0);
      const blocksEnd = obstacles.some(([x, y]) => x === 9 && y === 9);
      expect(blocksStart).toBe(false);
      expect(blocksEnd).toBe(false);
    });
  });

  // ==========================================================================
  // 3. Zero-Knowledge Proofs of Execution (zk-SNARKs / Groth16)
  // ==========================================================================
  describe('ZeroKnowledgeVerifier', () => {
    let verifier: ZeroKnowledgeVerifier;

    beforeEach(() => {
      verifier = new ZeroKnowledgeVerifier({ circuit: 'RaceIntegrityBN128' });
    });

    it('should verify authentic Groth16 BN128 proof payload', async () => {
      const proof = ZeroKnowledgeVerifier.generateMockRaceProof(45, 12, 'A_STAR');
      const isValid = await verifier.verifyAlgorithmRaceProof(proof);
      expect(isValid).toBe(true);

      const details = await verifier.verifyWithDetails(proof);
      expect(details.isValid).toBe(true);
      expect(details.curve).toBe('bn128');
      expect(details.claimedCost).toBe(45);
      expect(details.claimedSteps).toBe(12);
    });

    it('should reject tampered proof violating cost-to-steps bounds', async () => {
      const proof = ZeroKnowledgeVerifier.generateMockRaceProof(500, 10, 'A_STAR');
      // cost 500 > steps (10) * 10 = 100 -> violates constraint
      const isValid = await verifier.verifyAlgorithmRaceProof(proof);
      expect(isValid).toBe(false);

      const details = await verifier.verifyWithDetails(proof);
      expect(details.isValid).toBe(false);
      expect(details.message).toContain('failed');
    });

    it('should reject malformed proof payloads', async () => {
      const malformedProof = {
        pi_a: ['0x1'],
        pi_b: [],
        pi_c: [],
        publicSignals: []
      };
      const isValid = await verifier.verifyAlgorithmRaceProof(malformedProof);
      expect(isValid).toBe(false);
    });
  });

  // ==========================================================================
  // 4. Cross-Chain Autonomous DAO Engine & AMM Staking
  // ==========================================================================
  describe('AlgoArenaDAO & EVMContractAdapter', () => {
    it('should create new tournament and place spectator stakes', async () => {
      const tourneyId = await evmContractAdapter.createDAOTournament(
        'Autonomous World Cup Grand Finals',
        2000000000000000000n // 2 ETH
      );

      const tourney = evmContractAdapter.getDAOTournament(tourneyId);
      expect(tourney).not.toBeNull();
      expect(tourney!.name).toBe('Autonomous World Cup Grand Finals');
      expect(tourney!.prizePool).toBe(2000000000000000000n);
      expect(tourney!.isCompleted).toBe(false);

      // Place stake of 1 ETH
      const staked = await evmContractAdapter.placeDAOStake(tourneyId, 1000000000000000000n);
      expect(staked).toBe(true);

      const updatedTourney = evmContractAdapter.getDAOTournament(tourneyId);
      expect(updatedTourney!.prizePool).toBe(3000000000000000000n); // 2 ETH + 1 ETH = 3 ETH
    });

    it('should finalize tournament and distribute AMM pool to winner', async () => {
      const tourneyId = await evmContractAdapter.createDAOTournament(
        'Championship Match',
        1000000000000000000n
      );

      const winnerAddress = '0xAlgoWinner8812...C09';
      const outcome = await evmContractAdapter.finalizeDAOTournament(tourneyId, winnerAddress);

      expect(outcome.winner).toBe(winnerAddress);
      expect(outcome.payout).toBe(1000000000000000000n);

      const finalized = evmContractAdapter.getDAOTournament(tourneyId)!;
      expect(finalized.isCompleted).toBe(true);
      expect(finalized.winner).toBe(winnerAddress);

      // Placing stakes on completed tournament should be rejected
      await expect(
        evmContractAdapter.placeDAOStake(tourneyId, 500000000000000000n)
      ).rejects.toThrow('Tournament completed');
    });
  });
});
