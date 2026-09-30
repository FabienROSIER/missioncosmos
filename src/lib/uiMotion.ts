import {
  resolveGraphicsQuality,
  subscribeGraphicsQuality,
  type ResolvedGraphicsQuality,
} from '@/3d/materials/graphicsQuality';
import { prefersReducedMotion } from '@/lib/motion';

export type UiMotionLevel = 'none' | 'minimal' | 'standard' | 'full';

type DataSavingConnection = EventTarget & { saveData?: boolean };

function getConnection(): DataSavingConnection | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: DataSavingConnection }).connection;
}

/** UI effects share the 3D quality budget; accessibility always takes precedence. */
export function resolveUiMotion(
  quality: ResolvedGraphicsQuality,
  reducedMotion = false,
  saveData = false,
): UiMotionLevel {
  if (reducedMotion) return 'none';
  if (saveData || quality === 'low') return 'minimal';
  return quality === 'medium' ? 'standard' : 'full';
}

export function getUiMotionSnapshot(): UiMotionLevel {
  if (typeof window === 'undefined') return 'minimal';
  return resolveUiMotion(
    resolveGraphicsQuality(),
    prefersReducedMotion(),
    getConnection()?.saveData === true,
  );
}

/** Events only: no animation loop, scroll listener, or pointer tracking. */
export function subscribeUiMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const unsubscribeQuality = subscribeGraphicsQuality(onChange);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = getConnection();
  reduced.addEventListener('change', onChange);
  window.addEventListener('resize', onChange);
  connection?.addEventListener('change', onChange);
  return () => {
    unsubscribeQuality();
    reduced.removeEventListener('change', onChange);
    window.removeEventListener('resize', onChange);
    connection?.removeEventListener('change', onChange);
  };
}
