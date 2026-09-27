import type { ChildProfile } from '@/types/profile';
import type { Progress } from '@/types/progress';
import { SAVE_SCHEMA_VERSION } from '@/lib/constants';

/** Fichier de sauvegarde local (un appareil, plusieurs profils possibles). */
export type LocalSave = {
  version: number;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  /** Progression par profil */
  progressByProfile: Record<string, Progress>;
  updatedAt: string;
};

export const FIRST_MISSION_ID = 'mission-01';

export function createEmptyProgress(profileId: string): Progress {
  return {
    version: SAVE_SCHEMA_VERSION,
    profileId,
    completedMissionIds: [],
    unlockedMissionIds: [FIRST_MISSION_ID],
    earnedRewardIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptySave(): LocalSave {
  return {
    version: SAVE_SCHEMA_VERSION,
    profiles: [],
    activeProfileId: null,
    progressByProfile: {},
    updatedAt: new Date().toISOString(),
  };
}
