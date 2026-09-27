'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import styles from './SplashGate.module.css';

const SPLASH_KEY = 'mc:splash-seen';

type SplashGateProps = {
  children: React.ReactNode;
};

/** Splash court au premier chargement de session — saute si déjà vu. */
export function SplashGate({ children }: SplashGateProps) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let alreadySeen = false;

    try {
      alreadySeen = sessionStorage.getItem(SPLASH_KEY) === '1';
    } catch {
      alreadySeen = false;
    }

    const delayMs = alreadySeen ? 0 : 900;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        sessionStorage.setItem(SPLASH_KEY, '1');
      } catch {
        /* private mode */
      }
      setReady(true);
      router.prefetch('/missions');
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router]);

  if (!ready) {
    return (
      <div className={styles.fill}>
        <LoadingScreen message="Branche les moteurs…" />
      </div>
    );
  }

  return <div className={styles.fill}>{children}</div>;
}
