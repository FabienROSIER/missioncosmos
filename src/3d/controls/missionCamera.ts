import {
  Animation,
  ArcRotateCamera,
  CubicEase,
  EasingFunction,
  Vector3,
  type AbstractMesh,
  type TransformNode,
} from '@babylonjs/core';
import { frameCelestialCamera, getVisualRadius } from '@/3d/utils/cameraFraming';

export type MissionCameraHome = {
  alpha: number;
  beta: number;
  radius: number;
  target: Vector3;
};

export type MissionCameraApi = {
  recenter: () => Promise<void>;
  focusOn: (node: TransformNode, meshes?: AbstractMesh[]) => Promise<void>;
  getHome: () => MissionCameraHome;
};

export type ConfigureMissionCameraOptions = {
  /** Autoriser le pan (rarement utile pédagogiquement). */
  allowPan?: boolean;
  lowerBetaLimit?: number;
  upperBetaLimit?: number;
  /** Limites alpha optionnelles (radians). */
  lowerAlphaLimit?: number | null;
  upperAlphaLimit?: number | null;
};

/**
 * Caméra mission : rotation + pinch/molette, pas de pan par défaut.
 * Limites zoom déjà posées via frameCelestialCamera.
 */
export function configureMissionCamera(
  camera: ArcRotateCamera,
  options: ConfigureMissionCameraOptions = {},
): void {
  const allowPan = options.allowPan ?? false;

  camera.panningSensibility = allowPan ? 1000 : 0;
  camera.allowUpsideDown = false;
  camera.lowerBetaLimit = options.lowerBetaLimit ?? 0.2;
  camera.upperBetaLimit = options.upperBetaLimit ?? Math.PI - 0.2;
  camera.lowerAlphaLimit = options.lowerAlphaLimit ?? null;
  camera.upperAlphaLimit = options.upperAlphaLimit ?? null;

  // Sensibilité tactile / souris confortable enfants
  camera.angularSensibilityX = 1200;
  camera.angularSensibilityY = 1200;
  camera.wheelDeltaPercentage = 0.02;
  camera.pinchDeltaPercentage = 0.02;
  camera.inertia = 0.78;
  camera.panningInertia = 0.8;

  // Évite que le pinch UI navigateur concurrence (viewport déjà userScalable=false)
  camera.useInputToRestoreState = false;
}

export function captureCameraHome(camera: ArcRotateCamera): MissionCameraHome {
  return {
    alpha: camera.alpha,
    beta: camera.beta,
    radius: camera.radius,
    target: camera.target.clone(),
  };
}

export function animateCameraTo(
  camera: ArcRotateCamera,
  home: Partial<MissionCameraHome> & { target?: Vector3 },
  durationMs = 550,
): Promise<void> {
  const scene = camera.getScene();
  const fps = 60;
  const frames = Math.max(1, Math.round((durationMs / 1000) * fps));
  const easing = new CubicEase();
  easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

  const jobs: Promise<void>[] = [];

  const run = (property: string, from: number, to: number) =>
    new Promise<void>((resolve) => {
      Animation.CreateAndStartAnimation(
        `cam-${property}`,
        camera,
        property,
        fps,
        frames,
        from,
        to,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        easing,
        () => resolve(),
      );
    });

  if (home.alpha !== undefined) jobs.push(run('alpha', camera.alpha, home.alpha));
  if (home.beta !== undefined) jobs.push(run('beta', camera.beta, home.beta));
  if (home.radius !== undefined) jobs.push(run('radius', camera.radius, home.radius));

  if (home.target) {
    const from = camera.target.clone();
    const to = home.target;
    jobs.push(
      new Promise<void>((resolve) => {
        const animX = new Animation(
          'cam-target-x',
          'target.x',
          fps,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
        animX.setKeys([
          { frame: 0, value: from.x },
          { frame: frames, value: to.x },
        ]);
        animX.setEasingFunction(easing);
        const animY = new Animation(
          'cam-target-y',
          'target.y',
          fps,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
        animY.setKeys([
          { frame: 0, value: from.y },
          { frame: frames, value: to.y },
        ]);
        animY.setEasingFunction(easing);
        const animZ = new Animation(
          'cam-target-z',
          'target.z',
          fps,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
        animZ.setKeys([
          { frame: 0, value: from.z },
          { frame: frames, value: to.z },
        ]);
        animZ.setEasingFunction(easing);
        scene.beginDirectAnimation(camera, [animX, animY, animZ], 0, frames, false, 1, () =>
          resolve(),
        );
      }),
    );
  }

  return Promise.all(jobs).then(() => undefined);
}

export function createMissionCameraApi(
  camera: ArcRotateCamera,
  home: MissionCameraHome,
  focusPivot?: TransformNode,
  focusMeshes: AbstractMesh[] = [],
): MissionCameraApi {
  return {
    getHome: () => ({
      ...home,
      target: home.target.clone(),
    }),
    recenter: () => animateCameraTo(camera, home),
    focusOn: async (node, meshes = []) => {
      const list = meshes.length > 0 ? meshes : focusMeshes;
      const radius = getVisualRadius(node, list);
      await animateCameraTo(camera, {
        target: node.getAbsolutePosition(),
        radius: Math.max(radius * 2.4, (camera.lowerRadiusLimit ?? radius) + 0.4),
        alpha: home.alpha,
        beta: home.beta,
      });
    },
  };
}

/** Helper scène planète : framing + face jour + config contrôles + API. */
export function setupPlanetMissionCamera(
  camera: ArcRotateCamera,
  pivot: TransformNode,
  meshes: AbstractMesh[],
  frameOptions?: Parameters<typeof frameCelestialCamera>[3],
): MissionCameraApi {
  frameCelestialCamera(camera, pivot, meshes, frameOptions);
  configureMissionCamera(camera, { allowPan: false });
  const home = captureCameraHome(camera);
  return createMissionCameraApi(camera, home, pivot, meshes);
}
