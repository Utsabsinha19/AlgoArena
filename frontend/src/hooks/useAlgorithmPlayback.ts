// ============================================================================
// AlgoArena v2.0 - Time-Dilation Playback Engine (`useAlgorithmPlayback`)
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchStepSnapshot } from '../types/algoArena';

export const useAlgorithmPlayback = (snapshots: SearchStepSnapshot[]) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, Math.max(0, snapshots.length - 1)));
  }, [snapshots.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const seekTo = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, Math.max(0, snapshots.length - 1))));
  }, [snapshots.length]);

  // Automated tick playback when isPlaying is true
  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) return;

    const tick = (time: number) => {
      // Step interval scales inversely with playback speed
      const intervalMs = Math.max(16, 120 / playbackSpeed);

      if (time - lastTickTimeRef.current >= intervalMs) {
        lastTickTimeRef.current = time;
        setCurrentStep((prev) => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, snapshots.length]);

  return {
    currentStep,
    activeSnapshot: snapshots[currentStep] ?? null,
    isPlaying,
    playbackSpeed,
    setIsPlaying,
    stepForward,
    stepBackward,
    seekTo,
    setPlaybackSpeed,
  };
};
