export const GRAPHICS_QUALITY_LEVELS = ['auto', 'low', 'medium', 'high'] as const;
export type GraphicsQualityLevel = (typeof GRAPHICS_QUALITY_LEVELS)[number];

export type ResolvedGraphicsQuality = 'low' | 'medium' | 'high';

const STORAGE_KEY = 'mc:graphics-quality';

export function getStoredGraphicsQuality(): GraphicsQualityLevel {
  if (typeof window === 'undefined') return 'auto';
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'auto' || value === 'low' || value === 'medium' || value === 'high') {
      return value;
    }
  } catch {
    /* private mode */
  }
  return 'auto';
}

export function setStoredGraphicsQuality(level: GraphicsQualityLevel): void {
  try {
    localStorage.setItem(STORAGE_KEY, level);
  } catch {
    /* ignore */
  }
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
