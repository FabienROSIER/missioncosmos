import {
  Color3,
  Color4,
  Constants,
  DefaultRenderingPipeline,
  DirectionalLight,
  HemisphericLight,
  PointsCloudSystem,
  Texture,
  Vector3,
  type AbstractMesh,
  type CloudPoint,
  type Scene,
} from '@babylonjs/core';

export type StarfieldOptions = {
  /** Nombre d'étoiles (mobile : baisser). */
  count?: number;
  /** Taille en px — petit = ponctuel. */
  pointSize?: number;
  /** Rayon de la sphère d'étoiles. */
  radius?: number;
};

/**
 * Fond spatial : étoiles ponctuelles (pas une texture panoramique floue).
 * Les WebP AST-020/021/022 restent pour les menus UI en CSS.
 */
export async function createPunctualStarfield(
  scene: Scene,
  options: StarfieldOptions = {},
): Promise<PointsCloudSystem> {
  const mobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;
  const count = options.count ?? (mobile ? 1800 : 3200);
  const pointSize = options.pointSize ?? (mobile ? 1.25 : 1.5);
  const radius = options.radius ?? 120;

  scene.clearColor = new Color4(0.015, 0.025, 0.055, 1);

  const pcs = new PointsCloudSystem('punctual-stars', pointSize, scene);

  pcs.addPoints(count, (particle: CloudPoint) => {
    // Distribution uniforme sur une sphère
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * (0.92 + Math.random() * 0.08);

    particle.position = new Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );

    // Majorité d'étoiles faibles ; quelques-unes un peu plus brillantes (toujours blanches)
    const roll = Math.random();
    const brightness = roll > 0.97 ? 1 : roll > 0.85 ? 0.85 : 0.55 + Math.random() * 0.25;
    const cool = 0.92 + Math.random() * 0.08;
    particle.color = new Color4(brightness * cool, brightness * cool, brightness, 1);
  });

  await pcs.buildMeshAsync();
  if (pcs.mesh) {
    pcs.mesh.isPickable = false;
    pcs.mesh.alwaysSelectAsActiveMesh = true;
  }

  return pcs;
}

/** Améliore netteté des textures d'un corps chargé. */
export function upgradeMeshTextures(meshes: AbstractMesh[]): void {
  for (const mesh of meshes) {
    const mat = mesh.material;
    if (!mat) continue;
    for (const tex of mat.getActiveTextures()) {
      if (tex instanceof Texture) {
        tex.anisotropicFilteringLevel = 8;
        tex.updateSamplingMode(Constants.TEXTURE_TRILINEAR_SAMPLINGMODE);
      }
    }
  }
}

/** Éclairage + anti-aliasing pour une planète lisible. */
export function setupPlanetSceneQuality(scene: Scene): () => void {
  for (const light of [...scene.lights]) {
    if (light.name === 'defaultLight') {
      light.dispose();
    }
  }

  const hemi = new HemisphericLight('hemi', new Vector3(0.2, 1, 0.3), scene);
  hemi.intensity = 0.35;
  hemi.groundColor = new Color3(0.05, 0.07, 0.12);

  const sun = new DirectionalLight('sun', new Vector3(-0.65, -0.35, -0.55), scene);
  sun.intensity = 1.15;
  sun.diffuse = new Color3(1, 0.97, 0.92);

  const camera = scene.activeCamera;
  let pipeline: DefaultRenderingPipeline | undefined;
  if (camera) {
    pipeline = new DefaultRenderingPipeline('planetQuality', true, scene, [camera]);
    pipeline.samples = 4;
    pipeline.fxaaEnabled = true;
    pipeline.bloomEnabled = false;
    pipeline.sharpenEnabled = true;
    pipeline.sharpen.edgeAmount = 0.2;
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.contrast = 1.08;
    pipeline.imageProcessing.exposure = 1.05;
  }

  return () => {
    pipeline?.dispose();
    hemi.dispose();
    sun.dispose();
  };
}
