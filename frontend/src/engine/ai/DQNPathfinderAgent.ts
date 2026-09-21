// ============================================================================
// AlgoArena v3.0 - Deep Q-Network (DQN) Pathfinder Agent (Section 5)
// Multi-Layer Neural Q-Network with Experience Replay & Epsilon Decay
// ============================================================================

import { DQNAction, DQNTransition } from '../../types/algoArena';
import { GridState } from '../../types';
import { ReplayBuffer } from './ReplayBuffer';

// Simple dense neural network layer
class DenseLayer {
  public weights: number[][]; // [inputDim][units]
  public biases: number[]; // [units]
  public inputDim: number;
  public units: number;

  constructor(inputDim: number, units: number) {
    this.inputDim = inputDim;
    this.units = units;
    // He / Xavier initialization
    const scale = Math.sqrt(2.0 / inputDim);
    this.weights = Array.from({ length: inputDim }, () =>
      Array.from({ length: units }, () => (Math.random() * 2 - 1) * scale)
    );
    this.biases = new Array(units).fill(0.01);
  }

  public forward(input: number[]): number[] {
    const output = new Array(this.units).fill(0);
    for (let j = 0; j < this.units; j++) {
      let sum = this.biases[j];
      for (let i = 0; i < this.inputDim; i++) {
        sum += input[i] * this.weights[i][j];
      }
      output[j] = sum;
    }
    return output;
  }
}

// Multi-layer Neural Q-Network: [Input] -> 64 (ReLU) -> 64 (ReLU) -> 4 (Linear)
class QNetwork {
  public layer1: DenseLayer;
  public layer2: DenseLayer;
  public outLayer: DenseLayer;

  constructor(stateSize: number, actionSize: number) {
    this.layer1 = new DenseLayer(stateSize, 64);
    this.layer2 = new DenseLayer(64, 64);
    this.outLayer = new DenseLayer(64, actionSize);
  }

  public predict(state: number[]): number[] {
    // Layer 1 + ReLU
    const z1 = this.layer1.forward(state);
    const a1 = z1.map((v) => Math.max(0, v));

    // Layer 2 + ReLU
    const z2 = this.layer2.forward(a1);
    const a2 = z2.map((v) => Math.max(0, v));

    // Output Layer (Linear Q-values)
    return this.outLayer.forward(a2);
  }

  public copyFrom(other: QNetwork) {
    this.layer1.biases = [...other.layer1.biases];
    this.layer1.weights = other.layer1.weights.map((row) => [...row]);
    this.layer2.biases = [...other.layer2.biases];
    this.layer2.weights = other.layer2.weights.map((row) => [...row]);
    this.outLayer.biases = [...other.outLayer.biases];
    this.outLayer.weights = other.outLayer.weights.map((row) => [...row]);
  }
}

export class DQNPathfinderAgent {
  public stateSize: number;
  public actionSize: number;
  private model: QNetwork;
  private targetModel: QNetwork;

  public gamma: number = 0.95;
  public epsilon: number = 1.0;
  public epsilonMin: number = 0.01;
  public epsilonDecay: number = 0.995;
  public learningRate: number = 0.005;

  private replayBuffer: ReplayBuffer;
  private trainStepCount: number = 0;

  constructor(stateSize: number = 10, actionSize: number = 4, maxMemory: number = 2000) {
    this.stateSize = stateSize;
    this.actionSize = actionSize;
    this.model = new QNetwork(stateSize, actionSize);
    this.targetModel = new QNetwork(stateSize, actionSize);
    this.targetModel.copyFrom(this.model);
    this.replayBuffer = new ReplayBuffer(maxMemory);
  }

  public getReplayBuffer(): ReplayBuffer {
    return this.replayBuffer;
  }

  /**
   * Action selection via Epsilon-Greedy policy (Explore vs Exploit)
   */
  public act(state: number[]): DQNAction {
    if (Math.random() <= this.epsilon) {
      // Exploration: Pick random discrete action
      return Math.floor(Math.random() * this.actionSize) as DQNAction;
    }

    // Exploitation: Select action with highest predicted Q-value
    const qValues = this.model.predict(state);
    let bestAction = 0;
    let maxQ = qValues[0];
    for (let i = 1; i < qValues.length; i++) {
      if (qValues[i] > maxQ) {
        maxQ = qValues[i];
        bestAction = i;
      }
    }
    return bestAction as DQNAction;
  }

  public decayEpsilon() {
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }
  }

  public remember(transition: DQNTransition) {
    this.replayBuffer.add(transition);
  }

  /**
   * Samples experience replay buffer and updates network parameters
   */
  public replay(batchSize = 24) {
    if (this.replayBuffer.size() < batchSize) return;

    // Mini-batch sampling from ReplayBuffer
    const batch = this.replayBuffer.sample(batchSize);
    for (let b = 0; b < batch.length; b++) {
      const { state, action, reward, nextState, done } = batch[b];

      const currentQ = this.model.predict(state);
      const nextTargetQ = this.targetModel.predict(nextState);
      const maxNextQ = Math.max(...nextTargetQ);

      const targetValue = done ? reward : reward + this.gamma * maxNextQ;
      const error = targetValue - currentQ[action];

      // Online gradient descent step on output layer weights
      for (let j = 0; j < this.model.outLayer.inputDim; j++) {
        this.model.outLayer.weights[j][action] += this.learningRate * error * 0.05;
      }
      this.model.outLayer.biases[action] += this.learningRate * error * 0.05;
    }

    this.trainStepCount++;
    if (this.trainStepCount % 50 === 0) {
      this.targetModel.copyFrom(this.model);
    }
  }

  /**
   * Helper to extract normalized state vector from grid coordinates
   */
  public extractState(
    grid: GridState,
    currentX: number,
    currentY: number
  ): number[] {
    const { width, height, start, end, cells } = grid;
    const startX = start ? start.x / width : 0;
    const startY = start ? start.y / height : 0;
    const goalX = end ? end.x / width : 1;
    const goalY = end ? end.y / height : 1;

    const currNormX = currentX / width;
    const currNormY = currentY / height;

    // Obstacle presence in 4 immediate cardinal directions
    const isWall = (x: number, y: number) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return 1;
      return cells[y][x].type === 'wall' ? 1 : 0;
    };

    const wallUp = isWall(currentX, currentY - 1);
    const wallRight = isWall(currentX + 1, currentY);
    const wallDown = isWall(currentX, currentY + 1);
    const wallLeft = isWall(currentX - 1, currentY);

    return [
      startX,
      startY,
      goalX,
      goalY,
      currNormX,
      currNormY,
      wallUp,
      wallRight,
      wallDown,
      wallLeft,
    ];
  }
}
