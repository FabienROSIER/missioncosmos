import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import styles from './RewardPanel.module.css';

type RewardPanelProps = {
  title: string;
  description: string;
  children?: ReactNode;
  /** Courte animation d’apparition (mission reward) — respect reduced-motion. */
  celebrate?: boolean;
  /** Version dense (écrans sans scroll). */
  compact?: boolean;
};

export function RewardPanel({
  title,
  description,
  children,
  celebrate = false,
  compact = false,
}: RewardPanelProps) {
  return (
    <aside
      className={[styles.root, compact ? styles.compact : ''].filter(Boolean).join(' ')}
      aria-live="polite"
    >
      <Badge tone="solar">Récompense</Badge>
      {celebrate ? (
        <SuccessCelebration inline compact={compact} title={title} message={description} />
      ) : (
        <>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </>
      )}
      {children}
    </aside>
  );
}
