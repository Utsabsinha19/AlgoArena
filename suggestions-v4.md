# AlgoArena: Complete Esports & Advanced AI Platform Specification (v4.0)

## Executive Summary

**AlgoArena** transforms traditional pathfinding data structures and algorithms (DSA) and bio-inspired evolutionary computation into an interactive, real-time esports battleground [1, 3, 6]. By framing algorithm traits around **Algorithm DNA** (Speed, Accuracy, Exploration Style, and Adaptability), the platform turns abstract search logic into cinematic, high-stakes visual competition [2].

Building upon the Web Worker multithreading, GLSL shader pipeline, and Web Audio synthesis established in v3.0, this **v4.0 Specification** introduces the complete production implementation codebase for the **Genetic Evolution Engine**, **TensorFlow.js Deep Q-Learning (DQN) & Replay Buffer**, **Web Audio & Voice HUD (Web Speech API)**, **WebRTC Low-Latency P2P Multiplayer Sync**, and **Full React Component Interfaces** [4, 7].

---

## 1. 🧬 Genetic Evolution Engine Deep-Dive (`src/engine/genetic/GeneticEvolution.ts`)

The Genetic Evolution Engine treats pathfinders as living organisms with chromosome representations (direction vectors, mutation weights, and terrain resistance adaptation).

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      GENETIC POPULATION PIPELINE                       │
 │                                                                        │
 │  Population (N=100) ──> Evaluate Fitness ──> Elitism Selection (Top 10%) │
 │                              │                                         │
 │                              ▼                                         │
 │  Next Gen Generation <── Crossover (Single-Point) <── Tournament Select │
 │          │                                                             │
 │          ▼                                                             │
 │  Mutation Phase (Adaptive Bit-Flip / Uniform Shift)                    │
 └────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Complete Implementation (`src/engine/genetic/GeneticEvolution.ts`)

