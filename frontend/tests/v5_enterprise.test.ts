// ============================================================================
// AlgoArena v5.0 - Enterprise Verification Test Suite (Section 1 - 5)
// Tests: WASM Kernel, Multi-Agent CBS, Rapier Physics, Zustand Replay, Plugin SDK
// ============================================================================

import { describe, test, expect } from 'vitest';
import { WasmPathfinderBridge } from '../src/wasm/WasmPathfinder';
import { ConflictBasedSearchEngine } from '../src/engine/mapf/ConflictBasedSearch';
import { RapierPhysicsEngine } from '../src/engine/physics/RapierPhysicsEngine';
import { useAlgoStore } from '../src/store/useAlgoStore';
import {
  PluginRegistry,
  BidirectionalAStarPlugin,
  JumpPointSearchPlugin,
  CustomPathfinderPlugin,
  PathfinderContext,
} from '../src/sdk/AlgoPluginSDK';

describe('AlgoArena v5.0 Enterprise Architecture Verification', () => {
  // 1. WebAssembly C++ Core
  describe('WebAssembly (WASM) 8-Directional Kernel Core', () => {
    test('computes diagonal cost (1.414x) and reaches goal in 8 directions', () => {
      const width = 10;
      const height = 10;
      const grid = new Uint8Array(width * height).fill(0);

      // Direct diagonal move from (0,0) to (5,5) without obstacles
      const result = WasmPathfinderBridge.runWasmAStar(grid, width, height, 0, 0, 5, 5);

      expect(result.pathLength).toBeGreaterThan(0);
      expect(result.path[0]).toEqual([0, 0]);
      expect(result.path[result.path.length - 1]).toEqual([5, 5]);

      // 5 diagonal steps at cost ~1.414 = ~7.07
      expect(result.cost).toBeCloseTo(5 * 1.414, 1);
      expect(result.nodesExplored).toBeGreaterThan(0);
    });

    test('evades wall obstacles in 8 directions', () => {
      const width = 10;
      const height = 10;
      const grid = new Uint8Array(width * height).fill(0);

      // Place vertical wall from y=1 to y=8 at x=5
      for (let y = 1; y <= 8; y++) {
        grid[y * width + 5] = 1; // Obstacle
      }

      const result = WasmPathfinderBridge.runWasmAStar(grid, width, height, 2, 5, 8, 5);
      expect(result.pathLength).toBeGreaterThan(0);
      expect(result.path[result.path.length - 1]).toEqual([8, 5]);

      // Wall at x=5 must not be in path
      for (const [x, y] of result.path) {
        if (x === 5) {
          expect([0, 9]).toContain(y); // Only y=0 or y=9 are open
        }
      }
    });
  });

  // 2. Multi-Agent Pathfinding (MAPF) with Conflict-Based Search (CBS)
  describe('Multi-Agent Conflict-Based Search (CBS) MAPF', () => {
    test('resolves head-on collision between 2 agents in a 1D corridor', () => {
      // 5x3 corridor where Agent 1 goes left to right (0,1) -> (4,1)
      // and Agent 2 goes right to left (4,1) -> (0,1)
      const width = 5;
      const height = 3;
      const obstacles = new Set<number>();
      // Row 0 and Row 2 are walls
      for (let x = 0; x < width; x++) {
        if (x !== 2) {
          obstacles.add(0 * width + x);
          obstacles.add(2 * width + x);
        }
      }

      const engine = new ConflictBasedSearchEngine(width, height, obstacles);
      const agents = [
        { id: 1, start: [0, 1] as [number, number], goal: [4, 1] as [number, number] },
        { id: 2, start: [4, 1] as [number, number], goal: [0, 1] as [number, number] },
      ];

      const paths = engine.solveMAPF(agents);
      expect(paths.size).toBe(2);

      const path1 = paths.get(1)!;
      const path2 = paths.get(2)!;

      expect(path1.path.length).toBeGreaterThan(0);
      expect(path2.path.length).toBeGreaterThan(0);

      // Verify zero simultaneous vertex collisions
      const conflict = engine.findFirstConflict(paths);
      expect(conflict).toBeNull();
    });

    test('solves multi-agent battle with 3 converging agents without collisions', () => {
      const width = 15;
      const height = 15;
      const obstacles = new Set<number>();
      // Central pillar obstacle
      obstacles.add(7 * width + 7);

      const engine = new ConflictBasedSearchEngine(width, height, obstacles);
      const agents = [
        { id: 1, start: [1, 1] as [number, number], goal: [13, 13] as [number, number] },
        { id: 2, start: [13, 1] as [number, number], goal: [1, 13] as [number, number] },
        { id: 3, start: [7, 1] as [number, number], goal: [7, 13] as [number, number] },
      ];

      const paths = engine.solveMAPF(agents);
      expect(paths.size).toBe(3);

      const conflict = engine.findFirstConflict(paths);
      expect(conflict).toBeNull();
    });
  });

  // 3. Rapier.js Dynamic Physics Engine
  describe('Rapier.js Dynamic Physics Engine', () => {
    test('initializes physics world and spawns destructible rigid bodies', async () => {
      const physics = new RapierPhysicsEngine();
      const ready = await physics.initPhysics();

      if (ready) {
        physics.createStaticFloor(20, 20);
        const bodyId = physics.spawnDestructibleBarrier(0, 10, 0);
        expect(bodyId).not.toBeNull();
        expect(physics.getRigidBodyCount()).toBe(1);

        // Step physics simulation
        physics.stepPhysics(1 / 60);
        const translations = physics.getBodyTranslations();
        expect(translations.length).toBe(1);
        expect(translations[0].y).toBeLessThanOrEqual(10); // Gravity acts on body

        physics.resetPhysics();
        expect(physics.getRigidBodyCount()).toBe(0);
      } else {
        // Safe fallback in environments without WASM support
        expect(physics.isReady()).toBe(false);
      }
    });
  });

  // 4. Zustand Deterministic State Stream & Replay
  describe('Zustand Deterministic Replay Store (.algoa)', () => {
    test('records match telemetry events and exports/imports valid .algoa JSON', () => {
      const store = useAlgoStore.getState();

      store.startMatchRecording(12345, [25, 20], ['A_STAR', 'DIJKSTRA']);
      expect(useAlgoStore.getState().isRecording).toBe(true);

      store.recordTelemetryEvent('A_STAR', 42, 'EXPAND');
      store.recordTelemetryEvent('DIJKSTRA', 56, 'VISIT');

      const replay = store.stopMatchRecording();
      expect(replay).not.toBeNull();
      expect(replay?.seed).toBe(12345);
      expect(replay?.gridDimensions).toEqual([25, 20]);
      expect(replay?.telemetryEvents.length).toBe(2);

      // JSON export serialization
      const jsonStr = store.exportReplayJSON();
      expect(typeof jsonStr).toBe('string');
      expect(jsonStr).toContain('"version": "5.0.0"');

      // Clear & Load JSON deserialization
      store.clearReplay();
      expect(useAlgoStore.getState().replayData).toBeNull();

      store.loadReplayJSON(jsonStr);
      expect(useAlgoStore.getState().replayData?.seed).toBe(12345);
      expect(useAlgoStore.getState().replayData?.telemetryEvents.length).toBe(2);
    });
  });

  // 5. Custom Pathfinder Plugin SDK
  describe('Custom Pathfinder Plugin SDK & Registry', () => {
    test('contains built-in Bidirectional A* and Jump Point Search plugins', () => {
      const plugins = PluginRegistry.getPlugins();
      expect(plugins.length).toBeGreaterThanOrEqual(2);

      const bAstar = PluginRegistry.getPlugin('bidirectional-astar');
      expect(bAstar).toBeDefined();
      expect(bAstar?.metadata.name).toBe('Bidirectional A*');

      const jps = PluginRegistry.getPlugin('jump-point-search');
      expect(jps).toBeDefined();
      expect(jps?.metadata.name).toBe('Jump Point Search (JPS)');
    });

    test('solves grid path using Bidirectional A* plugin', () => {
      const ctx: PathfinderContext = {
        gridWidth: 10,
        gridHeight: 10,
        getWeight: () => 1,
        isObstacle: (x, y) => x === 5 && y >= 2 && y <= 7,
        getNeighbors: (x, y) => {
          const neighbors: [number, number][] = [];
          if (y > 0) neighbors.push([x, y - 1]);
          if (x < 9) neighbors.push([x + 1, y]);
          if (y < 9) neighbors.push([x, y + 1]);
          if (x > 0) neighbors.push([x - 1, y]);
          return neighbors;
        },
      };

      const path = BidirectionalAStarPlugin.solve(ctx, [1, 4], [8, 4]);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual([1, 4]);
      expect(path[path.length - 1]).toEqual([8, 4]);
    });

    test('registers and executes third-party custom plugin', () => {
      const customPlugin: CustomPathfinderPlugin = {
        metadata: {
          id: 'manhattan-ray-tracer',
          name: 'Manhattan Ray Tracer',
          author: 'Visiting Researcher',
          description: 'Straight line ray tracer with right-hand turn collision evasion.',
          dna: { speed: 99, accuracy: 70, exploration: 30, adaptability: 60 },
        },
        solve: (_ctx, start, goal) => [start, goal],
      };

      PluginRegistry.registerPlugin(customPlugin);
      expect(PluginRegistry.getPlugin('manhattan-ray-tracer')).toBeDefined();

      const path = customPlugin.solve(
        {
          gridWidth: 10,
          gridHeight: 10,
          getWeight: () => 1,
          isObstacle: () => false,
          getNeighbors: () => [],
        },
        [0, 0],
        [9, 9]
      );
      expect(path.length).toBe(2);

      PluginRegistry.unregisterPlugin('manhattan-ray-tracer');
      expect(PluginRegistry.getPlugin('manhattan-ray-tracer')).toBeUndefined();
    });
  });
});
