import {
  Color3,
  Constants,
  PBRMaterial,
  StandardMaterial,
  Texture,
  type AbstractMesh,
  type Material,
  type Scene,
} from '@babylonjs/core';
import type { ResolvedGraphicsQuality } from '@/3d/materials/graphicsQuality';

/**
 * Normalise les matériaux d'un corps planétaire.
 * Low/mobile : StandardMaterial simple, sans normal map.
 * High : conserve PBR si déjà présent, sinon Standard enrichi.
 */
export function applyPlanetaryMaterials(
  scene: Scene,
  meshes: AbstractMesh[],
  quality: ResolvedGraphicsQuality,
): void {
  for (const mesh of meshes) {
    if (!mesh.material) continue;
    const mat = mesh.material;

    if (quality === 'low') {
      mesh.material = toLiteStandard(scene, mat, mesh.name);
      continue;
    }

    // High : garder PBR du GLB si utile, sinon standard net
    if (mat instanceof PBRMaterial) {
      mat.metallic = Math.min(mat.metallic ?? 0, 0.05);
      mat.roughness = Math.max(mat.roughness ?? 0.8, 0.65);
      // Peu d’IBL : sinon la face nuit reste trop claire (surtout en high)
      mat.environmentIntensity = 0.05;
      bumpAniso(mat);
    } else if (mat instanceof StandardMaterial) {
      mat.specularColor = new Color3(0.08, 0.08, 0.1);
      mat.specularPower = 32;
      bumpAniso(mat);
    }
  }
}

/**
 * Matériaux Terre pour jour/nuit : Standard lambert, ambiant noir.
 * Le PBR + IBL rend la face nuit trop claire.
 */
export function applyDayNightEarthMaterials(scene: Scene, meshes: AbstractMesh[]): void {
  scene.ambientColor = new Color3(1, 1, 1);

  for (const mesh of meshes) {
    if (!mesh.material) continue;
    const lite = toLiteStandard(scene, mesh.material, mesh.name);
    // Fill neutre (pas de teinte marron) — texture Terre lisible à l’horizon
    lite.ambientColor = new Color3(0.16, 0.17, 0.2);
    if (lite.diffuseTexture) {
      lite.emissiveTexture = lite.diffuseTexture;
      lite.emissiveColor = new Color3(0.08, 0.085, 0.095);
    } else {
      lite.emissiveColor = new Color3(0.04, 0.045, 0.05);
    }
    lite.specularColor = Color3.Black();
    mesh.material = lite;
  }
}

function toLiteStandard(scene: Scene, source: Material, name: string): StandardMaterial {
  const lite = new StandardMaterial(`${name}-lite`, scene);
  lite.specularColor = Color3.Black();
  lite.maxSimultaneousLights = 2;

  if (source instanceof StandardMaterial && source.diffuseTexture) {
    lite.diffuseTexture = source.diffuseTexture;
  } else if (source instanceof PBRMaterial && source.albedoTexture) {
    lite.diffuseTexture = source.albedoTexture;
  } else if (source instanceof StandardMaterial) {
    lite.diffuseColor = source.diffuseColor?.clone() ?? new Color3(0.4, 0.45, 0.5);
  } else {
    lite.diffuseColor = new Color3(0.35, 0.4, 0.5);
  }

  lite.bumpTexture = null;
  bumpAniso(lite);
  return lite;
}

function bumpAniso(mat: StandardMaterial | PBRMaterial): void {
  const textures =
    mat instanceof PBRMaterial
      ? [mat.albedoTexture, mat.bumpTexture, mat.emissiveTexture]
      : [mat.diffuseTexture, mat.bumpTexture, mat.emissiveTexture];

  for (const tex of textures) {
    if (tex instanceof Texture) {
      tex.anisotropicFilteringLevel = 4;
      tex.updateSamplingMode(Constants.TEXTURE_TRILINEAR_SAMPLINGMODE);
    }
  }
}
