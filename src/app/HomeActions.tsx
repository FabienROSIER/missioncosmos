'use client';

import Link from 'next/link';
import { useLocalSave } from '@/features/progression/useLocalSave';
import styles from './HomeActions.module.css';

/** CTAs accueil selon profil local. */
export function HomeActions() {
  const { hasProfile } = useLocalSave();

  return (
    <>
      <div className={styles.actions}>
        {hasProfile ? (
          <Link href="/missions" className="btn btn--primary">
            Continuer
          </Link>
        ) : (
          <>
            <Link href="/profil" className="btn btn--primary">
              Créer mon profil
            </Link>
            <Link href="/missions" className="btn btn--secondary">
              Voir la carte
            </Link>
          </>
        )}
      </div>
      <div className={styles.secondaryActions}>
        <Link href="/profil" className="btn btn--ghost">
          Profil
        </Link>
        <Link href="/collection" className="btn btn--ghost">
          Collection
        </Link>
        <Link href="/settings" className="btn btn--ghost">
          Paramètres
        </Link>
      </div>
    </>
  );
}
