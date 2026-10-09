import { ArcRotateCamera, Vector3, type AbstractMesh, type TransformNode } from '@babylonjs/core';

/** Marge intérieure : le disque reste loin du bord de l’écran. */
export const BODY_FRAME_PADDING = 0.14;
/** Compense l’atmosphère / le halo, sans changer la taille du mesh. */
export const EARTH_VIEW_RADIUS_SCALE = 1.12;
export const SUN_VIEW_RADIUS_SCALE = 1.16;

export type FramingSphere = {
  center: Vector3;
  radius: number;
};

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

/** Plus petite sphère qui contient toutes les autres. */
export function enclosingSphere(spheres: readonly FramingSphere[]): FramingSphere {
  let center = spheres[0]?.center.clone() ?? Vector3.Zero();
  let radius = spheres[0]?.radius ?? 0;

  for (let i = 1; i < spheres.length; i++) {
    const next = spheres[i]!;
    const delta = next.center.subtract(center);
    const dist = delta.length();
    if (dist + next.radius <= radius) continue;
    if (dist + radius <= next.radius) {
      center = next.center.clone();
      radius = next.radius;
      continue;
    }
    const nextRadius = (dist + radius + next.radius) / 2;
    center = center.add(delta.scale((nextRadius - radius) / dist));
    radius = nextRadius;
  }

  return { center, radius };
}

/**
 * Distance caméra pour qu’une sphère centrée sur la cible tienne
 * dans le plus petit côté du cadre (fov vertical Babylon).
 */
export function cameraRadiusForSphere(
  boundRadius: number,
  fov: number,
  aspect: number,
  padding = BODY_FRAME_PADDING,
): number {
  const tanV = Math.tan(Math.max(fov, 0.2) / 2);
  const tanLimit = Math.min(tanV, tanV * Math.max(aspect, 0.2)) * (1 - padding);
  const half = Math.atan(Math.max(tanLimit, 0.05));
  return boundRadius / Math.sin(half);
}

/** Même calcul, avec le fov et le format réels du canvas. */
export function cameraRadiusFittingSphere(
  camera: ArcRotateCamera,
  boundRadius: number,
  padding = BODY_FRAME_PADDING,
): number {
  return cameraRadiusForSphere(boundRadius, camera.fov, canvasAspect(camera), padding);
}

function canvasAspect(camera: ArcRotateCamera): number {
  const canvas = camera.getScene().getEngine().getRenderingCanvas();
  const width = canvas?.clientWidth ?? 0;
  const height = canvas?.clientHeight ?? 0;
  if (width > 1 && height > 1) return width / height;
  const engine = camera.getScene().getEngine();
  const renderWidth = engine.getRenderWidth();
  const renderHeight = engine.getRenderHeight();
  if (renderWidth > 1 && renderHeight > 1) return renderWidth / renderHeight;
  // Avant le premier layout : prévoir un cadre étroit pour ne pas rogner.
  return 0.7;
}

/** Calcule cible + distance pour garder chaque sphère entière à l’écran. */
export function measureBodiesFraming(
  camera: ArcRotateCamera,
  spheres: readonly FramingSphere[],
  padding = BODY_FRAME_PADDING,
): FramingSphere {
  const enclosed = enclosingSphere(spheres);
  return {
    center: enclosed.center,
    radius: cameraRadiusForSphere(enclosed.radius, camera.fov, canvasAspect(camera), padding),
  };
}

/** Direction cible → caméra, avec la formule réelle d’ArcRotateCamera. */
export function applyArcRotateOffset(camera: ArcRotateCamera, offsetDir: Vector3): void {
  const dir = offsetDir.clone();
  if (dir.lengthSquared() < 1e-8) return;
  dir.normalize();
  camera.beta = Math.acos(Math.min(1, Math.max(-1, dir.y)));
  // offset = (cosα·sinβ, cosβ, sinα·sinβ)
  camera.alpha = Math.atan2(dir.z, dir.x);
}

/**
 * Place la caméra sur le rayon `desiredFromAnchor`, à la distance de cadrage du centre.
 * Le côté visible de l’astre ancre ne dépend donc pas du décalage de la cible.
 */
