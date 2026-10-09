import { describe, expect, it } from 'vitest';
import { SOLAR_SYSTEM_PLANETS } from '@/content/bodies/solarSystem';
import {
  SOLAR_OVERVIEW_BODY_CLEARANCE,
  SOLAR_OVERVIEW_PADDING,
  solarSystemOverviewBound,
  solarSystemOverviewRadius,
} from '@/3d/utils/solarSystemFraming';

function limitingHalfAngle(fov: number, aspect: number, padding: number): number {
  const tanV = Math.tan(Math.max(fov, 0.2) / 2);
  const tanLimit = Math.min(tanV, tanV * Math.max(aspect, 0.2)) * (1 - padding);
  return Math.atan(Math.max(tanLimit, 0.05));
}

describe('vue d’ensemble du système solaire', () => {
  const neptuneOrbit = SOLAR_SYSTEM_PLANETS.neptune.compactOrbit;

  it('englobe Neptune et les anneaux de Saturne', () => {
    const bound = solarSystemOverviewBound(neptuneOrbit);
    expect(bound).toBeGreaterThan(neptuneOrbit + SOLAR_SYSTEM_PLANETS.neptune.readableRadius);
    const saturnRings = 2.27 * SOLAR_SYSTEM_PLANETS.saturn.readableRadius;
    expect(bound).toBeGreaterThan(SOLAR_SYSTEM_PLANETS.saturn.compactOrbit + saturnRings);
    expect(bound).toBe(neptuneOrbit + SOLAR_OVERVIEW_BODY_CLEARANCE);
  });

  it('garde tout le disque dans le cadre desktop, portrait et paysage', () => {
    const bound = solarSystemOverviewBound(neptuneOrbit);
    const cases = [
      { fov: 0.8, aspect: 1.45 },
      { fov: 1.3, aspect: 0.52 },
      { fov: 1.07, aspect: 1.65 },
    ];
    for (const frame of cases) {
      const radius = solarSystemOverviewRadius(neptuneOrbit, frame.fov, frame.aspect);
      const half = limitingHalfAngle(frame.fov, frame.aspect, SOLAR_OVERVIEW_PADDING);
      expect(Math.asin(Math.min(1, bound / radius))).toBeLessThanOrEqual(half + 1e-6);
      expect(radius).toBeGreaterThan(neptuneOrbit * 1.75);
    }
  });

  it('recule quand le cadre est plus étroit', () => {
    const wide = solarSystemOverviewRadius(neptuneOrbit, 0.8, 1.6);
    const narrow = solarSystemOverviewRadius(neptuneOrbit, 0.8, 0.55);
    expect(narrow).toBeGreaterThan(wide);
  });
});
