import { describe, expect, it } from 'vitest';
import {
  EARTH_AXIAL_TILT_DEG,
  NORTH_SUMMER_ANGLE,
  isNorthernSummer,
  northSeasonAt,
  southSeasonAt,
} from './seasonsLearning';

describe('seasonsLearning', () => {
  it('donne l’été au nord près de NORTH_SUMMER_ANGLE', () => {
    expect(northSeasonAt(NORTH_SUMMER_ANGLE, EARTH_AXIAL_TILT_DEG)).toBe('ete');
    expect(southSeasonAt(NORTH_SUMMER_ANGLE, EARTH_AXIAL_TILT_DEG)).toBe('hiver');
    expect(isNorthernSummer(NORTH_SUMMER_ANGLE, EARTH_AXIAL_TILT_DEG)).toBe(true);
  });

  it('inverse les saisons à l’opposé', () => {
    const winter = NORTH_SUMMER_ANGLE + Math.PI;
    expect(northSeasonAt(winter, EARTH_AXIAL_TILT_DEG)).toBe('hiver');
    expect(southSeasonAt(winter, EARTH_AXIAL_TILT_DEG)).toBe('ete');
  });

  it('sans inclinaison : pas de saisons marquées', () => {
    expect(northSeasonAt(NORTH_SUMMER_ANGLE, 0)).toBe('doux');
    expect(isNorthernSummer(NORTH_SUMMER_ANGLE, 0)).toBe(false);
  });
});
