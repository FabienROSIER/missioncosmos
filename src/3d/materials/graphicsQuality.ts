export const GRAPHICS_QUALITY_LEVELS = ['auto', 'low', 'high'] as const;
export type GraphicsQualityLevel = (typeof GRAPHICS_QUALITY_LEVELS)[number];

export type ResolvedGraphicsQuality = 'low' | 'high';

const STORAGE_KEY = 'mc:graphics-quality';

export function getStoredGraphicsQuality(): GraphicsQualityLevel {
  if (typeof window === 'undefined') return 'auto';
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'auto' || value === 'low' || value === 'high') return value;
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

/** Résolution auto : low si mobile / DPR élevé / cœurs limités. */
export function resolveGraphicsQuality(
  preferred: GraphicsQualityLevel = getStoredGraphicsQuality(),
): ResolvedGraphicsQuality {
  if (preferred === 'low' || preferred === 'high') return preferred;
  if (typeof window === 'undefined') return 'high';

  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const dpr = window.devicePixelRatio || 1;
  if (mobile || cores <= 4 || dpr >= 2.5) return 'low';
  return 'high';
}
