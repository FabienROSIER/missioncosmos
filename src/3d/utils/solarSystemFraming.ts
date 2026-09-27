import { ArcRotateCamera, Vector3 } from '@babylonjs/core';

/** Vue d’ensemble maquette système solaire. */
export function frameSolarSystemOverview(
  camera: ArcRotateCamera,
  maxOrbit: number,
): void {
  camera.setTarget(Vector3.Zero());
  const viewDir = new Vector3(0.35, 0.78, 0.52);
  viewDir.normalize();
  camera.beta = Math.acos(Math.min(1, Math.max(-1, viewDir.y)));
  camera.alpha = Math.atan2(viewDir.x, viewDir.z);
  // Grand système (mode Distances ≈ UA) : cadrage large + zoom loin autorisé
  const span = Math.max(maxOrbit, 8);
  camera.radius = Math.max(span * 1.75, 16);
  camera.lowerRadiusLimit = Math.max(span * 0.28, 4);
  camera.upperRadiusLimit = Math.max(span * 5.5, 200);
  camera.minZ = Math.max(0.08, span * 0.002);
}

/** Cadre sur une planète (ou le Soleil). */
export function frameSolarSystemBody(
  camera: ArcRotateCamera,
  position: Vector3,
  visualRadius: number,
): void {
  camera.setTarget(position.clone());
  const r = Math.max(visualRadius, 0.05);
  camera.radius = Math.max(r * 5.5, 1.8);
  camera.lowerRadiusLimit = Math.max(r * 2.1, 0.9);
  camera.upperRadiusLimit = Math.max(r * 24, 80);
  camera.minZ = Math.max(0.05, r * 0.04);
  camera.beta = Math.PI / 2.55;
}
