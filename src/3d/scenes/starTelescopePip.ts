import {
  Color3,
  Color4,
  Engine,
  FreeCamera,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
  Viewport,
  type ArcRotateCamera,
  type LinesMesh,
  type Scene,
} from '@babylonjs/core';
import { MAIN_CAMERA_LAYER, PIP_LOCAL_LAYER } from '@/3d/scenes/houseViewPip';
import {
  captureViewport,
  restoreViewport,
  syncPipViewportLayout,
} from '@/3d/scenes/pipViewportLayout';
import {
  PHOTO_DISTANCE_MAX,
  PHOTO_DISTANCE_MIN,
  STARS,
  comparisonVisualRadius,
  type StarId,
} from '@/content/bodies/stars';

export type StarTelescopePipHandle = {
  setState: (starId: StarId, distance: number) => void;
  setVisible: (visible: boolean) => void;
  dispose: () => void;
};

type AttachStarTelescopePipOptions = {
  scene: Scene;
  mainCamera: ArcRotateCamera;
  frameEl: HTMLElement;
  canvasEl: HTMLElement;
};

const STAR_X = -3.6;
const TELESCOPE_NEAR_X = -1.8;
const TELESCOPE_FAR_X = 3.2;

/** PiP de profil : étoile à gauche, télescope mobile sur un rail à droite. */
export function attachStarTelescopePip({
  scene,
  mainCamera,
  frameEl,
  canvasEl,
}: AttachStarTelescopePipOptions): StarTelescopePipHandle {
  mainCamera.layerMask = MAIN_CAMERA_LAYER;
  const defaultMainViewport = captureViewport(mainCamera);

  const pipCamera = new FreeCamera('stars-profile-pip', new Vector3(0, 2.8, -12), scene);
  pipCamera.setTarget(new Vector3(0, -0.15, 0));
  pipCamera.fov = 0.62;
  pipCamera.minZ = 0.02;
  pipCamera.maxZ = 100;
  pipCamera.layerMask = PIP_LOCAL_LAYER;
  pipCamera.viewport = new Viewport(0, 0, 0.01, 0.01);

  const localRoot = new TransformNode('stars-profile-pip-root', scene);

  const star = MeshBuilder.CreateSphere(
    'stars-profile-pip-star',
    { diameter: 2, segments: 20 },
    scene,
  );
  star.parent = localRoot;
  star.position.set(STAR_X, 0, 0);
  star.layerMask = PIP_LOCAL_LAYER;
  star.isPickable = false;
  const starMaterial = new StandardMaterial('stars-profile-pip-star-mat', scene);
  starMaterial.disableLighting = true;
  starMaterial.diffuseColor = Color3.Black();
  starMaterial.specularColor = Color3.Black();
  star.material = starMaterial;

  const rail = MeshBuilder.CreateLines(
    'stars-profile-pip-rail',
    {
      points: [
        new Vector3(TELESCOPE_NEAR_X - 0.25, -1.45, 0),
        new Vector3(TELESCOPE_FAR_X + 0.25, -1.45, 0),
      ],
    },
    scene,
  );
  rail.parent = localRoot;
  rail.color = new Color3(0.35, 0.75, 0.85);
  rail.alpha = 0.75;
  rail.layerMask = PIP_LOCAL_LAYER;
  rail.isPickable = false;

  const telescope = new TransformNode('stars-profile-pip-telescope', scene);
  telescope.parent = localRoot;

  const tube = MeshBuilder.CreateCylinder(
    'stars-profile-pip-tube',
    { height: 1.15, diameterTop: 0.42, diameterBottom: 0.3, tessellation: 14 },
    scene,
  );
  tube.parent = telescope;
  tube.rotation.z = Math.PI / 2;
  tube.position.y = -0.52;
  tube.layerMask = PIP_LOCAL_LAYER;
  tube.isPickable = false;

  const telescopeMaterial = new StandardMaterial('stars-profile-pip-telescope-mat', scene);
  telescopeMaterial.disableLighting = true;
  telescopeMaterial.emissiveColor = new Color3(0.32, 0.82, 0.9);
  telescopeMaterial.diffuseColor = Color3.Black();
  tube.material = telescopeMaterial;

  const lens = MeshBuilder.CreateCylinder(
    'stars-profile-pip-lens',
    { height: 0.08, diameter: 0.5, tessellation: 14 },
    scene,
  );
  lens.parent = telescope;
  lens.rotation.z = Math.PI / 2;
  lens.position.set(-0.61, -0.52, 0);
  lens.layerMask = PIP_LOCAL_LAYER;
  lens.isPickable = false;
  const lensMaterial = new StandardMaterial('stars-profile-pip-lens-mat', scene);
  lensMaterial.disableLighting = true;
  lensMaterial.emissiveColor = new Color3(1, 0.78, 0.22);
  lensMaterial.diffuseColor = Color3.Black();
  lens.material = lensMaterial;

  const stand = MeshBuilder.CreateLines(
    'stars-profile-pip-stand',
    {
      points: [
        new Vector3(0, -0.7, 0),
        new Vector3(0, -1.4, 0),
        new Vector3(-0.42, -1.45, 0),
        new Vector3(0, -1.4, 0),
        new Vector3(0.42, -1.45, 0),
      ],
    },
    scene,
  );
  stand.parent = telescope;
  stand.color = new Color3(0.75, 0.82, 0.9);
  stand.layerMask = PIP_LOCAL_LAYER;
  stand.isPickable = false;

  let distanceLine: LinesMesh | null = null;
  let visible = false;

  const updateDistanceLine = (telescopeX: number) => {
    distanceLine = MeshBuilder.CreateLines(
      'stars-profile-pip-distance',
      {
        points: [new Vector3(STAR_X + 0.55, -0.05, 0), new Vector3(telescopeX - 0.72, -0.05, 0)],
        instance: distanceLine ?? undefined,
      },
      scene,
    );
    distanceLine.parent = localRoot;
    distanceLine.color = new Color3(1, 0.78, 0.22);
    distanceLine.alpha = 0.7;
    distanceLine.layerMask = PIP_LOCAL_LAYER;
    distanceLine.isPickable = false;
  };

  const syncViewport = () => {
    if (!visible) {
      restoreViewport(mainCamera, defaultMainViewport);
      pipCamera.viewport = new Viewport(0, 0, 0.01, 0.01);
      return;
    }
    syncPipViewportLayout(mainCamera, pipCamera, frameEl, canvasEl, defaultMainViewport);
  };

  const beforeCameraObserver = scene.onBeforeCameraRenderObservable.add((camera) => {
    if (camera === mainCamera) {
      scene.autoClear = true;
      scene.autoClearDepthAndStencil = true;
      return;
    }
    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;
    const engine = scene.getEngine();
    if (!(engine instanceof Engine)) return;
    const global = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
    engine.scissorClear(
      global.x,
      global.y,
      global.width,
      global.height,
      new Color4(0.015, 0.025, 0.055, 1),
    );
  });

  scene.activeCameras = [mainCamera, pipCamera];
  scene.cameraToUseForPointers = mainCamera;

  const resizeObserver = new ResizeObserver(syncViewport);
  resizeObserver.observe(canvasEl);
  resizeObserver.observe(frameEl);
  window.addEventListener('resize', syncViewport);
  window.addEventListener('orientationchange', syncViewport);

  const setState = (starId: StarId, distance: number) => {
    const definition = STARS[starId];
    starMaterial.emissiveColor.set(definition.color.r, definition.color.g, definition.color.b);
    const radius = comparisonVisualRadius(definition.radiusSolar);
    star.scaling.setAll(0.45 + ((radius - 0.28) / 1.55) * 0.65);

    const normalized = Math.max(
      0,
      Math.min(1, (distance - PHOTO_DISTANCE_MIN) / (PHOTO_DISTANCE_MAX - PHOTO_DISTANCE_MIN)),
    );
    const telescopeX = TELESCOPE_NEAR_X + normalized * (TELESCOPE_FAR_X - TELESCOPE_NEAR_X);
    telescope.position.x = telescopeX;
    updateDistanceLine(telescopeX);
  };

  return {
    setState,
    setVisible: (nextVisible) => {
      visible = nextVisible;
      window.requestAnimationFrame(syncViewport);
    },
    dispose: () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      scene.onBeforeCameraRenderObservable.remove(beforeCameraObserver);
      scene.activeCameras = null;
      scene.cameraToUseForPointers = null;
      scene.autoClear = true;
      scene.autoClearDepthAndStencil = true;
      restoreViewport(mainCamera, defaultMainViewport);
      mainCamera.layerMask = 0x0fffffff;
      distanceLine?.dispose();
      stand.dispose();
      lens.dispose();
      lensMaterial.dispose();
      tube.dispose();
      telescopeMaterial.dispose();
      telescope.dispose();
      rail.dispose();
      star.dispose();
      starMaterial.dispose();
      localRoot.dispose();
      pipCamera.dispose();
    },
  };
}
