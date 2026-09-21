// ============================================================================
// AlgoArena v3.0 - Volumetric Energy Path GLSL Shader (Section 2.1)
// Custom WebGL Shader Material with pulsing energy density & cyan Fresnel glow
// ============================================================================

import * as THREE from 'three';

export const LaserPathShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00ffff') },
    uGlowIntensity: { value: 2.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uGlowIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // Dynamic pulsing energy wave traveling along path length (vUv.x)
      float pulse = 0.8 + 0.25 * sin(uTime * 8.0 + vUv.x * 24.0);

      // View-direction Fresnel glow along grazing edges
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.2);

      // Combine base neon color, pulse multiplier, and edge bloom
      vec3 finalColor = uColor * uGlowIntensity * pulse + vec3(fresnel * 0.6);

      // Translucent laser core with soft edge falloff
      float alpha = clamp(0.75 + fresnel * 0.25, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

export function createLaserShaderMaterial(colorHex = '#00ffff', glowIntensity = 2.5) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(colorHex) },
      uGlowIntensity: { value: glowIntensity },
    },
    vertexShader: LaserPathShader.vertexShader,
    fragmentShader: LaserPathShader.fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}
