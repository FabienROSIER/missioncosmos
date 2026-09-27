import { describe, expect, it } from 'vitest';
import {
  AU_SCENE_UNIT,
  PLANET_ORDER,
  SOLAR_SYSTEM_PLANETS,
  TO_SCALE_EARTH_RADIUS,
  isPlanetId,
  planetDefinition,
  resolveOrbit,
  resolveSunRadius,
} from '@/content/bodies/solarSystem';
import { MISSION_05 } from '@/content/missions/mission-05';
import { validateMission } from '@/content/missions/validateMission';
import { QUIZ_MISSION_05 } from '@/content/quizzes/mission-05';

describe('Mission 05 — système solaire', () => {
  it('valide la mission', () => {
    expect(validateMission(MISSION_05)).toEqual([]);
  });

  it('a 8 planètes dans l’ordre classique', () => {
    expect(PLANET_ORDER).toHaveLength(8);
    expect(Object.keys(SOLAR_SYSTEM_PLANETS)).toHaveLength(8);
  });

  it('mode à l’échelle : tailles ≈ réelles et orbites ≈ UA', () => {
    const earth = planetDefinition('earth', 'toScale');
    const jupiter = planetDefinition('jupiter', 'toScale');
    expect(earth.visual.visualRadius).toBeCloseTo(TO_SCALE_EARTH_RADIUS, 5);
    expect(jupiter.visual.visualRadius / earth.visual.visualRadius).toBeGreaterThan(10);

    const earthOrbit = resolveOrbit('earth', 'toScale');
    const neptuneOrbit = resolveOrbit('neptune', 'toScale');
    expect(earthOrbit).toBeCloseTo(AU_SCENE_UNIT, 5);
    expect(neptuneOrbit / earthOrbit).toBeGreaterThan(28);
    expect(neptuneOrbit).toBeGreaterThan(resolveOrbit('neptune', 'readable'));
    expect(isPlanetId('pluto')).toBe(false);
  });

  it('garde un Soleil visible en mode à l’échelle', () => {
    expect(resolveSunRadius('toScale')).toBeGreaterThan(1);
    expect(resolveSunRadius('readable')).toBeGreaterThan(1);
  });

  it('quiz : 8 planètes, distances et Pluton naine', () => {
    expect(QUIZ_MISSION_05.questions).toHaveLength(4);
    expect(QUIZ_MISSION_05.questions[2]?.correctChoiceId).toBe('huge');
  });
});
