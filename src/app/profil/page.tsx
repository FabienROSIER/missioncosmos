'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ProfileSetupForm } from '@/features/progression/ProfileSetupForm';
import {
  deleteProfile,
  setActiveProfile,
} from '@/features/progression/saveStore';
import { useLocalSave } from '@/features/progression/useLocalSave';
import { AVATAR_LABELS, MAX_PROFILES } from '@/types/profile';
import styles from './profil.module.css';

export default function ProfilPage() {
  const router = useRouter();
  const { save, profile, hasProfile } = useLocalSave();
  const [adding, setAdding] = useState(false);
  const canAdd = save.profiles.length < MAX_PROFILES;

  return (
    <AppShell title="Profil" sky="nebula">
      <div className={styles.screen}>
        {hasProfile && profile ? (
          <div className={styles.current}>
            <p className={styles.avatar} aria-hidden>
              {AVATAR_LABELS[profile.avatarId]}
            </p>
            <div>
              <h2 className={styles.name}>
                {profile.displayName.trim() || 'Explorateur'}
              </h2>
              <p className={styles.meta}>Tu joues avec ce profil.</p>
            </div>
          </div>
        ) : (
          <p className={styles.intro}>Crée un profil pour sauvegarder ta progression ici.</p>
        )}

        {save.profiles.length > 1 ? (
          <div className={styles.switcher}>
            <p className={styles.label}>Changer de profil</p>
            <div className={styles.list}>
              {save.profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.chip} ${p.id === save.activeProfileId ? styles.chipActive : ''}`}
                  onClick={() => {
                    setActiveProfile(p.id);
                    setAdding(false);
                  }}
                >
                  <span aria-hidden>{AVATAR_LABELS[p.avatarId]}</span>
                  {p.displayName.trim() || 'Explorateur'}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <section className={styles.card}>
          <h3 className={styles.heading}>
            {adding
              ? 'Nouveau profil'
              : hasProfile
                ? 'Modifier mon profil'
                : 'Nouveau profil'}
          </h3>
          {adding ? (
            <ProfileSetupForm
              key="new"
              profileCount={save.profiles.length}
              onDone={() => {
                setAdding(false);
                router.push('/missions');
              }}
            />
          ) : (
            <ProfileSetupForm
              key={profile?.id ?? 'create'}
              initial={profile ?? undefined}
              profileCount={save.profiles.length}
              onDone={() => router.push('/missions')}
            />
          )}
        </section>

        <div className={styles.footer}>
          {hasProfile && canAdd && !adding ? (
            <button type="button" className={styles.secondary} onClick={() => setAdding(true)}>
              Ajouter un profil
            </button>
          ) : null}
          {adding ? (
            <button type="button" className={styles.secondary} onClick={() => setAdding(false)}>
              Annuler
            </button>
          ) : null}
          {hasProfile && !canAdd ? (
            <p className={styles.meta}>Limite de {MAX_PROFILES} profils atteinte.</p>
          ) : null}
          {profile && !adding ? (
            <button
              type="button"
              className={styles.danger}
              onClick={() => {
                deleteProfile(profile.id);
              }}
            >
              Supprimer ce profil
            </button>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
