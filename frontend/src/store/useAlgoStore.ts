// ============================================================================
// AlgoArena v5.0 - Deterministic State Stream & Match Replay Store (Section 4)
// Captures full deterministic events and serializes binary/JSON .algoa replay files
// ============================================================================

import { create } from 'zustand';

export interface TelemetryEvent {
  timeMs: number;
  algoId: string;
  node: number;
  action: string;
}

export interface MatchReplayFile {
  version: string;
  timestamp: number;
  seed: number;
  gridDimensions: [number, number];
  selectedAlgorithms: string[];
  telemetryEvents: TelemetryEvent[];
}

export interface AlgoArenaState {
  isMatchActive: boolean;
  isRecording: boolean;
  recordingStartTime: number;
  replayData: MatchReplayFile | null;
  selectedSquad: string[];
  setSquad: (squad: string[]) => void;
  setMatchActive: (active: boolean) => void;
  startMatchRecording: (seed: number, gridDimensions: [number, number], selectedAlgorithms: string[]) => void;
  recordTelemetryEvent: (algoId: string, node: number, action?: string) => void;
  stopMatchRecording: () => MatchReplayFile | null;
  exportReplayJSON: () => string;
  loadReplayJSON: (jsonStr: string) => void;
  downloadReplayFile: (filename?: string) => void;
  clearReplay: () => void;
}

export const useAlgoStore = create<AlgoArenaState>((set, get) => ({
  isMatchActive: false,
  isRecording: false,
  recordingStartTime: 0,
  replayData: null,
  selectedSquad: ['A_STAR', 'DIJKSTRA', 'GENETIC'],

  setSquad: (squad) => set({ selectedSquad: squad }),
  setMatchActive: (active) => set({ isMatchActive: active }),

  startMatchRecording: (seed, gridDimensions, selectedAlgorithms) => {
    const newReplay: MatchReplayFile = {
      version: '5.0.0',
      timestamp: Date.now(),
      seed,
      gridDimensions,
      selectedAlgorithms,
      telemetryEvents: [],
    };
    set({
      isRecording: true,
      isMatchActive: true,
      recordingStartTime: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      replayData: newReplay,
    });
  },

  recordTelemetryEvent: (algoId, node, action = 'EXPAND') => {
    const { isRecording, replayData, recordingStartTime } = get();
    if (!isRecording || !replayData) return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const event: TelemetryEvent = {
      timeMs: Math.round(now - recordingStartTime),
      algoId,
      node,
      action,
    };

    replayData.telemetryEvents.push(event);
  },

  stopMatchRecording: () => {
    const { replayData } = get();
    set({ isRecording: false, isMatchActive: false });
    return replayData;
  },

  exportReplayJSON: () => {
    const replay = get().replayData;
    return JSON.stringify(replay || {}, null, 2);
  },

  loadReplayJSON: (jsonStr: string) => {
    try {
      const replay = JSON.parse(jsonStr) as MatchReplayFile;
      set({ replayData: replay, selectedSquad: replay.selectedAlgorithms || get().selectedSquad });
    } catch (err) {
      console.error('[AlgoStore]: Failed to parse .algoa replay JSON', err);
    }
  },

  downloadReplayFile: (filename = 'match_replay.algoa') => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const jsonStr = get().exportReplayJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  clearReplay: () => set({ replayData: null, isRecording: false, isMatchActive: false }),
}));
