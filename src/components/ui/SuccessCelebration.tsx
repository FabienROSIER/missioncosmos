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

/** Succès partagé. L’encart plein écran se ferme au premier appui ; le quiz et la récompense restent. */
export function SuccessCelebration({
  message,
  title = 'Défi réussi !',
  inline = false,
  compact = false,
  portalId,
}: Props) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (!portalId) return;
    const timer = setTimeout(() => setHost(document.getElementById(portalId)), 0);
    return () => clearTimeout(timer);
  }, [portalId]);
  useEffect(() => {
    if (inline || dismissed) return;
    const dismiss = () => setDismissed(true);
    window.addEventListener('pointerdown', dismiss);
    return () => window.removeEventListener('pointerdown', dismiss);
  }, [inline, dismissed]);
  if (dismissed) return null;
  const card = inline ? (
    <div className={styles.inline} data-success-celebration>
      <div className={`${styles.card} ${compact ? styles.compact : ''}`} role="status">
        <span className={styles.check} aria-hidden="true">
          ✓
        </span>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  ) : (
    <button
      type="button"
      className={styles.overlay}
      data-success-celebration
      aria-label="Fermer le message de réussite"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDismissed(true);
      }}
    >
      <div className={`${styles.card} ${compact ? styles.compact : ''}`} role="status">
        <span className={styles.check} aria-hidden="true">
          ✓
        </span>
        <strong>{title}</strong>
        <p>{message}</p>
        <p className={styles.dismissHint}>Appuie pour fermer</p>
      </div>
    </button>
  );
  return portalId ? (host ? createPortal(card, host) : null) : card;
}
