/**
 * Phases lunaires pédagogiques (pas une éphéméride).
 * Angle = élongation Soleil–Lune vue depuis la Terre (0 = nouvelle, π = pleine).
 */

export const MOON_PHASE_IDS = [
  'new',
  'crescent',
  'quarter',
  'gibbous',
  'full',
] as const;

export type MoonPhaseId = (typeof MOON_PHASE_IDS)[number];

export const MOON_PHASE_LABELS: Record<MoonPhaseId, string> = {
  new: 'Nouvelle Lune',
  crescent: 'Croissant',
  quarter: 'Premier / dernier quartier',
  gibbous: 'Presque pleine',
  full: 'Pleine Lune',
};

/** Élongation 0…π (rad) → phase pour l’UI / défis. */
export function phaseFromElongation(elongationRad: number): MoonPhaseId {
  const e = normalizeElongation(elongationRad);
  const deg = (e * 180) / Math.PI;
  if (deg < 22) return 'new';
  if (deg < 67) return 'crescent';
  if (deg < 112) return 'quarter';
  if (deg < 157) return 'gibbous';
  return 'full';
}

/** Vrai si l’élongation est dans la bande du défi (marge confortable). */
export function isPhaseMatch(elongationRad: number, target: MoonPhaseId): boolean {
  const deg = (normalizeElongation(elongationRad) * 180) / Math.PI;
  switch (target) {
    case 'new':
      return deg <= 28;
    case 'crescent':
      return deg >= 30 && deg <= 70;
    case 'quarter':
      return deg >= 75 && deg <= 105;
    case 'gibbous':
      return deg >= 110 && deg <= 155;
    case 'full':
      return deg >= 152;
    default:
      return false;
  }
}

/** Angle entre vecteurs Terre→Soleil et Terre→Lune, ramené à [0, π]. */
export function elongationBetween(
  earthToSun: { x: number; y: number; z: number },
  earthToMoon: { x: number; y: number; z: number },
): number {
  const a = normalizeVec(earthToSun);
  const b = normalizeVec(earthToMoon);
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  return Math.acos(dot);
}

function normalizeElongation(rad: number): number {
  let e = Math.abs(rad) % (Math.PI * 2);
  if (e > Math.PI) e = Math.PI * 2 - e;
  return e;
}

function normalizeVec(v: { x: number; y: number; z: number }) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}
