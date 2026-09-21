// ============================================================================
// AlgoArena v3.0 - Sci-Fi Orbit Camera Controller (Section 7)
// Provides damped rotation, polar angle limits, and smooth cinematic panning
// ============================================================================

import { forwardRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export interface OrbitControls3DProps {
  enableDamping?: boolean;
  dampingFactor?: number;
  maxPolarAngle?: number;
  minDistance?: number;
  maxDistance?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export const OrbitControls3D = forwardRef<OrbitControlsImpl, OrbitControls3DProps>(
  (
    {
      enableDamping = true,
      dampingFactor = 0.05,
      maxPolarAngle = Math.PI / 2.05,
      minDistance = 4,
      maxDistance = 140,
      autoRotate = false,
      autoRotateSpeed = 0.5,
    },
    ref
  ) => {
    return (
      <OrbitControls
        ref={ref}
        enableDamping={enableDamping}
        dampingFactor={dampingFactor}
        maxPolarAngle={maxPolarAngle}
        minDistance={minDistance}
        maxDistance={maxDistance}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
      />
    );
  }
);

OrbitControls3D.displayName = 'OrbitControls3D';
