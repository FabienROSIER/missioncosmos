import {
  AbstractMesh,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {
  CELESTIAL_BODIES_BASE,
  type CelestialBodyId,
} from '@/lib/constants';

export type LoadedCelestialBody = {
  id: CelestialBodyId;
  /** Pivot à positionner / incliner / orbites */
  pivot: TransformNode;
  meshes: AbstractMesh[];
  dispose: () => void;
};

/**
 * Charge un GLB indépendant (textures WebP embarquées).
 * Rayon source ≈ 1 — appliquer l'échelle visuelle dans l'app.
 */
export async function loadCelestialBody(
  scene: Scene,
  id: CelestialBodyId,
  visualScale = 1,
  assetBase: string = CELESTIAL_BODIES_BASE,
): Promise<LoadedCelestialBody> {
  const rootUrl = `${assetBase}/${id}/`;
  const fileName = `${id}.glb`;

  const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
  const pivot = new TransformNode(`${id}-pivot`, scene);
  pivot.scaling = new Vector3(visualScale, visualScale, visualScale);

  for (const mesh of result.meshes) {
    if (!mesh.parent) {
      mesh.parent = pivot;
    }
  }

  // Conserver la racine de conversion glTF si présente
  if (result.transformNodes[0] && !result.transformNodes[0].parent) {
    result.transformNodes[0].parent = pivot;
  }

  return {
    id,
    pivot,
    meshes: result.meshes,
    dispose: () => {
      for (const mesh of result.meshes) {
        mesh.dispose(false, true);
      }
      for (const node of result.transformNodes) {
        node.dispose();
      }
      pivot.dispose();
    },
  };
}
