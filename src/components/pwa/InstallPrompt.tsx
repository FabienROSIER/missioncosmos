'use client';

import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

/** Une proposition par onglet / lancement ; ne revient pas à chaque page. */
const SESSION_KEY = 'mc:install-prompt-session';

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

function wasPromptedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markPromptedThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // stockage indisponible (mode privé strict, etc.)
  }
}

/**
 * Bouton d’installation : visible seulement si beforeinstallprompt est dispo
 * et que l’app n’est pas déjà en mode standalone.
 * Affiché au plus une fois par lancement (sessionStorage).
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandaloneDisplay() || wasPromptedThisSession()) {
      setHidden(true);
      return;
    }

    const onBip = (event: Event) => {
      event.preventDefault();
      if (wasPromptedThisSession()) return;
      markPromptedThisSession();
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
            markPromptedThisSession();
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
              markPromptedThisSession();
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
