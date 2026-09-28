import {
  Color3,
  PBRMaterial,
  StandardMaterial,
  type AbstractMesh,
  type Scene,
} from '@babylonjs/core';

/**
 * Soleil émissif — n'éclaire pas les autres corps (ajouter une DirectionalLight séparée).
 * La texture est branchée sur l’émissif pour que la rotation reste lisible
 * (vue principale et fenêtre PiP « Avec le Guide »).
 */
export function applyEmissiveSunMaterial(scene: Scene, meshes: AbstractMesh[]): void {
  for (const mesh of meshes) {
    if (!mesh.material) continue;
    mesh.alwaysSelectAsActiveMesh = true;
    // Groupe 0 (défaut) : le sol / la Terre doivent pouvoir occlure le Soleil (profondeur)
    mesh.renderingGroupId = 0;

    if (mesh.material instanceof PBRMaterial) {
      const pbr = mesh.material;
      if (pbr.albedoTexture && !pbr.emissiveTexture) {
        pbr.emissiveTexture = pbr.albedoTexture;
      }
      // La carte porte déjà sa teinte dorée : une seconde teinte orange
      // et une émission trop forte effacent la granulation.
      pbr.emissiveColor = Color3.White();
      pbr.emissiveIntensity = 1.15;
      pbr.albedoColor = Color3.Black();
      pbr.metallic = 0;
      pbr.roughness = 1;
      continue;
    }

    if (mesh.material instanceof StandardMaterial) {
      const std = mesh.material;
      std.disableLighting = true;
      if (std.diffuseTexture) {
        std.emissiveTexture = std.diffuseTexture;
      }
      std.emissiveColor = Color3.White();
      std.diffuseColor = Color3.Black();
      std.specularColor = Color3.Black();
      continue;
    }

    const mat = new StandardMaterial(`${mesh.name}-sun`, scene);
    mat.disableLighting = true;
    mat.emissiveColor = new Color3(1, 0.82, 0.4);
    mat.diffuseColor = new Color3(1, 0.9, 0.5);
    mesh.material = mat;
  }
}
