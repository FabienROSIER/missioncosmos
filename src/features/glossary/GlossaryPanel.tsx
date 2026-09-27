'use client';

import { Modal } from '@/components/ui/Modal';
import { isGlossaryEnrichedUnlocked } from '@/content/glossary';
import type { GlossaryEntry } from '@/types/glossary';
import styles from './GlossaryPanel.module.css';

type GlossaryPanelProps = {
  open: boolean;
  entries: GlossaryEntry[];
  onClose: () => void;
  /** Mettre une entrée en avant (ouverte depuis un mot cliquable). */
  focusId?: string | null;
  /** Récompenses du profil actif — débloquent les définitions enrichies. */
  earnedRewardIds?: string[];
};

/** Glossaire interactif — définitions courtes, accessibles en mission. */
export function GlossaryPanel({
  open,
  entries,
  onClose,
  focusId,
  earnedRewardIds = [],
}: GlossaryPanelProps) {
  const ordered = focusId
    ? [...entries].sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : 0))
    : entries;

  return (
    <Modal open={open} title="Mots du cosmos" onClose={onClose} closeLabel="Fermer le glossaire">
      {ordered.length === 0 ? (
        <p className={styles.empty}>Aucun mot pour cette mission.</p>
      ) : (
        <ul className={styles.list}>
          {ordered.map((entry) => {
            const enriched = isGlossaryEnrichedUnlocked(entry, earnedRewardIds);
            return (
              <li
                key={entry.id}
                className={`${styles.item} ${entry.id === focusId ? styles.focus : ''}`}
                id={`glossary-${entry.id}`}
              >
                <h3 className={styles.term}>{entry.term}</h3>
                <p className={styles.definition}>{entry.definition}</p>
                {enriched && entry.enrichedDefinition ? (
                  <p className={styles.enriched}>
                    <span className={styles.enrichedLabel}>Bonus</span>
                    {entry.enrichedDefinition}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
