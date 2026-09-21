// ============================================================================
// AlgoArena v2.0 - 3D Arena Controls Hook (Section 5)
// Manages Orbit Camera presets, smooth lerp damping, runner chase mode,
// and unrestricted user zooming / orbiting
// ============================================================================

import { useRef, useCallback, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CameraMode } from '../types';

export interface ArenaCameraConfig {
  gridWidth: number;
  gridHeight: number;
  mode: CameraMode;
  leadNode?: { x: number; y: number } | null;
}

export interface Arena3DControlsReturn {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  getCameraPresetPosition: (mode: CameraMode) => THREE.Vector3;
  getCameraTargetPosition: (mode: CameraMode) => THREE.Vector3;
  updateCameraStep: (
    camera: THREE.Camera,
    mode: CameraMode,
    leadNode?: { x: number; y: number } | null,
    lerpFactor?: number
  ) => void;
  stopTransition: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  defaultPosition: [number, number, number];
}

export function use3DArenaControls({
  gridWidth,
  gridHeight,
  mode,
  leadNode,
}: ArenaCameraConfig): Arena3DControlsReturn {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const currentModeRef = useRef<CameraMode>(mode);
  const isTransitioningRef = useRef<boolean>(true);

  const maxDimension = Math.max(gridWidth, gridHeight);

  // When external mode prop changes, initiate smooth camera transition
  useEffect(() => {
    isTransitioningRef.current = true;
    currentModeRef.current = mode;
  }, [mode]);

  // Preset camera positions
  const getCameraPresetPosition = useCallback(
    (targetMode: CameraMode): THREE.Vector3 => {
      switch (targetMode) {
        case 'tactical':
          // Bird's eye top-down view with generous zoom
          return new THREE.Vector3(0, maxDimension * 1.5, 0.01);
        case 'isometric':
          // Angled isometric perspective
          return new THREE.Vector3(0, maxDimension * 1.1, maxDimension * 0.9);
        case 'runner':
          // Dynamic chase camera following lead node or center
          if (leadNode) {
            return new THREE.Vector3(
              leadNode.x - gridWidth / 2 - 2,
              5,
              leadNode.y - gridHeight / 2 + 6
            );
          }
          return new THREE.Vector3(0, 10, 15);
      }
    },
    [maxDimension, gridWidth, gridHeight, leadNode]
  );

  const getCameraTargetPosition = useCallback(
    (targetMode: CameraMode): THREE.Vector3 => {
      if (targetMode === 'runner' && leadNode) {
        return new THREE.Vector3(
          leadNode.x - gridWidth / 2,
          0.5,
          leadNode.y - gridHeight / 2
        );
      }
      return new THREE.Vector3(0, 0, 0);
    },
    [gridWidth, gridHeight, leadNode]
  );

  // Stop camera transition immediately when user interacts (scrolls, drags)
  const stopTransition = useCallback(() => {
    isTransitioningRef.current = false;
  }, []);

  // Programmatic Zoom In
  const zoomIn = useCallback(() => {
    if (!controlsRef.current) return;
    isTransitioningRef.current = false;
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;
    const offset = camera.position.clone().sub(controls.target);
    const currentDist = offset.length();
    const newDist = Math.max(controls.minDistance || 2, currentDist * 0.75);
    offset.setLength(newDist);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  }, []);

  // Programmatic Zoom Out
  const zoomOut = useCallback(() => {
    if (!controlsRef.current) return;
    isTransitioningRef.current = false;
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;
    const offset = camera.position.clone().sub(controls.target);
    const currentDist = offset.length();
    const newDist = Math.min(controls.maxDistance || 250, currentDist * 1.35);
    offset.setLength(newDist);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  }, []);

  // Programmatic Reset View
  const resetView = useCallback(() => {
    isTransitioningRef.current = true;
  }, []);

  // Smooth frame lerp update: Only lerps during mode transition or runner chase;
  // otherwise preserves user's zoom level and orbit angle!
  const updateCameraStep = useCallback(
    (
      camera: THREE.Camera,
      activeMode: CameraMode,
      activeLeadNode?: { x: number; y: number } | null,
      lerpFactor = 0.05
    ) => {
      if (activeMode !== currentModeRef.current) {
        currentModeRef.current = activeMode;
        isTransitioningRef.current = true;
      }

      if (isTransitioningRef.current) {
        const targetCameraPos = getCameraPresetPosition(activeMode);
        const targetLookAt = getCameraTargetPosition(activeMode);

        camera.position.lerp(targetCameraPos, lerpFactor);

        if (controlsRef.current) {
          controlsRef.current.target.lerp(targetLookAt, lerpFactor);
          controlsRef.current.update();

          if (
            camera.position.distanceTo(targetCameraPos) < 0.15 &&
            controlsRef.current.target.distanceTo(targetLookAt) < 0.15
          ) {
            isTransitioningRef.current = false;
          }
        }
      } else if (activeMode === 'runner' && activeLeadNode) {
        const targetLookAt = getCameraTargetPosition('runner');
        if (controlsRef.current) {
          const delta = targetLookAt.clone().sub(controlsRef.current.target);
          controlsRef.current.target.lerp(targetLookAt, 0.08);
          camera.position.add(delta.multiplyScalar(0.08));
          controlsRef.current.update();
        }
      } else if (controlsRef.current) {
        controlsRef.current.update();
      }
    },
    [getCameraPresetPosition, getCameraTargetPosition]
  );

  const defaultPosition: [number, number, number] = useMemo(
    () => [0, maxDimension * 1.1, maxDimension * 0.9],
    [maxDimension]
  );

  return {
    controlsRef,
    getCameraPresetPosition,
    getCameraTargetPosition,
    updateCameraStep,
    stopTransition,
    zoomIn,
    zoomOut,
    resetView,
    defaultPosition,
  };
}
