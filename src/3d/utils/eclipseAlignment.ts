/**
 * Alignements d’éclipse (maquette pédagogique, pas d’éphéméride).
 * Élongation ≈ 0 → nouvelle Lune (éclipse solaire possible).
 * Élongation ≈ π → pleine Lune (éclipse lunaire possible).
 */

export type EclipseKind = 'none' | 'solar' | 'lunar';

export const ECLIPSE_LABELS: Record<EclipseKind, string> = {
  none: 'Pas d’éclipse',
  solar: 'Éclipse solaire',
  lunar: 'Éclipse lunaire',
};

/** Seuil d’alignement (rad) pour réussir un défi. */
const SOLAR_MAX = 0.22;
const LUNAR_MIN = Math.PI - 0.22;
/** Hors du plan : trop haut/bas = pas d’éclipse (orbite inclinée). */
const PLANE_MAX = 0.28;

export function classifyEclipse(
  earth: { x: number; y: number; z: number },
  sun: { x: number; y: number; z: number },
  moon: { x: number; y: number; z: number },
): EclipseKind {
  const e2s = normalize({
    x: sun.x - earth.x,
    y: sun.y - earth.y,
    z: sun.z - earth.z,
  });
  const e2m = normalize({
    x: moon.x - earth.x,
    y: moon.y - earth.y,
    z: moon.z - earth.z,
  });

  // Sortie du plan de l’écliptique maquette (Y ≈ 0)
  if (Math.abs(moon.y - earth.y) > PLANE_MAX) return 'none';

  const dot = Math.min(1, Math.max(-1, e2s.x * e2m.x + e2s.y * e2m.y + e2s.z * e2m.z));
  const elong = Math.acos(dot);

  if (elong <= SOLAR_MAX) return 'solar';
  if (elong >= LUNAR_MIN) return 'lunar';
  return 'none';
}

export function isEclipseMatch(
  earth: { x: number; y: number; z: number },
  sun: { x: number; y: number; z: number },
  moon: { x: number; y: number; z: number },
  target: 'solar' | 'lunar',
): boolean {
  return classifyEclipse(earth, sun, moon) === target;
}

function normalize(v: { x: number; y: number; z: number }) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}
