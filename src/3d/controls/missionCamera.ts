import {
  Animation,
  ArcRotateCamera,
  CubicEase,
  EasingFunction,
  Vector3,
  type AbstractMesh,
  type ArcRotateCameraPointersInput,
  type TransformNode,
} from '@babylonjs/core';
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';
import { frameCelestialCamera, getVisualRadius } from '@/3d/utils/cameraFraming';

/** Limite avant relative au desktop ; paysage plus permissif car la vue est plus étroite. */
const MOBILE_PORTRAIT_ZOOM_IN_FACTOR = 0.38;
const MOBILE_LANDSCAPE_ZOOM_IN_FACTOR = 0.26;
/** Rapprochement automatique appliqué à l’entrée en paysage. */
const MOBILE_LANDSCAPE_AUTO_ZOOM_FACTOR = 0.7;

/** Sensibilité pan Babylon : plus bas = translation plus rapide. */
const DESKTOP_PANNING_SENSIBILITY = 900;
const MOBILE_PANNING_SENSIBILITY = 300;

function isMobileGameLayout(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_GAME_QUERY).matches;
}

function isLandscapeLayout(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(orientation: landscape)').matches;
}

type ResponsiveZoomState = {
  baseLowerLimit: number;
  appliedLowerLimit: number;
  landscapeBoostApplied: boolean;
};

const responsiveZoomStates = new WeakMap<ArcRotateCamera, ResponsiveZoomState>();

/**
 * Abaisse la limite de zoom avant sur mobile (dézoom inchangé).
 * À appeler après avoir posé `lowerRadiusLimit` desktop, si `configureMissionCamera` ne suit pas.
 */
export function allowCloserZoomOnMobile(camera: ArcRotateCamera): void {
  const lower = camera.lowerRadiusLimit;
  if (lower == null || !Number.isFinite(lower) || lower <= 0) return;

  let state = responsiveZoomStates.get(camera);
  if (!state) {
    state = {
      baseLowerLimit: lower,
      appliedLowerLimit: lower,
      landscapeBoostApplied: false,
    };
    responsiveZoomStates.set(camera, state);
  } else if (Math.abs(lower - state.appliedLowerLimit) > 1e-5) {
    // Une scène vient de poser une nouvelle limite : elle devient la référence desktop.
    state.baseLowerLimit = lower;
    // Le cadrage (radius) a généralement été reposé lui aussi : réappliquer le boost.
    state.landscapeBoostApplied = false;
  }

  if (!isMobileGameLayout()) {
    camera.lowerRadiusLimit = state.baseLowerLimit;
    state.appliedLowerLimit = state.baseLowerLimit;
    return;
  }

  const factor = isLandscapeLayout()
    ? MOBILE_LANDSCAPE_ZOOM_IN_FACTOR
    : MOBILE_PORTRAIT_ZOOM_IN_FACTOR;
  const floor = Math.max((camera.minZ || 0.05) * 6, 0.12);
  camera.lowerRadiusLimit = Math.max(state.baseLowerLimit * factor, floor);
  state.appliedLowerLimit = camera.lowerRadiusLimit;
}

/**
 * Applique/retire le rapprochement de cadrage quand l’orientation change.
 * Le rayon courant est multiplié puis divisé : le zoom choisi par l’utilisateur est conservé.
 */
export function syncResponsiveCameraZoom(camera: ArcRotateCamera): void {
  allowCloserZoomOnMobile(camera);

  const lower = camera.lowerRadiusLimit ?? 0;
  const upper = camera.upperRadiusLimit ?? Number.POSITIVE_INFINITY;
  const state = responsiveZoomStates.get(camera);
  if (!state) return;

  const shouldBoost =
    !camera.metadata?.skipLandscapeAutoZoom && isMobileGameLayout() && isLandscapeLayout();
  if (shouldBoost && !state.landscapeBoostApplied) {
    camera.radius = Math.max(lower, Math.min(upper, camera.radius * MOBILE_LANDSCAPE_AUTO_ZOOM_FACTOR));
    state.landscapeBoostApplied = true;
  } else if (!shouldBoost && state.landscapeBoostApplied) {
    camera.radius = Math.max(
      lower,
      Math.min(upper, camera.radius / MOBILE_LANDSCAPE_AUTO_ZOOM_FACTOR),
    );
    state.landscapeBoostApplied = false;
  }
}

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
  /** Met à jour la vue restaurée par « Recentrer » (cadrage responsive). */
  setHome?: (home: MissionCameraHome) => void;
};

