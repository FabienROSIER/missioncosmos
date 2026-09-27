/**
 * Limites de résolution texture par catégorie d'asset.
 * Appliquées au runtime (scale down GPU) selon la qualité graphique.
 */

export type TextureAssetCategory =
  | 'planet'
  | 'sun'
  | 'background'
  | 'ui'
  | 'sprite';

/** Max côté long (px) — high / low. */
export const TEXTURE_MAX_RESOLUTION: Record<
  TextureAssetCategory,
  { high: number; low: number }
> = {
  planet: { high: 2048, low: 1024 },
  sun: { high: 2048, low: 1024 },
  background: { high: 2048, low: 1024 },
  ui: { high: 1024, low: 512 },
  sprite: { high: 512, low: 256 },
};

export function getTextureMaxSide(
  category: TextureAssetCategory,
  quality: 'low' | 'high',
): number {
  return TEXTURE_MAX_RESOLUTION[category][quality];
}
