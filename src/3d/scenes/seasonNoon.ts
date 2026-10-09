import { Quaternion, Vector3 } from '@babylonjs/core';

/** France métropolitaine — même repère que le compagnon des missions Terre / Lune. */
export const FRANCE_LAT_DEG = 46.6;
export const FRANCE_LON_DEG = 2.4;

/**
 * Champ vertical du PiP, assez large pour garder le Soleil et le sol
 * même quand le Soleil de midi est haut (été, inclinaison jusqu’à 35°).
 */
export const SEASON_PIP_FOV = 2.2;
/** Regard assez bas pour garder un vrai bout de sol sous le Soleil. */
export const SEASON_PIP_LOOK_ELEVATION = 0.38;

export type NoonSunBand = 'haut' | 'moyen' | 'bas';

export function franceLocalDirection(): Vector3 {
  const lat = (FRANCE_LAT_DEG * Math.PI) / 180;
  const lon = (FRANCE_LON_DEG * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return new Vector3(cosLat * Math.cos(lon), Math.sin(lat), cosLat * Math.sin(lon));
}

function signedAngleAroundAxis(axis: Vector3, from: Vector3, to: Vector3): number {
  const f = from.subtract(axis.scale(Vector3.Dot(from, axis)));
  const t = to.subtract(axis.scale(Vector3.Dot(to, axis)));
  if (f.lengthSquared() < 1e-10 || t.lengthSquared() < 1e-10) return 0;
  f.normalize();
  t.normalize();
  return Math.atan2(Vector3.Dot(Vector3.Cross(f, t), axis), Vector3.Dot(f, t));
}

/**
 * Inclinaison fixe dans l’espace, puis rotation autour de l’axe
 * pour que la France soit à midi (face au Soleil).
 */
export function earthNoonQuaternion(toSunWorld: Vector3, tiltRad: number): Quaternion {
  const tiltQ = Quaternion.RotationAxis(Vector3.Right(), tiltRad);
  const sunDir = toSunWorld.clone();
  if (sunDir.lengthSquared() < 1e-10) return tiltQ;
  sunDir.normalize();
  const localSun = Vector3.Zero();
  sunDir.rotateByQuaternionToRef(Quaternion.Inverse(tiltQ), localSun);
  const spin = signedAngleAroundAxis(Vector3.Up(), franceLocalDirection(), localSun);
  return tiltQ.multiply(Quaternion.RotationAxis(Vector3.Up(), spin));
}

/** Élévation du Soleil au-dessus de l’horizon, en France, à midi. */
export function franceSunElevationRad(toSunWorld: Vector3, tiltRad: number): number {
  const outward = franceLocalDirection();
  outward.rotateByQuaternionToRef(earthNoonQuaternion(toSunWorld, tiltRad), outward);
  outward.normalize();
  const sun = toSunWorld.clone();
  if (sun.lengthSquared() < 1e-10) return 0;
  sun.normalize();
  return Math.asin(Math.min(1, Math.max(-1, Vector3.Dot(outward, sun))));
}

export function noonSunBand(elevationRad: number): NoonSunBand {
  const deg = (elevationRad * 180) / Math.PI;
  if (deg >= 55) return 'haut';
  if (deg >= 35) return 'moyen';
  return 'bas';
}

/** Le centre du Soleil et un bout de sol (sous l’horizon) tiennent dans le PiP. */
export function seasonPipFramesSunAndGround(elevationRad: number, sunAngularRadius = 0.25): boolean {
  const half = SEASON_PIP_FOV / 2;
  const bottom = SEASON_PIP_LOOK_ELEVATION - half;
  const top = SEASON_PIP_LOOK_ELEVATION + half;
  return (
    bottom < -0.12 &&
    elevationRad - sunAngularRadius > bottom &&
    elevationRad + sunAngularRadius < top
  );
}

/**
 * Distance de la caméra « face Soleil », en rayons.
 * Assez loin pour voir l’hémisphère tourné vers la Terre, sans couper le limbe.
 */
export const SEASON_PIP_SUN_FACE_DISTANCE = 4;

/** Rayon angulaire du Soleil vu depuis une distance de référence (indépendant de la saison). */
export function pipSunAngularRadius(sunRadius: number, referenceDistance: number): number {
  const ratio = sunRadius / Math.max(referenceDistance, sunRadius * 1.01);
  return Math.asin(Math.min(0.99, ratio));
}

/**
 * Champ de la photo PiP : le limbe du Soleil touche le bord du carré,
 * donc un disque qui reprend cette photo reste rond et sans fond.
 */
export function sunFaceCameraFov(faceDistanceInRadii = SEASON_PIP_SUN_FACE_DISTANCE): number {
  return 2 * Math.asin(1 / faceDistanceInRadii);
}

/** Rayon monde d’un disque dans le plan de vue, à profondeur fixe. */
export function pipSunDiscRadius(depth: number, angularRadius: number): number {
  return depth * Math.tan(angularRadius);
}

/**
 * Centre du disque dans le plan de vue (profondeur `depth`), ou null si le Soleil est derrière.
 * Le vecteur part de l’œil.
 */
export function pipSunViewCenter(forward: Vector3, toSun: Vector3, depth: number): Vector3 | null {
  const f = forward.clone();
  if (f.lengthSquared() < 1e-10) return null;
  f.normalize();
  const s = toSun.clone();
  if (s.lengthSquared() < 1e-10) return null;
  s.normalize();
  const ahead = Vector3.Dot(s, f);
  if (ahead < 0.05) return null;
  return s.scale(depth / ahead);
}

/** Regard PiP : azimut du Soleil, élévation fixe, « haut » = normale du sol. */
export function noonPipLookDirection(outward: Vector3, toSun: Vector3): Vector3 {
  const up = outward.clone();
  if (up.lengthSquared() < 1e-10) return new Vector3(0, 0, 1);
  up.normalize();
  const sun = toSun.clone();
  if (sun.lengthSquared() < 1e-10) sun.copyFrom(Vector3.Forward());
  else sun.normalize();
  let azimuth = sun.subtract(up.scale(Vector3.Dot(sun, up)));
  if (azimuth.lengthSquared() < 1e-8) {
    azimuth = Vector3.Cross(up, Vector3.Right());
    if (azimuth.lengthSquared() < 1e-8) azimuth = Vector3.Cross(up, Vector3.Forward());
  }
  azimuth.normalize();
  return azimuth
    .scale(Math.cos(SEASON_PIP_LOOK_ELEVATION))
    .addInPlace(up.scale(Math.sin(SEASON_PIP_LOOK_ELEVATION)))
    .normalize();
}
