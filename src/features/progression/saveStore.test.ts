import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  completeMission,
  loadSave,
  newProfileId,
  resetAllProgress,
  upsertProfile,
} from '@/features/progression/saveStore';
import { FIRST_MISSION_ID } from '@/features/progression/types';

describe('saveStore', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
    resetAllProgress();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('crée un profil avec mission 01 débloquée', () => {
    const id = newProfileId();
    upsertProfile({
      id,
      displayName: 'Luna',
      avatarId: 'moon',
      createdAt: new Date().toISOString(),
    });
    const save = loadSave();
    expect(save.activeProfileId).toBe(id);
    expect(save.progressByProfile[id]?.unlockedMissionIds).toContain(FIRST_MISSION_ID);
  });

  it('termine une mission et débloque la suivante', () => {
    const id = newProfileId();
    upsertProfile({
      id,
      displayName: '',
      avatarId: 'rocket',
      createdAt: new Date().toISOString(),
    });
    completeMission('mission-01', ['reward-earth-explorer'], 'mission-02');
    const progress = loadSave().progressByProfile[id]!;
    expect(progress.completedMissionIds).toContain('mission-01');
    expect(progress.unlockedMissionIds).toContain('mission-02');
    expect(progress.earnedRewardIds).toContain('reward-earth-explorer');
  });

  it('migre une sauvegarde v1 : constellations en 10, les suivantes décalées', () => {
    const id = newProfileId();
    store.set(
      'mc:save',
      JSON.stringify({
        version: 1,
        profiles: [
          {
            id,
            displayName: 'Luna',
            avatarId: 'moon',
            createdAt: '2026-09-30T00:00:00.000Z',
          },
        ],
        activeProfileId: id,
        progressByProfile: {
          [id]: {
            version: 1,
            profileId: id,
            completedMissionIds: ['mission-09', 'mission-10'],
            unlockedMissionIds: ['mission-01', 'mission-09', 'mission-10', 'mission-11'],
            earnedRewardIds: ['reward-stellar-light', 'reward-milky-way'],
            lastPlayedMissionId: 'mission-10',
            updatedAt: '2026-09-30T00:00:00.000Z',
          },
        },
        updatedAt: '2026-09-30T00:00:00.000Z',
      }),
    );
    const progress = loadSave().progressByProfile[id]!;
    expect(progress.completedMissionIds).toEqual(['mission-09', 'mission-11']);
    expect(progress.unlockedMissionIds).toEqual([
      'mission-01',
      'mission-09',
      'mission-11',
      'mission-12',
      'mission-10',
    ]);
    expect(progress.lastPlayedMissionId).toBe('mission-11');
    expect(progress.earnedRewardIds).toContain('reward-milky-way');
  });
});