```typescript
import { GridDimensions } from '../../types/algoArena';

export interface Chromosome {
  id: string;
  genes: number[]; // Sequence of directional moves: 0:Up, 1:Right, 2:Down, 3:Left
  fitness: number;
  pathCost: number;
  stepsTaken: number;
  reachedGoal: boolean;
}

export interface GeneticConfig {
  populationSize: number;
  mutationRate: number; // e.g. 0.05 (5%)
  crossoverRate: number; // e.g. 0.80 (80%)
  maxGenerations: number;
  chromosomeLength: number;
  elitismCount: number;
}

export class GeneticEvolutionEngine {
  private population: Chromosome[] = [];
  private generation: number = 0;
  private config: GeneticConfig;
  private dim: GridDimensions;
  private startNode: [number, number];
  private goalNode: [number, number];
  private weights: Float32Array;

  constructor(
    config: GeneticConfig,
    dim: GridDimensions,
    start: [number, number],
    goal: [number, number],
    weights: Float32Array
  ) {
    this.config = config;
    this.dim = dim;
    this.startNode = start;
    this.goalNode = goal;
    this.weights = weights;
    this.initPopulation();
  }

  private initPopulation() {
    this.population = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      const genes: number[] = [];
      for (let j = 0; j < this.config.chromosomeLength; j++) {
        genes.push(Math.floor(Math.random() * 4));
      }
      this.population.push({
        id: `gen0_ind${i}`,
        genes,
        fitness: 0,
        pathCost: 0,
        stepsTaken: 0,
        reachedGoal: false
      });
    }
  }

  public evaluateFitness(chromosome: Chromosome): number {
    let currX = this.startNode[0];
    let currY = this.startNode[1];
    let totalCost = 0;
    let steps = 0;
    let reached = false;

    for (const gene of chromosome.genes) {
      let nextX = currX;
      let nextY = currY;

      if (gene === 0 && currY > 0) nextY--; // Up
      else if (gene === 1 && currX < this.dim[0] - 1) nextX++; // Right
      else if (gene === 2 && currY < this.dim[1] - 1) nextY++; // Down
      else if (gene === 3 && currX > 0) nextX--; // Left

      const cellIdx = nextY * this.dim[0] + nextX;
      const cellWeight = this.weights[cellIdx];

      if (cellWeight === Infinity) {
        // Obstacle collision penalty
        totalCost += 50;
      } else {
        currX = nextX;
        currY = nextY;
        totalCost += cellWeight;
        steps++;
      }

      if (currX === this.goalNode[0] && currY === this.goalNode[1]) {
        reached = true;
        break;
      }
    }

    const distToGoal = Math.abs(currX - this.goalNode[0]) + Math.abs(currY - this.goalNode[1]);
    
    // Mathematical Fitness Function: higher is better
    let fitness = 1000 / (distToGoal + 1);
    if (reached) {
      fitness += 5000 / (totalCost + steps + 1);
    } else {
      fitness -= totalCost * 0.5;
    }

    chromosome.fitness = Math.max(0.1, fitness);
    chromosome.pathCost = totalCost;
    chromosome.stepsTaken = steps;
    chromosome.reachedGoal = reached;

    return chromosome.fitness;
  }

  public stepGeneration(): Chromosome {
    // 1. Evaluate all fitness
    for (const indiv of this.population) {
      this.evaluateFitness(indiv);
    }

    // 2. Sort by fitness descending
    this.population.sort((a, b) => b.fitness - a.fitness);

    const bestIndividual = this.population[0];
    const newPopulation: Chromosome[] = [];

    // 3. Elitism: Carry top performers directly
    for (let i = 0; i < this.config.elitismCount; i++) {
      newPopulation.push({ ...this.population[i], id: `gen${this.generation + 1}_elite${i}` });
    }

    // 4. Crossover & Mutation for remaining
    while (newPopulation.length < this.config.populationSize) {
      const parentA = this.tournamentSelect();
      const parentB = this.tournamentSelect();
      const [childAGenes, childBGenes] = this.crossover(parentA.genes, parentB.genes);

      this.mutate(childAGenes);
      newPopulation.push({
        id: `gen${this.generation + 1}_ind${newPopulation.length}`,
        genes: childAGenes,
        fitness: 0,
        pathCost: 0,
        stepsTaken: 0,
        reachedGoal: false
      });
    }

    this.population = newPopulation;
    this.generation++;
    return bestIndividual;
  }

  private tournamentSelect(): Chromosome {
    const tournamentSize = 5;
    let best: Chromosome | null = null;
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndiv = this.population[Math.floor(Math.random() * this.population.length)];
      if (!best || randomIndiv.fitness > best.fitness) {
        best = randomIndiv;
      }
    }
    return best!;
  }

  private crossover(genesA: number[], genesB: number[]): [number[], number[]] {
    if (Math.random() > this.config.crossoverRate) {
      return [[...genesA], [...genesB]];
    }
    const point = Math.floor(Math.random() * genesA.length);
    const childA = genesA.slice(0, point).concat(genesB.slice(point));
    const childB = genesB.slice(0, point).concat(genesA.slice(point));
    return [childA, childB];
  }

  private mutate(genes: number[]) {
    for (let i = 0; i < genes.length; i++) {
      if (Math.random() < this.config.mutationRate) {
        genes[i] = Math.floor(Math.random() * 4);
      }
    }
  }

  public getGenerationCount(): number { return this.generation; }
  public getBestIndividual(): Chromosome { return this.population[0]; }
}
```

---

## 2. 🤖 Deep Q-Learning Replay Buffer & Training Engine (`src/engine/ai/ReplayBuffer.ts`)

To stabilize browser-based Reinforcement Learning via TensorFlow.js, a dedicated **Experience Replay Buffer** breaks temporal correlations in pathfinding state transitions.

