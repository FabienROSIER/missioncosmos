import {
  Color3,
  Color4,
  Constants,
  Engine,
  FreeCamera,
  Matrix,
  MeshBuilder,
  Quaternion,
  RenderTargetTexture,
  ShaderMaterial,
  StandardMaterial,
  Vector3,
  Viewport,
  type AbstractMesh,
  type ArcRotateCamera,
  type Observer,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import type { CompanionSurfaceMarkerHandle } from '@/3d/scenes/companionSurfaceMarker';
import {
  EARTH_MAIN_LAYER,
  HOUSE_MESH_LAYER,
  MAIN_CAMERA_LAYER,
  PIP_CAMERA_LAYER,
  PIP_LOCAL_LAYER,
} from '@/3d/scenes/houseViewPip';
import { createPipSkyLayer } from '@/3d/scenes/pipSkyLayer';
import {
  captureViewport,
  restoreViewport,
  syncPipViewportLayout,
} from '@/3d/scenes/pipViewportLayout';
import {
  SEASON_PIP_FOV,
  SEASON_PIP_SUN_FACE_DISTANCE,
  noonPipLookDirection,
  pipSunAngularRadius,
  pipSunDiscRadius,
  pipSunViewCenter,
  sunFaceCameraFov,
} from '@/3d/scenes/seasonNoon';

/** Profondeur du disque dans le plan de vue. Assez loin pour passer derrière le sol. */
const PIP_SUN_DEPTH = 8;
/** Photo carrée du limbe : assez nette pour les taches, légère sur mobile. */
const PIP_SUN_FACE_SIZE = 256;
/**
 * Le disque n’a pas le buffer HDR de la vue 3D. Ce gain aligne la couleur
 * affichée sur celle du modèle, sans modifier le modèle.
 */
const PIP_SUN_MATCH_GAIN = 1.14;

export type SeasonNoonPipHandle = {
  dispose: () => void;
};

type AttachSeasonNoonPipOptions = {
  scene: Scene;
  mainCamera: ArcRotateCamera;
  companion: CompanionSurfaceMarkerHandle;
  earthPivot: TransformNode;
  earthRadius: number;
  earthMeshes: AbstractMesh[];
  /** Anneau, axe, fond étoilé : vue principale seulement. */
  mainOnlyMeshes: AbstractMesh[];
  /** Maillage texturé du Soleil : photo PiP, caché dans la petite vue. */
  sunMeshes: AbstractMesh[];
  sunRadius: number;
  /** Distance de référence (rayon d’orbite) : la taille du disque ne dépend pas de la saison. */
  referenceDistance: number;
  frameEl: HTMLElement;
  canvasEl: HTMLElement;
  sunPosition: () => Vector3;
};

/**
 * PiP depuis la France à midi : ciel large, Soleil et un bout de sol.
 * Le Soleil y est un disque de taille fixe : le grand angle n’étire plus
 * la sphère en été. Sa texture est une photo du vrai Soleil, prise
 * depuis la Terre, donc les taches suivent la face tournée vers nous.
 * Le compagnon reste dans la vue principale.
 */
export function attachSeasonNoonPip({
  scene,
  mainCamera,
  companion,
  earthPivot,
  earthRadius,
  earthMeshes,
  mainOnlyMeshes,
  sunMeshes,
  sunRadius,
  referenceDistance,
  frameEl,
  canvasEl,
  sunPosition,
}: AttachSeasonNoonPipOptions): SeasonNoonPipHandle {
  companion.setLayerMask(HOUSE_MESH_LAYER);
  mainCamera.layerMask = MAIN_CAMERA_LAYER;

  const layerBackup: { mesh: AbstractMesh; mask: number }[] = [];
  const hideFromPip = (mesh: AbstractMesh) => {
    layerBackup.push({ mesh, mask: mesh.layerMask });
    mesh.layerMask = EARTH_MAIN_LAYER;
  };
  for (const mesh of earthMeshes) hideFromPip(mesh);
  for (const mesh of mainOnlyMeshes) hideFromPip(mesh);
  for (const mesh of sunMeshes) hideFromPip(mesh);
  for (const child of earthPivot.getChildMeshes()) {
    if (child.name.includes('atmosphere')) hideFromPip(child);
  }

  const pipCam = new FreeCamera('season-noon-pip', Vector3.Zero(), scene);
  pipCam.minZ = 0.02;
  pipCam.maxZ = 2000;
  pipCam.fov = SEASON_PIP_FOV;
  pipCam.layerMask = PIP_CAMERA_LAYER;
  pipCam.viewport = new Viewport(0.02, 0.55, 0.3, 0.22);
  const defaultMainViewport = captureViewport(mainCamera);

  const skyLayer = createPipSkyLayer(
    scene,
    'season-pip-sky',
    PIP_LOCAL_LAYER,
    new Color3(0.52, 0.8, 1),
  );

  const horizon = MeshBuilder.CreateSphere(
    'season-pip-horizon',
    { diameter: earthRadius * 2.04, segments: 64 },
    scene,
  );
  horizon.parent = earthPivot;
  horizon.layerMask = PIP_LOCAL_LAYER;
  horizon.isPickable = false;
  horizon.applyFog = false;
  horizon.renderingGroupId = 0;
  horizon.alwaysSelectAsActiveMesh = true;

  const horizonMat = new StandardMaterial('season-pip-horizon-mat', scene);
  horizonMat.disableLighting = true;
  horizonMat.diffuseColor = Color3.Black();
  horizonMat.specularColor = Color3.Black();
  horizonMat.emissiveColor = new Color3(0.22, 0.42, 0.28);
  horizon.material = horizonMat;

  // Photo du limbe vu depuis la Terre : la sphère reste au centre, donc ronde.
  const faceCam = new FreeCamera('season-pip-sun-face', Vector3.Zero(), scene);
  faceCam.minZ = 0.05;
  faceCam.maxZ = Math.max(sunRadius * 40, 20);
  faceCam.fov = sunFaceCameraFov();
  faceCam.layerMask = EARTH_MAIN_LAYER;
  faceCam.viewport = new Viewport(0, 0, 1, 1);

  const faceTexture = new RenderTargetTexture('season-pip-sun-face', PIP_SUN_FACE_SIZE, scene, {
    generateMipMaps: false,
    doNotChangeAspectRatio: false,
    generateDepthBuffer: true,
    type: Constants.TEXTURETYPE_HALF_FLOAT,
    gammaSpace: false,
  });
  faceTexture.clearColor = new Color4(0, 0, 0, 1);
  faceTexture.activeCamera = faceCam;
  faceTexture.renderList = sunMeshes;
  scene.customRenderTargets.push(faceTexture);

  const sunDisc = MeshBuilder.CreateDisc(
    'season-pip-sun-disc',
    { radius: 1, tessellation: 48 },
    scene,
  );
  sunDisc.layerMask = PIP_LOCAL_LAYER;
  sunDisc.isPickable = false;
  sunDisc.applyFog = false;
  sunDisc.alwaysSelectAsActiveMesh = true;
  sunDisc.renderingGroupId = 0;
  // Même formule que le post-traitement de la vue 3D (exposition, gamma, contraste).
  const sunDiscMat = new ShaderMaterial(
    'season-pip-sun-disc-mat',
    scene,
    {
      vertexSource: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 worldViewProjection;
        varying vec2 vUV;
        void main(void) {
          vUV = uv;
          gl_Position = worldViewProjection * vec4(position, 1.0);
        }
      `,
      fragmentSource: `
        precision highp float;
        varying vec2 vUV;
        uniform sampler2D faceSampler;
        uniform float exposure;
        uniform float contrast;
        uniform float matchGain;
        void main(void) {
          vec3 color = texture2D(faceSampler, vUV).rgb * exposure;
          color = pow(max(color, vec3(0.0)), vec3(1.0 / 2.2));
          vec3 highContrast = color * color * (3.0 - 2.0 * color);
          if (contrast < 1.0) {
            color = mix(vec3(0.5), color, contrast);
          } else {
            color = mix(color, highContrast, contrast - 1.0);
          }
          color *= matchGain;
          gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
        }
      `,
    },
    {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection', 'exposure', 'contrast', 'matchGain'],
      samplers: ['faceSampler'],
    },
  );
  sunDiscMat.setTexture('faceSampler', faceTexture);
  const grade = scene.imageProcessingConfiguration;
  sunDiscMat.setFloat('exposure', grade.exposure);
  sunDiscMat.setFloat('contrast', grade.contrast);
  sunDiscMat.setFloat('matchGain', PIP_SUN_MATCH_GAIN);
  sunDiscMat.backFaceCulling = false;
  sunDisc.material = sunDiscMat;

  const discRotation = new Matrix();
  const discQuaternion = new Quaternion();

  scene.activeCameras = [mainCamera, pipCam];
  scene.cameraToUseForPointers = mainCamera;

  const pipClear = new Color4(0.52, 0.8, 1, 1);
  const beforeCamObs = scene.onBeforeCameraRenderObservable.add((cam) => {
    if (cam === mainCamera || cam === faceCam) {
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
    earthPivot.computeWorldMatrix(true);
    const center = earthPivot.getAbsolutePosition();
    const feet = Vector3.TransformCoordinates(companion.getLocalPosition(), earthPivot.getWorldMatrix());
    const outward = feet.subtract(center);
    if (outward.lengthSquared() < 1e-8) return;
    outward.normalize();
    const sun = sunPosition();
    const toSun = sun.subtract(feet);
    const look = noonPipLookDirection(outward, toSun);
    const eye = feet.add(outward.scale(earthRadius * 0.16));
    pipCam.position.copyFrom(eye);
    pipCam.setTarget(eye.add(look.scale(8)));
    pipCam.upVector.copyFrom(outward);
    pipCam.fov = SEASON_PIP_FOV;

    const sunCenter = sun;
    const towardEarth = eye.subtract(sunCenter);
    if (towardEarth.lengthSquared() > 1e-8) {
      towardEarth.normalize();
      faceCam.position.copyFrom(sunCenter).addInPlace(towardEarth.scale(sunRadius * SEASON_PIP_SUN_FACE_DISTANCE));
      faceCam.setTarget(sunCenter);
      faceCam.upVector.copyFrom(Vector3.Up());
      faceCam.fov = sunFaceCameraFov();
    }

    const centerOffset = pipSunViewCenter(look, toSun, PIP_SUN_DEPTH);
    if (!centerOffset) {
      sunDisc.setEnabled(false);
    } else {
      sunDisc.setEnabled(true);
      sunDisc.position.copyFrom(eye).addInPlace(centerOffset);
      const right = Vector3.Cross(outward, look);
      if (right.lengthSquared() > 1e-8) {
        right.normalize();
        const camUp = Vector3.Cross(look, right).normalize();
        Matrix.FromXYZAxesToRef(right, camUp, look, discRotation);
        Quaternion.FromRotationMatrixToRef(discRotation, discQuaternion);
        sunDisc.rotationQuaternion = discQuaternion;
      }
      const discRadius = pipSunDiscRadius(PIP_SUN_DEPTH, pipSunAngularRadius(sunRadius, referenceDistance));
      sunDisc.scaling.set(discRadius, discRadius, 1);
    }

    const imageGrade = scene.imageProcessingConfiguration;
    sunDiscMat.setFloat('exposure', imageGrade.exposure);
    sunDiscMat.setFloat('contrast', imageGrade.contrast);
    companion.updateOcclusion(mainCamera.position);
  };

  const syncViewport = () => {
    syncPipViewportLayout(mainCamera, pipCam, frameEl, canvasEl, defaultMainViewport);
  };

  const renderObs: Observer<Scene> = scene.onBeforeRenderObservable.add(() => {
    syncPose();
  });

  syncViewport();
  syncPose();

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
      for (const entry of layerBackup) entry.mesh.layerMask = entry.mask;
      skyLayer.dispose();
      horizon.dispose();
      horizonMat.dispose();
      sunDisc.dispose();
      sunDiscMat.dispose();
      faceTexture.dispose();
      faceCam.dispose();
      pipCam.dispose();
    },
  };
}
