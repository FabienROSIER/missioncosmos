'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { MISSION_CATALOG } from '@/content/missions/catalog';
import {
  getActiveProfile,
  getActiveProgress,
  getSaveSnapshot,
  subscribeSave,
} from '@/features/progression/saveStore';
import { createEmptySave } from '@/features/progression/types';
import type { ChildProfile } from '@/types/profile';
import type { Progress } from '@/types/progress';

const SERVER_SNAPSHOT = createEmptySave();
const EMPTY_REWARDS: string[] = [];

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/** % de missions terminées sur le catalogue actuel (plafonné à 100). */
export function computeProgressPercent(completedMissionIds: readonly string[]): number {
  const total = MISSION_CATALOG.length;
  if (total <= 0) return 0;
  const completed = completedMissionIds.filter((id) =>
    MISSION_CATALOG.some((mission) => mission.id === id),
  ).length;
  return Math.min(100, Math.round((completed / total) * 100));
}

/** Hook lecture de la sauvegarde locale (profil + progression). */
export function useLocalSave() {
  const save = useSyncExternalStore(subscribeSave, getSaveSnapshot, getServerSnapshot);

  const profile: ChildProfile | null = useMemo(() => getActiveProfile(save), [save]);
  const progress: Progress | null = useMemo(() => getActiveProgress(save), [save]);

  const hasProfile = Boolean(profile);

  const progressPercent = useMemo(() => {
    if (!progress) return 0;
    return computeProgressPercent(progress.completedMissionIds);
  }, [progress]);

  const isMissionUnlocked = useCallback(
    (missionId: string) => progress?.unlockedMissionIds.includes(missionId) ?? false,
    [progress],
  );

  const isMissionCompleted = useCallback(
    (missionId: string) => progress?.completedMissionIds.includes(missionId) ?? false,
    [progress],
  );

  const earnedRewardIds = progress?.earnedRewardIds ?? EMPTY_REWARDS;
  const hasEarthExplorer = earnedRewardIds.includes('reward-earth-explorer');

  return {
    save,
    profile,
    progress,
    hasProfile,
    progressPercent,
    isMissionUnlocked,
    isMissionCompleted,
    earnedRewardIds,
    /** Variante compagnon CSS après Mission 01 (assets Phase 6). */
    companionVariant: (hasEarthExplorer ? 'explorer' : 'default') as 'explorer' | 'default',
  };
}