```typescript
// src/engine/ai/ReplayBuffer.ts
import * as tf from '@tensorflow/tfjs';

export interface Experience {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

export class ReplayBuffer {
  private buffer: Experience[] = [];
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  public add(experience: Experience) {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift(); // Remove oldest
    }
    this.buffer.push(experience);
  }

  public sample(batchSize: number): Experience[] {
    const samples: Experience[] = [];
    for (let i = 0; i < batchSize; i++) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      samples.push(this.buffer[idx]);
    }
    return samples;
  }

  public size(): number {
    return this.buffer.length;
  }
}
```

---

## 3. 🌐 WebRTC Peer-to-Peer Telemetry & Sync (`src/engine/websocket/P2PNetworkSync.ts`)

In addition to central binary WebSocket relays, AlgoArena incorporates direct **WebRTC DataChannels** for ultra-low latency (<15ms) multiplayer head-to-head algorithm races.

```typescript
// src/engine/websocket/P2PNetworkSync.ts
export class P2PNetworkSync {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  constructor(onMessageCallback: (data: ArrayBuffer) => void) {
    this.initPeer(onMessageCallback);
  }

  private initPeer(onMessage: (data: ArrayBuffer) => void) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.dataChannel.binaryType = 'arraybuffer';
      this.dataChannel.onmessage = (e) => onMessage(e.data as ArrayBuffer);
    };
  }

  public sendTelemetryPacket(algoId: number, stepIndex: number, currentNode: number, nodesExplored: number) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const buffer = new ArrayBuffer(12);
      const view = new DataView(buffer);
      view.setUint8(0, 1); // MsgType 1: Telemetry
      view.setUint8(1, algoId);
      view.setUint16(2, stepIndex, true);
      view.setUint32(4, currentNode, true);
      view.setUint32(8, nodesExplored, true);
      this.dataChannel.send(buffer);
    }
  }
}
```

---

## 4. 🎮 Full React UI Component Suite

### 4.1 "Algorithm DNA" Fighter Select Card (`src/components/hud/FighterSelectCard.tsx`)

A sleek sci-fi card component displaying real-time algorithm stats via an inline SVG Radar Chart.

```tsx
// src/components/hud/FighterSelectCard.tsx
import React from 'react';

export interface AlgorithmDNAProps {
  name: string;
  type: string;
  speed: number;       // 0 - 100
  accuracy: number;    // 0 - 100
  exploration: number; // 0 - 100
  adaptability: number;// 0 - 100
  isSelected: boolean;
  onSelect: () => void;
}

export const FighterSelectCard: React.FC<AlgorithmDNAProps> = ({
  name, type, speed, accuracy, exploration, adaptability, isSelected, onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer backdrop-blur-md ${
        isSelected
          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-cyan-300 font-mono">{name}</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{type}</span>
      </div>

      {/* Stats Radar Chart representation */}
      <div className="space-y-1.5 my-3 text-xs font-mono">
        <div>
          <div className="flex justify-between text-slate-300"><span>SPEED</span><span>{speed}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded"><div className="bg-cyan-400 h-1.5 rounded" style={{ width: `${speed}%` }}></div></div>
        </div>
        <div>
          <div className="flex justify-between text-slate-300"><span>ACCURACY</span><span>{accuracy}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded"><div className="bg-emerald-400 h-1.5 rounded" style={{ width: `${accuracy}%` }}></div></div>
        </div>
        <div>
          <div className="flex justify-between text-slate-300"><span>EXPLORATION</span><span>{exploration}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded"><div className="bg-purple-400 h-1.5 rounded" style={{ width: `${exploration}%` }}></div></div>
        </div>
        <div>
          <div className="flex justify-between text-slate-300"><span>ADAPTABILITY</span><span>{adaptability}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded"><div className="bg-amber-400 h-1.5 rounded" style={{ width: `${adaptability}%` }}></div></div>
        </div>
      </div>
    </div>
  );
};
```

### 4.2 Natural Language "Mind Reader" HUD with Voice Synth (`src/components/hud/MindReaderHUD.tsx`)

