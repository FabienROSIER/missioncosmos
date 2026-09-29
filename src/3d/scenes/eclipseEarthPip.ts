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
  samplePipSky,
} from '@/3d/scenes/houseViewPip';
import { classifyEclipse, type EclipseKind } from '@/3d/utils/eclipseAlignment';

export type EclipseEarthPipHandle = {
  dispose: () => void;
};

type AttachEclipseEarthPipOptions = {
  scene: Scene;
  mainCamera: ArcRotateCamera;
  earthPivot: TransformNode;
  moonPivot: TransformNode;
  sunPivot: TransformNode;
  earthRadius: number;
  /** Rayon visuel Lune (maquette) — le Soleil PiP aura le même diamètre apparent. */
  moonRadius: number;
  earthMeshes: AbstractMesh[];
  /** Masqués dans le PiP : on affiche un Soleil « apparent » à l’échelle. */
  sunMeshes: AbstractMesh[];
  frameEl: HTMLElement;
  canvasEl: HTMLElement;
  onEclipseChange?: (kind: EclipseKind) => void;
};

/**
 * PiP Mission 04 : ciel depuis la Terre.
 * - Regard vers la Lune (ou vers le Soleil si quasi-alignés).
 * - Fond jour→nuit comme Mission 02 (éclairement au point de vue).
 * - Soleil PiP : même distance œil→disque et même rayon que la Lune.
 */
