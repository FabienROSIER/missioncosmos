'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { MISSION_CATALOG } from '@/content/missions/catalog';
import { useLocalSave } from '@/features/progression/useLocalSave';
import { UniverseMap } from '@/features/universe/UniverseMap';
import { AVATAR_LABELS } from '@/types/profile';
import styles from './missions.module.css';

export default function MissionsPage() {
  const router = useRouter();
  const {
    profile,
    hasProfile,
    progressPercent,
    progress,
    isMissionUnlocked,
    isMissionCompleted,
  } = useLocalSave();

  if (!hasProfile) {
    return (
      <AppShell title="Carte de l’Univers" sky="starfield">
        <div className={styles.screen}>
          <p className={styles.intro}>Crée un profil pour commencer l&apos;aventure.</p>
          <button type="button" className={styles.cta} onClick={() => router.push('/profil')}>
            Créer mon profil
          </button>
        </div>
      </AppShell>
    );
  }

  const progressKey = [
    progressPercent,
    ...(progress?.unlockedMissionIds ?? []),
    ...(progress?.completedMissionIds ?? []),
  ].join('|');

  return (
    <AppShell title="Carte de l’Univers" sky="milky-way">
      <div className={styles.screen}>
        <div className={styles.profileRow}>
          <span className={styles.avatar} aria-hidden>
            {profile ? AVATAR_LABELS[profile.avatarId] : ''}
          </span>
          <div>
            <p className={styles.profileName}>
              {profile?.displayName.trim() || 'Explorateur'}
            </p>
            <p className={styles.progress}>
              Progression : {progressPercent}% · {MISSION_CATALOG.length} missions
            </p>
          </div>
        </div>
        <UniverseMap
          isMissionUnlocked={isMissionUnlocked}
          isMissionCompleted={isMissionCompleted}
          progressKey={progressKey}
          onStartMission={(missionId) => router.push(`/mission/${missionId}`)}
        />
      </div>
    </AppShell>
  );
}