export type ConfigureMissionCameraOptions = {
  /**
   * Translation caméra (défaut true) :
   * - mobile : glisser à deux doigts
   * - PC : clic molette + déplacement
   */
  allowPan?: boolean;
  lowerBetaLimit?: number;
  upperBetaLimit?: number;
  /** Limites alpha optionnelles (radians). */
  lowerAlphaLimit?: number | null;
  upperAlphaLimit?: number | null;
  /**
   * Le cadrage a déjà la bonne distance pour l’orientation courante.
   * Ne pas rapprocher automatiquement en paysage (ça recadre Soleil / Terre).
   */
  skipLandscapeAutoZoom?: boolean;
};

/**
 * Caméra mission : rotation + pinch/molette + translation (pan).
 * Limites zoom déjà posées via frameCelestialCamera.
 */
export function configureMissionCamera(
  camera: ArcRotateCamera,
  options: ConfigureMissionCameraOptions = {},
): void {
  if (options.skipLandscapeAutoZoom) {
    camera.metadata = { ...(camera.metadata ?? {}), skipLandscapeAutoZoom: true };
  }

  const allowPan = options.allowPan ?? true;
  const panningSensibility = isMobileGameLayout()
    ? MOBILE_PANNING_SENSIBILITY
    : DESKTOP_PANNING_SENSIBILITY;

  camera.panningSensibility = allowPan ? panningSensibility : 0;
  camera.panningInertia = 0.75;
  camera.panningAxis = new Vector3(1, 1, 0);
  camera.mapPanning = false;
  // Molette = pan (au lieu du clic droit Babylon par défaut)
  camera._panningMouseButton = 1;
  // Soft limit pour ne pas perdre la scène ; « Recentrer » restaure la vue
  const upper = camera.upperRadiusLimit ?? camera.radius ?? 10;
  camera.panningDistanceLimit = allowPan
    ? Math.max(upper * 0.9, (camera.radius ?? 5) * 1.4)
    : null;

  const pointers = camera.inputs?.attached
    ?.pointers as ArcRotateCameraPointersInput | undefined;
  if (pointers) {
    pointers.multiTouchPanning = allowPan;
    pointers.multiTouchPanAndZoom = allowPan;
    pointers.pinchZoom = true;
    if (allowPan) {
      pointers.panningSensibility = panningSensibility;
    }
  }

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

  // Évite que le pinch UI navigateur concurrence (viewport déjà userScalable=false)
  camera.useInputToRestoreState = false;

  syncResponsiveCameraZoom(camera);
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
  const initialZoomState = responsiveZoomStates.get(camera);
  let baseHomeRadius = initialZoomState?.landscapeBoostApplied
    ? home.radius / MOBILE_LANDSCAPE_AUTO_ZOOM_FACTOR
    : home.radius;
  const skipLandscapeZoom = Boolean(camera.metadata?.skipLandscapeAutoZoom);
  const responsiveHome = (): MissionCameraHome => ({
    ...home,
    radius:
      !skipLandscapeZoom && isMobileGameLayout() && isLandscapeLayout()
        ? baseHomeRadius * MOBILE_LANDSCAPE_AUTO_ZOOM_FACTOR
        : baseHomeRadius,
    target: home.target.clone(),
  });

  return {
    getHome: responsiveHome,
    setHome: (next) => {
      home.alpha = next.alpha;
      home.beta = next.beta;
      home.radius = next.radius;
      home.target.copyFrom(next.target);
      baseHomeRadius = next.radius;
    },
    recenter: () => animateCameraTo(camera, responsiveHome()),
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
  configureMissionCamera(camera);
  const home = captureCameraHome(camera);
  return createMissionCameraApi(camera, home, pivot, meshes);
}
