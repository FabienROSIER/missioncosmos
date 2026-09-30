export const GRAPHICS_QUALITY_LEVELS = ['auto', 'low', 'medium', 'high'] as const;
export type GraphicsQualityLevel = (typeof GRAPHICS_QUALITY_LEVELS)[number];

export type ResolvedGraphicsQuality = 'low' | 'medium' | 'high';

export const GRAPHICS_QUALITY_STORAGE_KEY = 'mc:graphics-quality';
export const GRAPHICS_QUALITY_CHANGE_EVENT = 'mc:graphics-quality-change';

// Keep the selection usable for this session when storage is unavailable.
let sessionQuality: GraphicsQualityLevel | undefined;

export function getStoredGraphicsQuality(): GraphicsQualityLevel {
  if (typeof window === 'undefined') return 'auto';
  if (sessionQuality !== undefined) return sessionQuality;
  try {
    const value = localStorage.getItem(GRAPHICS_QUALITY_STORAGE_KEY);
    if (value === 'auto' || value === 'low' || value === 'medium' || value === 'high') {
      return value;
    }
  } catch {
    /* private mode */
  }
  return 'auto';
}

export function setStoredGraphicsQuality(level: GraphicsQualityLevel): void {
  if (typeof window === 'undefined') return;
  sessionQuality = level;
  try {
    localStorage.setItem(GRAPHICS_QUALITY_STORAGE_KEY, level);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(GRAPHICS_QUALITY_CHANGE_EVENT));
}

export function subscribeGraphicsQuality(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== GRAPHICS_QUALITY_STORAGE_KEY) return;
    sessionQuality = undefined;
    onChange();
  };
  window.addEventListener(GRAPHICS_QUALITY_CHANGE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(GRAPHICS_QUALITY_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Résolution auto :
 * - low uniquement pour les appareils réellement limités ;
 * - medium sur mobile / écrans très denses ;
 * - high sur les machines plus confortables.
 */
export function resolveGraphicsQuality(
  preferred: GraphicsQualityLevel = getStoredGraphicsQuality(),
): ResolvedGraphicsQuality {
  if (preferred !== 'auto') return preferred;
  if (typeof window === 'undefined') return 'high';

  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const dpr = window.devicePixelRatio || 1;
  if (cores <= 2 || (memory !== undefined && memory <= 2)) return 'low';
  if (mobile || cores <= 4 || dpr >= 2.5) return 'medium';
  return 'high';
}
