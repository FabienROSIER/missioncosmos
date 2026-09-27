'use client';

import type { ReactNode } from 'react';
import { Companion } from '@/components/game/Companion';
import { COMPANION_TEMP_NAME } from '@/content/companion';
import type { CompanionPose } from '@/lib/assets/paths';
import { useLocalSave } from '@/features/progression/useLocalSave';
import styles from './DialogueBubble.module.css';

type DialogueBubbleProps = {
  speaker?: string;
  children: ReactNode;
  pose?: CompanionPose;
  showCompanion?: boolean;
};

export function DialogueBubble({
  speaker = COMPANION_TEMP_NAME,
  children,
  pose = 'welcome',
  showCompanion = true,
}: DialogueBubbleProps) {
  const { companionVariant } = useLocalSave();

  return (
    <figure className={styles.root}>
      {showCompanion ? (
        <Companion
          pose={pose}
          size="md"
          className={styles.avatar}
          variant={companionVariant}
        />
      ) : null}
      <div className={styles.column}>
        <figcaption className={styles.speaker}>{speaker}</figcaption>
        <blockquote className={styles.bubble}>{children}</blockquote>
      </div>
    </figure>
  );
}
