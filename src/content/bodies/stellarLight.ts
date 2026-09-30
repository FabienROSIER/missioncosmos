/** Pédagogie lumière stellaire — Mission 09 (corps noir simplifié). */

import { STARS, type StarId } from '@/content/bodies/stars';

export type ThermalBand = 'cold' | 'medium' | 'hot';

export type StarLightTargetId = 'proxima' | 'sun' | 'sirius';

export type StarLightSceneMode =
  | 'intro'
  | 'color'
  | 'spectrum'
  | 'lab'
  | 'compare'
  | 'challenge'
  | 'explore';

export type Rgb = { r: number; g: number; b: number };

/** Plage pédagogique du laboratoire (K). */
export const TEMP_MIN_K = 2500;
export const TEMP_MAX_K = 12000;
export const TEMP_STEP_K = 50;

/** Tolérance absolue autour de la température cible (K). */
export const PRISM_TOLERANCE_K = 450;

/** Cibles du défi, du plus froid au plus chaud. */
export const PRISM_TARGETS: StarLightTargetId[] = ['proxima', 'sun', 'sirius'];

export const PRISM_TARGET_TEMP_K: Record<StarLightTargetId, number> = {
  proxima: STARS.proxima.temperatureK,
  sun: STARS.sun.temperatureK,
  sirius: STARS.sirius.temperatureK,
};

export function clampTemperatureK(temperatureK: number): number {
  return Math.min(TEMP_MAX_K, Math.max(TEMP_MIN_K, temperatureK));
}

export function thermalBand(temperatureK: number): ThermalBand {
  if (temperatureK < 4000) return 'cold';
  if (temperatureK < 7000) return 'medium';
  return 'hot';
}

export function thermalBandLabelFr(band: ThermalBand): string {
  if (band === 'cold') return 'froide';
  if (band === 'medium') return 'moyenne';
  return 'chaude';
}

/** Loi de Wien simplifiée : λ_max (nm) ≈ 2,9×10⁶ / T. */
export function peakWavelengthNm(temperatureK: number): number {
  const t = Math.max(temperatureK, 1);
  return (2.897e6) / t;
}

/**
 * Approximation pédagogique température → RGB (0–1).
 * Inspirée d’approximations de corps noir ; pas une simulation exacte.
 */
export function temperatureToRgb(temperatureK: number): Rgb {
  const t = clampTemperatureK(temperatureK) / 100;
  let r: number;
  let g: number;
  let b: number;

  if (t <= 66) {
    r = 1;
    g = Math.max(0, Math.min(1, (99.4708025861 * Math.log(t) - 161.1195681661) / 255));
  } else {
    r = Math.max(0, Math.min(1, (329.698727446 * Math.pow(t - 60, -0.1332047592)) / 255));
    g = Math.max(0, Math.min(1, (288.1221695283 * Math.pow(t - 60, -0.0755148492)) / 255));
  }

  if (t >= 66) {
    b = 1;
  } else if (t <= 19) {
    b = 0;
  } else {
    b = Math.max(0, Math.min(1, (138.5177312231 * Math.log(t - 10) - 305.0447927307) / 255));
  }

  return { r, g, b };
}

export function rgbCss(rgb: Rgb): string {
  return `rgb(${Math.round(rgb.r * 255)} ${Math.round(rgb.g * 255)} ${Math.round(rgb.b * 255)})`;
}

/** Intensité relative d’un corps noir simplifié sur 380–750 nm. */
export function spectrumIntensityAt(temperatureK: number, wavelengthNm: number): number {
  const t = Math.max(temperatureK, 1);
  const lambdaM = wavelengthNm * 1e-9;
  const c2 = 1.4388e-2;
  const x = c2 / (lambdaM * t);
  // Formule de Planck (relative) : 1 / (λ⁵ (e^{c2/λT} − 1))
  const denom = Math.pow(lambdaM, 5) * (Math.exp(Math.min(x, 40)) - 1);
  return denom > 0 ? 1 / denom : 0;
}

export function sampleSpectrumCurve(
  temperatureK: number,
  samples = 48,
): Array<{ wavelengthNm: number; intensity: number }> {
  const start = 380;
  const end = 750;
  const points: Array<{ wavelengthNm: number; intensity: number }> = [];
  let max = 0;
  for (let i = 0; i < samples; i += 1) {
    const wavelengthNm = start + ((end - start) * i) / (samples - 1);
    const intensity = spectrumIntensityAt(temperatureK, wavelengthNm);
    max = Math.max(max, intensity);
    points.push({ wavelengthNm, intensity });
  }
  if (max <= 0) return points.map((p) => ({ ...p, intensity: 0 }));
  return points.map((p) => ({ ...p, intensity: p.intensity / max }));
}

export function temperatureLabelFr(temperatureK: number): string {
  return `${Math.round(temperatureK).toLocaleString('fr-FR')} K`;
}

export function isPrismMatch(
  currentK: number,
  targetId: StarLightTargetId,
  toleranceK = PRISM_TOLERANCE_K,
): boolean {
  return Math.abs(currentK - PRISM_TARGET_TEMP_K[targetId]) <= toleranceK;
}

export function prismHint(currentK: number, targetId: StarLightTargetId): string {
  if (isPrismMatch(currentK, targetId)) return 'Température prête : valide ce réglage !';
  return currentK > PRISM_TARGET_TEMP_K[targetId]
    ? 'Trop chaud : refroidis un peu l’étoile.'
    : 'Trop froid : chauffe un peu l’étoile.';
}

export function prismProgress(completed: StarLightTargetId[]): {
  done: number;
  total: 3;
  complete: boolean;
} {
  const unique = new Set(completed);
  const done = PRISM_TARGETS.filter((id) => unique.has(id)).length;
  return { done, total: 3, complete: done === 3 };
}

export function starLightTargetNameFr(id: StarLightTargetId): string {
  return STARS[id as StarId].nameFr;
}

export function starLightTargetFact(id: StarLightTargetId): string {
  const temp = PRISM_TARGET_TEMP_K[id];
  const band = thermalBandLabelFr(thermalBand(temp));
  return `${starLightTargetNameFr(id)} · ~${temperatureLabelFr(temp)} · étoile ${band}`;
}

/** Position normalisée du pic (0 = violet, 1 = rouge) sur la bande visible. */
export function peakPosition01(temperatureK: number): number {
  const peak = peakWavelengthNm(temperatureK);
  return Math.min(1, Math.max(0, (peak - 380) / (750 - 380)));
}
