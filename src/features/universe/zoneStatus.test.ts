import { describe, expect, it } from 'vitest';
import {
  getZoneStatus,
  isZoneUnlockedByProgression,
  missionsMapHref,
  pickInitialZoneId,
  resolveMapZoneId,
} from '@/features/universe/zoneStatus';
import { getZoneById, UNIVERSE_ZONES } from '@/content/universe';

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

  it('système solaire disponible si mission-05 débloquée (plus de zone voisinage)', () => {
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
    expect(isZoneUnlockedByProgression('solar-system', input)).toBe(true);
    expect(getZoneStatus(getZoneById('solar-system')!, input)).toBe('available');
    expect(UNIVERSE_ZONES.some((z) => z.id === ('earth-neighborhood' as never))).toBe(false);
  });

  it('galaxies verrouillée tant que mission-12 pas débloquée', () => {
    const input = {
      isMissionUnlocked: (id: string) => id === 'mission-01' || id === 'mission-11',
      isMissionCompleted: () => false,
    };
    expect(getZoneStatus(getZoneById('galaxies')!, input)).toBe('locked');
  });

  it('galaxies disponible si mission-12 débloquée', () => {
    const input = {
      isMissionUnlocked: (id: string) => id === 'mission-12',
      isMissionCompleted: () => false,
    };
    expect(getZoneStatus(getZoneById('galaxies')!, input)).toBe('available');
  });

  it('chaque zone a au moins une mission catalogue', () => {
    for (const zone of UNIVERSE_ZONES) {
      expect(zone.missionIds.length).toBeGreaterThan(0);
    }
    expect(UNIVERSE_ZONES).toHaveLength(8);
  });

  it('pickInitialZoneId privilégie une mission en cours', () => {
    const id = pickInitialZoneId({
      isMissionUnlocked: (m) => m === 'mission-01' || m === 'mission-02',
      isMissionCompleted: (m) => m === 'mission-01',
    });
    expect(id).toBe('earth');
  });

  it('le retour de mission ouvre la zone de cette mission, même si une autre est en cours', () => {
    const input = {
      isMissionUnlocked: (m: string) => m === 'mission-01' || m === 'mission-05',
      isMissionCompleted: () => false,
    };
    expect(missionsMapHref('mission-05')).toBe('/missions?zone=solar-system');
    expect(resolveMapZoneId('solar-system', input)).toBe('solar-system');
    expect(pickInitialZoneId(input)).toBe('earth');
  });

  it('ignore une zone inconnue ou verrouillée', () => {
    const input = {
      isMissionUnlocked: (m: string) => m === 'mission-01',
      isMissionCompleted: () => false,
    };
    expect(resolveMapZoneId('galaxies', input)).toBe('earth');
    expect(resolveMapZoneId('nulle-part', input)).toBe('earth');
    expect(missionsMapHref('mission-inconnue')).toBe('/missions');
    expect(
      resolveMapZoneId('solar-system', {
        isMissionUnlocked: () => false,
        isMissionCompleted: () => false,
      }),
    ).toBe('solar-system');
  });
});
