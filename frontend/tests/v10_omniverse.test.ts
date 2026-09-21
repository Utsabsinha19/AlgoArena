import { describe, it, expect, beforeEach } from 'vitest';
import { GaussianSplatRenderer } from '../src/engine/gpu/GaussianSplatRenderer';
import { SwarmCognitiveTree } from '../src/engine/ai/SwarmCognitiveTree';
import { PhotonicMeshSolver } from '../src/engine/quantum/PhotonicMeshSolver';
import { ClosedLoopBCIEngine } from '../src/engine/bci/ClosedLoopBCIEngine';
import { evmContractAdapter, EVMContractAdapter } from '../src/engine/web3/EVMContractAdapter';

describe('AlgoArena v10.0 Omniverse Platform Verification', () => {

  // ==========================================================================
  // 1. WebGPU 3D Gaussian Splatting Photorealistic Arena
  // ==========================================================================
  describe('GaussianSplatRenderer', () => {
    let renderer: GaussianSplatRenderer;

    beforeEach(() => {
      renderer = new GaussianSplatRenderer();
    });

    it('should generate synthetic Gaussian splats with correct buffer headers', () => {
      const count = 500;
      const header = GaussianSplatRenderer.generateSyntheticSplats(count);
      expect(header.numSplats).toBe(count);
      expect(header.positions.length).toBe(count * 3);
      expect(header.scales.length).toBe(count * 3);
      expect(header.rotations.length).toBe(count * 4);
      expect(header.colors.length).toBe(count * 4);
    });

    it('should initialize GPU storage buffer and render splat scene', async () => {
      const header = GaussianSplatRenderer.generateSyntheticSplats(100);
      let allocatedSize = 0;

      const mockDevice = {
        createBuffer: (desc: { size: number; usage: number }) => {
          allocatedSize = desc.size;
          return { size: desc.size, destroy: () => {} };
        }
      };

      await renderer.initialize(mockDevice, header);
      expect(renderer.isInitialized()).toBe(true);
      expect(renderer.getSplatCount()).toBe(100);
      expect(allocatedSize).toBeGreaterThan(0);

      let drawnInstances = 0;
      const mockPassEncoder = {
        draw: (_verts: number, instances?: number) => {
          drawnInstances = instances || 0;
        }
      };

      renderer.renderSplatScene(mockPassEncoder);
      expect(drawnInstances).toBeGreaterThan(0);
    });

    it('should sort splats by depth relative to camera position', () => {
      const header = GaussianSplatRenderer.generateSyntheticSplats(50);
      const mockDevice = {
        createBuffer: (desc: { size: number; usage: number }) => ({ size: desc.size })
      };
      renderer.initialize(mockDevice, header);

      const indices = renderer.sortSplatsByDepth([0, 0, 10]);
      expect(indices.length).toBe(50);
      // Valid permutation of indices 0..49
      const set = new Set(indices);
      expect(set.size).toBe(50);
    });
  });

  // ==========================================================================
  // 2. LLM-Driven Swarm Cognitive Behavior Trees
  // ==========================================================================
  describe('SwarmCognitiveTree', () => {
    let tree: SwarmCognitiveTree;

    beforeEach(() => {
      tree = new SwarmCognitiveTree();
    });

    it('should negotiate spatial chokepoints and grant priority to low-energy agent', () => {
      const agentA = {
        agentId: 'Drone-Alpha',
        position: [10, 10, 0] as [number, number, number],
        currentPath: [],
        batteryEnergy: 18.5,
        threatLevel: 0.1
      };
      const agentB = {
        agentId: 'Drone-Beta',
        position: [11, 10, 0] as [number, number, number],
        currentPath: [],
        batteryEnergy: 92.0,
        threatLevel: 0.4
      };

      const outcome = tree.negotiateChokepoint(agentA, agentB);
      // Agent A has critically low battery (18.5%), so Agent B must yield
      expect(outcome.yieldAgentId).toBe('Drone-Beta');
      expect(outcome.reason).toContain('Priority right-of-way');
    });

    it('should form tactical convoy alliances with aerodynamic efficiency gains', () => {
      const agents = [
        { agentId: 'Drone-1', position: [0, 0, 0] as [number, number, number], currentPath: [], batteryEnergy: 70, threatLevel: 0.1 },
        { agentId: 'Drone-2', position: [1, 0, 0] as [number, number, number], currentPath: [], batteryEnergy: 95, threatLevel: 0.05 },
        { agentId: 'Drone-3', position: [2, 0, 0] as [number, number, number], currentPath: [], batteryEnergy: 60, threatLevel: 0.2 }
      ];

      const alliance = tree.formConvoyAlliance(agents);
      expect(alliance.convoyId).toContain('CONVOY-');
      expect(alliance.leaderId).toBe('Drone-2'); // Highest energy + lowest threat
      expect(alliance.memberIds.length).toBe(3);
      expect(alliance.efficiencyGain).toBeGreaterThan(1.0);
    });

    it('should evaluate threat hazard proximity and recommend evasive maneuvers', () => {
      const agent = {
        agentId: 'Scout-7',
        position: [5, 5, 0] as [number, number, number],
        currentPath: [],
        batteryEnergy: 80,
        threatLevel: 0.0
      };

      // Hazard at [5, 6, 0], distance = 1.0, hazard radius = 2.0 -> inside hazard
      const resHalt = tree.evaluateThreatHazard(agent, [5, 6, 0], 2.0);
      expect(resHalt.mustDetour).toBe(true);
      expect(resHalt.recommendedAction).toBe('HALT');

      // Hazard at [5, 8, 0], distance = 3.0, radius = 2.0 (dist <= 3.6) -> evade
      const resEvade = tree.evaluateThreatHazard(agent, [5, 8, 0], 2.0);
      expect(resEvade.mustDetour).toBe(true);
      expect(resEvade.recommendedAction).toBe('EVADE');

      // Hazard far away
      const resContinue = tree.evaluateThreatHazard(agent, [5, 30, 0], 2.0);
      expect(resContinue.mustDetour).toBe(false);
      expect(resContinue.recommendedAction).toBe('CONTINUE');
    });
  });

  // ==========================================================================
  // 3. Quantum-Classical Photonic Mesh Solver
  // ==========================================================================
  describe('PhotonicMeshSolver', () => {
    let solver: PhotonicMeshSolver;

    beforeEach(() => {
      solver = new PhotonicMeshSolver(32);
    });

    it('should simulate optical interference and extract constructive peak shortest path', () => {
      const path = solver.simulateOpticalInterference(0, 31);
      expect(path.length).toBeGreaterThanOrEqual(2);
      expect(path[0]).toBe(0);
      expect(path[path.length - 1]).toBe(31);
    });

    it('should calculate physical optical propagation delay and phase coherence', () => {
      const telemetry = solver.solveWithTelemetry(0, 20);
      expect(telemetry.startNode).toBe(0);
      expect(telemetry.targetNode).toBe(20);
      expect(telemetry.opticalDelayPs).toBeGreaterThan(0);
      expect(telemetry.opticalDelayPs).toBeLessThan(1.0); // Sub-picosecond propagation
      expect(telemetry.coherenceRatio).toBeGreaterThan(0.7);
      expect(telemetry.throughputPathsPerSec).toBeGreaterThan(100);
    });

    it('should configure and retrieve waveguide phase shifters', () => {
      solver.setPhaseShift(4, 9, Math.PI / 4);
      expect(solver.getPhaseShift(4, 9)).toBeCloseTo(Math.PI / 4);
      expect(solver.getPhaseShift(0, 1)).toBe(0.0);
    });
  });

  // ==========================================================================
  // 4. Closed-Loop BCI Adaptive Mutation Engine
  // ==========================================================================
  describe('ClosedLoopBCIEngine', () => {
    let bci: ClosedLoopBCIEngine;

    beforeEach(() => {
      bci = new ClosedLoopBCIEngine(0.65);
    });

    it('should reduce mutation rate during high cognitive workload to ease stress', () => {
      // theta = 1.2, beta = 0.8 -> workload = 1.5 > target (0.65) + 0.15 = 0.80
      const newRate = bci.calculateAdaptiveMutationRate(1.2, 0.8, 0.10);
      expect(newRate).toBeLessThan(0.10);
      expect(newRate).toBeCloseTo(0.10 * 0.85);
    });

    it('should boost mutation rate during low cognitive workload to introduce challenge', () => {
      // theta = 0.2, beta = 1.0 -> workload = 0.20 < target (0.65) - 0.15 = 0.50
      const newRate = bci.calculateAdaptiveMutationRate(0.2, 1.0, 0.10);
      expect(newRate).toBeGreaterThan(0.10);
      expect(newRate).toBeCloseTo(0.10 * 1.25);
    });

    it('should maintain current mutation rate during optimal flow-state', () => {
      // theta = 0.65, beta = 1.0 -> workload = 0.65 (equilibrium)
      const newRate = bci.calculateAdaptiveMutationRate(0.65, 1.0, 0.10);
      expect(newRate).toBe(0.10);
    });

    it('should evaluate cognitive workload and return correct zone diagnosis', () => {
      const highStress = bci.evaluateCognitiveWorkload(1.4, 0.7, 0.05);
      expect(highStress.zone).toBe('HIGH_STRESS_OVERLOAD');
      expect(highStress.recommendation).toContain('stress');

      const flow = bci.evaluateCognitiveWorkload(0.65, 1.0, 0.05);
      expect(flow.zone).toBe('FLOW_STATE');

      const boredom = bci.evaluateCognitiveWorkload(0.1, 1.2, 0.05);
      expect(boredom.zone).toBe('LOW_AROUSAL_BOREDOM');
    });
  });

  // ==========================================================================
  // 5. On-Chain Zero-Knowledge ML Verification (zk-ML)
  // ==========================================================================
  describe('zk-ML On-Chain Verification', () => {
    it('should submit and verify authentic zk-ML neural pathfinding proof', async () => {
      const matchHash = '0xMATCH_HASH_7791A';
      const proof = EVMContractAdapter.generateMockZkMLProof(35, 10);

      const outcome = await evmContractAdapter.submitVerifiedZkMLMatch(matchHash, proof);
      expect(outcome.verified).toBe(true);
      expect(outcome.matchHash).toBe(matchHash);
      expect(outcome.txHash).toContain('0xzkML_');

      expect(evmContractAdapter.isMatchZkMLVerified(matchHash)).toBe(true);

      const recorded = evmContractAdapter.getZkMLVerifiedMatch(matchHash);
      expect(recorded).not.toBeNull();
      expect(recorded!.matchHash).toBe(matchHash);
    });

    it('should reject tampered zk-ML proof violating cost-to-steps constraint', async () => {
      const matchHash = '0xTAMPERED_MATCH';
      const proof = EVMContractAdapter.generateMockZkMLProof(500, 5); // 500 > 5 * 10 = 50

      await expect(
        evmContractAdapter.submitVerifiedZkMLMatch(matchHash, proof)
      ).rejects.toThrow('neural constraint violation');
    });

    it('should reject malformed zk-ML proof with invalid parameter lengths', async () => {
      const malformedProof = {
        a: ['0x1'] as unknown as [string, string],
        b: [] as unknown as [[string, string], [string, string]],
        c: ['0x2'] as unknown as [string, string],
        input: ['10', '2'] as [string, string]
      };

      await expect(
        evmContractAdapter.submitVerifiedZkMLMatch('0xBAD_PROOF', malformedProof)
      ).rejects.toThrow('malformed');
    });
  });
});
