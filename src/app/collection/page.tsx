'use client';

import { AppShell } from '@/components/layout/AppShell';
import { RewardPanel } from '@/components/ui/RewardPanel';
import { getUnlockedEnrichedEntries } from '@/content/glossary';
import { getRewardsByIds } from '@/content/rewards/catalog';
import { useLocalSave } from '@/features/progression/useLocalSave';
import styles from './screen.module.css';

export default function CollectionPage() {
  const { progress, hasProfile, earnedRewardIds } = useLocalSave();
  const rewards = getRewardsByIds(progress?.earnedRewardIds ?? []);
  const enrichedWords = getUnlockedEnrichedEntries(earnedRewardIds);

  return (
    <AppShell title="Collection" sky="milky-way">
      <div className={`${styles.screen} ${styles.scroll}`}>
        {!hasProfile ? (
          <p className={styles.copy}>Crée un profil pour collectionner tes badges.</p>
        ) : (
          <div className={styles.fill}>
            <div className={styles.section}>
              {rewards.length === 0 ? (
                <RewardPanel
                  compact
                  title="Collection cosmique"
                  description="Gagne tes badges en réussissant des missions. Rien à acheter."
                />
              ) : (
                <ul className={styles.list}>
                  {rewards.map((reward) => (
                    <li key={reward.id}>
                      <RewardPanel
                        compact
                        title={reward.title}
                        description={reward.description}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {enrichedWords.length > 0 ? (
              <section className={styles.block} aria-labelledby="glossary-bonus-title">
                <h2 id="glossary-bonus-title" className={styles.heading}>
                  Mots bonus
                </h2>
                <ul className={styles.wordList}>
                  {enrichedWords.map((entry) => (
                    <li key={entry.id} className={styles.wordItem}>
                      <strong className={styles.wordTerm}>{entry.term}</strong>
                      <p className={styles.wordDef}>{entry.enrichedDefinition}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
