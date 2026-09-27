import { ArcRotateCamera, Vector3, type AbstractMesh, type TransformNode } from '@babylonjs/core';

/** Rayon englobant approximatif (monde) d'un pivot + ses meshes. */
export function getVisualRadius(pivot: TransformNode, meshes: AbstractMesh[]): number {
  let radius = 0;
  for (const mesh of meshes) {
    if (!mesh.getBoundingInfo) continue;
    mesh.computeWorldMatrix(true);
    const sphere = mesh.getBoundingInfo().boundingSphere;
    radius = Math.max(radius, sphere.radiusWorld);
  }

  if (radius <= 0) {
    const { min, max } = pivot.getHierarchyBoundingVectors(true);
    const extent = max.subtract(min).scale(0.5);
    radius = Math.max(extent.x, extent.y, extent.z, 1);
  }

  return radius;
}

/**
 * Place la caméra du côté d'où vient la lumière (face jour).
 * `sunDirection` = direction des rayons (DirectionalLight.direction).
 */
export function orientCameraToDaySide(
  camera: ArcRotateCamera,
  sunDirection: Vector3 = new Vector3(-0.7, -0.35, -0.5),
): void {
  // Vecteur Terre → Soleil = opposé aux rayons
  const toSun = sunDirection.scale(-1);
  if (toSun.lengthSquared() < 1e-8) return;
  toSun.normalize();

  // Formule ArcRotateCamera Babylon : pos = target + (sinβ·sinα, cosβ, sinβ·cosα) * r
  const beta = Math.acos(Math.min(1, Math.max(-1, toSun.y)));
  const alpha = Math.atan2(toSun.x, toSun.z);
  camera.alpha = alpha;
  camera.beta = beta;
}

/**
 * Vue pédagogique jour/nuit : plongée depuis le côté de l’axe Soleil–Terre.
 * Terre = sujet principal ; Soleil partiellement visible en bord d’écran.
 */
export function frameDayNightOverview(
  camera: ArcRotateCamera,
  earthPos: Vector3,
  sunPos: Vector3,
  sunDirection: Vector3 = new Vector3(-0.7, -0.35, -0.5),
): void {
  // Biais Terre, mais assez vers le Soleil pour le garder en bord de cadre
  const target = Vector3.Lerp(sunPos, earthPos, 0.72);
  camera.setTarget(target);

  const toSun = sunDirection.scale(-1);
  if (toSun.lengthSquared() < 1e-8) return;
  toSun.normalize();

  let side = Vector3.Cross(toSun, Vector3.Up());
  if (side.lengthSquared() < 1e-6) {
    side = Vector3.Cross(toSun, new Vector3(1, 0, 0));
  }
  side.normalize();

  // Plongée + léger côté (évite l’alignement Soleil→Terre)
  const viewDir = side.scale(0.52).add(new Vector3(0, 0.88, 0));
  viewDir.normalize();

  const span = Math.max(Vector3.Distance(earthPos, sunPos), 1);
  camera.beta = Math.acos(Math.min(1, Math.max(-1, viewDir.y)));
  camera.alpha = Math.atan2(viewDir.x, viewDir.z);
  // Assez large pour voir un bout du Soleil, Terre encore dominante
  camera.radius = Math.min(5.6, span * 0.85);
  camera.lowerRadiusLimit = 3.4;
  camera.upperRadiusLimit = Math.max(span * 1.8, 24);
  camera.minZ = 0.08;
}

/**
 * @deprecated Préférer frameDayNightOverview pour Mission 02.
 */
export function orientCameraToDayNightThreeQuarter(
  camera: ArcRotateCamera,
  sunDirection: Vector3 = new Vector3(-0.7, -0.35, -0.5),
): void {
  const toSun = sunDirection.scale(-1);
  if (toSun.lengthSquared() < 1e-8) return;
  toSun.normalize();

  let side = Vector3.Cross(toSun, Vector3.Up());
  if (side.lengthSquared() < 1e-6) {
    side = Vector3.Cross(toSun, new Vector3(1, 0, 0));
  }
  side.normalize();

  const viewDir = side.scale(0.5).add(new Vector3(0, 0.88, 0));
  viewDir.normalize();

  camera.beta = Math.acos(Math.min(1, Math.max(-1, viewDir.y)));
  camera.alpha = Math.atan2(viewDir.x, viewDir.z);
}

/**
 * Vue Mission 03 : Soleil visible en bord de cadre + Terre/orbite lisibles.
 * Même logique que frameDayNightOverview (biais cible vers le Soleil).
 */
export function frameMoonPhasesOverview(
  camera: ArcRotateCamera,
  earthPos: Vector3,
  sunPos: Vector3,
  orbitRadius: number,
): void {
  // Biais Terre, mais assez vers le Soleil pour le garder à l’écran
  const target = Vector3.Lerp(sunPos, earthPos, 0.64);
  camera.setTarget(target);

  const toSun = sunPos.subtract(earthPos);
  if (toSun.lengthSquared() < 1e-8) return;
  toSun.normalize();

  let side = Vector3.Cross(toSun, Vector3.Up());
  if (side.lengthSquared() < 1e-6) {
    side = Vector3.Cross(toSun, new Vector3(1, 0, 0));
  }
  side.normalize();

  // Moins zénithal que v1 : le Soleil reste un disque visible sur le côté
  const viewDir = side.scale(0.55).add(toSun.scale(0.12)).add(new Vector3(0, 0.76, 0));
  viewDir.normalize();

  camera.beta = Math.acos(Math.min(1, Math.max(-1, viewDir.y)));
  camera.alpha = Math.atan2(viewDir.x, viewDir.z);

  const sunDist = Vector3.Distance(earthPos, sunPos);
  camera.radius = Math.max(orbitRadius * 3.15, sunDist * 0.95, 7.2);
  camera.lowerRadiusLimit = Math.max(orbitRadius * 2.1, 4.8);
  camera.upperRadiusLimit = Math.max(sunDist * 2.4, 28);
  camera.minZ = 0.08;
}

/**
 * Empêche la caméra de rentrer dans le globe.
 * lower = rayon * marge ; distance initiale confortable.
 */
export function frameCelestialCamera(
  camera: ArcRotateCamera,
  pivot: TransformNode,
  meshes: AbstractMesh[],
  options?: {
    margin?: number;
    startFactor?: number;
    maxFactor?: number;
    /** Direction des rayons solaires — oriente la vue face jour. */
    sunDirection?: Vector3;
  },
): void {
  const margin = options?.margin ?? 1.35;
  const startFactor = options?.startFactor ?? 2.4;
  const maxFactor = options?.maxFactor ?? 8;

  const radius = getVisualRadius(pivot, meshes);
  const lower = radius * margin;

  camera.setTarget(pivot.getAbsolutePosition());
  camera.lowerRadiusLimit = lower;
  camera.upperRadiusLimit = Math.max(radius * maxFactor, lower + 1);
  camera.radius = Math.max(radius * startFactor, lower + 0.25);
  camera.minZ = Math.max(0.05, lower * 0.04);
  camera.wheelDeltaPercentage = 0.02;
  camera.pinchDeltaPercentage = 0.02;

  if (options?.sunDirection) {
    orientCameraToDaySide(camera, options.sunDirection);
  }
}
