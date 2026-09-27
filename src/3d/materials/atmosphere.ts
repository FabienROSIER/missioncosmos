import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  type AbstractMesh,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import type { ResolvedGraphicsQuality } from '@/3d/materials/graphicsQuality';

export type AtmosphereHandle = {
  mesh: AbstractMesh;
  dispose: () => void;
};

/**
 * Atmosphère simplifiée : coquille légèrement plus grande.
 * Si `litBySun` : reçoit la lumière directionnelle → face nuit quasi invisible
 * (évite le halo bleu uniforme sur l’ombre).
 */
export function createSimpleAtmosphere(
  scene: Scene,
  parent: TransformNode,
  options?: {
    scale?: number;
    color?: Color3;
    quality?: ResolvedGraphicsQuality;
    /** Opacité (défaut 0.18). */
    alpha?: number;
    /**
     * true = matériau éclairé (recommandé jour/nuit).
     * false = émissif uniforme (Mission 01).
     */
    litBySun?: boolean;
  },
): AtmosphereHandle | null {
  const quality = options?.quality ?? 'high';
  if (quality === 'low') return null;

  const scale = options?.scale ?? 1.035;
  const color = options?.color ?? new Color3(0.35, 0.55, 0.95);
  const alpha = options?.alpha ?? 0.18;
  const litBySun = options?.litBySun ?? false;

  const mesh = MeshBuilder.CreateSphere(
    `${parent.name}-atmosphere`,
    { diameter: 2, segments: 24 },
    scene,
  );
  mesh.parent = parent;
  mesh.scaling.setAll(scale);
  mesh.isPickable = false;
  mesh.applyFog = false;

  const mat = new StandardMaterial(`${parent.name}-atmosphere-mat`, scene);
  mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  mat.backFaceCulling = false;
  mat.disableDepthWrite = true;
  mat.specularColor = Color3.Black();
  mat.alpha = alpha;

  if (litBySun) {
    // Uniquement le côté jour / limbe éclairé — pas de bleu sur la face nuit
    mat.disableLighting = false;
    mat.diffuseColor = color;
    mat.emissiveColor = new Color3(0.01, 0.015, 0.03);
    mat.maxSimultaneousLights = 2;
  } else {
    mat.disableLighting = true;
    mat.emissiveColor = color;
  }

  mesh.material = mat;

  return {
    mesh,
    dispose: () => {
      mat.dispose();
      mesh.dispose();
    },
  };
}
