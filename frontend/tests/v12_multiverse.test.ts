import { describe, it, expect, beforeEach } from 'vitest';
import { PhotonicQuantumCore } from '../src/engine/quantum/PhotonicQuantumCore';
import { DirectNeuralInterface } from '../src/engine/bci/DirectNeuralInterface';
import { PlanetarySimulationMesh } from '../src/engine/simulation/PlanetarySimulationMesh';
import { SelfEvolvingCodeKernel } from '../src/engine/ai/SelfEvolvingCodeKernel';
import { evmContractAdapter, EVMContractAdapter } from '../src/engine/web3/EVMContractAdapter';

describe('AlgoArena v12.0 Planetary Multi-Verse Platform Verification', () => {

  // ==========================================================================
  // 1. Sub-Nanometer Photonic Quantum Computing Core
  // ==========================================================================
  describe('PhotonicQuantumCore', () => {
    let core: PhotonicQuantumCore;

    beforeEach(() => {
      core = new PhotonicQuantumCore(64);
    });

    it('should initialize qumode squeezed states with parameters', () => {
      expect(core.getQumodeCount()).toBe(64);
      const qumodes = core.getQumodes();
      expect(qumodes.length).toBe(64);
      expect(qumodes[0].squeezingParameter).toBe(1.5);
      expect(qumodes[0].phaseAngle).toBe(0);
      expect(qumodes[1].phaseAngle).toBeCloseTo(Math.PI / 32, 4);
    });

    it('should execute quantum wavefront relaxation and compute optimal path', () => {
      const result = core.executeQuantumWavefrontRelaxation(0, 15);
      expect(result.optimalPath.length).toBeGreaterThan(1);
      expect(result.optimalPath[0]).toBe(0);
      expect(result.optimalPath[result.optimalPath.length - 1]).toBe(15);
      expect(result.quantumFidelity).toBeGreaterThanOrEqual(0.99);
      expect(result.computationLatencyNs).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 2. Brain-Computer-Cloud Direct Neural Lace Interface
  // ==========================================================================
  describe('DirectNeuralInterface', () => {
    let lace: DirectNeuralInterface;

    beforeEach(() => {
      lace = new DirectNeuralInterface();
    });

    it('should connect and disconnect neural lace array correctly', async () => {
      expect(lace.isLaceConnected()).toBe(false);
      const connected = await lace.connectLaceArray();
      expect(connected).toBe(true);
      expect(lace.isLaceConnected()).toBe(true);

      lace.disconnectLaceArray();
      expect(lace.isLaceConnected()).toBe(false);
    });

    it('should decode motor intent vectors and multi-channel cognitive bandpowers', () => {
      const mockRawChannel = new Float32Array(32);
      for (let i = 0; i < 32; i++) {
        mockRawChannel[i] = 1.25; // total power = 40.0, focus = 0.4
      }

      const telemetry = lace.decodeMotorIntent(mockRawChannel);
      expect(telemetry.focusIndex).toBeCloseTo(0.4, 2);
      expect(telemetry.motorIntentVector.length).toBe(3);
      expect(telemetry.motorIntentVector[0]).toBeCloseTo(Math.cos(0.4 * Math.PI), 2);
      expect(telemetry.motorIntentVector[1]).toBeCloseTo(Math.sin(0.4 * Math.PI), 2);
      expect(telemetry.gammaPower).toBeGreaterThan(0);
      expect(lace.getChannelHistory().length).toBe(1);
    });
  });

  // ==========================================================================
  // 3. Planetary Digital Twin Simulation Mesh
  // ==========================================================================
  describe('PlanetarySimulationMesh', () => {
    let mesh: PlanetarySimulationMesh;

    beforeEach(() => {
      mesh = new PlanetarySimulationMesh();
    });

    it('should initialize default digital twin regions and compute planetary totals', () => {
      expect(mesh.getRegionCount()).toBeGreaterThanOrEqual(4);
      expect(mesh.getTotalActiveAgents()).toBeGreaterThan(10000);
      expect(mesh.getRegion('TOKYO_MEGA_01')).toBeDefined();
    });

    it('should register and unregister digital twin regions', () => {
      const initialCount = mesh.getRegionCount();
      mesh.registerRegion({
        regionId: 'BERLIN_AUTONOMOUS_05',
        name: 'Berlin Urban Mesh',
        activeAgents: 2900,
        gridCells: 750000,
        latencyMs: 1.5
      });

      expect(mesh.getRegionCount()).toBe(initialCount + 1);
      expect(mesh.getRegion('BERLIN_AUTONOMOUS_05')).toBeDefined();

      const removed = mesh.unregisterRegion('BERLIN_AUTONOMOUS_05');
      expect(removed).toBe(true);
      expect(mesh.getRegion('BERLIN_AUTONOMOUS_05')).toBeUndefined();
    });

    it('should compute global multi-hop swarm routing across orbital hubs', () => {
      const routing = mesh.computeGlobalSwarmRouting('TOKYO_MEGA_01', 'NYC_METRO_03');
      expect(routing.routePath.length).toBe(3);
      expect(routing.routePath[0]).toBe('TOKYO_MEGA_01');
      expect(routing.routePath[1]).toBe('HUB_ORBITAL_ALPHA');
      expect(routing.routePath[2]).toBe('NYC_METRO_03');
      expect(routing.estimatedFlightTimeMin).toBeGreaterThan(10);
      expect(routing.totalHops).toBe(2);
    });
  });

  // ==========================================================================
  // 4. Post-Quantum Lattice Proof Verifier (FIPS-204 ML-DSA-87)
  // ==========================================================================
  describe('PostQuantumLatticeProof Verifier & EVMContractAdapter', () => {
    it('should generate mock FIPS-204 ML-DSA key pairs and signatures', () => {
      const matchHash = '0xMATCH_FINAL_EVE_099';
      const keyPair = EVMContractAdapter.generateMockLatticeKeyPair();
      const sig = EVMContractAdapter.generateMockLatticeSignature(matchHash);

      expect(keyPair.publicKey.startsWith('0x')).toBe(true);
      expect(keyPair.publicKey.length).toBeGreaterThan(2000);
      expect(sig.startsWith('0x')).toBe(true);
      expect(sig.length).toBeGreaterThan(4000);
    });

    it('should verify and store authentic lattice signatures on-chain', async () => {
      const matchHash = '0xMATCH_CHAMPIONSHIP_FINAL_2026';
      const keyPair = EVMContractAdapter.generateMockLatticeKeyPair();
      const sig = EVMContractAdapter.generateMockLatticeSignature(matchHash);

      const result = await evmContractAdapter.submitPostQuantumLatticeProof(matchHash, keyPair.publicKey, sig);
      expect(result.verified).toBe(true);
      expect(result.txHash.startsWith('0xPQ_LATTICE_')).toBe(true);

      const retrieved = evmContractAdapter.getLatticeProof(matchHash);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.matchHash).toBe(matchHash);
      expect(retrieved?.publicKey).toBe(keyPair.publicKey);
    });

    it('should reject malformed lattice parameters that fail FIPS-204 size bounds', async () => {
      const matchHash = '0xMATCH_MALFORMED';
      await expect(
        evmContractAdapter.submitPostQuantumLatticeProof(matchHash, '0xshort', '0xshort')
      ).rejects.toThrow('Invalid ML-DSA-87 Lattice parameter length');
    });
  });

  // ==========================================================================
  // 5. Autonomous Formal Verification & Code Kernel (Lean 4)
  // ==========================================================================
  describe('SelfEvolvingCodeKernel', () => {
    let kernel: SelfEvolvingCodeKernel;

    beforeEach(() => {
      kernel = new SelfEvolvingCodeKernel();
    });

    it('should generate mathematically proven Lean 4 theorems and verified executable JS', () => {
      const spec = 'Admissible Polytope Search';
      const result = kernel.generateFormallyVerifiedAlgorithm(spec);

      expect(result.isFormallyVerified).toBe(true);
      expect(result.lean4Proof).toContain('theorem path_optimality_guaranteed');
      expect(result.lean4Proof).toContain('astar_admissible_optimality');
      expect(result.executableJS).toContain('function verifiedKernelSearch');
      expect(result.algorithmName).toContain('Lean4_');
      expect(kernel.getKernelCount()).toBe(1);
    });
  });
});
