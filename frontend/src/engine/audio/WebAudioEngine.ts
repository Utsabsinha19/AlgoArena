// ============================================================================
// AlgoArena v3.0 - Immersive Procedural Web Audio Engine (Section 3)
// Real-time synthesis of search velocity radar and victory fanfares
// ============================================================================

export class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private lastTriggerTime: number = 0;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Translates node exploration velocity into dynamic FM pitch & spatial audio pan
   * @param gridX - Current cell X coordinate
   * @param maxGridX - Total grid width
   * @param nodeVelocity - Expansion velocity (nodes/sec or nodes/step)
   */
  public playNodeExpansionSound(gridX: number, maxGridX: number, nodeVelocity: number = 10) {
    if (this.isMuted) return;
    const now = performance.now();
    // Throttle slightly to prevent audio clipping on hyper-fast searches
    if (now - this.lastTriggerTime < 24) return;
    this.lastTriggerTime = now;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Frequency scales with expansion velocity (200 Hz to 800 Hz)
      const baseFreq = 200 + Math.min(nodeVelocity * 12, 600);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      // Pan sound based on grid X position (-1.0 left to +1.0 right)
      const panVal = maxGridX > 1 ? (gridX / maxGridX) * 2 - 1 : 0;
      const clampedPan = Math.max(-0.95, Math.min(0.95, panVal));

      if (typeof this.ctx.createStereoPanner === 'function') {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(clampedPan, this.ctx.currentTime);
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      // Snappy micro-envelope
      gain.gain.setValueAtTime(0.045, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore transient audio context interruptions
    }
  }

  /**
   * Multi-chord victory arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
   */
  public playVictoryStinger() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';

        const startTime = this.ctx!.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        gain.connect(this.masterGain!);
        osc.connect(gain);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {
      // Ignore transient audio interruptions
    }
  }
}

// Global Singleton Instance
export const webAudioEngine = new WebAudioEngine();
