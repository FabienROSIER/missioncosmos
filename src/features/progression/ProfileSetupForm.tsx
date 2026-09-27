'use client';

import { useState } from 'react';
import {
  AVATAR_IDS,
  AVATAR_LABELS,
  MAX_PROFILES,
  type AvatarId,
  type ChildProfile,
} from '@/types/profile';
import { newProfileId, upsertProfile } from '@/features/progression/saveStore';
import styles from './ProfileSetupForm.module.css';

type ProfileSetupFormProps = {
  onDone?: (profile: ChildProfile) => void;
  /** Édition d'un profil existant */
  initial?: ChildProfile;
  profileCount?: number;
};

/** Création / édition profil — pseudo facultatif, avatar prédéfini. */
export function ProfileSetupForm({ onDone, initial, profileCount = 0 }: ProfileSetupFormProps) {
  const [name, setName] = useState(initial?.displayName ?? '');
  const [avatarId, setAvatarId] = useState<AvatarId>(initial?.avatarId ?? 'rocket');
  const canCreate = Boolean(initial) || profileCount < MAX_PROFILES;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCreate) return;
    const profile: ChildProfile = {
      id: initial?.id ?? newProfileId(),
      displayName: name.trim().slice(0, 20),
      avatarId,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    upsertProfile(profile, true);
    onDone?.(profile);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <p className={styles.help}>
        Pas de compte, pas de photo. Tout reste sur cet appareil.
      </p>

      <label className={styles.label} htmlFor="mc-pseudo">
        Pseudo <span className={styles.optional}>(facultatif)</span>
      </label>
      <input
        id="mc-pseudo"
        className={styles.input}
        type="text"
        maxLength={20}
        placeholder="Explorateur"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="nickname"
      />

      <p className={styles.label}>Avatar</p>
      <div className={styles.avatars} role="radiogroup" aria-label="Choix d’avatar">
        {AVATAR_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`${styles.avatar} ${avatarId === id ? styles.avatarActive : ''}`}
            aria-pressed={avatarId === id}
            onClick={() => setAvatarId(id)}
          >
            <span aria-hidden>{AVATAR_LABELS[id]}</span>
          </button>
        ))}
      </div>

      {!canCreate ? (
        <p className={styles.warn}>Maximum {MAX_PROFILES} profils sur cet appareil.</p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={!canCreate}>
        {initial ? 'Enregistrer' : 'Créer mon profil'}
      </button>
    </form>
  );
}