export function cameraPositionForAnchorView(
  anchor: Vector3,
  desiredFromAnchor: Vector3,
  frameCenter: Vector3,
  radius: number,
): Vector3 {
  const desired = desiredFromAnchor.clone();
  if (desired.lengthSquared() < 1e-8) desired.set(0, 0.2, 1);
  desired.normalize();
  const toCenter = frameCenter.subtract(anchor);
  const along = Vector3.Dot(desired, toCenter);
  const discriminant = Math.max(0, along * along - toCenter.lengthSquared() + radius * radius);
  const distance = along + Math.sqrt(discriminant);
  return anchor.add(desired.scale(Math.max(distance, 0.01)));
}

function horizontalSide(toSun: Vector3): Vector3 {
  let side = Vector3.Cross(toSun, Vector3.Up());
  if (side.lengthSquared() < 1e-6) {
    side = Vector3.Cross(toSun, new Vector3(1, 0, 0));
  }
  side.normalize();
  return side;
}

/**
 * Profil de l’axe Soleil–Terre : surtout sur le côté, un peu vers le Soleil
 * (davantage de face éclairée) et légèrement au-dessus.
 */
export function profileViewDirection(toSun: Vector3): Vector3 {
  const desired = horizontalSide(toSun).scale(0.88).add(toSun.scale(0.2)).add(new Vector3(0, 0.32, 0));
  desired.normalize();
  return desired;
}

/**
 * Éclipse : derrière le Soleil et au-dessus, dans l’alignement Soleil–Terre.
 * La hauteur laisse voir la Lune quand elle passe derrière la Terre.
 */
export function eclipseViewDirection(toSun: Vector3): Vector3 {
  const desired = toSun.scale(0.9).add(new Vector3(0, 0.42, 0));
  desired.normalize();
  return desired;
}

export function orientCameraForAnchor(
  camera: ArcRotateCamera,
  anchor: Vector3,
  desiredFromAnchor: Vector3,
  frame: FramingSphere,
): void {
  const camPos = cameraPositionForAnchorView(
    anchor,
    desiredFromAnchor,
    frame.center,
    frame.radius,
  );
  // setPosition fige la position voulue. setTarget, lui, recalcule
  // les angles depuis l’ancienne position et casserait le profil.
  camera.setPosition(camPos);
}

/** Cadrage + orientation ancrée (profil ou alignement). */
export function frameAnchoredBodies(
  camera: ArcRotateCamera,
  anchor: Vector3,
  desiredFromAnchor: Vector3,
  spheres: readonly FramingSphere[],
  padding = BODY_FRAME_PADDING,
): FramingSphere {
  const frame = measureBodiesFraming(camera, spheres, padding);
  camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit ?? 0, frame.radius * 1.55);
  // setTarget recalcule alpha/bêta depuis l’ancienne position : on oriente après.
  camera.setTarget(frame.center);
  orientCameraForAnchor(camera, anchor, desiredFromAnchor, frame);
  const lower = camera.lowerRadiusLimit ?? 0;
  camera.radius = Math.max(frame.radius, lower);
  if (camera.radius > frame.radius + 0.01 && lower > frame.radius) {
    camera.lowerRadiusLimit = frame.radius * 0.45;
    camera.radius = frame.radius;
  }
  return frame;
}

/** Applique le cadrage et relève la limite de dézoom si elle recadrait. */
export function applyBodiesFraming(
  camera: ArcRotateCamera,
  spheres: readonly FramingSphere[],
  padding = BODY_FRAME_PADDING,
): FramingSphere {
  const frame = measureBodiesFraming(camera, spheres, padding);
  camera.setTarget(frame.center);
  camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit ?? 0, frame.radius * 1.55);
  const lower = camera.lowerRadiusLimit ?? 0;
  camera.radius = Math.max(frame.radius, lower);
  if (camera.radius > frame.radius + 0.01 && lower > frame.radius) {
    camera.lowerRadiusLimit = frame.radius * 0.45;
    camera.radius = frame.radius;
  }
  return frame;
}

/**
 * Recadre au resize tant que la caméra est encore sur la vue auto.
 * « Recentrer » retrouve Soleil + Terre même après un changement d’orientation.
 */
