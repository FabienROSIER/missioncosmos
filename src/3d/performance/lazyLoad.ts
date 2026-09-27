import type { CelestialBodyId } from '@/lib/constants';
import { logger } from '@/lib/logger';

type Loader = () => Promise<unknown>;

const preloadCache = new Map<string, Promise<unknown>>();

/**
 * Lazy / preload d'assets mission.
 * Les corps sont déjà chargés à la demande via SceneLoader ;
 * ce helper évite les doubles fetch et permet un warm-up optionnel.
 */
export function preloadOnce(key: string, loader: Loader): Promise<unknown> {
  const existing = preloadCache.get(key);
  if (existing) return existing;
  const promise = loader().catch((error) => {
    preloadCache.delete(key);
    logger.warn('Preload échoué', key, error);
    throw error;
  });
  preloadCache.set(key, promise);
  return promise;
}

/** Prefetch réseau du GLB (sans parser Babylon) — utile avant d'entrer en mission. */
export function prefetchCelestialGlb(
  bodyId: CelestialBodyId,
  baseUrl: string,
): Promise<unknown> {
  const url = `${baseUrl}/${bodyId}/${bodyId}.glb`;
  return preloadOnce(`glb:${url}`, async () => {
    const res = await fetch(url, { method: 'GET', credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.arrayBuffer();
    return true;
  });
}

export function clearPreloadCache(): void {
  preloadCache.clear();
}