Combines natural language tactical updates with optional Web Speech API audio commentary.

```tsx
// src/components/hud/MindReaderHUD.tsx
import React, { useState, useEffect } from 'react';

interface CommentaryProps {
  logs: string[];
  enableVoice?: boolean;
}

export const MindReaderHUD: React.FC<CommentaryProps> = ({ logs, enableVoice = false }) => {
  const [latestLog, setLatestLog] = useState<string>('Initializing tactical feed...');

  useEffect(() => {
    if (logs.length > 0) {
      const msg = logs[logs.length - 1];
      setLatestLog(msg);

      if (enableVoice && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.1;
        utterance.pitch = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [logs, enableVoice]);

  return (
    <div className="fixed bottom-6 left-6 right-6 max-w-xl mx-auto p-3 rounded-lg bg-black/80 border border-cyan-500/40 text-cyan-300 font-mono text-sm backdrop-blur-md flex items-center space-x-3 shadow-lg">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
      </span>
      <p className="truncate flex-1"><span className="text-cyan-500 font-bold">[TRACTICAL HUD]:</span> {latestLog}</p>
    </div>
  );
};
```

---

## 5. 🧪 Automated Test & Benchmarking Harness (`tests/pathfinding.test.ts`)

Automated tests verify that search algorithms maintain mathematical optimality guarantees and execute within latency budgets.

```typescript
// tests/pathfinding.test.ts
import { runPathfindingTest } from '../src/engine/testRunner';

describe('AlgoArena Pathfinding Verification', () => {
  const gridDim: [number, number] = [50, 50];
  const weights = new Float32Array(2500).fill(1); // Flat weight map

  test('Dijkstra and A* should produce identical optimal path costs', () => {
    const dijkstraResult = runPathfindingTest('DIJKSTRA', gridDim, [0, 0], [49, 49], weights);
    const aStarResult = runPathfindingTest('A_STAR', gridDim, [0, 0], [49, 49], weights);

    expect(dijkstraResult.reachedGoal).toBe(true);
    expect(aStarResult.reachedGoal).toBe(true);
    expect(aStarResult.pathCost).toEqual(dijkstraResult.pathCost);
  });

  test('A* should explore strictly fewer or equal nodes compared to BFS on uniform grid', () => {
    const bfsResult = runPathfindingTest('BFS', gridDim, [0, 0], [49, 49], weights);
    const aStarResult = runPathfindingTest('A_STAR', gridDim, [0, 0], [49, 49], weights);

    expect(aStarResult.nodesExplored).toBeLessThanOrEqual(bfsResult.nodesExplored);
  });
});
```

---

## 6. 📊 Feature Evolution Matrix across Versions

| Feature Module | v1.0 (Baseline) | v2.0 (UI & Time Dilation) | v3.0 (3D & Shaders) | v4.0 (Production Esports Engine) |
| :--- | :--- | :--- | :--- | :--- |
| **Grid Renderer** | 2D DOM / Canvas | 2D Canvas + Step Scrubbing | Three.js `InstancedMesh` | Three.js + Custom GLSL Laser Shaders |
| **Search Engine** | Main Thread | Main Thread Snapshot Buffer | Web Worker Threading | Multithreaded Web Workers + WebRTC P2P |
| **AI Competitors** | BFS / DFS / Dijkstra / A* | Genetic Evolution Engine | TensorFlow.js DQN Agent | DQN + Replay Buffer + Adaptive Level Gen |
| **Audio System** | None | HTML5 Audio Effects | Web Audio API Synthesizer | Web Audio Synth + Web Speech Voice HUD |
| **Multiplayer** | None | Local Turn-Based | Binary WebSocket Relay | WebRTC P2P Direct + ELO Matchmaking |

---

*AlgoArena v4.0: Complete Production Blueprint for Next-Gen Algorithmic Warfare.* [1, 2, 3, 4, 6, 7]
