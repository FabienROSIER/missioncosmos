/**
 * Préfixe de déploiement (ex. `/missioncosmos` sur GitHub Pages).
 * Vide en local. Aligné sur `next.config.ts` via NEXT_PUBLIC_BASE_PATH.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

/** Préfixe un chemin absolu applicatif (`/assets/...`) avec le basePath. */
export function withBasePath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return path;
  }
  if (!BASE_PATH) {
    return path;
  }
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
