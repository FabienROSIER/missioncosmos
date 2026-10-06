import { describe, expect, it } from 'vitest';
import {
  APPARENT_SIZE_STAR,
  APPARENT_TARGET,
  PHOTO_STARS,
  STARS,
  apparentAngularSize,
  apparentTargetDistance,
  comparisonVisualRadius,
  isApparentSizeMatch,
  isPhotoFramed,
  photoFramingHint,
  photoProgress,
  photoTargetDistance,
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

  it('donne un cadrage photo atteignable pour chaque étoile', () => {
    for (const id of PHOTO_STARS) {
      const targetDistance = photoTargetDistance(id);
      expect(isPhotoFramed(id, targetDistance)).toBe(true);
      expect(photoFramingHint(id, targetDistance)).toContain('photo');
    }
    expect(photoTargetDistance('proxima')).toBeLessThan(photoTargetDistance('sun'));
    expect(photoTargetDistance('sun')).toBeLessThan(photoTargetDistance('betelgeuse'));
  });

  it('explique dans quel sens déplacer le télescope', () => {
    const target = photoTargetDistance('sun');
    expect(photoFramingHint('sun', target * 0.5)).toContain('éloigne');
    expect(photoFramingHint('sun', target * 1.8)).toContain('rapproche');
  });

  it('compte les photos uniques de l’album', () => {
    expect(photoProgress([])).toEqual({ done: 0, total: 3, complete: false });
    expect(photoProgress(['proxima'])).toEqual({ done: 1, total: 3, complete: false });
    expect(photoProgress(['proxima', 'sun', 'betelgeuse'])).toEqual({
      done: 3,
      total: 3,
      complete: true,
    });
    expect(photoProgress(['proxima', 'proxima']).done).toBe(1);
  });

  it('formate un libellé de rayon lisible', () => {
    expect(radiusLabelFr(1)).toBe('Largeur : 1 × le Soleil');
    expect(radiusLabelFr(0.15)).toContain('Soleil');
    expect(radiusLabelFr(700)).toContain('700');
  });
});
