'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import styles from './SafeBackButton.module.css';

type SafeBackButtonProps = {
  fallbackHref?: string;
  label?: string;
  /** Version compacte pour HUD mission */
  compact?: boolean;
};

/** Retour navigateur / Android ; fallback si historique vide. */
export function SafeBackButton({
  fallbackHref = '/',
  label = 'Retour',
  compact = false,
}: SafeBackButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  if (compact) {
    return (
      <button type="button" className={styles.compact} onClick={goBack} aria-label={label}>
        ← {label}
      </button>
    );
  }

  return (
    <Button variant="secondary" onClick={goBack}>
      {label}
    </Button>
  );
}
