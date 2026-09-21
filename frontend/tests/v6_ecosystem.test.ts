// ============================================================================
// AlgoArena v6.0 - Ecosystem Verification Test Suite
// Autonomous AI League, GNN Heuristics, Plugin Sandbox & Broadcast Telemetry
// ============================================================================

import { describe, test, expect, beforeEach } from 'vitest';
import { TournamentDirector } from '../src/engine/league/TournamentDirector';
import { GNNHeuristicEvaluator } from '../src/engine/ai/GNNHeuristicEvaluator';
import { PluginSandbox } from '../src/engine/security/PluginSandbox';

describe('AlgoArena v6.0 Ecosystem Verification', () => {
  // --------------------------------------------------------------------------
  // 1. Autonomous AI Tournament & Elo League Engine
  // --------------------------------------------------------------------------
  describe('Autonomous AI Tournament & Elo League Engine', () => {
    let director: TournamentDirector;

    beforeEach(() => {
      director = new TournamentDirector();
    });

    test('initializes with default competitor bots', () => {
      const competitors = director.getAllCompetitors();
      expect(competitors.length).toBeGreaterThanOrEqual(6);

      const astarBot = director.getCompetitor('bot_astar');
      expect(astarBot).toBeDefined();
      expect(astarBot?.eloRating).toBe(1650);
      expect(astarBot?.wins).toBe(0);
    });

    test('calculates Glicko-2 rating update for victory and defeat', () => {
      const playerA = director.getCompetitor('bot_astar')!;
      const playerB = director.getCompetitor('bot_dijkstra')!;

      const initialEloA = playerA.eloRating;
      const initialEloB = playerB.eloRating;

      // Player A wins
      const newRatingA = director.calculateGlicko2Update(playerA, playerB, 1.0);
      const newRatingB = director.calculateGlicko2Update(playerB, playerA, 0.0);

      expect(newRatingA).toBeGreaterThan(initialEloA);
      expect(newRatingB).toBeLessThan(initialEloB);
    });

    test('generates valid Swiss-system pairings based on rating proximity', () => {
      const pairings = director.generateSwissPairings();
      expect(pairings.length).toBeGreaterThan(0);

      // Verify each competitor is paired at most once
      const pairedIds = new Set<string>();
      for (const pair of pairings) {
        expect(pairedIds.has(pair.competitorA.id)).toBe(false);
        expect(pairedIds.has(pair.competitorB.id)).toBe(false);
        expect(pair.competitorA.id).not.toBe(pair.competitorB.id);

        pairedIds.add(pair.competitorA.id);
        pairedIds.add(pair.competitorB.id);
      }
    });

    test('simulates Swiss tournament round and updates leaderboard', () => {
      const initialRound = director.getCurrentRound();
      const results = director.simulateRound();

      expect(results.length).toBeGreaterThan(0);
      expect(director.getCurrentRound()).toBe(initialRound + 1);

      const leaderboard = director.getLeaderboard();
      expect(leaderboard.length).toBeGreaterThanOrEqual(6);

      // Verify sorted by Elo descending
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].eloRating).toBeGreaterThanOrEqual(leaderboard[i + 1].eloRating);
      }
    });

    test('resets tournament state cleanly', () => {
      director.simulateRound();
      expect(director.getMatchHistory().length).toBeGreaterThan(0);

      director.resetTournament();
      expect(director.getMatchHistory().length).toBe(0);
      expect(director.getCurrentRound()).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Graph Neural Network (GNN) Learned Heuristics
  // --------------------------------------------------------------------------
  describe('Graph Neural Network (GNN) Learned Heuristics', () => {
    let gnn: GNNHeuristicEvaluator;

    beforeEach(() => {
      gnn = new GNNHeuristicEvaluator();
    });

    test('evaluates open grid node with standard topological distance', () => {
      const obstacles = new Set<number>();
      const heuristic = gnn.evaluateGridNode(0, 0, 10, 10, 20, 20, obstacles);

      expect(heuristic).toBeGreaterThan(0);
      // Euclidean distance is sqrt(200) ~= 14.14
      expect(heuristic).toBeGreaterThan(14.0);
    });

    test('penalizes trapped node surrounded by walls vs open node', () => {
      const width = 20;
      const height = 20;
      const openObstacles = new Set<number>();
      const trappedObstacles = new Set<number>();

      // Surround node at (5, 5) with 3 walls (dead-end pocket)
      trappedObstacles.add(4 * width + 5); // Up
      trappedObstacles.add(6 * width + 5); // Down
      trappedObstacles.add(5 * width + 4); // Left

      const openHeuristic = gnn.evaluateGridNode(5, 5, 15, 15, width, height, openObstacles);
      const trappedHeuristic = gnn.evaluateGridNode(5, 5, 15, 15, width, height, trappedObstacles);

      // GNN message-passing must penalize trapped node with detour cost
      expect(trappedHeuristic).toBeGreaterThan(openHeuristic);
    });

    test('predictHeuristic handles tensor inputs gracefully', async () => {
      const node = new Float32Array([1, 1]);
      const goal = new Float32Array([10, 10]);
      const adj = new Float32Array(16).fill(1.0);

      const val = await gnn.predictHeuristic(node, goal, adj);
      expect(val).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Plugin Sandbox & Proof-of-Execution Engine
  // --------------------------------------------------------------------------
  describe('Plugin Sandbox & Proof-of-Execution Engine', () => {
    test('safely executes legitimate algorithm and generates proof hash', () => {
      const sandbox = new PluginSandbox(50_000);

      const outcome = sandbox.executeSafely((sb) => {
        let acc = 0;
        for (let i = 0; i < 500; i++) {
          sb.consumeFuel(1);
          acc += i;
        }
        return { total: acc };
      });

      expect(outcome.result).toEqual({ total: 124750 });
      expect(outcome.fuelConsumed).toBe(500);
      expect(outcome.executionProofHash.startsWith('0x')).toBe(true);
      expect(outcome.error).toBeUndefined();
    });

    test('halts runaway infinite loop when fuel quota is exhausted', () => {
      const sandbox = new PluginSandbox(2_000);

      const outcome = sandbox.executeSafely((sb) => {
        let iterations = 0;
        while (true) {
          sb.consumeFuel(1);
          iterations++;
          if (iterations > 1_000_000) break;
        }
        return { completed: true };
      });

      expect(outcome.result).toBeNull();
      expect(outcome.error).toContain('Fuel quota exceeded');
      expect(outcome.fuelConsumed).toBeGreaterThan(2_000);
    });

    test('computes deterministic Merkle proof root for execution steps', () => {
      const sandbox = new PluginSandbox();
      const steps = ['0x11223344', '0x55667788', '0x99aabbcc'];

      const root1 = sandbox.generateMerkleProof(steps);
      const root2 = sandbox.generateMerkleProof(steps);

      expect(root1).toBe(root2);
      expect(root1.startsWith('0x')).toBe(true);
    });
  });
});
