'use client';

import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
};

/** Sheet/modal mobile-first — fermeture clavier Escape. */
export function Modal({
  open,
  title,
  children,
  onClose,
  closeLabel = 'Fermer',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mc-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="mc-modal-title" className={styles.title}>
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label={closeLabel}>
            ✕
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
