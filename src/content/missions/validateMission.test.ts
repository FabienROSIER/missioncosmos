import { describe, expect, it } from 'vitest';
import { MISSION_01 } from '@/content/missions/mission-01';
import { MISSION_04 } from '@/content/missions/mission-04';
import { MISSION_05 } from '@/content/missions/mission-05';
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
