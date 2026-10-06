/** Pédagogie étoiles — Mission 08 (maquette, valeurs arrondies). */

export type StarId = 'proxima' | 'sun' | 'sirius' | 'betelgeuse';

export type StarsSceneMode = 'sun' | 'sizes' | 'colors' | 'apparent' | 'challenge' | 'explore';

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
    shortFact: 'Le Soleil : une étoile comme d’autres, essentielle à notre vie.',
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
    estimateNote: 'Taille estimée, qui peut varier.',
    color: { r: 1, g: 0.38, b: 0.22 },
    shortFact: 'Une géante rouge : énorme, mais plus froide que le Soleil.',
  },
};

/** Étoiles affichées côte à côte pour comparer les tailles (échelle compressée). */
export const SIZE_COMPARE_STARS: StarId[] = ['proxima', 'sun', 'betelgeuse'];

/** Étoiles pour l’aperçu couleur / température. */
export const COLOR_COMPARE_STARS: StarId[] = ['proxima', 'sun', 'sirius'];

/** Série photo du défi, de la petite naine à la géante. */
export const PHOTO_STARS: StarId[] = ['proxima', 'sun', 'betelgeuse'];

/** Étoile manipulée pour la mire (géante éloignée). */
export const APPARENT_SIZE_STAR: StarId = 'betelgeuse';

/** Mire : taille angulaire cible (unités pédagogiques). */
export const APPARENT_TARGET = 8.5;

/** Tolérance relative sur la mire (~12 %). */
export const APPARENT_TOLERANCE = 0.12;

/** Bornes du curseur de distance (UA pédagogiques). */
export const APPARENT_DISTANCE_MIN = 12;
export const APPARENT_DISTANCE_MAX = 90;

/** Rail du photographe : assez large pour montrer que la géante exige beaucoup de recul. */
export const PHOTO_DISTANCE_MIN = 12;
export const PHOTO_DISTANCE_MAX = 140;
export const PHOTO_TARGET = comparisonVisualRadius(STARS.proxima.radiusSolar) / 22;
export const PHOTO_TOLERANCE = 0.11;

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

/** Taille dans le viseur, à partir de la taille compressée de la maquette. */
export function photoApparentSize(starId: StarId, distance: number): number {
  return comparisonVisualRadius(STARS[starId].radiusSolar) / Math.max(distance, 1);
}

export function photoTargetDistance(starId: StarId): number {
  const distance = comparisonVisualRadius(STARS[starId].radiusSolar) / PHOTO_TARGET;
  return Math.min(PHOTO_DISTANCE_MAX, Math.max(PHOTO_DISTANCE_MIN, distance));
}

export function isPhotoFramed(starId: StarId, distance: number): boolean {
  const current = photoApparentSize(starId, distance);
  return Math.abs(current - PHOTO_TARGET) / PHOTO_TARGET <= PHOTO_TOLERANCE;
}

export function photoFramingHint(starId: StarId, distance: number): string {
  const current = photoApparentSize(starId, distance);
  if (isPhotoFramed(starId, distance)) return 'Cadrage prêt : prends la photo !';
  return current > PHOTO_TARGET
    ? 'L’étoile déborde du cadre : éloigne le télescope.'
    : 'L’étoile paraît trop petite : rapproche le télescope.';
}

export function photoProgress(completed: StarId[]): {
  done: number;
  total: 3;
  complete: boolean;
} {
  const unique = new Set(completed);
  const done = PHOTO_STARS.filter((id) => unique.has(id)).length;
  return { done, total: 3, complete: done === 3 };
}

export function temperatureBandFr(temperatureK: number): string {
  if (temperatureK < 4000) return 'plus froide';
  if (temperatureK < 7000) return 'moyenne';
  return 'plus chaude';
}

export function radiusLabelFr(radiusSolar: number): string {
  const ratio =
    radiusSolar < 10
      ? `${radiusSolar.toString().replace('.', ',')} × le Soleil`
      : `≈ ${Math.round(radiusSolar)} × le Soleil`;
  return `Largeur : ${ratio}`;
}
