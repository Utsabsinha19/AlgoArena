// ============================================================================
// AlgoArena v3.0 - Web Worker Search Manager Hook (Section 1.1)
// Manages worker threads, zero-copy typed arrays, and streaming search snapshots
// ============================================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import { GridState, AlgorithmType } from '../types';
import { StepSnapshot, WorkerResponse } from '../types/algoArena';

export interface WebWorkerSearchOptions {
  onStep?: (snapshot: StepSnapshot) => void;
  onComplete?: (result: { path: number[]; nodesExplored: number; executionTimeMs: number; cost: number }) => void;
  onError?: (error: string) => void;
}

export function useWebWorkerSearch(options: WebWorkerSearchOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [progress, setProgress] = useState<StepSnapshot | null>(null);
  const [workerSupported, setWorkerSupported] = useState<boolean>(true);

  // Initialize Worker instance
  useEffect(() => {
    try {
      if (typeof Worker !== 'undefined') {
        const worker = new Worker(
          new URL('../workers/pathfinding.worker.ts', import.meta.url),
          { type: 'module' }
        );

        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          const data = e.data;
          if (data.type === 'SEARCH_STEP' && data.snapshot) {
            setProgress(data.snapshot);
            options.onStep?.(data.snapshot);
          } else if (data.type === 'SEARCH_COMPLETE' && data.result) {
            setIsSearching(false);
            setProgress(null);
            options.onComplete?.(data.result);
          } else if (data.type === 'SEARCH_ERROR') {
            setIsSearching(false);
            options.onError?.(data.error || 'Worker error occurred');
          }
        };

        workerRef.current = worker;
      } else {
        setWorkerSupported(false);
      }
    } catch (err) {
      console.warn('Web Workers unavailable in current environment; falling back to main-thread execution', err);
      setWorkerSupported(false);
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const startWorkerSearch = useCallback(
    (
      algorithm: AlgorithmType,
      grid: GridState,
      heuristicWeight = 1.0
    ): boolean => {
      if (!workerRef.current || !grid.start || !grid.end) {
        return false;
      }

      const { width, height, cells, start, end } = grid;
      const totalCells = width * height;
      const weights = new Float32Array(totalCells);

      // Encode grid cell costs into typed Float32Array
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const cell = cells[y][x];

          if (cell.type === 'wall') {
            weights[idx] = 9999;
          } else if (cell.type === 'mud') {
            weights[idx] = 5.0;
          } else if (cell.type === 'water') {
            weights[idx] = 3.0;
          } else if (cell.type === 'boost') {
            weights[idx] = 0.5;
          } else {
            weights[idx] = 1.0;
          }
        }
      }

      setIsSearching(true);
      setProgress(null);

      workerRef.current.postMessage({
        type: 'START_SEARCH',
        algorithm,
        dimensions: [width, height],
        startNode: [start.x, start.y],
        goalNode: [end.x, end.y],
        weights,
        heuristicWeight,
      });

      return true;
    },
    []
  );

  const cancelSearch = useCallback(() => {
    if (workerRef.current && isSearching) {
      workerRef.current.postMessage({ type: 'CANCEL_SEARCH' });
      setIsSearching(false);
      setProgress(null);
    }
  }, [isSearching]);

  return {
    startWorkerSearch,
    cancelSearch,
    isSearching,
    progress,
    workerSupported,
  };
}
