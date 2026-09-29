import {
  Color3,
  Color4,
  Engine,
  FreeCamera,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  Viewport,
  type AbstractMesh,
  type ArcRotateCamera,
  type Observer,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import {
  EARTH_MAIN_LAYER,
  MAIN_CAMERA_LAYER,
  PIP_CAMERA_LAYER,
  PIP_LOCAL_LAYER,
} from '@/3d/scenes/houseViewPip';
import {
  captureViewport,
  restoreViewport,
  syncPipViewportLayout,
} from '@/3d/scenes/pipViewportLayout';
import type { MoonPhaseId } from '@/3d/utils/moonPhase';
import { elongationBetween, phaseFromElongation } from '@/3d/utils/moonPhase';

export type MoonEarthPipHandle = {
  dispose: () => void;
};

type AttachMoonEarthPipOptions = {
  scene: Scene;
  mainCamera: ArcRotateCamera;
  earthPivot: TransformNode;
  moonPivot: TransformNode;
  sunPivot: TransformNode;
  earthRadius: number;
  /** Masquer ces meshes dans le PiP (Terre GLB trop proche). */
  earthMeshes: AbstractMesh[];
  frameEl: HTMLElement;
  canvasEl: HTMLElement;
  onPhaseChange?: (phase: MoonPhaseId) => void;
};

/**
 * Deuxième caméra : point de vue depuis la Terre vers la Lune
 * (même pattern viewport HTML que Mission 02 / houseViewPip).
 * L’éclairage Soleil → Lune montre la phase en temps réel.
 */
export function attachMoonEarthPip({
  scene,
  mainCamera,
  earthPivot,
  moonPivot,
  sunPivot,
  earthRadius,
  earthMeshes,
  frameEl,
  canvasEl,
  onPhaseChange,
}: AttachMoonEarthPipOptions): MoonEarthPipHandle {
  mainCamera.layerMask = MAIN_CAMERA_LAYER;

  const earthLayerBackup: { mesh: AbstractMesh; mask: number }[] = [];
  const hideFromPip = (mesh: AbstractMesh) => {
    earthLayerBackup.push({ mesh, mask: mesh.layerMask });
    mesh.layerMask = EARTH_MAIN_LAYER;
  };
  for (const mesh of earthMeshes) hideFromPip(mesh);
  for (const child of earthPivot.getChildMeshes()) {
    if (child.name.includes('atmosphere') || child.name.includes('orbit')) {
      hideFromPip(child);
    }
  }

  const pipCam = new FreeCamera('moon-earth-pip', Vector3.Zero(), scene);
  pipCam.minZ = 0.02;
  pipCam.maxZ = 2000;
  pipCam.fov = 0.55;
  pipCam.layerMask = PIP_CAMERA_LAYER;
  pipCam.viewport = new Viewport(0.02, 0.55, 0.3, 0.22);
  const defaultMainViewport = captureViewport(mainCamera);

  // Ciel nocturne local (PiP) — fond sombre pour lire la phase
  const sky = MeshBuilder.CreateSphere(
    'moon-pip-sky',
    { diameter: 120, segments: 16, sideOrientation: Mesh.BACKSIDE },
    scene,
  );
  sky.infiniteDistance = true;
  sky.isPickable = false;
  sky.applyFog = false;
  sky.layerMask = PIP_LOCAL_LAYER;

  const skyMat = new StandardMaterial('moon-pip-sky-mat', scene);
  skyMat.disableLighting = true;
  skyMat.diffuseColor = Color3.Black();
  skyMat.specularColor = Color3.Black();
  skyMat.emissiveColor = new Color3(0.02, 0.03, 0.06);
  sky.material = skyMat;

  scene.activeCameras = [mainCamera, pipCam];
  scene.cameraToUseForPointers = mainCamera;

  const pipClear = new Color4(0.02, 0.03, 0.06, 1);
  let lastPhase: MoonPhaseId | null = null;

  const beforeCamObs = scene.onBeforeCameraRenderObservable.add((cam) => {
    if (cam === mainCamera) {
      scene.autoClear = true;
      scene.autoClearDepthAndStencil = true;
      return;
    }
    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;
    const engine = scene.getEngine();
    if (!(engine instanceof Engine)) return;
    const global = cam.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
    engine.scissorClear(global.x, global.y, global.width, global.height, pipClear);
  });

  const syncPose = () => {
    const earth = earthPivot.getAbsolutePosition();
    const moon = moonPivot.getAbsolutePosition();
    const toMoon = moon.subtract(earth);
    const dist = toMoon.length();
    if (dist < 1e-4) return;
    toMoon.scaleInPlace(1 / dist);

    // Juste au-dessus de la surface, regard vers la Lune
    const eye = earth.add(toMoon.scale(earthRadius * 1.06));
    pipCam.position.copyFrom(eye);
    pipCam.setTarget(moon);
    pipCam.upVector.copyFrom(Vector3.Up());

    // FOV pour cadrer la Lune bien lisible dans le PiP
    const moonApproxR = 0.32;
    const viewDist = Vector3.Distance(eye, moon);
    pipCam.fov = Math.min(0.95, Math.max(0.22, (moonApproxR * 2.15) / Math.max(viewDist, 0.5)));

    const sun = sunPivot.getAbsolutePosition();
    const elong = elongationBetween(
      { x: sun.x - earth.x, y: sun.y - earth.y, z: sun.z - earth.z },
      { x: moon.x - earth.x, y: moon.y - earth.y, z: moon.z - earth.z },
    );
    const phase = phaseFromElongation(elong);
    if (phase !== lastPhase) {
      lastPhase = phase;
      onPhaseChange?.(phase);
    }
  };

  const syncViewport = () => {
    syncPipViewportLayout(mainCamera, pipCam, frameEl, canvasEl, defaultMainViewport);
  };

  const renderObs: Observer<Scene> = scene.onBeforeRenderObservable.add(() => {
    syncPose();
  });

  syncViewport();
  syncPose();
  if (lastPhase) onPhaseChange?.(lastPhase);

  const ro = new ResizeObserver(() => syncViewport());
  ro.observe(canvasEl);
  ro.observe(frameEl);
  window.addEventListener('resize', syncViewport);
  window.addEventListener('orientationchange', syncViewport);

  return {
    dispose: () => {
      ro.disconnect();
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      scene.onBeforeRenderObservable.remove(renderObs);
      scene.onBeforeCameraRenderObservable.remove(beforeCamObs);
      scene.activeCameras = null;
      scene.autoClear = true;
      scene.autoClearDepthAndStencil = true;
      scene.cameraToUseForPointers = null;
      mainCamera.layerMask = 0x0fffffff;
      restoreViewport(mainCamera, defaultMainViewport);
      for (const entry of earthLayerBackup) {
        entry.mesh.layerMask = entry.mask;
      }
      sky.dispose();
      skyMat.dispose();
      pipCam.dispose();
    },
  };
}
