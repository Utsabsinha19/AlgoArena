// ============================================================================
// AlgoArena v4.0 - Deep Q-Learning Replay Buffer & Experience Store (Section 2)
// Decouples state transitions and breaks temporal correlations for TFJS training
// ============================================================================

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
    if (this.buffer.length === 0) return samples;
    for (let i = 0; i < batchSize; i++) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      samples.push(this.buffer[idx]);
    }
    return samples;
  }

  public size(): number {
    return this.buffer.length;
  }

  /**
   * Sample mini-batch as TensorFlow.js Tensors for accelerated neural updates
   */
  public sampleTensors(batchSize: number): {
    states: tf.Tensor2D;
    actions: tf.Tensor1D;
    rewards: tf.Tensor1D;
    nextStates: tf.Tensor2D;
    dones: tf.Tensor1D;
  } {
    const batch = this.sample(batchSize);
    return tf.tidy(() => ({
      states: tf.tensor2d(batch.map((e) => e.state)),
      actions: tf.tensor1d(batch.map((e) => e.action), 'int32'),
      rewards: tf.tensor1d(batch.map((e) => e.reward)),
      nextStates: tf.tensor2d(batch.map((e) => e.nextState)),
      dones: tf.tensor1d(batch.map((e) => (e.done ? 1 : 0))),
    }));
  }

  public clear() {
    this.buffer = [];
  }
}
