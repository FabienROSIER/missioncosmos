export type RewardKind = 'badge' | 'collection' | 'glossary' | 'companion';

export interface Reward {
  id: string;
  title: string;
  description: string;
  kind: RewardKind;
  assetId?: string;
}

/** Sauvegarde locale versionnée (migration Phase 5 / 15). */
export interface Progress {
  version: number;
  profileId: string;
  completedMissionIds: string[];
  unlockedMissionIds: string[];
  earnedRewardIds: string[];
  lastPlayedMissionId?: string;
  /** ISO 8601 */
  updatedAt: string;
}
