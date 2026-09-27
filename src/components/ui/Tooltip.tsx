import type { ReactNode } from 'react';
import styles from './Tooltip.module.css';

type TooltipProps = {
  label: string;
  children: ReactNode;
};

/** Indice pédagogique au survol / focus — mobile : titre natif aussi. */
export function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className={styles.wrap} title={label}>
      {children}
      <span className={styles.tip} role="tooltip">
        {label}
      </span>
    </span>
  );
}
