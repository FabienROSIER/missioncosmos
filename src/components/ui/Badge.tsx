import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeTone = 'neutral' | 'nebula' | 'solar' | 'success';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`${styles.root} ${styles[tone]}`}>{children}</span>;
}
