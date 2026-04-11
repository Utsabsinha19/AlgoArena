// ============================================
// AlgoArena - Sound Effects System
// ============================================

// Audio context for sound generation
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Play a tone
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

// Sound effects
export const sounds = {
  // Click sound
  click: () => {
    playTone(800, 0.05, 'square', 0.05);
  },

  // Cell visit sound
  visit: () => {
    playTone(400 + Math.random() * 200, 0.03, 'sine', 0.03);
  },

  // Path found sound
  pathFound: () => {
    playTone(523.25, 0.1, 'sine', 0.1); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.1), 100); // E5
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.1), 200); // G5
  },

  // No path found sound
  noPath: () => {
    playTone(200, 0.3, 'sawtooth', 0.1);
    setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.1), 150);
  },

  // Victory fanfare
  victory: () => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.1), i * 150);
    });
  },

  // Defeat sound
  defeat: () => {
    playTone(400, 0.2, 'triangle', 0.1);
    setTimeout(() => playTone(300, 0.2, 'triangle', 0.1), 150);
    setTimeout(() => playTone(200, 0.3, 'triangle', 0.1), 300);
  },

  // Button hover
  hover: () => {
    playTone(600, 0.02, 'sine', 0.02);
  },

  // Start algorithm
  start: () => {
    playTone(440, 0.1, 'sine', 0.08);
  },

  // Step sound for learning mode
  step: () => {
    playTone(300 + Math.random() * 100, 0.02, 'sine', 0.02);
  },

  // Timer warning (time attack mode)
  timerWarning: () => {
    playTone(800, 0.1, 'square', 0.05);
  },

  // Timer critical
  timerCritical: () => {
    playTone(1000, 0.15, 'square', 0.08);
    setTimeout(() => playTone(1000, 0.15, 'square', 0.08), 200);
  },

  // Dynamic obstacle near
  obstacleNear: () => {
    playTone(200, 0.05, 'sawtooth', 0.03);
  },

  // Terrain place
  terrainPlace: () => {
    playTone(350, 0.03, 'triangle', 0.05);
  },

  // Terrain remove
  terrainRemove: () => {
    playTone(250, 0.03, 'triangle', 0.05);
  },

  // Maze generated
  mazeGenerated: () => {
    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.08), i * 100);
    });
  },

  // Achievement unlocked
  achievement: () => {
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; // C5, E5, G5, C6, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.1, 'sine', 0.08), i * 80);
    });
  },
};

// Enable audio context (must be called after user interaction)
export function enableAudio(): void {
  if (audioContext?.state === 'suspended') {
    audioContext.resume();
  }
}

// Toggle mute
let isMuted = false;

export function toggleMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuteState(): boolean {
  return isMuted;
}

// Wrap sound functions with mute check
export function playSound(soundKey: keyof typeof sounds): void {
  if (isMuted) return;
  sounds[soundKey]?.();
}
