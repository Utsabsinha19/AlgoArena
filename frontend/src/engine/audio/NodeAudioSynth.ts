// ============================================================================
// AlgoArena v2.0 - Web Audio API Procedural Synthesizer & Spatial Panning
// ============================================================================

class NodeAudioSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;
  private masterVolume = 0.5;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public enable(): void {
    this.initContext();
  }

  public setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  /**
   * Frequency Modulation (FM) Node Radar with Spatialized Audio Panning (Section 1.2)
   * @param progressRatio 0.0 to 1.0 (how close to the goal or max exploration)
   * @param gridX X-coordinate of current node
   * @param gridWidth Total grid width
   * @param velocity Expansion speed factor (1.0 to 5.0)
   */
  public triggerNodeRadar(progressRatio: number, gridX: number, gridWidth: number, velocity = 1.0): void {
    if (this.isMuted) return;

    try {
      const ctx = this.initContext();

      // Pitch shifts dynamically from 220Hz (A3) to 880Hz (A5)
      const baseFreq = 220;
      const targetFreq = Math.min(880, Math.max(220, baseFreq + progressRatio * 660 * Math.min(velocity, 1.5)));

      // Spatial stereo panning: -1.0 (far left) to +1.0 (far right)
      const panValue = Math.max(-1, Math.min(1, (gridX / Math.max(1, gridWidth - 1)) * 2 - 1));

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(targetFreq * 1.04, ctx.currentTime + 0.035);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + progressRatio * 1800, ctx.currentTime);

      const duration = 0.04;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);

      // Connect through StereoPannerNode if supported
      if ('createStereoPanner' in ctx) {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(panValue, ctx.currentTime);
        gain.connect(panner);
        panner.connect(this.masterGain!);
      } else {
        gain.connect(this.masterGain!);
      }

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Browser audio context safety
    }
  }

  /**
   * Triumphant Synthwave Arpeggio chords on victory
   */
  public triggerVictoryFanfare(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.initContext();
      const chords = [
        [261.63, 329.63, 392.00], // C
        [293.66, 369.99, 440.00], // D
        [329.63, 415.30, 493.88], // E
        [523.25, 659.25, 783.99, 1046.50], // C High Maj7
      ];

      chords.forEach((chord, i) => {
        setTimeout(() => {
          chord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(this.masterGain!);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.35);
          });
        }, i * 120);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Glitch Defeat audio soundscape
   */
  public triggerGlitchDefeat(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.initContext();
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(140 + Math.random() * 260, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.06);
        }, i * 50);
      }
    } catch {
      // Audio safety
    }
  }

  /**
   * Ambient Cyberpunk Synth Drone
   */
  public toggleAmbientDrone(): boolean {
    if (this.isAmbientPlaying) {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
        this.ambientOsc1 = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
      this.isAmbientPlaying = false;
      return false;
    }

    try {
      const ctx = this.initContext();
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.04, ctx.currentTime);

      this.ambientOsc1 = ctx.createOscillator();
      this.ambientOsc1.type = 'sawtooth';
      this.ambientOsc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 sub

      this.ambientOsc2 = ctx.createOscillator();
      this.ambientOsc2.type = 'sine';
      this.ambientOsc2.frequency.setValueAtTime(82.4, ctx.currentTime); // E2 fifth

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain!);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
      return true;
    } catch {
      return false;
    }
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }
}

export const NodeAudioSynth = new NodeAudioSynthEngine();
