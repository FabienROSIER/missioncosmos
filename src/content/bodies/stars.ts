/** Pédagogie étoiles — Mission 08 (maquette, valeurs arrondies). */

export type StarId = 'proxima' | 'sun' | 'sirius' | 'betelgeuse';

export type StarsSceneMode = 'sun' | 'sizes' | 'colors' | 'apparent' | 'challenge' | 'explore';

export type ObservatoryRound = 'apparent' | 'podium';

export type StarDefinition = {
  id: StarId;
  nameFr: string;
  /** Rayon relatif au Soleil (arrondi pédagogique). */
  radiusSolar: number;
  /** Température de surface approximative (K). */
  temperatureK: number;
  colorLabelFr: string;
  /** Distance typique pour la démo taille apparente (UA pédagogiques). */
  demoDistanceAu: number;
  /** Note si la valeur est une estimation. */
  estimateNote?: string;
  /** Couleur d’affichage RGB 0–1. */
  color: { r: number; g: number; b: number };
  shortFact: string;
};

/**
 * Catalogue réduit et vérifié (ordre de grandeur).
 * Bételgeuse : rayon variable / estimé — signalé comme approximation.
 */
export const STARS: Record<StarId, StarDefinition> = {
  proxima: {
    id: 'proxima',
    nameFr: 'Proxima du Centaure',
    radiusSolar: 0.15,
    temperatureK: 3000,
    colorLabelFr: 'rouge-orangé',
    demoDistanceAu: 4,
    color: { r: 1, g: 0.45, b: 0.28 },
    shortFact: 'Une naine rouge, bien plus petite que le Soleil.',
  },
  sun: {
    id: 'sun',
    nameFr: 'Soleil',
    radiusSolar: 1,
    temperatureK: 5800,
    colorLabelFr: 'jaune-blanc',
    demoDistanceAu: 1,
    color: { r: 1, g: 0.86, b: 0.45 },
    shortFact: 'Notre étoile : une étoile banale… et indispensable.',
  },
  sirius: {
    id: 'sirius',
    nameFr: 'Sirius A',
    radiusSolar: 1.7,
    temperatureK: 9900,
    colorLabelFr: 'blanc-bleuté',
    demoDistanceAu: 8,
    color: { r: 0.75, g: 0.88, b: 1 },
    shortFact: 'Plus chaude et un peu plus grosse que le Soleil.',
  },
  betelgeuse: {
    id: 'betelgeuse',
    nameFr: 'Bételgeuse',
    radiusSolar: 700,
    temperatureK: 3500,
    colorLabelFr: 'rouge',
    demoDistanceAu: 40,
    estimateNote: 'Rayon estimé (variable) — ordre de grandeur.',
    color: { r: 1, g: 0.38, b: 0.22 },
    shortFact: 'Une géante rouge : énorme, mais plus froide que le Soleil.',
  },
};

/** Étoiles affichées côte à côte pour comparer les tailles (échelle compressée). */
export const SIZE_COMPARE_STARS: StarId[] = ['proxima', 'sun', 'betelgeuse'];

/** Étoiles pour l’aperçu couleur / température. */
export const COLOR_COMPARE_STARS: StarId[] = ['proxima', 'sun', 'sirius'];

/** Jetons du podium (mêmes diamètres affichés, ordre réel à trouver). */
export const PODIUM_STARS: StarId[] = ['proxima', 'sun', 'betelgeuse'];

/** Étoile manipulée pour la mire (géante éloignée). */
export const APPARENT_SIZE_STAR: StarId = 'betelgeuse';

/** Mire : taille angulaire cible (unités pédagogiques). */
export const APPARENT_TARGET = 8.5;

/** Tolérance relative sur la mire (~12 %). */
export const APPARENT_TOLERANCE = 0.12;

/** Bornes du curseur de distance (UA pédagogiques). */
export const APPARENT_DISTANCE_MIN = 12;
export const APPARENT_DISTANCE_MAX = 90;

/**
 * Facteur pour que Bételgeuse puisse caler la mire dans la plage du curseur.
 * Ce n’est pas une formule astronomique exacte.
 */
const APPARENT_SCALE = 0.55;

/**
 * Rayon d’affichage compressé pour la comparaison visuelle.
 * Sans log, Bételgeuse écraserait tout l’écran.
 */
export function comparisonVisualRadius(radiusSolar: number): number {
  const base = 0.28;
  const span = 1.55;
  const t = Math.log10(Math.max(radiusSolar, 0.05) + 1) / Math.log10(701);
  return base + span * Math.max(0, Math.min(1, t));
}

/** Taille angulaire pédagogique : proportionnelle à rayon / distance. */
export function apparentAngularSize(radiusSolar: number, distanceAu: number): number {
  const d = Math.max(distanceAu, 0.05);
  return (radiusSolar / d) * APPARENT_SCALE;
}

export function isApparentSizeMatch(
  current: number,
  target: number = APPARENT_TARGET,
  tolerance: number = APPARENT_TOLERANCE,
): boolean {
  if (target <= 0) return false;
  return Math.abs(current - target) / target <= tolerance;
}

export function clampApparentDistance(distanceAu: number): number {
  return Math.min(APPARENT_DISTANCE_MAX, Math.max(APPARENT_DISTANCE_MIN, distanceAu));
}

/** Distance idéale pour caler Bételgeuse sur la mire. */
export function apparentTargetDistance(
  starId: StarId = APPARENT_SIZE_STAR,
  target: number = APPARENT_TARGET,
): number {
  const star = STARS[starId];
  return clampApparentDistance((star.radiusSolar * APPARENT_SCALE) / target);
}

export function isPodiumOrderCorrect(order: StarId[]): boolean {
  if (order.length !== PODIUM_STARS.length) return false;
  const expected = [...PODIUM_STARS].sort((a, b) => STARS[a].radiusSolar - STARS[b].radiusSolar);
  return expected.every((id, index) => order[index] === id);
}

export function observatoryProgress(completed: ObservatoryRound[]): {
  done: number;
  total: 2;
  complete: boolean;
} {
  const unique = new Set(completed);
  const done = (unique.has('apparent') ? 1 : 0) + (unique.has('podium') ? 1 : 0);
  return { done, total: 2, complete: done === 2 };
}

export function temperatureBandFr(temperatureK: number): string {
  if (temperatureK < 4000) return 'plus froide';
  if (temperatureK < 7000) return 'moyenne';
  return 'plus chaude';
}

export function radiusLabelFr(radiusSolar: number): string {
  if (radiusSolar < 1) return `${radiusSolar.toString().replace('.', ',')} × le Soleil`;
  if (radiusSolar === 1) return '1 × le Soleil';
  if (radiusSolar < 10) return `${radiusSolar.toString().replace('.', ',')} × le Soleil`;
  return `≈ ${Math.round(radiusSolar)} × le Soleil`;
}
