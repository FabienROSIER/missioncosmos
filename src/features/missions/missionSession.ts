import { SAVE_SCHEMA_VERSION } from '@/lib/constants';
import { remapLegacyMissionId } from '@/features/progression/legacyMissionIds';

const STORAGE_KEY = 'mc:mission-session';

export type MissionSession = {
  version: number;
  missionId: string;
  stepIndex: number;
  updatedAt: string;
};

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** Charge la session en cours pour une mission (reprise). */
export function loadMissionSession(missionId: string): MissionSession | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as MissionSession;
    if (data.version !== 1 && data.version !== SAVE_SCHEMA_VERSION) return null;
    const storedMissionId =
      data.version === 1 ? remapLegacyMissionId(data.missionId) : data.missionId;
    if (storedMissionId !== missionId) return null;
    if (typeof data.stepIndex !== 'number' || data.stepIndex < 0) return null;
    return { ...data, version: SAVE_SCHEMA_VERSION, missionId: storedMissionId };
  } catch {
    return null;
  }
}

/** Sauvegarde la progression dans la mission (reprise après quitter). */
export function saveMissionSession(missionId: string, stepIndex: number): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const payload: MissionSession = {
      version: SAVE_SCHEMA_VERSION,
      missionId,
      stepIndex,
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

/** Efface la session (mission terminée ou recommencer). */
export function clearMissionSession(missionId?: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    if (!missionId) {
      storage.removeItem(STORAGE_KEY);
      return;
    }
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as MissionSession;
    if (data.missionId === missionId) storage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
