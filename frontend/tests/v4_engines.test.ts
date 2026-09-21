// ============================================================================
// AlgoArena v4.0 - Engine Verification Suite (Genetic, ReplayBuffer, P2P)
// ============================================================================

import { describe, test, expect } from 'vitest';
import { GeneticEvolutionEngine } from '../src/engine/genetic/GeneticEvolution';
import { ReplayBuffer } from '../src/engine/ai/ReplayBuffer';
import { P2PNetworkSync } from '../src/engine/websocket/P2PNetworkSync';

describe('AlgoArena v4.0 Engine Unit Tests', () => {
  describe('GeneticEvolutionEngine', () => {
    test('initializes population and performs elitism & crossover', () => {
      const dim: [number, number] = [20, 20];
      const weights = new Float32Array(400).fill(1);
      const engine = new GeneticEvolutionEngine(
        {
          populationSize: 20,
          mutationRate: 0.05,
          crossoverRate: 0.8,
          maxGenerations: 10,
          chromosomeLength: 50,
          elitismCount: 2,
        },
        dim,
        [0, 0],
        [10, 10],
        weights
      );

      expect(engine.getPopulation().length).toBe(20);
      expect(engine.getGenerationCount()).toBe(0);

      const bestInitial = engine.getBestIndividual();
      expect(bestInitial.genes.length).toBe(50);

      // Step generation
      const bestNext = engine.stepGeneration();
      expect(engine.getGenerationCount()).toBe(1);
      expect(bestNext.fitness).toBeGreaterThan(0);
      expect(engine.getPopulation().length).toBe(20);
    });

    test('reconstructs valid chromosome paths within bounds', () => {
      const dim: [number, number] = [10, 10];
      const weights = new Float32Array(100).fill(1);
      const engine = new GeneticEvolutionEngine(
        {
          populationSize: 10,
          mutationRate: 0.05,
          crossoverRate: 0.8,
          maxGenerations: 5,
          chromosomeLength: 20,
          elitismCount: 2,
        },
        dim,
        [0, 0],
        [5, 5],
        weights
      );

      const chromosome = engine.getPopulation()[0];
      const path = engine.getChromosomePath(chromosome);
      expect(path.length).toBeGreaterThanOrEqual(1);
      expect(path[0]).toEqual({ x: 0, y: 0 });

      path.forEach((pt) => {
        expect(pt.x).toBeGreaterThanOrEqual(0);
        expect(pt.x).toBeLessThan(10);
        expect(pt.y).toBeGreaterThanOrEqual(0);
        expect(pt.y).toBeLessThan(10);
      });
    });
  });

  describe('ReplayBuffer', () => {
    test('adds experiences and evicts oldest when maxSize is exceeded', () => {
      const buffer = new ReplayBuffer(5);

      for (let i = 0; i < 7; i++) {
        buffer.add({
          state: [i],
          action: i % 4,
          reward: i * 10,
          nextState: [i + 1],
          done: i === 6,
        });
      }

      expect(buffer.size()).toBe(5);
    });

    test('samples uniform mini-batches', () => {
      const buffer = new ReplayBuffer(100);
      for (let i = 0; i < 20; i++) {
        buffer.add({
          state: [i, i * 2],
          action: i % 4,
          reward: 1,
          nextState: [i + 1, (i + 1) * 2],
          done: false,
        });
      }

      const batch = buffer.sample(6);
      expect(batch.length).toBe(6);
      batch.forEach((exp) => {
        expect(exp.state.length).toBe(2);
        expect(exp.nextState.length).toBe(2);
      });
    });
  });

  describe('P2PNetworkSync 12-Byte Binary Packet Protocol', () => {
    test('correctly packs and unpacks 12-byte telemetry packet', () => {
      const buffer = new ArrayBuffer(12);
      const view = new DataView(buffer);
      view.setUint8(0, 1); // MsgType 1
      view.setUint8(1, 4); // A* (algo 4)
      view.setUint16(2, 42, true); // stepIndex 42
      view.setUint32(4, 250, true); // currentNode 250
      view.setUint32(8, 128, true); // nodesExplored 128

      const decoded = P2PNetworkSync.parseTelemetryPacket(buffer);
      expect(decoded.msgType).toBe(1);
      expect(decoded.algoId).toBe(4);
      expect(decoded.stepIndex).toBe(42);
      expect(decoded.currentNode).toBe(250);
      expect(decoded.nodesExplored).toBe(128);
    });
  });
});
