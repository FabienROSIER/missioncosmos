'use client';

import styles from './GlossaryTermButton.module.css';

type GlossaryTermButtonProps = {
  label: string;
  onOpen: () => void;
};

/** Mot cliquable dans un texte pédagogique → ouvre le glossaire. */
export function GlossaryTermButton({ label, onOpen }: GlossaryTermButtonProps) {
  return (
    <button type="button" className={styles.root} data-motion="inline" onClick={onOpen}>
      {label}
    </button>
  );
}
