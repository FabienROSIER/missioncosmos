import type { MetadataRoute } from 'next';
import { BASE_PATH } from '@/lib/basePath';

/** Requis pour `output: 'export'`. */
export const dynamic = 'force-static';

/**
 * Manifest PWA — chemins relatifs à l’origine, avec basePath Pages.
 * start_url / scope doivent rester dans le sous-chemin du dépôt.
 */
export default function manifest(): MetadataRoute.Manifest {
  const root = BASE_PATH ? `${BASE_PATH}/` : '/';

  return {
    name: 'Mission Cosmos',
    short_name: 'Cosmos',
    description: 'Jeu éducatif gratuit d’astronomie pour les 6–12 ans',
    start_url: root,
    scope: root,
    display: 'standalone',
    orientation: 'any',
    background_color: '#0B1220',
    theme_color: '#0B1220',
    lang: 'fr',
    categories: ['education', 'games'],
    icons: [
      {
        src: `${root}assets/icons/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${root}assets/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${root}assets/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
