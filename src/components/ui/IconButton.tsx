import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

/** Bouton icône accessible — `label` obligatoire pour lecteurs d'écran. */
export function IconButton({ label, children, className, type = 'button', ...rest }: IconButtonProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}
