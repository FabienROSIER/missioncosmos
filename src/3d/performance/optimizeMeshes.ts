import {
  Constants,
  ScenePerformancePriority,
  Texture,
  type AbstractMesh,
  type Material,
  type Scene,
} from '@babylonjs/core';
import type { ResolvedGraphicsQuality } from '@/3d/materials/graphicsQuality';
import {
  getTextureMaxSide,
  type TextureAssetCategory,
} from '@/3d/performance/textureLimits';

/**
 * Réduit le coût CPU/GPU des meshes d'un corps :
 * - freeze matériaux stables
 * - aniso / sampling selon qualité
 * - alwaysSelectAsActiveMesh (petites scènes)
 *
 * Ne pas freezeWorldMatrix ici : les pivots orbitent / tournent.
 * Plafond de résolution = contrat asset (voir textureLimits) ; pas de rescale GPU runtime.
 */
export function optimizeCelestialMeshes(
  meshes: AbstractMesh[],
  quality: ResolvedGraphicsQuality,
  category: TextureAssetCategory = 'planet',
): void {
  const maxSide = getTextureMaxSide(category, quality);
  const aniso = quality === 'low' ? 2 : 4;

  for (const mesh of meshes) {
    if (!mesh.material) continue;

    clampMaterialTextures(mesh.material, maxSide, aniso);
    mesh.alwaysSelectAsActiveMesh = true;
    // Ne pas freeze() ici : textures GLB/WebP souvent pas encore prêtes → matériau noir figé.
  }
}

function clampMaterialTextures(
  material: Material,
  maxSide: number,
  aniso: number,
): void {
  for (const tex of material.getActiveTextures()) {
    if (!(tex instanceof Texture)) continue;
    tex.anisotropicFilteringLevel = aniso;
    tex.updateSamplingMode(Constants.TEXTURE_TRILINEAR_SAMPLINGMODE);

    // Logique de plafond : si texture > max, on baisse l'aniso (déjà fait) ;
    // le vrai allègement mémoire passe par des assets aux bonnes résolutions.
    const size = tex.getSize();
    const longest = Math.max(size.width || 0, size.height || 0);
    if (longest > maxSide) {
      tex.anisotropicFilteringLevel = Math.min(tex.anisotropicFilteringLevel, 1);
    }
  }
}

/**
 * Freeze world matrix des meshes vraiment statiques (ex. fond).
 * Ne pas appeler sur un pivot qui tourne chaque frame.
 */
export function freezeStaticMeshes(meshes: AbstractMesh[]): void {
  for (const mesh of meshes) {
    mesh.freezeWorldMatrix();
    mesh.doNotSyncBoundingInfo = true;
    mesh.alwaysSelectAsActiveMesh = true;
  }
}

/** Priorité perf scène selon qualité. */
export function applyScenePerformancePriority(
  scene: Scene,
  quality: ResolvedGraphicsQuality,
): void {
  scene.performancePriority =
    quality === 'low'
      ? ScenePerformancePriority.Intermediate
      : ScenePerformancePriority.BackwardCompatible;
}

/** Désactive le picking sur les meshes non interactifs. */
export function disablePicking(meshes: AbstractMesh[]): void {
  for (const mesh of meshes) {
    mesh.isPickable = false;
  }
}
