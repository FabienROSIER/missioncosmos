import { describe, expect, it } from 'vitest';
import {
  ORBIT_COMPARE_PLANETS,
  ORBIT_RACE_WINNER,
  orbitPeriodDays,
  orbitYearLabel,
} from './orbitsCompare';

describe('orbitsCompare (Mission 06)', () => {
  it('ordonne les périodes : Mercure < Terre < Jupiter', () => {
    const [mercury, earth, jupiter] = ORBIT_COMPARE_PLANETS;
    expect(orbitPeriodDays(mercury)).toBeLessThan(orbitPeriodDays(earth));
    expect(orbitPeriodDays(earth)).toBeLessThan(orbitPeriodDays(jupiter));
  });

  it('désigne Mercure comme gagnante de la course', () => {
    expect(ORBIT_RACE_WINNER).toBe('mercury');
    expect(orbitYearLabel('mercury')).toMatch(/88/);
    expect(orbitYearLabel('earth')).toMatch(/1 an/);
    expect(orbitYearLabel('jupiter')).toMatch(/12/);
  });
});
