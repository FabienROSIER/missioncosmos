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

  it('opens constellations for old saves without relocking later missions or losing badges', () => {
    const id = newProfileId();
    upsertProfile({
      id,
      displayName: 'Luna',
      avatarId: 'moon',
      createdAt: new Date().toISOString(),
    });
    completeMission('mission-09', ['reward-stellar-light'], 'mission-10');
    // Force a fresh storage snapshot, as on a browser reload.
    const oldSave = JSON.parse(store.get('mc:save')!);
    oldSave.updatedAt = '2026-09-30T00:00:00.000Z';
    store.set('mc:save', JSON.stringify(oldSave));
    const progress = loadSave().progressByProfile[id]!;
    expect(progress.unlockedMissionIds).toContain('mission-constellations');
    expect(progress.unlockedMissionIds).toContain('mission-10');
    expect(progress.completedMissionIds).toContain('mission-09');
    expect(progress.earnedRewardIds).toContain('reward-stellar-light');
  });
});
