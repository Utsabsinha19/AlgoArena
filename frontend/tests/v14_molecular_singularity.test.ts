import { describe, it, expect, beforeEach } from 'vitest';
import {
  TopologicalMetagraphSolver,
  topologicalMetagraphSolver,
  TopologicalNode,
  BettiNumbers
} from '../src/engine/spatial/TopologicalMetagraphSolver';
import {
  OrganoidBioInterface,
  organoidBioInterface,
  OrganoidMEAReading
} from '../src/engine/bci/OrganoidBioInterface';
import {
  DysonGridEnergyRouter,
  dysonGridEnergyRouter,
  EnergyCollectorNode
} from '../src/engine/space/DysonGridEnergyRouter';
import {
  evmContractAdapter,
  EVMContractAdapter
} from '../src/engine/web3/EVMContractAdapter';
import {
  MolecularDNACompiler,
  molecularDNACompiler
} from '../src/engine/bio/MolecularDNACompiler';

describe('AlgoArena v14.0 Trans-Dimensional Metagraph & Molecular Neuro-Synthetic Singularity', () => {

  // ==========================================================================
  // 1. Trans-Dimensional Topological Metagraph Solvers (TDA)
  // ==========================================================================
  describe('TopologicalMetagraphSolver', () => {
    let solver: TopologicalMetagraphSolver;

    beforeEach(() => {
      solver = new TopologicalMetagraphSolver();
    });

    it('should initialize with default Calabi-Yau simplicial complex nodes', () => {
      const nodes = solver.getAllNodes();
      expect(nodes.length).toBeGreaterThanOrEqual(6);
      const root = solver.getNode(1);
      expect(root).toBeDefined();
      expect(root?.label).toBe('Origin Singular Apex');
      expect(solver.getNode(7)?.label).toContain('Calabi');
    });

    it('should compute persistent homology Betti numbers (betti0, betti1, betti2)', () => {
      const betti: BettiNumbers = solver.computePersistentHomology(0.65);
      expect(betti.betti0).toBeGreaterThanOrEqual(1); // Connected components
      expect(betti.betti1).toBeGreaterThanOrEqual(1); // 1D wormhole tunnels / loops
      expect(betti.betti2).toBeGreaterThanOrEqual(1); // Higher-dimensional cavities
    });

    it('should execute Topological A* pathfinding utilizing Calabi-Yau shortcuts', () => {
      const result = solver.runTopologicalAStar(1, 200);
      expect(result.path.length).toBeGreaterThanOrEqual(2);
      expect(result.path[0]).toBe(1);
      expect(result.path[result.path.length - 1]).toBe(200);
      expect(result.topologicalShortcutsUsed).toBeGreaterThan(0);
      expect(result.bettiProfile.betti0).toBeGreaterThanOrEqual(1);
      expect(result.geodesicDistance).toBeGreaterThan(0);
    });

    it('should handle identical source and target nodes with zero distance', () => {
      const result = solver.runTopologicalAStar(42, 42);
      expect(result.path).toEqual([42]);
      expect(result.geodesicDistance).toBe(0);
      expect(result.topologicalShortcutsUsed).toBe(0);
    });

    it('should allow registering custom simplicial nodes and wormhole bridges', () => {
      const customNode: TopologicalNode = {
        id: 999,
        coords: [1.2, 0.4, -0.8, 0.5],
        label: 'Calabi-Yau Trans-Wormhole Vertex 999'
      };
      solver.registerNode(customNode);

      expect(solver.getNode(999)).toBeDefined();
      expect(solver.getNodeCount()).toBeGreaterThanOrEqual(7);
    });
  });

  // ==========================================================================
  // 2. Synaptic Organoid-in-the-Loop Bio-Computing
  // ==========================================================================
  describe('OrganoidBioInterface', () => {
    let organoid: OrganoidBioInterface;

    beforeEach(() => {
      organoid = new OrganoidBioInterface();
    });

    it('should initialize with 1024-channel MEA cortical culture specification', () => {
      const culture = organoid.getCultureState();
      expect(culture.organoidId).toBe('ORGANOID_CORTICAL_ALPHA_9');
      expect(culture.meaChannels).toBe(1024);
      expect(culture.viabilityScore).toBeGreaterThan(0.95);
      expect(culture.linked).toBe(false);
    });

    it('should connect and disconnect to MEA biochip hardware interface', async () => {
      expect(organoid.isLinked()).toBe(false);
      const connected = await organoid.connectOrganoidArray('MEA-DEVICE-TEST-01');
      expect(connected).toBe(true);
      expect(organoid.isLinked()).toBe(true);
      expect(organoid.getCultureState().deviceAddress).toBe('MEA-DEVICE-TEST-01');

      organoid.disconnectOrganoidArray();
      expect(organoid.isLinked()).toBe(false);
    });

    it('should process multi-electrode spike train readings and compute synchrony', () => {
      const syntheticSpikes = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) {
        syntheticSpikes[i] = i % 10 === 0 ? 0.9 : 0.1;
      }

      const reading: OrganoidMEAReading = organoid.processNeuralCultureFeedback(syntheticSpikes);
      expect(reading.organoidId).toBe('ORGANOID_CORTICAL_ALPHA_9');
      expect(reading.activeElectrodes).toBe(1024);
      expect(reading.firingRateHz).toBeGreaterThan(0);
      expect(reading.burstSynchronyIndex).toBeGreaterThanOrEqual(0.75);
      expect(reading.burstSynchronyIndex).toBeLessThanOrEqual(1.0);
      expect(reading.localFieldPotentialUv).toBeGreaterThan(0);
      expect(reading.dominantThetaDeltaRatio).toBeCloseTo(1.618, 2);
    });

    it('should modulate algorithmic search heuristic via synaptic plasticity (LTP/LTD)', () => {
      const baseHeuristic = 100.0;

      // Positive plasticity (LTP) should sharpen/boost heuristic
      const boosted = organoid.modulateHeuristicWithBiologicalPlasticity(baseHeuristic, 0.4);
      expect(boosted).toBeCloseTo(140.0, 1);

      // Negative plasticity (LTD) should dampen heuristic
      const dampened = organoid.modulateHeuristicWithBiologicalPlasticity(baseHeuristic, -0.3);
      expect(dampened).toBeCloseTo(70.0, 1);

      // Neutral plasticity (0) keeps base heuristic
      const neutral = organoid.modulateHeuristicWithBiologicalPlasticity(baseHeuristic, 0.0);
      expect(neutral).toBe(100.0);
    });
  });

  // ==========================================================================
  // 3. Dyson-Swarm Stellar Energy Router
  // ==========================================================================
  describe('DysonGridEnergyRouter', () => {
    let router: DysonGridEnergyRouter;

    beforeEach(() => {
      router = new DysonGridEnergyRouter();
    });

    it('should initialize with default star-system Dyson swarm collectors', () => {
      const collectors = router.getAllCollectors();
      expect(collectors.length).toBeGreaterThanOrEqual(4);
      const swarmRing = router.getCollector('DYSON_SWARM_NODE_01');
      expect(swarmRing).toBeDefined();
      expect(swarmRing?.energyCapacityTW).toBe(14500);
      expect(swarmRing?.solarDistanceAU).toBe(0.15);
      expect(swarmRing?.orbitalVelocityKmS).toBe(110.5);
    });

    it('should compute thermodynamic optimal energy routing with relativistic Doppler corrections', () => {
      const result = router.computeThermodynamicOptimalPath();
      expect(result.energyPath.length).toBeGreaterThanOrEqual(2);
      expect(result.energyPath[result.energyPath.length - 1]).toBe('DYSON_RECEIVER_MARS_ORBIT');
      expect(result.deliveredPowerTW).toBeGreaterThan(0);
      expect(result.totalTransmissionLossTW).toBeGreaterThan(0);
      expect(result.efficiencyRating).toBeGreaterThanOrEqual(0.90);
      expect(result.relativisiticDopplerShiftZ).toBeGreaterThan(0);
    });

    it('should support dynamic registration of new stellar laser collector nodes', () => {
      const newCollector: EnergyCollectorNode = {
        id: 'KUIPER_RELAY_OMEGA',
        name: 'Kuiper Belt Laser Relay Omega',
        solarDistanceAU: 45.0,
        energyCapacityTW: 25000,
        orbitalVelocityKmS: 4.5
      };

      router.registerCollectorNode(newCollector);
      expect(router.getCollector('KUIPER_RELAY_OMEGA')).toBeDefined();
      expect(router.getAllCollectors().length).toBeGreaterThanOrEqual(5);
    });
  });

  // ==========================================================================
  // 4. Recursive Plonky3 Zero-Knowledge Hyper-Chain Verification
  // ==========================================================================
  describe('Recursive Plonky3 zk-Verification (EVMContractAdapter)', () => {
    it('should generate valid mock recursive Plonky3 FRI batch proofs', () => {
      const seasonRoot = '0xSEASON_14_WORLD_CHAMPIONSHIP';
      const proof = EVMContractAdapter.generateMockPlonk3BatchProof(seasonRoot, 500000);

      expect(proof.seasonRoot).toBe(seasonRoot);
      expect(proof.totalMatches).toBe(500000);
      expect(proof.recursiveProofPayload).toContain('PLONKY3_FRI_RECURSIVE_AGGREGATION_TREE');
    });

    it('should submit and verify Plonky3 batch proof on EVMContractAdapter', () => {
      const seasonRoot = '0xSEASON_PLONK3_TEST_' + Date.now().toString(16);
      const proof = EVMContractAdapter.generateMockPlonk3BatchProof(seasonRoot, 250000);

      const result = evmContractAdapter.submitPlonk3BatchProof(
        seasonRoot,
        proof.totalMatches,
        proof.recursiveProofPayload
      );

      expect(result.verified).toBe(true);
      expect(result.txHash).toMatch(/^0xPLONK3_TX_/);

      const stored = evmContractAdapter.getPlonk3BatchProof(seasonRoot);
      expect(stored).not.toBeNull();
      expect(stored?.seasonRoot).toBe(seasonRoot);
      expect(stored?.totalMatches).toBe(250000);
      expect(stored?.recursiveProofPayload).toBe(proof.recursiveProofPayload);
    });

    it('should retrieve seeded and submitted recursive Plonky3 proofs', () => {
      const allProofs = evmContractAdapter.getAllPlonk3BatchProofs();
      expect(allProofs.length).toBeGreaterThanOrEqual(1);
      const defaultProof = evmContractAdapter.getPlonk3BatchProof('0xSEASON_14_WORLD_CHAMPIONSHIP_HYPER_CHAIN');
      expect(defaultProof).toBeDefined();
      expect(defaultProof?.totalMatches).toBe(1048576);
    });
  });

  // ==========================================================================
  // 5. Self-Synthesizing DNA/RNA Molecular Compute Compiler
  // ==========================================================================
  describe('MolecularDNACompiler', () => {
    let compiler: MolecularDNACompiler;

    beforeEach(() => {
      compiler = new MolecularDNACompiler();
    });

    it('should encode graph vertices and edges into oligonucleotide strands', () => {
      const edges: [number, number][] = [[1, 2], [2, 3]];

      const result = compiler.encodeGraphToDNA(3, edges);
      expect(result.strandSequences.length).toBe(edges.length);
      expect(result.strandsDetailed.length).toBe(edges.length);
      expect(result.microfluidicOpcode).toContain('MIX_CHIP_WELL_A1_TO_B4');
      expect(result.totalBasePairs).toBeGreaterThan(0);
      expect(result.hairpinStabilityKcalMol).toBe(-3.42);
      expect(result.estimatedThermalCycles).toBe(35);
    });

    it('should generate valid Watson-Crick complement sequences', () => {
      const seq = 'ATGC';
      const comp = compiler.getComplement(seq);
      expect(comp).toBe('TACG'); // A->T, T->A, G->C, C->G

      const seq2 = 'AAAA';
      expect(compiler.getComplement(seq2)).toBe('TTTT');
    });

    it('should calculate oligonucleotide melting temperature (Tm) based on GC content', () => {
      // 50% GC content (4 GC out of 8 bases): gcRatio = 0.5
      // Tm = 64.9 + 41 * (0.5 - 0.4) = 64.9 + 4.1 = 69.0
      const strand = 'AATTGGCC';
      const tm = compiler.calculateMeltingTemp(strand);
      expect(tm).toBe(69.0);
    });

    it('should synthesize microfluidic opcodes for automated laboratory chips', () => {
      const result = compiler.encodeGraphToDNA(2, [[1, 42]]);
      const opcode = result.microfluidicOpcode;

      expect(opcode).toContain('MIX_CHIP_WELL_A1_TO_B4');
      expect(opcode).toContain('anneal_temp=58.5C');
      expect(opcode).toContain('nodes=2');
    });

    it('should load default topological Calabi-Yau graph into DNA compilation result', () => {
      const defaultDNA = compiler.seedDefaultGraphDNA();
      expect(defaultDNA.strandSequences.length).toBeGreaterThanOrEqual(4);
      expect(defaultDNA.strandsDetailed.length).toBeGreaterThanOrEqual(4);
      expect(defaultDNA.strandsDetailed[0].forwardStrand).toContain('ATG');
    });
  });
});
