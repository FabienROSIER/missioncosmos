import { describe, expect, it } from 'vitest';
import { MISSION_01 } from '@/content/missions/mission-01';
import { MISSION_04 } from '@/content/missions/mission-04';
import { MISSION_05 } from '@/content/missions/mission-05';
import { MISSION_06 } from '@/content/missions/mission-06';
import { MISSION_07 } from '@/content/missions/mission-07';
import { MISSION_08 } from '@/content/missions/mission-08';
import { validateMission } from '@/content/missions/validateMission';

describe('validateMission', () => {
  it('valide Mission 01', () => {
    expect(validateMission(MISSION_01)).toEqual([]);
  });

  it('valide Mission 04', () => {
    expect(validateMission(MISSION_04)).toEqual([]);
  });

  it('valide Mission 05', () => {
    expect(validateMission(MISSION_05)).toEqual([]);
  });

  it('valide Mission 06', () => {
    expect(validateMission(MISSION_06)).toEqual([]);
    expect(MISSION_06.steps.some((s) => s.challengeOrbitRace)).toBe(true);
    expect(MISSION_06.steps.some((s) => s.challengeOrbitFall)).toBe(true);
  });

  it('valide Mission 07', () => {
    expect(validateMission(MISSION_07)).toEqual([]);
    expect(MISSION_07.steps.some((s) => s.challengeNorthernSummer)).toBe(true);
    expect(MISSION_07.sceneId).toBe('seasons');
  });

  it('valide Mission 08', () => {
    expect(validateMission(MISSION_08)).toEqual([]);
    expect(MISSION_08.steps.some((s) => s.challengeObservatory)).toBe(true);
    expect(MISSION_08.sceneId).toBe('stars');
  });

  it('signale les champs manquants', () => {
    const errors = validateMission({
      ...MISSION_01,
      id: '',
      steps: [],
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('id'))).toBe(true);
  });
});
