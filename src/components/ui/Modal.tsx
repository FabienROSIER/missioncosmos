'use client';

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
};

const subscribeMounted = () => () => undefined;
const getMounted = () => true;
const getServerMounted = () => false;

/** Native dialog keeps focus inside and restores it on close; CSS handles presence. */
export function Modal({ open, title, children, onClose, closeLabel = 'Fermer' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const mounted = useSyncExternalStore(subscribeMounted, getMounted, getServerMounted);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open, mounted]);

  // The portal avoids clipping or moving the dialog with animated parent panels.
  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.backdrop}
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.sheet}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label={closeLabel}>
            ✕
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>,
    document.body,
  );
}
