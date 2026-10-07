import { describe, expect, it } from 'vitest';
import {
  AU_KM,
  EARTH_ORBIT_PERIOD_DAYS,
  EARTH_YEAR_VISUAL_SEC,
  PLANET_ORDER,
  SOLAR_SYSTEM_PLANETS,
  SIZE_GROUPS,
  commonScaleRadius,
  distancePosition,
  orbitalAngularSpeed,
  realRadiusKm,
  sizeComparisonLayout,
  spinAngularSpeed,
  type ComparisonGroup,
} from '@/content/bodies/solarSystem';
import { MISSION_05 } from '@/content/missions/mission-05';
import { validateMission } from '@/content/missions/validateMission';

describe('Mission 05 — échelles explicites', () => {
  it('valide la mission et sépare les deux expériences avant le défi', () => {
    expect(validateMission(MISSION_05)).toEqual([]);
    const ids = MISSION_05.steps!.map((step) => step.id);
    expect(ids.indexOf('m05-challenge-order')).toBeGreaterThan(ids.indexOf('m05-observe'));
    expect(MISSION_05.steps!.find((s) => s.id === 'm05-observe')?.requiresSuccess).toBe(false);
    expect(ids.indexOf('m05-scale')).toBeGreaterThan(ids.indexOf('m05-challenge-order'));
    expect(ids.indexOf('m05-distances')).toBeGreaterThan(ids.indexOf('m05-scale'));
    const scale = MISSION_05.steps!.find((s) => s.id === 'm05-scale');
    const distances = MISSION_05.steps!.find((s) => s.id === 'm05-distances');
    expect(scale?.requiresSuccess).toBe(true);
    expect(distances?.requiresSuccess).toBe(true);
  });
  for (const group of Object.keys(SIZE_GROUPS) as ComparisonGroup[]) {
    it(`préserve tous les rapports de diamètres et évite les recouvrements : ${group}`, () => {
      const { bodies } = sizeComparisonLayout(group);
      const reference = bodies[0]!;
      for (const [index, body] of bodies.entries()) {
        expect(body.radius / reference.radius).toBeCloseTo(
          realRadiusKm(body.id) / realRadiusKm(reference.id),
          10,
        );
        if (index > 0) {
          const previous = bodies[index - 1]!;
          expect(body.x - body.extent).toBeGreaterThan(previous.x + previous.extent);
        }
      }
    });
  }
  it('utilise exactement la même conversion pour un rayon et une distance', () => {
    for (const span of [1.6, 30.07]) {
      for (const id of [...PLANET_ORDER, 'sun'] as const) {
        const ratio = commonScaleRadius(id, span, 900) / distancePosition(1, span, 900);
        expect(ratio).toBeCloseTo(realRadiusKm(id) / AU_KM, 12);
      }
    }
    expect(commonScaleRadius('earth', 30.07, 900) * 2).toBeLessThan(0.003);
  });
  it('conserve les distances linéaires lors du zoom', () => {
    expect(
      distancePosition(SOLAR_SYSTEM_PLANETS.neptune.approxAu, 30.07, 900) /
        distancePosition(1, 30.07, 900),
    ).toBeCloseTo(30.07);
    expect(distancePosition(1, 1.6, 900) / distancePosition(0.5, 1.6, 900)).toBe(2);
  });

  it('vitesses orbitales : rapport inverse des périodes (Mercure ≫ Neptune)', () => {
    const earth = orbitalAngularSpeed(EARTH_ORBIT_PERIOD_DAYS);
    expect(earth * EARTH_YEAR_VISUAL_SEC).toBeCloseTo(2 * Math.PI, 5);
    const mercury = orbitalAngularSpeed(SOLAR_SYSTEM_PLANETS.mercury.orbitalPeriodDays);
    const neptune = orbitalAngularSpeed(SOLAR_SYSTEM_PLANETS.neptune.orbitalPeriodDays);
    expect(mercury / earth).toBeCloseTo(
      EARTH_ORBIT_PERIOD_DAYS / SOLAR_SYSTEM_PLANETS.mercury.orbitalPeriodDays,
      5,
    );
    expect(neptune / earth).toBeCloseTo(
      EARTH_ORBIT_PERIOD_DAYS / SOLAR_SYSTEM_PLANETS.neptune.orbitalPeriodDays,
      5,
    );
    expect(mercury).toBeGreaterThan(earth);
    expect(earth).toBeGreaterThan(neptune);
  });

  it('spins : Vénus très lente, Jupiter plus rapide que la Terre ; Uranus très penchée', () => {
    const earth = spinAngularSpeed(SOLAR_SYSTEM_PLANETS.earth.siderealRotationDays);
    const venus = spinAngularSpeed(SOLAR_SYSTEM_PLANETS.venus.siderealRotationDays);
    const jupiter = spinAngularSpeed(SOLAR_SYSTEM_PLANETS.jupiter.siderealRotationDays);
    expect(Math.abs(venus)).toBeLessThan(Math.abs(earth));
    expect(jupiter).toBeGreaterThan(earth);
    expect(SOLAR_SYSTEM_PLANETS.uranus.axialTiltDeg).toBeGreaterThan(90);
    expect(SOLAR_SYSTEM_PLANETS.venus.axialTiltDeg).toBeGreaterThan(90);
    expect(SOLAR_SYSTEM_PLANETS.earth.axialTiltDeg).toBeCloseTo(23.44, 1);
  });
});
