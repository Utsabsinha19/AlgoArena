// ============================================
// AlgoArena - Procedural Synthwave Audio System
// ============================================

let audioContext: AudioContext | null = null;
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let isMuted = false;
let masterVolume = 0.5;
let isAmbientActive = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function enableAudio(): void {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (isMuted && ambientGain && audioContext) {
    ambientGain.gain.setValueAtTime(0, audioContext.currentTime);
  } else if (!isMuted && ambientGain && audioContext && isAmbientActive) {
    ambientGain.gain.setValueAtTime(0.04 * masterVolume, audioContext.currentTime);
  }
  return isMuted;
}

export function getMuteState(): boolean {
  return isMuted;
}

export function setMasterVolume(vol: number): void {
  masterVolume = Math.max(0, Math.min(1, vol));
  if (ambientGain && audioContext && !isMuted && isAmbientActive) {
    ambientGain.gain.setValueAtTime(0.04 * masterVolume, audioContext.currentTime);
  }
}

// Play a single procedural tone
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1): void {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    const actualVol = volume * masterVolume;
    gainNode.gain.setValueAtTime(actualVol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Real-time node exploration pitch modulation
 * Maps exploration progress and speed into futuristic sci-fi pulses
 */
export function playExplorationTone(progressRatio: number, distanceToGoal = 10): void {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const baseFreq = 220; // A3
    // Frequency rises smoothly as search nears goal
    const targetFreq = Math.min(1200, Math.max(160, baseFreq + progressRatio * 480 - Math.min(distanceToGoal, 30) * 8));

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(targetFreq * 1.05, ctx.currentTime + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 + progressRatio * 1500, ctx.currentTime);

    gain.gain.setValueAtTime(0.025 * masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Audio context may not be initiated yet
  }
}

/**
 * Triumphant Synthwave chord arpeggios on victory
 */
export function playSynthwaveVictory(): void {
  if (isMuted) return;
  try {
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [293.66, 369.99, 440.00, 587.33], // D Major
      [329.63, 415.30, 493.88, 659.25], // E Major
      [392.00, 493.88, 587.33, 783.99], // G Major
      [523.25, 659.25, 783.99, 1046.50], // C6 High
    ];

    chords.forEach((chord, stepIdx) => {
      setTimeout(() => {
        chord.forEach((freq) => {
          playTone(freq, 0.35, 'sawtooth', 0.04);
          playTone(freq * 0.5, 0.4, 'sine', 0.05);
        });
      }, stepIdx * 140);
    });
  } catch (err) {
    console.warn('Victory audio failed:', err);
  }
}

/**
 * Glitch audio soundscape when trapped in dead ends or hazard collision
 */
export function playGlitchDefeat(): void {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120 + Math.random() * 240, ctx.currentTime);
        gain.gain.setValueAtTime(0.05 * masterVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      }, i * 45);
    }
  } catch (err) {
    console.warn('Glitch audio failed:', err);
  }
}

/**
 * Ambient Cyberpunk Synth Drone generator
 */
export function toggleAmbientDrone(): boolean {
  if (isAmbientActive) {
    if (ambientOsc1) {
      ambientOsc1.stop();
      ambientOsc1.disconnect();
      ambientOsc1 = null;
    }
    if (ambientOsc2) {
      ambientOsc2.stop();
      ambientOsc2.disconnect();
      ambientOsc2 = null;
    }
    isAmbientActive = false;
    return false;
  }

  try {
    enableAudio();
    const ctx = getAudioContext();
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(isMuted ? 0 : 0.035 * masterVolume, ctx.currentTime);

    // Deep sub drone (55Hz = A1)
    ambientOsc1 = ctx.createOscillator();
    ambientOsc1.type = 'sawtooth';
    ambientOsc1.frequency.setValueAtTime(55, ctx.currentTime);

    // Warm fifth harmonic (82.4Hz = E2) with slight detune
    ambientOsc2 = ctx.createOscillator();
    ambientOsc2.type = 'sine';
    ambientOsc2.frequency.setValueAtTime(82.4, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);

    ambientOsc1.connect(filter);
    ambientOsc2.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientOsc1.start();
    ambientOsc2.start();

    isAmbientActive = true;
    return true;
  } catch (err) {
    console.warn('Ambient drone error:', err);
    return false;
  }
}

export function isAmbientRunning(): boolean {
  return isAmbientActive;
}

// Built-in sound effects
export const sounds = {
  click: () => playTone(800, 0.05, 'square', 0.05),
  visit: () => playTone(400 + Math.random() * 200, 0.03, 'sine', 0.03),
  pathFound: () => {
    playTone(523.25, 0.12, 'sine', 0.1);
    setTimeout(() => playTone(659.25, 0.12, 'sine', 0.1), 100);
    setTimeout(() => playTone(783.99, 0.18, 'sine', 0.1), 200);
  },
  noPath: () => playGlitchDefeat(),
  victory: () => playSynthwaveVictory(),
  defeat: () => playGlitchDefeat(),
  hover: () => playTone(600, 0.02, 'sine', 0.02),
  start: () => playTone(440, 0.1, 'sine', 0.08),
  step: () => playTone(300 + Math.random() * 100, 0.02, 'sine', 0.02),
  timerWarning: () => playTone(800, 0.1, 'square', 0.05),
  timerCritical: () => {
    playTone(1000, 0.15, 'square', 0.08);
    setTimeout(() => playTone(1000, 0.15, 'square', 0.08), 200);
  },
  obstacleNear: () => playTone(200, 0.05, 'sawtooth', 0.03),
  terrainPlace: () => playTone(350, 0.03, 'triangle', 0.05),
  terrainRemove: () => playTone(250, 0.03, 'triangle', 0.05),
  mazeGenerated: () => {
    [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.08), i * 100);
    });
  },
  achievement: () => {
    [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.1, 'sine', 0.08), i * 80);
    });
  },
};

export function playSound(soundKey: keyof typeof sounds): void {
  if (isMuted) return;
  sounds[soundKey]?.();
}
