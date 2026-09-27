'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import styles from './ParentalResetGate.module.css';

type ParentalResetGateProps = {
  open: boolean;
  a: number;
  b: number;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
};

/** Protection simple type parent : petite addition avant action destructive. */
export function ParentalResetGate({
  open,
  a,
  b,
  onClose,
  onConfirm,
  title = 'Zone parents',
  description = 'Pour effacer la progression, résous cette petite question.',
}: ParentalResetGateProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const answer = a + b;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const n = Number.parseInt(value, 10);
    if (n === answer) {
      setError(false);
      setValue('');
      onConfirm();
      onClose();
      return;
    }
    setError(true);
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className={styles.copy}>{description}</p>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label} htmlFor="mc-parent-math">
          Combien font {a} + {b} ?
        </label>
        <input
          id="mc-parent-math"
          className={styles.input}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(false);
          }}
          required
        />
        {error ? <p className={styles.error}>Ce n’est pas le bon résultat. Réessaie.</p> : null}
        <button type="submit" className={styles.submit}>
          Confirmer
        </button>
      </form>
    </Modal>
  );
}

export function createParentMathChallenge(): { a: number; b: number } {
  const a = 2 + Math.floor(Math.random() * 5);
  const b = 2 + Math.floor(Math.random() * 5);
  return { a, b };
}