export function watchBodiesFraming(
  camera: ArcRotateCamera,
  getSpheres: () => readonly FramingSphere[],
  onHome: (frame: FramingSphere, stillAuto: boolean) => void,
  padding = BODY_FRAME_PADDING,
  orient?: (frame: FramingSphere) => void,
  adjust?: (frame: FramingSphere) => void,
): () => void {
  let autoRadius = camera.radius;
  let autoTarget = camera.target.clone();
  let autoAlpha = camera.alpha;
  let autoBeta = camera.beta;

  const refit = () => {
    const stillAuto =
      Math.abs(camera.radius - autoRadius) < 0.2 &&
      Vector3.Distance(camera.target, autoTarget) < 0.25 &&
      Math.abs(camera.alpha - autoAlpha) < 0.08 &&
      Math.abs(camera.beta - autoBeta) < 0.08;
    const frame = measureBodiesFraming(camera, getSpheres(), padding);
    camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit ?? 0, frame.radius * 1.55);
    if (stillAuto) {
      camera.setTarget(frame.center);
      orient?.(frame);
      const lower = camera.lowerRadiusLimit ?? 0;
      camera.radius = Math.max(frame.radius, lower);
      camera.targetScreenOffset.set(0, 0);
      adjust?.(frame);
      autoRadius = camera.radius;
      autoTarget = camera.target.clone();
      autoAlpha = camera.alpha;
      autoBeta = camera.beta;
    } else {
      autoRadius = frame.radius;
      autoTarget = frame.center.clone();
    }
    onHome(frame, stillAuto);
  };

  const canvas = camera.getScene().getEngine().getRenderingCanvas();
  const observer = new ResizeObserver(() => {
    requestAnimationFrame(refit);
  });
  if (canvas) observer.observe(canvas);
  const onWindow = () => {
    requestAnimationFrame(refit);
  };
  window.addEventListener('resize', onWindow);
  window.addEventListener('orientationchange', onWindow);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', onWindow);
    window.removeEventListener('orientationchange', onWindow);
  };
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

export function sunEarthFramingSpheres(
  earthPos: Vector3,
  sunPos: Vector3,
  earthRadius: number,
  sunRadius: number,
): FramingSphere[] {
  return [
    { center: earthPos, radius: earthRadius * EARTH_VIEW_RADIUS_SCALE },
    { center: sunPos, radius: sunRadius * SUN_VIEW_RADIUS_SCALE },
  ];
}

/** Terre + orbite lunaire, pour que la Lune reste dans le cadre avec le Soleil. */
export function sunEarthMoonFramingSpheres(
  earthPos: Vector3,
  sunPos: Vector3,
  orbitRadius: number,
  earthRadius: number,
  sunRadius: number,
  moonRadius: number,
): FramingSphere[] {
  return [
    {
      center: earthPos,
      radius: Math.max(earthRadius * EARTH_VIEW_RADIUS_SCALE, orbitRadius + moonRadius),
    },
    { center: sunPos, radius: sunRadius * SUN_VIEW_RADIUS_SCALE },
  ];
}

/**
 * Vue pédagogique jour/nuit : profil de l’axe Soleil–Terre.
 * Légèrement décalée vers le Soleil, les deux astres restent entiers dans le cadre.
 */
