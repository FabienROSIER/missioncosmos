'use client';

import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

/**
 * Bouton d’installation : visible seulement si beforeinstallprompt est dispo
 * et que l’app n’est pas déjà en mode standalone.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setHidden(true);
      return;
    }

    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    };

    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  if (hidden || !deferred) {
    return null;
  }

  return (
    <div className={styles.bar} role="region" aria-label="Installer l'application">
      <p className={styles.text}>Installer Mission Cosmos sur l’écran d’accueil</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => {
            setHidden(true);
            setDeferred(null);
          }}
        >
          Plus tard
        </button>
        <button
          type="button"
          className={styles.install}
          onClick={() => {
            void (async () => {
              await deferred.prompt();
              await deferred.userChoice;
              setDeferred(null);
              setHidden(true);
            })();
          }}
        >
          Installer
        </button>
      </div>
    </div>
  );
}
