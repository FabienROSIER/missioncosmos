'use client';

import { useEffect } from 'react';
import { resolveGraphicsQuality } from '@/3d/materials/graphicsQuality';
import { getUiMotionSnapshot, subscribeUiMotion } from '@/lib/uiMotion';

/** One shared policy for CSS, including dialogs portalled outside the app root. */
export function UiMotionPreferences() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      root.dataset.uiQuality = resolveGraphicsQuality();
      root.dataset.uiMotion = getUiMotionSnapshot();
    };
    const updateVisibility = () => {
      root.dataset.uiVisibility = document.hidden ? 'hidden' : 'visible';
    };
    update();
    updateVisibility();
    const unsubscribe = subscribeUiMotion(update);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return null;
}