export function attachEclipseEarthPip({
  scene,
  mainCamera,
  earthPivot,
  moonPivot,
  sunPivot,
  earthRadius,
  moonRadius,
  earthMeshes,
  sunMeshes,
  frameEl,
  canvasEl,
  onEclipseChange,
}: AttachEclipseEarthPipOptions): EclipseEarthPipHandle {
  mainCamera.layerMask = MAIN_CAMERA_LAYER;

  const layerBackup: { mesh: AbstractMesh; mask: number }[] = [];
  const hideFromPip = (mesh: AbstractMesh) => {
    layerBackup.push({ mesh, mask: mesh.layerMask });
    mesh.layerMask = EARTH_MAIN_LAYER;
  };
  for (const mesh of earthMeshes) hideFromPip(mesh);
  for (const mesh of sunMeshes) hideFromPip(mesh);
  for (const child of earthPivot.getChildMeshes()) {
    if (child.name.includes('atmosphere') || child.name.includes('orbit')) {
      hideFromPip(child);
    }
  }

  const pipCam = new FreeCamera('eclipse-earth-pip', Vector3.Zero(), scene);
  pipCam.minZ = 0.02;
  pipCam.maxZ = 2000;
  pipCam.fov = 0.55;
  pipCam.layerMask = PIP_CAMERA_LAYER;
  pipCam.viewport = new Viewport(0.02, 0.55, 0.3, 0.22);

  const sky = MeshBuilder.CreateSphere(
    'eclipse-pip-sky',
    { diameter: 140, segments: 16, sideOrientation: Mesh.BACKSIDE },
    scene,
  );
  sky.infiniteDistance = true;
  sky.isPickable = false;
  sky.applyFog = false;
  sky.layerMask = PIP_LOCAL_LAYER;

  const skyMat = new StandardMaterial('eclipse-pip-sky-mat', scene);
  skyMat.disableLighting = true;
  skyMat.diffuseColor = Color3.Black();
  skyMat.specularColor = Color3.Black();
  skyMat.emissiveColor = new Color3(0.4, 0.7, 0.98);
  skyMat.alpha = 1;
  skyMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  skyMat.disableDepthWrite = true;
  skyMat.backFaceCulling = false;
  sky.material = skyMat;

  const pipSun = MeshBuilder.CreateSphere(
    'eclipse-pip-sun',
    { diameter: moonRadius * 2, segments: 24 },
    scene,
  );
  pipSun.isPickable = false;
  pipSun.layerMask = PIP_LOCAL_LAYER;
  pipSun.renderingGroupId = 0;

  const pipSunMat = new StandardMaterial('eclipse-pip-sun-mat', scene);
  pipSunMat.disableLighting = true;
  pipSunMat.diffuseColor = Color3.Black();
  pipSunMat.specularColor = Color3.Black();
  pipSunMat.emissiveColor = new Color3(1, 0.78, 0.28);
  pipSun.material = pipSunMat;

  scene.activeCameras = [mainCamera, pipCam];
  scene.cameraToUseForPointers = mainCamera;

  const pipClear = new Color4(0.4, 0.7, 0.98, 1);
  let lastKind: EclipseKind | null = null;

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
    const sun = sunPivot.getAbsolutePosition();

    const toMoon = moon.subtract(earth);
    const distMoon = toMoon.length();
    if (distMoon < 1e-4) return;
    toMoon.scaleInPlace(1 / distMoon);

    const toSun = sun.subtract(earth);
    if (toSun.lengthSquared() < 1e-8) return;
    toSun.normalize();

    const dot = Math.min(1, Math.max(-1, Vector3.Dot(toMoon, toSun)));
    const elong = Math.acos(dot);
    const sunInView = elong < Math.PI * 0.55;
    /** Quasi-alignés : on cadre sur l’axe Soleil pour que la Lune masque le disque. */
    const nearSolar = elong < 0.35;

    const lookDir = nearSolar || !sunInView ? (nearSolar ? toSun : toMoon) : toMoon;
    const eye = earth.add(lookDir.scale(earthRadius * 1.08));

    pipCam.position.copyFrom(eye);
    pipCam.upVector.copyFrom(Vector3.Up());

    if (nearSolar) {
      pipCam.setTarget(earth.add(toSun.scale(distMoon)));
    } else {
      pipCam.setTarget(moon);
    }

    const focusDist = nearSolar
      ? Vector3.Distance(eye, earth.add(toSun.scale(distMoon)))
      : Vector3.Distance(eye, moon);
    if (focusDist < 1e-4) return;

    pipSun.setEnabled(sunInView);
    if (sunInView) {
      pipSun.position.copyFrom(eye.add(toSun.scale(focusDist * 1.04)));
      pipSun.scaling.setAll(1);
    }

    const moonHalfAngle = Math.atan(moonRadius / focusDist);
    if (nearSolar) {
      pipCam.fov = Math.min(0.55, Math.max(0.28, moonHalfAngle * 4.2));
    } else if (sunInView) {
      const need = Math.max(moonHalfAngle * 5.2, elong + moonHalfAngle * 2.4);
      pipCam.fov = Math.min(1.05, Math.max(0.3, need));
    } else {
      pipCam.fov = Math.min(0.85, Math.max(0.28, moonHalfAngle * 5.5));
    }

    // Jour / crépuscule / nuit au point de vue (même courbe que Mission 02)
    const lightingScore = Vector3.Dot(lookDir, toSun);
    const skySample = samplePipSky(lightingScore);
    // Éclipse solaire : le ciel s’assombrit comme en vrai (Lune devant le Soleil)
    const solarCover = Math.min(1, Math.max(0, (0.28 - elong) / 0.28));
    const nightSky = new Color3(0.02, 0.03, 0.06);
    const skyColor = Color3.Lerp(skySample.color, nightSky, solarCover);
    skyMat.emissiveColor.copyFrom(skyColor);
    skyMat.alpha = Math.max(0.1, skySample.alpha * (1 - 0.9 * solarCover));
    pipClear.r = skyColor.r;
    pipClear.g = skyColor.g;
    pipClear.b = skyColor.b;
    // Soleil PiP un peu moins éclatant sous la couverture
    pipSunMat.emissiveColor.set(
      1 * (1 - 0.35 * solarCover),
      0.78 * (1 - 0.45 * solarCover),
      0.28 * (1 - 0.5 * solarCover),
    );

    const kind = classifyEclipse(earth, sun, moon);
    if (kind !== lastKind) {
      lastKind = kind;
      onEclipseChange?.(kind);
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
  if (lastKind) onEclipseChange?.(lastKind);

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
      for (const entry of layerBackup) {
        entry.mesh.layerMask = entry.mask;
      }
      sky.dispose();
      skyMat.dispose();
      pipSun.dispose();
      pipSunMat.dispose();
      pipCam.dispose();
    },
  };
}
