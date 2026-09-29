import type { AbstractEngine } from '@babylonjs/core';
import type { ResolvedGraphicsQuality } from '@/3d/materials/graphicsQuality';

/**
 * Résolution moteur sans double application DPR.
 * `adaptToDeviceRatio` doit rester false sur le Engine : on gère ici.
 *
 * hardwareScalingLevel > 1 = moins de pixels (meilleures perfs mobile).
 */
export function applyEngineResolution(
  engine: AbstractEngine,
  quality: ResolvedGraphicsQuality,
): void {
  const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const dprCap = quality === 'low' ? 1.25 : 1.75;
  const targetDpr = Math.min(rawDpr, dprCap);
  // level = CSS pixels / buffer pixels ratio inverted:
  // buffer ≈ client * (rawDpr/level)... Babylon: width = clientWidth / level.
  // On vise buffer ≈ client * targetDpr → level = rawDpr / targetDpr (≥ 1).
  const level = Math.max(1, rawDpr / targetDpr);
  engine.setHardwareScalingLevel(level);
  engine.resize();
}
