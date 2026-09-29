import { describe, expect, it } from 'vitest';
import {
  APPARENT_SIZE_STAR,
  APPARENT_TARGET,
  PODIUM_STARS,
  STARS,
  apparentAngularSize,
  apparentTargetDistance,
  comparisonVisualRadius,
  isApparentSizeMatch,
  isPodiumOrderCorrect,
  observatoryProgress,
  radiusLabelFr,
} from './stars';

describe('stars learning', () => {
  it('conserve un ordre de grandeur cohérent', () => {
    expect(STARS.proxima.radiusSolar).toBeLessThan(STARS.sun.radiusSolar);
    expect(STARS.sun.radiusSolar).toBeLessThan(STARS.sirius.radiusSolar);
    expect(STARS.sirius.radiusSolar).toBeLessThan(STARS.betelgeuse.radiusSolar);
    expect(STARS.betelgeuse.estimateNote).toBeTruthy();
  });

  it('compresse les tailles pour l’affichage', () => {
    const proxima = comparisonVisualRadius(STARS.proxima.radiusSolar);
    const sun = comparisonVisualRadius(STARS.sun.radiusSolar);
    const betel = comparisonVisualRadius(STARS.betelgeuse.radiusSolar);
    expect(proxima).toBeLessThan(sun);
    expect(sun).toBeLessThan(betel);
    expect(betel / sun).toBeLessThan(8);
  });

  it('valide la mire de taille apparente', () => {
    const distance = apparentTargetDistance(APPARENT_SIZE_STAR, APPARENT_TARGET);
    const size = apparentAngularSize(STARS[APPARENT_SIZE_STAR].radiusSolar, distance);
    expect(isApparentSizeMatch(size)).toBe(true);
    expect(isApparentSizeMatch(size * 1.5)).toBe(false);
  });

  it('valide le podium du plus petit au plus grand', () => {
    expect(isPodiumOrderCorrect(['proxima', 'sun', 'betelgeuse'])).toBe(true);
    expect(isPodiumOrderCorrect(['betelgeuse', 'sun', 'proxima'])).toBe(false);
    expect(PODIUM_STARS).toContain('sun');
  });

  it('compte la progression de l’observatoire', () => {
    expect(observatoryProgress([])).toEqual({ done: 0, total: 2, complete: false });
    expect(observatoryProgress(['apparent'])).toEqual({ done: 1, total: 2, complete: false });
    expect(observatoryProgress(['apparent', 'podium'])).toEqual({
      done: 2,
      total: 2,
      complete: true,
    });
    expect(observatoryProgress(['podium', 'apparent', 'apparent']).complete).toBe(true);
  });

  it('formate un libellé de rayon lisible', () => {
    expect(radiusLabelFr(1)).toBe('1 × le Soleil');
    expect(radiusLabelFr(0.15)).toContain('Soleil');
    expect(radiusLabelFr(700)).toContain('700');
  });
});
