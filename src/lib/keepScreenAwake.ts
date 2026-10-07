'use client';

import { useEffect } from 'react';
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';

/**
 * Empêche la mise en veille de l’écran pendant une mission (mobile / tactile).
 * Utilise l’API Screen Wake Lock ; no-op si absente ou refusée.
 */
export function useKeepScreenAwake(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined') return;
    if (!('wakeLock' in navigator)) return;
    if (!window.matchMedia(MOBILE_GAME_QUERY).matches) return;

    let cancelled = false;
    let lock: WakeLockSentinel | null = null;

    const release = async () => {
      const current = lock;
      lock = null;
      try {
        await current?.release();
      } catch {
        // Déjà libéré (onglet en arrière-plan, etc.)
      }
    };

    const request = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        const next = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await next.release();
          return;
        }
        lock = next;
        next.addEventListener('release', () => {
          if (lock === next) lock = null;
        });
      } catch {
        // Permission / politique navigateur : on laisse la veille native.
      }
    };

    void request();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void release();
    };
  }, [enabled]);
}
