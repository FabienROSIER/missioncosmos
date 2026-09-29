import {
  Color3,
  Color4,
  Engine,
  FreeCamera,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  StandardMaterial,
  Texture,
  Viewport,
  type AbstractMesh,
  type ArcRotateCamera,
  type BaseTexture,
  type Observer,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import type { HouseMarkerHandle, PipSkyPhase } from '@/3d/scenes/dayNightMarkers';

/** Calque réservé à la vue principale (compagnon / repère invisible dans le PiP). */
export const HOUSE_MESH_LAYER = 0x20000000;
/** Terre GLB : vue principale seulement (évite l’horizon facetté dans le PiP). */
export const EARTH_MAIN_LAYER = 0x10000000;
/** Ciel + sol / coque lisse visibles uniquement dans la vue PiP. */
export const PIP_LOCAL_LAYER = 0x40000000;
export const MAIN_CAMERA_LAYER = 0x0fffffff | HOUSE_MESH_LAYER | EARTH_MAIN_LAYER;
export const PIP_CAMERA_LAYER = 0x0fffffff | PIP_LOCAL_LAYER;

export type HouseViewPipHandle = {
  dispose: () => void;
};

type AttachHouseViewPipOptions = {
  scene: Scene;
  mainCamera: ArcRotateCamera;
  house: HouseMarkerHandle;
  earthPivot: TransformNode;
  earthRadius: number;
  earthMeshes: AbstractMesh[];
  frameEl: HTMLElement;
  canvasEl: HTMLElement;
  onLightingChange?: (phase: PipSkyPhase) => void;
};

function findEarthAlbedo(meshes: AbstractMesh[]): BaseTexture | null {
  for (const mesh of meshes) {
    const mat = mesh.material;
    if (!mat) continue;
    if (mat instanceof StandardMaterial && mat.diffuseTexture) return mat.diffuseTexture;
    if (mat instanceof PBRMaterial && mat.albedoTexture) return mat.albedoTexture;
  }
  return null;
}

/** Ciel PiP selon score d’éclairement (fluide : jour → orangé → nuit). */
export function samplePipSky(score: number): { color: Color3; alpha: number; clear: Color4 } {
  const day = new Color3(0.4, 0.7, 0.98);
  const daySoft = new Color3(0.55, 0.74, 0.95);
  const golden = new Color3(1.0, 0.52, 0.22);
  const dusk = new Color3(0.72, 0.26, 0.42);
  const night = new Color3(0.02, 0.03, 0.06);

  let color: Color3;
  let alpha: number;

  if (score >= 0.35) {
    color = day;
    alpha = 1;
  } else if (score >= 0.12) {
    const t = (score - 0.12) / 0.23;
    color = Color3.Lerp(daySoft, day, t);
    alpha = 1;
  } else if (score >= 0) {
    const t = score / 0.12;
    color = Color3.Lerp(golden, daySoft, t);
    alpha = 1;
  } else if (score >= -0.12) {
    const t = (score + 0.12) / 0.12;
    color = Color3.Lerp(dusk, golden, t);
    alpha = 0.92 + 0.08 * t;
  } else if (score >= -0.35) {
    const t = (score + 0.35) / 0.23;
    color = Color3.Lerp(night, dusk, t);
    alpha = 0.12 + 0.8 * t;
  } else {
    color = night;
    alpha = Math.max(0, Math.min(0.12, (score + 0.55) / 0.2) * 0.12);
  }

  return {
    color,
    alpha,
    clear: new Color4(color.r, color.g, color.b, 1),
  };
}

/** Luminosité du sol (évite le blanc cramé). */
function groundBrightness(score: number): number {
  if (score > 0.25) return 0.62;
  if (score > 0.05) return 0.48 + ((score - 0.05) / 0.2) * 0.14;
  if (score > -0.12) return 0.36 + ((score + 0.12) / 0.17) * 0.12;
  if (score > -0.35) return 0.18 + ((score + 0.35) / 0.23) * 0.18;
  return 0.1;
}

/**
 * Deuxième caméra : point de vue du Guide sur Terre, rendu dans un coin du canvas.
 */
export function attachHouseViewPip({
  scene,
  mainCamera,
  house,
  earthPivot,
  earthRadius,
  earthMeshes,
  frameEl,
  canvasEl,
  onLightingChange,
}: AttachHouseViewPipOptions): HouseViewPipHandle {
  house.setLayerMask(HOUSE_MESH_LAYER);
  mainCamera.layerMask = MAIN_CAMERA_LAYER;

  // Masquer la Terre GLB + atmosphère facettée dans le PiP uniquement
  const earthLayerBackup: { mesh: AbstractMesh; mask: number }[] = [];
  const hideFromPip = (mesh: AbstractMesh) => {
    earthLayerBackup.push({ mesh, mask: mesh.layerMask });
    mesh.layerMask = EARTH_MAIN_LAYER;
  };
  for (const mesh of earthMeshes) hideFromPip(mesh);
  for (const child of earthPivot.getChildMeshes()) {
    if (child.name.includes('atmosphere')) hideFromPip(child);
  }

  const pose = house.getViewPose();
  const pipCam = new FreeCamera('house-view-pip', pose.eye.clone(), scene);
  pipCam.setTarget(pose.target);
  pipCam.upVector.copyFrom(pose.up);
  pipCam.minZ = 0.005;
  pipCam.maxZ = 2000;
  pipCam.fov = 1.35;
  pipCam.layerMask = PIP_CAMERA_LAYER;
  pipCam.viewport = new Viewport(0.02, 0.55, 0.3, 0.22);

  // Ciel local (PiP)
  const sky = MeshBuilder.CreateSphere(
    'pip-sky',
    { diameter: 90, segments: 20, sideOrientation: Mesh.BACKSIDE },
    scene,
  );
  sky.infiniteDistance = true;
  sky.isPickable = false;
  sky.applyFog = false;
  sky.layerMask = PIP_LOCAL_LAYER;
  sky.renderingGroupId = 0;

  const skyMat = new StandardMaterial('pip-sky-mat', scene);
  skyMat.disableLighting = true;
  skyMat.diffuseColor = Color3.Black();
  skyMat.specularColor = Color3.Black();
  skyMat.emissiveColor = new Color3(0.4, 0.7, 0.98);
  skyMat.alpha = 1;
  skyMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  skyMat.disableDepthWrite = true;
  skyMat.backFaceCulling = false;
  sky.material = skyMat;

  // Coque Terre lisse (PiP) : remplace le GLB facetté pour un horizon rond
  const horizon = MeshBuilder.CreateSphere(
    'pip-smooth-horizon',
    { diameter: earthRadius * 2.04, segments: 96 },
    scene,
  );
  horizon.parent = earthPivot;
  horizon.layerMask = PIP_LOCAL_LAYER;
  horizon.isPickable = false;
  horizon.applyFog = false;
  horizon.renderingGroupId = 0;
  horizon.alwaysSelectAsActiveMesh = true;

  const horizonMat = new StandardMaterial('pip-smooth-horizon-mat', scene);
  horizonMat.disableLighting = true;
  horizonMat.diffuseColor = Color3.Black();
  horizonMat.specularColor = Color3.Black();
  horizonMat.emissiveColor = new Color3(0.28, 0.48, 0.32);

  const albedo = findEarthAlbedo(earthMeshes);
  let groundTex: Texture | null = null;
  if (albedo instanceof Texture) {
    groundTex = albedo.clone();
    groundTex.name = 'pip-horizon-albedo';
    horizonMat.emissiveTexture = groundTex;
  } else if (albedo) {
    horizonMat.emissiveTexture = albedo;
  }
  horizon.material = horizonMat;

  // Brume d’atmosphère (PiP)
  const haze = MeshBuilder.CreateSphere(
    'pip-atmo-haze',
    { diameter: 28, segments: 16, sideOrientation: Mesh.BACKSIDE },
    scene,
  );
  haze.infiniteDistance = true;
  haze.isPickable = false;
  haze.applyFog = false;
  haze.layerMask = PIP_LOCAL_LAYER;
  haze.renderingGroupId = 0;

  const hazeMat = new StandardMaterial('pip-atmo-haze-mat', scene);
  hazeMat.disableLighting = true;
  hazeMat.diffuseColor = Color3.Black();
  hazeMat.specularColor = Color3.Black();
  hazeMat.emissiveColor = new Color3(0.45, 0.65, 0.95);
  hazeMat.alpha = 0.28;
  hazeMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  hazeMat.disableDepthWrite = true;
  hazeMat.backFaceCulling = false;
  haze.material = hazeMat;

  scene.activeCameras = [mainCamera, pipCam];
  scene.cameraToUseForPointers = mainCamera;

  const pipClear = new Color4(0.4, 0.7, 0.98, 1);

  const updatePipAtmosphere = () => {
    const score = house.getLightingScore();
    const skySample = samplePipSky(score);
    skyMat.emissiveColor.copyFrom(skySample.color);
    skyMat.alpha = skySample.alpha;
    pipClear.copyFrom(skySample.clear);

    hazeMat.emissiveColor.set(
      Math.min(1, skySample.color.r * 1.05 + 0.08),
      Math.min(1, skySample.color.g * 0.95 + 0.12),
      Math.min(1, skySample.color.b * 0.9 + 0.05),
    );
    hazeMat.alpha = 0.12 + skySample.alpha * 0.22;

    const b = groundBrightness(score);
    horizonMat.emissiveColor.set(b * 0.42, b * 0.72, b * 0.4);
  };

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

  let lastPhase: PipSkyPhase | null = null;

  const syncPose = () => {
    const next = house.getViewPose();
    pipCam.position.copyFrom(next.eye);
    pipCam.setTarget(next.target);
    pipCam.upVector.copyFrom(next.up);
    updatePipAtmosphere();

    const phase = house.getPipSkyPhase();
    if (phase !== lastPhase) {
      lastPhase = phase;
      onLightingChange?.(phase);
    }
  };

  const syncViewport = () => {
    const canvasRect = canvasEl.getBoundingClientRect();
    const frameRect = frameEl.getBoundingClientRect();
    if (canvasRect.width < 1 || canvasRect.height < 1) return;
    if (frameRect.width < 1 || frameRect.height < 1) return;

    const x = (frameRect.left - canvasRect.left) / canvasRect.width;
    const y = (canvasRect.bottom - frameRect.bottom) / canvasRect.height;
    const w = frameRect.width / canvasRect.width;
    const h = frameRect.height / canvasRect.height;
    pipCam.viewport.x = Math.max(0, Math.min(1, x));
    pipCam.viewport.y = Math.max(0, Math.min(1, y));
    pipCam.viewport.width = Math.max(0.05, Math.min(1 - pipCam.viewport.x, w));
    pipCam.viewport.height = Math.max(0.05, Math.min(1 - pipCam.viewport.y, h));
  };

  const renderObs: Observer<Scene> = scene.onBeforeRenderObservable.add(() => {
    syncPose();
  });

  syncViewport();
  syncPose();
  onLightingChange?.(house.getPipSkyPhase());

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
      for (const entry of earthLayerBackup) {
        entry.mesh.layerMask = entry.mask;
      }
      sky.dispose();
      skyMat.dispose();
      haze.dispose();
      hazeMat.dispose();
      horizonMat.emissiveTexture = null;
      horizon.dispose();
      horizonMat.dispose();
      groundTex?.dispose();
      pipCam.dispose();
    },
  };
}
