'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './SuccessCelebration.module.css';

type Props = {
  message: ReactNode;
  title?: string;
  inline?: boolean;
  compact?: boolean;
  portalId?: string;
};

/** Shared, non-blocking success feedback for challenges, quizzes and rewards. */
export function SuccessCelebration({
  message,
  title = 'Défi réussi !',
  inline = false,
  compact = false,
  portalId,
}: Props) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!portalId) return;
    const timer = setTimeout(() => setHost(document.getElementById(portalId)), 0);
    return () => clearTimeout(timer);
  }, [portalId]);
  const card = (
    <div
      className={inline ? styles.inline : styles.overlay}
      style={portalId ? { pointerEvents: 'none' } : undefined}
      data-success-celebration
    >
      <div className={`${styles.card} ${compact ? styles.compact : ''}`} role="status">
        <span className={styles.check} aria-hidden="true">
          ✓
        </span>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
  return portalId ? (host ? createPortal(card, host) : null) : card;
}
