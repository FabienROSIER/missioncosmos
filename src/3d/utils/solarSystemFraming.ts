import { ArcRotateCamera, Vector3 } from '@babylonjs/core';
import {
  acceptResponsiveCameraRadius,
  markDesktopCameraRadius,
  syncResponsiveCameraZoom,
} from '@/3d/controls/missionCamera';
import { cameraRadiusFittingSphere, cameraRadiusForSphere } from '@/3d/utils/cameraFraming';

/** Marge entre le bord du cadre et l’orbite la plus large. */
export const SOLAR_OVERVIEW_PADDING = 0.08;
/**
 * Le corps le plus extérieur (Neptune) et l’épaisseur du tore dépassent l’anneau.
 * Les anneaux de Saturne restent à l’intérieur de cette enveloppe.
 */
export const SOLAR_OVERVIEW_BODY_CLEARANCE = 0.6;

/** Rayon monde qui contient toutes les orbites et le corps posé sur la plus large. */
export function solarSystemOverviewBound(maxOrbit: number): number {
  return Math.max(maxOrbit, 8) + SOLAR_OVERVIEW_BODY_CLEARANCE;
}

/** Distance caméra pour que cette enveloppe tienne entière dans le cadre courant. */
export function solarSystemOverviewRadius(maxOrbit: number, fov: number, aspect: number): number {
  return cameraRadiusForSphere(
    solarSystemOverviewBound(maxOrbit),
    fov,
    aspect,
    SOLAR_OVERVIEW_PADDING,
  );
}

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
  const span = Math.max(maxOrbit, 8);
  const fitted = cameraRadiusFittingSphere(
    camera,
    solarSystemOverviewBound(maxOrbit),
    SOLAR_OVERVIEW_PADDING,
  );
  camera.lowerRadiusLimit = Math.max(span * 0.28, 4);
  camera.upperRadiusLimit = Math.max(span * 5.5, fitted * 1.8, 200);
  camera.radius = Math.max(fitted, camera.lowerRadiusLimit);
  camera.minZ = Math.max(0.08, span * 0.002);
  acceptResponsiveCameraRadius(camera);
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
  // Pas de configureMissionCamera ensuite → appliquer ici.
  // Le rayon ci-dessus est le desktop : le boost paysage reste utile sur un astre.
  markDesktopCameraRadius(camera);
  syncResponsiveCameraZoom(camera);
}
