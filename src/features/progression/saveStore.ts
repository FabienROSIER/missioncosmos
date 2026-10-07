import { SAVE_SCHEMA_VERSION } from '@/lib/constants';
import { remapLegacyMissionId } from '@/features/progression/legacyMissionIds';
import { createEmptyProgress, createEmptySave, type LocalSave } from '@/features/progression/types';
import type { ChildProfile } from '@/types/profile';
import type { Progress } from '@/types/progress';

const STORAGE_KEY = 'mc:save';
const CHANGE_EVENT = 'mc:save-change';

/** Snapshots stables pour useSyncExternalStore (même référence si données inchangées). */
const EMPTY_SAVE: LocalSave = createEmptySave();
let cachedRaw: string | null = null;
let cachedSave: LocalSave = EMPTY_SAVE;

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

function emitChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function subscribeSave(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function remapIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of ids) {
    const mapped = remapLegacyMissionId(id);
    if (seen.has(mapped)) continue;
    seen.add(mapped);
    next.push(mapped);
  }
  return next;
}

function migrateProgress(progress: Progress): Progress {
  const completed = Array.isArray(progress.completedMissionIds)
    ? [...progress.completedMissionIds]
    : [];
  const unlocked = Array.isArray(progress.unlockedMissionIds)
    ? [...progress.unlockedMissionIds]
    : [];
  if (completed.includes('mission-09') && !unlocked.includes('mission-constellations')) {
    unlocked.push('mission-constellations');
  }
  return {
    ...progress,
    version: SAVE_SCHEMA_VERSION,
    completedMissionIds: remapIds(completed),
    unlockedMissionIds: remapIds(unlocked),
    lastPlayedMissionId: progress.lastPlayedMissionId
      ? remapLegacyMissionId(progress.lastPlayedMissionId)
      : progress.lastPlayedMissionId,
  };
}

function migrate(raw: unknown): LocalSave {
  if (!raw || typeof raw !== 'object') return EMPTY_SAVE;
  const data = raw as Partial<LocalSave>;
  if (data.version !== 1 && data.version !== SAVE_SCHEMA_VERSION) {
    return EMPTY_SAVE;
  }
  const progressByProfile =
    data.progressByProfile && typeof data.progressByProfile === 'object'
      ? data.progressByProfile
      : {};
  return {
    version: SAVE_SCHEMA_VERSION,
    profiles: Array.isArray(data.profiles) ? data.profiles : [],
    activeProfileId: data.activeProfileId ?? null,
    progressByProfile:
      data.version === 1
        ? Object.fromEntries(
            Object.entries(progressByProfile).map(([id, progress]) => [
              id,
              migrateProgress(progress),
            ]),
          )
        : progressByProfile,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  };
}

/** Snapshot client mis en cache — requis par useSyncExternalStore. */
export function getSaveSnapshot(): LocalSave {
  const storage = getStorage();
  if (!storage) return EMPTY_SAVE;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      if (cachedRaw === '') return cachedSave;
      cachedRaw = '';
      cachedSave = EMPTY_SAVE;
      return cachedSave;
    }
    if (raw === cachedRaw) return cachedSave;
    cachedRaw = raw;
    const parsed = migrate(JSON.parse(raw));
    for (const profile of parsed.profiles) {
      if (!parsed.progressByProfile[profile.id]) {
        parsed.progressByProfile[profile.id] = createEmptyProgress(profile.id);
      }
    }
    cachedSave = parsed;
    return cachedSave;
  } catch {
    return EMPTY_SAVE;
  }
}

/** @deprecated Prefer getSaveSnapshot for React ; alias pour le reste du code. */
export function loadSave(): LocalSave {
  return getSaveSnapshot();
}

export function writeSave(save: LocalSave): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const next: LocalSave = { ...save, updatedAt: new Date().toISOString() };
    const serialized = JSON.stringify(next);
    storage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedSave = next;
    emitChange();
  } catch {
    /* private mode */
  }
}

export function getActiveProfile(save: LocalSave = loadSave()): ChildProfile | null {
  if (!save.activeProfileId) return null;
  return save.profiles.find((p) => p.id === save.activeProfileId) ?? null;
}

export function getActiveProgress(save: LocalSave = loadSave()): Progress | null {
  const profile = getActiveProfile(save);
  if (!profile) return null;
  return save.progressByProfile[profile.id] ?? null;
}

export function upsertProfile(profile: ChildProfile, makeActive = true): LocalSave {
  const save = loadSave();
  const existing = save.profiles.findIndex((p) => p.id === profile.id);
  const profiles =
    existing >= 0
      ? save.profiles.map((p, i) => (i === existing ? profile : p))
      : [...save.profiles, profile];

  if (!save.progressByProfile[profile.id]) {
    save.progressByProfile[profile.id] = createEmptyProgress(profile.id);
  }

  const next: LocalSave = {
    ...save,
    profiles,
    activeProfileId: makeActive ? profile.id : save.activeProfileId,
    progressByProfile: { ...save.progressByProfile },
  };
  writeSave(next);
  return next;
}

export function setActiveProfile(profileId: string): void {
  const save = loadSave();
  if (!save.profiles.some((p) => p.id === profileId)) return;
  writeSave({ ...save, activeProfileId: profileId });
}

export function updateActiveProgress(mutator: (progress: Progress) => Progress): void {
  const save = loadSave();
  const profile = getActiveProfile(save);
  if (!profile) return;
  const current = save.progressByProfile[profile.id] ?? createEmptyProgress(profile.id);
  const nextProgress = mutator(current);
  writeSave({
    ...save,
    progressByProfile: {
      ...save.progressByProfile,
      [profile.id]: { ...nextProgress, updatedAt: new Date().toISOString() },
    },
  });
}

/** Débloque la mission suivante et enregistre récompenses. */
export function completeMission(
  missionId: string,
  rewardIds: string[],
  nextMissionId?: string,
): void {
  updateActiveProgress((progress) => {
    const completed = progress.completedMissionIds.includes(missionId)
      ? progress.completedMissionIds
      : [...progress.completedMissionIds, missionId];

    let unlocked = [...progress.unlockedMissionIds];
    if (nextMissionId && !unlocked.includes(nextMissionId)) {
      unlocked = [...unlocked, nextMissionId];
    }

    const earned = [...progress.earnedRewardIds];
    for (const id of rewardIds) {
      if (!earned.includes(id)) earned.push(id);
    }

    return {
      ...progress,
      completedMissionIds: completed,
      unlockedMissionIds: unlocked,
      earnedRewardIds: earned,
      lastPlayedMissionId: missionId,
    };
  });
}

export function resetAllProgress(): void {
  writeSave(createEmptySave());
}

export function deleteProfile(profileId: string): void {
  const save = loadSave();
  const profiles = save.profiles.filter((p) => p.id !== profileId);
  const progressByProfile = { ...save.progressByProfile };
  delete progressByProfile[profileId];
  const activeProfileId =
    save.activeProfileId === profileId ? (profiles[0]?.id ?? null) : save.activeProfileId;
  writeSave({ ...save, profiles, progressByProfile, activeProfileId });
}

export function newProfileId(): string {
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
