import { describe, expect, it } from 'vitest';
import {
  PRISM_TARGETS,
  PRISM_TARGET_TEMP_K,
  TEMP_MAX_K,
  TEMP_MIN_K,
  isPrismMatch,
  peakWavelengthNm,
  prismHint,
  prismProgress,
  sampleSpectrumCurve,
  temperatureToRgb,
  thermalBand,
} from './stellarLight';

describe('stellarLight learning', () => {
  it('ordonne les cibles du froid au chaud', () => {
    expect(PRISM_TARGETS).toEqual(['proxima', 'sun', 'sirius']);
    expect(PRISM_TARGET_TEMP_K.proxima).toBeLessThan(PRISM_TARGET_TEMP_K.sun);
    expect(PRISM_TARGET_TEMP_K.sun).toBeLessThan(PRISM_TARGET_TEMP_K.sirius);
  });

  it('classe les bandes thermiques', () => {
    expect(thermalBand(3000)).toBe('cold');
    expect(thermalBand(5800)).toBe('medium');
    expect(thermalBand(9900)).toBe('hot');
  });

  it('déplace le pic de Wien avec la température', () => {
    const cold = peakWavelengthNm(3000);
    const hot = peakWavelengthNm(9900);
    expect(cold).toBeGreaterThan(hot);
    expect(cold).toBeGreaterThan(700);
    expect(hot).toBeLessThan(400);
  });

  it('rend une étoile froide plus rouge qu’une étoile chaude', () => {
    const cold = temperatureToRgb(3000);
    const hot = temperatureToRgb(9900);
    expect(cold.r).toBeGreaterThan(cold.b);
    expect(hot.b).toBeGreaterThan(cold.b);
    expect(hot.b / Math.max(hot.r, 0.01)).toBeGreaterThan(cold.b / Math.max(cold.r, 0.01));
  });

  it('normalise une courbe spectrale visible', () => {
    const curve = sampleSpectrumCurve(5800, 32);
    expect(curve.length).toBe(32);
    expect(Math.max(...curve.map((p) => p.intensity))).toBeCloseTo(1, 5);
    expect(curve[0]!.wavelengthNm).toBe(380);
    expect(curve.at(-1)!.wavelengthNm).toBe(750);
  });

  it('valide les cibles avec tolérance pédagogique', () => {
    expect(isPrismMatch(PRISM_TARGET_TEMP_K.sun, 'sun')).toBe(true);
    expect(isPrismMatch(PRISM_TARGET_TEMP_K.sun + 200, 'sun')).toBe(true);
    expect(isPrismMatch(PRISM_TARGET_TEMP_K.sun + 2000, 'sun')).toBe(false);
  });

  it('donne un indice directionnel', () => {
    expect(prismHint(8000, 'sun')).toContain('refroidis');
    expect(prismHint(4000, 'sun')).toContain('chauffe');
    expect(prismHint(PRISM_TARGET_TEMP_K.sun, 'sun')).toContain('prête');
  });

  it('compte la jauge 0/3', () => {
    expect(prismProgress([])).toEqual({ done: 0, total: 3, complete: false });
    expect(prismProgress(['proxima'])).toEqual({ done: 1, total: 3, complete: false });
    expect(prismProgress(['proxima', 'sun', 'sirius'])).toEqual({
      done: 3,
      total: 3,
      complete: true,
    });
    expect(prismProgress(['proxima', 'proxima']).done).toBe(1);
  });

  it('reste dans la plage du laboratoire', () => {
    expect(TEMP_MIN_K).toBeLessThan(PRISM_TARGET_TEMP_K.proxima);
    expect(TEMP_MAX_K).toBeGreaterThan(PRISM_TARGET_TEMP_K.sirius);
  });
});
