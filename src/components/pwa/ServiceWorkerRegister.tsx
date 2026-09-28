'use client';

import { useEffect, useRef } from 'react';
import { BASE_PATH } from '@/lib/basePath';

const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ||
  process.env.NEXT_PUBLIC_APP_ENV ||
  '0.1.0';

function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local')
  );
}

function isMissionPath(pathname: string): boolean {
  const prefix = BASE_PATH || '';
  const path = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  return path.startsWith('/mission/');
}

/**
 * Enregistre le SW uniquement hors localhost (ne gêne pas `next dev`).
 * Propose l’activation d’une nouvelle version seulement hors mission.
 */
export function ServiceWorkerRegister() {
  const waitingRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    if (isLocalDevHost(window.location.hostname)) {
      return;
    }

    const swUrl = `${BASE_PATH}/sw.js?v=${encodeURIComponent(BUILD_ID)}`;
    let cancelled = false;

    void navigator.serviceWorker
      .register(swUrl, { scope: `${BASE_PATH}/`, updateViaCache: 'none' })
      .then((registration) => {
        if (cancelled) {
          return;
        }

        const promptActivate = (worker: ServiceWorker) => {
          waitingRef.current = worker;
          if (isMissionPath(window.location.pathname)) {
            return;
          }
          worker.postMessage({ type: 'SKIP_WAITING' });
        };

        if (registration.waiting) {
          promptActivate(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) {
            return;
          }
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              promptActivate(installing);
            }
          });
        });
      })
      .catch(() => {
        // Installation PWA possible sans SW parfait ; ne pas bloquer l’UI.
      });

    const onControllerChange = () => {
      // Recharge hors mission uniquement
      if (!isMissionPath(window.location.pathname)) {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}
