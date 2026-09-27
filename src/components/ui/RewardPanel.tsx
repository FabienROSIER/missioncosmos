import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
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
      className={[
        styles.root,
        celebrate ? styles.celebrate : '',
        compact ? styles.compact : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
    >
      <Badge tone="solar">Récompense</Badge>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {children}
    </aside>
  );
}
