import { describe, it, expect, beforeEach } from 'vitest';
import { NonEuclideanGraphSolver, HyperbolicNode } from '../src/engine/spatial/NonEuclideanGraphSolver';
import { BioOpticalSwarmInterface, PlayerBrainwaveStream } from '../src/engine/bci/BioOpticalSwarmInterface';
import { InterstellarMeshRouter, SatelliteNode } from '../src/engine/space/InterstellarMeshRouter';
import { evmContractAdapter, EVMContractAdapter } from '../src/engine/web3/EVMContractAdapter';
import { SelfReplicatingCodeMorpher } from '../src/engine/ai/SelfReplicatingCodeMorpher';

describe('AlgoArena v13.0 Holographic Non-Euclidean Multiverse & Quantum-Bio Singularity', () => {

  // ==========================================================================
  // 1. Multi-Dimensional Non-Euclidean Poincaré Spatial Solver
  // ==========================================================================
  describe('NonEuclideanGraphSolver', () => {
    let solver: NonEuclideanGraphSolver;

    beforeEach(() => {
      solver = new NonEuclideanGraphSolver();
    });

    it('should initialize with default hyperbolic topology nodes', () => {
      expect(solver.getNodeCount()).toBeGreaterThanOrEqual(4);
      const nodes = solver.getAllNodes();
      expect(nodes.length).toBeGreaterThanOrEqual(4);
      const origin = solver.getNode(0);
      expect(origin).toBeDefined();
      expect(origin?.coords).toEqual([0, 0, 0]);
      expect(origin?.curvatureK).toBe(-1.0);
    });

    it('should compute exact Poincaré ball hyperbolic distance metric', () => {
      const u: HyperbolicNode = { id: 100, coords: [0, 0, 0], neighbors: [], curvatureK: -1 };
      const v: HyperbolicNode = { id: 101, coords: [0.5, 0, 0], neighbors: [], curvatureK: -1 };

      // Theoretical: delta = 1 + 2*(0.25)/((1-0)*(1-0.25)) = 1 + 0.5/0.75 = 5/3
      // arcosh(5/3) = ~1.0986
      const dist = solver.calculateHyperbolicDistance(u, v);
      expect(dist).toBeCloseTo(1.0986, 2);
    });

    it('should execute Hyperbolic A* search on negative curvature manifold', () => {
      const result = solver.runHyperbolicAStar(0, 10);
      expect(result.path.length).toBeGreaterThanOrEqual(2);
      expect(result.path[0]).toBe(0);
      expect(result.path[result.path.length - 1]).toBe(10);
      expect(result.hyperbolicLength).toBeGreaterThan(0);
      expect(result.nodesEvaluated).toBeGreaterThan(0);
      expect(result.curvatureProfile).toBe(-1.0);
    });

    it('should return zero distance for identical start and goal nodes', () => {
      const result = solver.runHyperbolicAStar(2, 2);
      expect(result.path).toEqual([2]);
      expect(result.hyperbolicLength).toBe(0);
      expect(result.nodesEvaluated).toBe(1);
    });
  });

  // ==========================================================================
  // 2. Swarm-Mind Bio-Optical Neural Braiding Interface
  // ==========================================================================
  describe('BioOpticalSwarmInterface', () => {
    let bioSwarm: BioOpticalSwarmInterface;

    beforeEach(() => {
      bioSwarm = new BioOpticalSwarmInterface();
    });

    it('should initialize default player brainwave streams', () => {
      expect(bioSwarm.getConnectedPilotCount()).toBe(4);
      const streams = bioSwarm.getAllStreams();
      expect(streams.length).toBe(4);
      expect(streams[0].playerId).toBe('Pilot_Alpha_01');
    });

    it('should calculate collective coherence weighted by gamma burst activity', () => {
      const coherence = bioSwarm.computeCollectiveCoherence();
      expect(coherence).toBeGreaterThan(0);
      expect(coherence).toBeLessThanOrEqual(1.0);
    });

    it('should dynamically modulate swarm formation based on collective coherence', () => {
      // High coherence focus (> 0.8) -> DELTA_VEE
      const highFormation = bioSwarm.modulateSwarmFormation(0.92);
      expect(highFormation.formationType).toBe('DELTA_VEE');
      expect(highFormation.speedMultiplier).toBe(2.4);
      expect(highFormation.swarmRadius).toBe(2.5);

      // Moderate coherence focus (0.45 to 0.8) -> CIRCULAR_SHIELD
      const midFormation = bioSwarm.modulateSwarmFormation(0.65);
      expect(midFormation.formationType).toBe('CIRCULAR_SHIELD');
      expect(midFormation.speedMultiplier).toBe(1.6);
      expect(midFormation.swarmRadius).toBe(4.8);

      // Low coherence focus (<= 0.45) -> DISPERSED_SURGE
      const lowFormation = bioSwarm.modulateSwarmFormation(0.35);
      expect(lowFormation.formationType).toBe('DISPERSED_SURGE');
      expect(lowFormation.speedMultiplier).toBe(1.0);
      expect(lowFormation.swarmRadius).toBe(8.0);
    });

    it('should connect and disconnect individual player brainwave streams', () => {
      const newStream: PlayerBrainwaveStream = {
        playerId: 'Pilot_Echo_05',
        coherenceIndex: 0.95,
        alphaPeakHz: 11.2,
        gammaBurstPower: 88.0
      };

      bioSwarm.connectStream(newStream);
      expect(bioSwarm.getConnectedPilotCount()).toBe(5);
      expect(bioSwarm.getStream('Pilot_Echo_05')?.coherenceIndex).toBe(0.95);

      const removed = bioSwarm.disconnectStream('Pilot_Echo_05');
      expect(removed).toBe(true);
      expect(bioSwarm.getConnectedPilotCount()).toBe(4);
    });
  });

  // ==========================================================================
  // 3. Interstellar Deep-Space Delay-Tolerant Mesh Router
  // ==========================================================================
  describe('InterstellarMeshRouter', () => {
    let router: InterstellarMeshRouter;

    beforeEach(() => {
      router = new InterstellarMeshRouter();
    });

    it('should initialize default planetary and orbital relay constellation', () => {
      expect(router.getSatelliteCount()).toBeGreaterThanOrEqual(4);
      const earthRelay = router.getSatellite('EARTH_STATION_ALPHA');
      expect(earthRelay).toBeDefined();
      expect(earthRelay?.orbitalPositionKm).toEqual([0, 6378, 0]);
    });

    it('should compute relativistic light-travel propagation delay with Lorentz dilation', () => {
      const src = router.getSatellite('EARTH_STATION_ALPHA')!;
      const dst = router.getSatellite('MOON_GATEWAY_BETA')!;
      
      const delay = router.calculateRelativisticDelay(src, dst);
      // Earth-Moon distance ~384,400 km / 299,792 km/s ~ 1.28 s
      expect(delay).toBeGreaterThan(1.0);
      expect(delay).toBeLessThan(1.6);
    });

    it('should compute delay-tolerant multi-hop routing paths across interplanetary distances', () => {
      const route = router.computeDelayTolerantRoute('EARTH_STATION_ALPHA', 'MARS_ORBITER_GAMMA');
      expect(route.routePath.length).toBeGreaterThanOrEqual(2);
      expect(route.routePath[0]).toBe('EARTH_STATION_ALPHA');
      expect(route.routePath[route.routePath.length - 1]).toBe('MARS_ORBITER_GAMMA');
      expect(route.totalRelativisticDelaySec).toBeGreaterThan(100); // Hundreds of seconds light delay
      expect(route.hops.length).toBe(route.routePath.length - 1);
      expect(route.directEuclideanDistanceKm).toBeGreaterThan(1000000);
    });
  });

  // ==========================================================================
  // 4. Zero-Setup zk-STARK Strategy Verifier (ZkStarkStrategyVerifier.sol)
  // ==========================================================================
  describe('zk-STARK Strategy Verification (EVMContractAdapter)', () => {
    it('should generate valid mock transparent zk-STARK FRI Merkle proofs', () => {
      const matchHash = '0xMATCH_STARK_ALPHA_001';
      const proof = EVMContractAdapter.generateMockZkStarkProof(matchHash);

      expect(proof.friMerkleRoot).toMatch(/^0x/);
      expect(proof.executionTraceRoot).toMatch(/^0x/);
      expect(proof.proofPayload).toContain('STARK_FRI_PROOF');
    });

    it('should submit and verify transparent zk-STARK proofs on-chain', () => {
      const matchHash = '0xMATCH_STARK_TEST_' + Date.now().toString(16);
      const proof = EVMContractAdapter.generateMockZkStarkProof(matchHash);

      const result = evmContractAdapter.submitZkStarkProof(
        matchHash,
        proof.friMerkleRoot,
        proof.executionTraceRoot,
        proof.proofPayload
      );

      expect(result.verified).toBe(true);
      expect(result.txHash).toMatch(/^0xSTARK_TX_/);

      const stored = evmContractAdapter.getZkStarkProof(matchHash);
      expect(stored).not.toBeNull();
      expect(stored?.friMerkleRoot).toBe(proof.friMerkleRoot);
      expect(stored?.executionTraceRoot).toBe(proof.executionTraceRoot);
      expect(stored?.proofPayload).toBe(proof.proofPayload);
    });

    it('should retrieve seeded and submitted zk-STARK proofs', () => {
      const allProofs = evmContractAdapter.getAllZkStarkProofs();
      expect(allProofs.length).toBeGreaterThanOrEqual(1);
      const defaultProof = evmContractAdapter.getZkStarkProof('0xMATCH_MULTIVERSE_HYPERBOLIC_WAR_v13');
      expect(defaultProof).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. Self-Replicating Genetic Code Morph Engine
  // ==========================================================================
  describe('SelfReplicatingCodeMorpher', () => {
    let morpher: SelfReplicatingCodeMorpher;

    beforeEach(() => {
      morpher = new SelfReplicatingCodeMorpher({
        mutationRate: 0.5,
        sandboxIterations: 100
      });
    });

    it('should parse algorithmic code string or JSON into AST representation', () => {
      const ast = morpher.parseStrategyToAST('manhattan heuristic distance evaluation');
      expect(ast.type).toBe('HeuristicBlock');
      expect(ast.children).toBeDefined();
      expect(ast.children!.length).toBeGreaterThanOrEqual(1);
    });

    it('should apply genetic AST mutations across nodes', () => {
      const baseAst = morpher.getTopStrategyAST();
      const { mutated, mutationDescription } = morpher.mutateAST(baseAst, 0.8);

      expect(mutated).toBeDefined();
      expect(mutationDescription).toBeDefined();
      expect(typeof mutationDescription).toBe('string');
    });

    it('should synthesize valid WebAssembly binary bytecode with standard WASM header', () => {
      const ast = morpher.getTopStrategyAST();
      const wasm = morpher.compileASTToWasm(ast);

      expect(wasm).toBeInstanceOf(Uint8Array);
      expect(wasm.length).toBeGreaterThan(8);

      // Verify standard WebAssembly magic bytes: \0asm (0x00, 0x61, 0x73, 0x6d)
      expect(wasm[0]).toBe(0x00);
      expect(wasm[1]).toBe(0x61);
      expect(wasm[2]).toBe(0x73);
      expect(wasm[3]).toBe(0x6d);
      // WASM version 1 (0x01, 0x00, 0x00, 0x00)
      expect(wasm[4]).toBe(0x01);
      expect(wasm[5]).toBe(0x00);
      expect(wasm[6]).toBe(0x00);
      expect(wasm[7]).toBe(0x00);
    });

    it('should evaluate sandbox fitness score within valid bounds [10, 99.9]', () => {
      const ast = morpher.getTopStrategyAST();
      const fitness = morpher.evaluateFitness(ast);

      expect(fitness).toBeGreaterThanOrEqual(10.0);
      expect(fitness).toBeLessThanOrEqual(99.9);
    });

    it('should execute self-replicating morph generation cycle and update history', () => {
      expect(morpher.getCurrentGeneration()).toBe(0);

      const gen1 = morpher.executeMorphGeneration(undefined, 0.6);
      expect(gen1.generation).toBe(1);
      expect(gen1.fitnessScore).toBeGreaterThan(0);
      expect(gen1.wasmBytecode).toBeInstanceOf(Uint8Array);
      expect(gen1.replicatedOffspringCount).toBeGreaterThanOrEqual(1);

      expect(morpher.getCurrentGeneration()).toBe(1);
      const history = morpher.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].generation).toBe(1);
    });
  });
});