export function frameDayNightOverview(
  camera: ArcRotateCamera,
  earthPos: Vector3,
  sunPos: Vector3,
  sunDirection: Vector3 = new Vector3(-0.7, -0.35, -0.5),
  bodies?: { earthRadius?: number; sunRadius?: number },
): void {
  const toSun = sunPos.subtract(earthPos);
  if (toSun.lengthSquared() < 1e-8) {
    toSun.copyFrom(sunDirection.scale(-1));
  }
  if (toSun.lengthSquared() < 1e-8) return;
  toSun.normalize();

  camera.lowerRadiusLimit = 3.4;
  camera.upperRadiusLimit = Math.max(Vector3.Distance(earthPos, sunPos) * 1.8, 24);
  camera.minZ = 0.08;
  frameAnchoredBodies(
    camera,
    earthPos,
    profileViewDirection(toSun),
    sunEarthFramingSpheres(
      earthPos,
      sunPos,
      bodies?.earthRadius ?? 1,
      bodies?.sunRadius ?? 1.85,
    ),
  );
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
 * Vue Mission 03 : même profil que le jour/nuit, Lune comprise dans le cadre.
 */
export function frameMoonPhasesOverview(
  camera: ArcRotateCamera,
  earthPos: Vector3,
  sunPos: Vector3,
  orbitRadius: number,
  bodies?: { earthRadius?: number; sunRadius?: number; moonRadius?: number },
): void {
  const toSun = sunPos.subtract(earthPos);
  if (toSun.lengthSquared() < 1e-8) return;
  toSun.normalize();

  const sunDist = Vector3.Distance(earthPos, sunPos);
  camera.lowerRadiusLimit = Math.max(orbitRadius * 2.1, 4.8);
  camera.upperRadiusLimit = Math.max(sunDist * 2.4, 28);
  camera.minZ = 0.08;

  frameAnchoredBodies(
    camera,
    earthPos,
    profileViewDirection(toSun),
    sunEarthMoonFramingSpheres(
      earthPos,
      sunPos,
      orbitRadius,
      bodies?.earthRadius ?? 0.85,
      bodies?.sunRadius ?? 1.75,
      bodies?.moonRadius ?? 0.32,
    ),
  );
}

/**
 * Vue Mission 04 : caméra derrière le Soleil, un peu au-dessus,
 * dans l’alignement Soleil puis Terre. La Lune derrière la Terre reste visible.
 */
export function frameEclipseOverview(
  camera: ArcRotateCamera,
  earthPos: Vector3,
  sunPos: Vector3,
  orbitRadius: number,
  bodies?: { earthRadius?: number; sunRadius?: number; moonRadius?: number },
): void {
  const toSun = sunPos.subtract(earthPos);
  if (toSun.lengthSquared() < 1e-8) return;
  toSun.normalize();

  const sunDist = Vector3.Distance(earthPos, sunPos);
  camera.lowerRadiusLimit = Math.max(orbitRadius * 1.4, 4.2);
  camera.upperRadiusLimit = Math.max(sunDist * 3.2, 36);
  camera.minZ = 0.08;

  frameAnchoredBodies(
    camera,
    earthPos,
    eclipseViewDirection(toSun),
    sunEarthMoonFramingSpheres(
      earthPos,
      sunPos,
      orbitRadius,
      bodies?.earthRadius ?? 0.85,
      bodies?.sunRadius ?? 1.75,
      bodies?.moonRadius ?? 0.32,
    ),
  );
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

export type NdcDisk = { x: number; y: number; rx: number; ry: number };
export type NdcRect = { x0: number; y0: number; x1: number; y1: number };

const OVERLAY_CLEAR_MARGIN = 0.03;

function diskHitsRect(disk: NdcDisk, rect: NdcRect, margin: number): boolean {
  return (
    disk.x + disk.rx > rect.x0 - margin &&
    disk.x - disk.rx < rect.x1 + margin &&
    disk.y + disk.ry > rect.y0 - margin &&
    disk.y - disk.ry < rect.y1 + margin
  );
}

/**
 * Glisse le cadrage sur un seul axe pour sortir les disques d’un rectangle
 * (PiP). Le plus petit déplacement qui dégage tout le monde.
 */
export function clearanceShiftNdc(disks: readonly NdcDisk[], rect: NdcRect): { x: number; y: number } {
  let right = 0;
  let left = 0;
  let up = 0;
  let down = 0;
  let hit = false;

  for (const disk of disks) {
    if (!diskHitsRect(disk, rect, OVERLAY_CLEAR_MARGIN)) continue;
    hit = true;
    right = Math.max(right, rect.x1 + OVERLAY_CLEAR_MARGIN - (disk.x - disk.rx));
    left = Math.max(left, disk.x + disk.rx - (rect.x0 - OVERLAY_CLEAR_MARGIN));
    up = Math.max(up, rect.y1 + OVERLAY_CLEAR_MARGIN - (disk.y - disk.ry));
    down = Math.max(down, disk.y + disk.ry - (rect.y0 - OVERLAY_CLEAR_MARGIN));
  }

  if (!hit) return { x: 0, y: 0 };

  const options = [
    { x: right, y: 0, cost: right },
    { x: -left, y: 0, cost: left },
    { x: 0, y: up, cost: up },
    { x: 0, y: -down, cost: down },
  ];
  options.sort((a, b) => a.cost - b.cost);
  return { x: options[0]!.x, y: options[0]!.y };
}

function overlayNdcRect(camera: ArcRotateCamera, occluder: HTMLElement): NdcRect | null {
  const canvas = camera.getScene().getEngine().getRenderingCanvas();
  if (!canvas) return null;
  const canvasRect = canvas.getBoundingClientRect();
  const overlayRect = occluder.getBoundingClientRect();
  if (canvasRect.width < 2 || canvasRect.height < 2) return null;
  if (overlayRect.width < 2 || overlayRect.height < 2) return null;

  const x0 = ((overlayRect.left - canvasRect.left) / canvasRect.width) * 2 - 1;
  const x1 = ((overlayRect.right - canvasRect.left) / canvasRect.width) * 2 - 1;
  const y1 = 1 - ((overlayRect.top - canvasRect.top) / canvasRect.height) * 2;
  const y0 = 1 - ((overlayRect.bottom - canvasRect.top) / canvasRect.height) * 2;
  if (x1 < -1 || x0 > 1 || y1 < -1 || y0 > 1) return null;

  return {
    x0: Math.max(-1, x0),
    x1: Math.min(1, x1),
    y0: Math.max(-1, y0),
    y1: Math.min(1, y1),
  };
}

function projectFramingDisk(camera: ArcRotateCamera, sphere: FramingSphere): NdcDisk | null {
  const point = Vector3.TransformCoordinates(sphere.center, camera.getViewMatrix());
  if (point.z >= -0.05) return null;
  const depth = -point.z;
  const tanV = Math.tan(Math.max(camera.fov, 0.2) / 2);
  const tanH = tanV * Math.max(canvasAspect(camera), 0.2);
  return {
    x: point.x / depth / tanH,
    y: point.y / depth / tanV,
    rx: sphere.radius / depth / tanH,
    ry: sphere.radius / depth / tanV,
  };
}

function diskOnScreen(disk: NdcDisk, pad: number): boolean {
  return (
    disk.x - disk.rx >= -1 + pad &&
    disk.x + disk.rx <= 1 - pad &&
    disk.y - disk.ry >= -1 + pad &&
    disk.y + disk.ry <= 1 - pad
  );
}

/**
 * Décale la vue (sans changer l’angle) pour que les astres ne passent
 * pas sous le PiP ou le panneau. Recule si le décalage les sortirait de l’écran.
 */
export function keepFramingClearOfElement(
  camera: ArcRotateCamera,
  spheres: readonly FramingSphere[],
  occluder: HTMLElement | null,
): void {
  const fitRadius = camera.radius;
  camera.targetScreenOffset.set(0, 0);
  if (!occluder) return;
  const rect = overlayNdcRect(camera, occluder);
  if (!rect) return;

  const tanV = Math.tan(Math.max(camera.fov, 0.2) / 2);
  const tanH = tanV * Math.max(canvasAspect(camera), 0.2);
  const screenPad = 0.04;

  for (let step = 0; step < 8; step++) {
    const nextRadius = fitRadius * (1 + step * 0.1);
    camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit ?? 0, nextRadius);
    camera.radius = nextRadius;
    camera.targetScreenOffset.set(0, 0);
    const disks = spheres
      .map((sphere) => projectFramingDisk(camera, sphere))
      .filter((disk): disk is NdcDisk => disk !== null);
    const shift = clearanceShiftNdc(disks, rect);
    const depth = Math.max(camera.radius, 0.01);
    camera.targetScreenOffset.set(shift.x * depth * tanH, shift.y * depth * tanV);
    const moved = spheres
      .map((sphere) => projectFramingDisk(camera, sphere))
      .filter((disk): disk is NdcDisk => disk !== null);
    const clear = moved.every((disk) => !diskHitsRect(disk, rect, 0));
    const inside = moved.every((disk) => diskOnScreen(disk, screenPad));
    if (clear && inside) return;
  }
}
