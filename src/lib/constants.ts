/** Constantes applicatives centralisées — pas de secrets ici. */

export const APP_NAME = 'Mission Cosmos';
export const APP_LOCALE = 'fr' as const;
export const TARGET_AGE = { min: 6, max: 12 } as const;

/** Version du schéma de sauvegarde locale */
export const SAVE_SCHEMA_VERSION = 1;

/**
 * Racine logique des assets (sans basePath).
 * Pour une URL réelle (fetch / Babylon / CSS), passer par `withBasePath()`.
 */
export const ASSETS_PUBLIC_ROOT = '/assets';

/** Pack corps célestes (GLB indépendants) — chemin logique */
export const CELESTIAL_BODIES_BASE =
  `${ASSETS_PUBLIC_ROOT}/models/solarsystem/celestial-bodies` as const;

export const CELESTIAL_BODY_IDS = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'asteroids',
] as const;

export type CelestialBodyId = (typeof CELESTIAL_BODY_IDS)[number];

export const GRAPHICS_QUALITY = ['auto', 'low', 'high'] as const;
export type GraphicsQuality = (typeof GRAPHICS_QUALITY)[number];
