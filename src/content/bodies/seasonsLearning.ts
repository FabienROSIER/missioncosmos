/** Pédagogie saisons — Mission 07 (maquette, pas ellipse réelle). */

export const EARTH_AXIAL_TILT_DEG = 23.5;

/** Angle d’orbite (rad) : été dans l’hémisphère nord (Terre en −Z, axe penché vers +Z). */
export const NORTH_SUMMER_ANGLE = -Math.PI / 2;

/** Demi-largeur de réussite du défi (~±25°). */
export const SEASON_CHALLENGE_TOLERANCE = 0.45;

export type HemisphereSeason = 'ete' | 'hiver' | 'doux';

export function normalizeAngle(rad: number): number {
  let a = rad;
  while (a <= -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

export function angleDelta(a: number, b: number): number {
  return Math.abs(normalizeAngle(a - b));
}

/** Saison nord selon la position sur l’orbite (axe fixe penché vers +Z). */
export function northSeasonAt(orbitAngle: number, tiltDeg: number): HemisphereSeason {
  if (tiltDeg < 5) return 'doux';
  const d = angleDelta(orbitAngle, NORTH_SUMMER_ANGLE);
  if (d < Math.PI / 4) return 'ete';
  if (d > (3 * Math.PI) / 4) return 'hiver';
  return 'doux'; // intersaisons simplifiées
}

export function southSeasonAt(orbitAngle: number, tiltDeg: number): HemisphereSeason {
  const n = northSeasonAt(orbitAngle, tiltDeg);
  if (n === 'doux') return 'doux';
  return n === 'ete' ? 'hiver' : 'ete';
}

export function isNorthernSummer(orbitAngle: number, tiltDeg: number): boolean {
  return (
    tiltDeg >= 5 && angleDelta(orbitAngle, NORTH_SUMMER_ANGLE) <= SEASON_CHALLENGE_TOLERANCE
  );
}

export function seasonLabelFr(season: HemisphereSeason): string {
  if (season === 'ete') return 'Été';
  if (season === 'hiver') return 'Hiver';
  return 'Doux';
}
