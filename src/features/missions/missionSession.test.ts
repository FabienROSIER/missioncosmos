import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  clearMissionSession,
  loadMissionSession,
  saveMissionSession,
} from '@/features/missions/missionSession';

describe('missionSession', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sauve et recharge une session', () => {
    saveMissionSession('mission-01', 3);
    const session = loadMissionSession('mission-01');
    expect(session?.stepIndex).toBe(3);
    expect(session?.missionId).toBe('mission-01');
  });

  it('ignore une autre mission', () => {
    saveMissionSession('mission-01', 2);
    expect(loadMissionSession('mission-02')).toBeNull();
  });

  it('efface la session', () => {
    saveMissionSession('mission-01', 1);
    clearMissionSession('mission-01');
    expect(loadMissionSession('mission-01')).toBeNull();
  });
});
