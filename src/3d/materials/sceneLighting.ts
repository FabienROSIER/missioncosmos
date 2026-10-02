import {
  Color3,
  DefaultRenderingPipeline,
  DirectionalLight,
  HemisphericLight,
  Vector3,
  type Scene,
} from '@babylonjs/core';
import type { ResolvedGraphicsQuality } from '@/3d/materials/graphicsQuality';

/** Direction des rayons solaires (vers la scène). La face jour regarde −cette direction. */
export const MISSION_SUN_DIRECTION = new Vector3(-0.7, -0.35, -0.5);

export type SceneLightingHandle = {
  sunLight: DirectionalLight;
  hemiLight: HemisphericLight;
  dispose: () => void;
};

export type SceneLightingOptions = {
  /** Disable edge enhancement for tiny luminous point sprites. */
  sharpenEnabled?: boolean;
  /** Remplissage ambiant (défaut selon qualité). Baisser pour missions jour/nuit. */
  hemiIntensity?: number;
  sunIntensity?: number;
  /** Contraste image processing (défaut 1.06). */
  contrast?: number;
  /** Teinte du fill hémisphérique (défaut bleu-gris doux). */
  hemiDiffuse?: Color3;
  hemiGround?: Color3;
};

/**
 * Éclairage directionnel (Soleil) + fill hémisphérique.
 * Intensités / post-process selon qualité.
 */
export function setupSceneLighting(
  scene: Scene,
  quality: ResolvedGraphicsQuality,
  options: SceneLightingOptions = {},
): SceneLightingHandle {
  for (const light of [...scene.lights]) {
    if (light.name === 'defaultLight' || light.name === 'hemi' || light.name === 'sun') {
      light.dispose();
    }
  }

  const hemi = new HemisphericLight('hemi', new Vector3(0.15, 1, 0.25), scene);
  hemi.intensity = options.hemiIntensity ?? (quality === 'low' ? 0.28 : 0.32);
  hemi.diffuse = options.hemiDiffuse?.clone() ?? new Color3(0.55, 0.62, 0.75);
  hemi.groundColor = options.hemiGround?.clone() ?? new Color3(0.02, 0.03, 0.06);

  const sunLight = new DirectionalLight('sun', MISSION_SUN_DIRECTION.clone(), scene);
  sunLight.intensity = options.sunIntensity ?? (quality === 'low' ? 1.05 : 1.2);
  sunLight.diffuse = new Color3(1, 0.97, 0.92);
  sunLight.specular = new Color3(0.4, 0.4, 0.35);

  const camera = scene.activeCamera;
  let pipeline: DefaultRenderingPipeline | undefined;
  if (camera) {
    pipeline = new DefaultRenderingPipeline('missionPipeline', true, scene, [camera]);
    pipeline.fxaaEnabled = true;
    pipeline.bloomEnabled = false;
    pipeline.samples = quality === 'high' ? 4 : quality === 'medium' ? 2 : 1;
    pipeline.sharpenEnabled = options.sharpenEnabled ?? quality !== 'low';
    if (pipeline.sharpenEnabled) {
      pipeline.sharpen.edgeAmount = quality === 'high' ? 0.16 : 0.1;
    }
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.contrast = options.contrast ?? 1.06;
    pipeline.imageProcessing.exposure = 1.02;
  }

  return {
    sunLight,
    hemiLight: hemi,
    dispose: () => {
      pipeline?.dispose();
      hemi.dispose();
      sunLight.dispose();
    },
  };
}
