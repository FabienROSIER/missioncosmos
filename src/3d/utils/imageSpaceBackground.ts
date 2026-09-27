import { Color3, Mesh, MeshBuilder, StandardMaterial, Texture, type Scene } from '@babylonjs/core';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';

export type ImageSpaceBackgroundOptions = {
  /** UV tiling — garde les étoiles petites sur la voûte. */
  uScale?: number;
  vScale?: number;
  /** Intensité emissive (0–1). */
  level?: number;
  /** Segments sphère (moins = moins de tris ; low ≈ 24). */
  segments?: number;
};

/**
 * Fond image pour missions 3D (préférence produit vs procédural).
 * Sphère world-aligned + infiniteDistance : suit le regard, pas le zoom planète.
 */
export function createSpaceBackground(
  scene: Scene,
  url: string = MISSION_STARFIELD_SRC,
  options: ImageSpaceBackgroundOptions = {},
) {
  const uScale = options.uScale ?? 4;
  const vScale = options.vScale ?? 2;
  const level = options.level ?? 0.8;

  const dome = MeshBuilder.CreateSphere(
    'image-starfield-dome',
    {
      diameter: 1000,
      segments: options.segments ?? 48,
      sideOrientation: Mesh.BACKSIDE,
    },
    scene,
  );
  dome.infiniteDistance = true;
  dome.isPickable = false;
  dome.applyFog = false;
  dome.alwaysSelectAsActiveMesh = true;
  dome.freezeWorldMatrix();

  const texture = new Texture(url, scene);
  texture.gammaSpace = true;
  texture.wrapU = Texture.WRAP_ADDRESSMODE;
  texture.wrapV = Texture.WRAP_ADDRESSMODE;
  texture.uScale = uScale;
  texture.vScale = vScale;
  texture.level = level;
  texture.anisotropicFilteringLevel = 4;

  const material = new StandardMaterial('image-starfield-material', scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.specularColor = Color3.Black();
  material.emissiveTexture = texture;
  material.emissiveColor = Color3.Black();
  material.disableDepthWrite = true;
  dome.material = material;

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    scene.onDisposeObservable.remove(sceneObserver);
    dome.dispose();
    material.dispose(false, true);
  };
  const sceneObserver = scene.onDisposeObservable.add(dispose);

  return { dome, dispose };
}
