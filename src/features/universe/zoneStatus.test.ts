import { describe, expect, it } from 'vitest';
import {
  getZoneStatus,
  isZoneUnlockedByProgression,
  pickInitialZoneId,
} from '@/features/universe/zoneStatus';
import { getZoneById } from '@/content/universe';

describe('zoneStatus', () => {
  it('terre disponible si mission-01 débloquée', () => {
    const earth = getZoneById('earth')!;
    const status = getZoneStatus(earth, {
      isMissionUnlocked: (id) => id === 'mission-01',
      isMissionCompleted: () => false,
    });
    expect(status).toBe('available');
  });

  it('terre explorée si missions débloquées toutes terminées (même si suite encore verrouillée)', () => {
    const earth = getZoneById('earth')!;
    const status = getZoneStatus(earth, {
      isMissionUnlocked: (id) => id === 'mission-01',
      isMissionCompleted: (id) => id === 'mission-01',
    });
    expect(status).toBe('completed');
  });

  it('lune verrouillée tant que mission-03 pas débloquée', () => {
    const moon = getZoneById('moon')!;
    const status = getZoneStatus(moon, {
      isMissionUnlocked: (id) => id === 'mission-01',
      isMissionCompleted: () => false,
    });
    expect(status).toBe('locked');
  });

  it('voisinage bientôt après zone lune terminée', () => {
    const input = {
      isMissionUnlocked: (id: string) =>
        id === 'mission-01' ||
        id === 'mission-02' ||
        id === 'mission-03' ||
        id === 'mission-04',
      isMissionCompleted: (id: string) =>
        id === 'mission-01' ||
        id === 'mission-02' ||
        id === 'mission-03' ||
        id === 'mission-04',
    };
    expect(isZoneUnlockedByProgression('earth-neighborhood', input)).toBe(true);
    expect(getZoneStatus(getZoneById('earth-neighborhood')!, input)).toBe('coming-soon');
  });

  it('système solaire disponible si mission-05 débloquée', () => {
    const input = {
      isMissionUnlocked: (id: string) =>
        id === 'mission-01' ||
        id === 'mission-02' ||
        id === 'mission-03' ||
        id === 'mission-04' ||
        id === 'mission-05',
      isMissionCompleted: (id: string) =>
        id === 'mission-01' ||
        id === 'mission-02' ||
        id === 'mission-03' ||
        id === 'mission-04',
    };
    expect(getZoneStatus(getZoneById('solar-system')!, input)).toBe('available');
  });

  it('pickInitialZoneId privilégie une mission en cours', () => {
    const id = pickInitialZoneId({
      isMissionUnlocked: (m) => m === 'mission-01' || m === 'mission-02',
      isMissionCompleted: (m) => m === 'mission-01',
    });
    expect(id).toBe('earth');
  });
});
