/** Avatars prédéfinis — jamais de photo personnelle. */
export const AVATAR_IDS = ['rocket', 'star', 'planet', 'comet', 'moon'] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export const AVATAR_LABELS: Record<AvatarId, string> = {
  rocket: '🚀',
  star: '⭐',
  planet: '🌍',
  comet: '☄️',
  moon: '🌙',
};

/** Profil enfant local — données minimales, pas de compte distant. */
export type ChildProfile = {
  id: string;
  /** Pseudo facultatif ; vide → affichage « Explorateur » */
  displayName: string;
  avatarId: AvatarId;
  createdAt: string;
};

export const MAX_PROFILES = 3;
