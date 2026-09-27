import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
  /** Moins de padding (carte Univers, listes denses). */
  dense?: boolean;
};

export function Card({
  children,
  interactive = false,
  dense = false,
  className,
  ...rest
}: CardProps) {
  const classes = [
    styles.root,
    interactive ? styles.interactive : '',
    dense ? styles.dense : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
