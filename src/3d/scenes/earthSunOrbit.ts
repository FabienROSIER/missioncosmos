import {
  Color3,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  TransformNode,
  Vector3,
  type ArcRotateCamera,
  type Observer,
  type PointerInfo,
  type Scene,
} from '@babylonjs/core';
import { isSingleFingerOrLeftDrag } from '@/3d/controls/singlePointerDrag';

export const EARTH_SUN_ORBIT_RADIUS = 5.2;
/** ~¾ de tour : assez pour comprendre sans forcer un tour complet. */
export const EARTH_SUN_ORBIT_SUCCESS_RAD = Math.PI * 1.5;

export type EarthSunOrbitDragHandle = {
  setEnabled: (enabled: boolean) => void;
  getAccumulatedAbs: () => number;
  resetAccumulated: () => void;
  dispose: () => void;
};

/**
 * Glisser horizontalement fait avancer la Terre sur son orbite autour du Soleil.
 * Caméra figée (zoom OK via molette / pinch Babylon).
 */
export function attachEarthSunOrbitDrag(
  scene: Scene,
  camera: ArcRotateCamera,
  onAngleDelta: (deltaRad: number) => void,
): EarthSunOrbitDragHandle {
  let enabled = true;
  let dragging = false;
  let lastX = 0;
  let accumulatedAbs = 0;
  const activePointers = new Set<number>();
  const savedAngularX = camera.angularSensibilityX;
  const savedAngularY = camera.angularSensibilityY;

  const observer: Observer<PointerInfo> = scene.onPointerObservable.add((info) => {
    if (!enabled) return;
    const evt = info.event as PointerEvent;

    if (info.type === PointerEventTypes.POINTERDOWN) {
      activePointers.add(evt.pointerId);
      if (!isSingleFingerOrLeftDrag(evt, activePointers.size)) {
        dragging = false;
        camera.angularSensibilityX = savedAngularX;
        camera.angularSensibilityY = savedAngularY;
        return;
      }
      dragging = true;
      lastX = evt.clientX;
      camera.angularSensibilityX = 100000;
      camera.angularSensibilityY = 100000;
    } else if (
      info.type === PointerEventTypes.POINTERUP ||
      info.type === PointerEventTypes.POINTERDOUBLETAP
    ) {
      activePointers.delete(evt.pointerId);
      dragging = false;
      camera.angularSensibilityX = savedAngularX;
      camera.angularSensibilityY = savedAngularY;
    } else if (info.type === PointerEventTypes.POINTERMOVE && dragging) {
      if (activePointers.size > 1) return;
      const dx = evt.clientX - lastX;
      lastX = evt.clientX;
      // Sens naturel : glisser à gauche → la Terre part vers la gauche
      const delta = -dx * 0.012;
      accumulatedAbs += Math.abs(delta);
      onAngleDelta(delta);
    }
  });

  return {
    setEnabled: (next) => {
      enabled = next;
      if (!next && dragging) {
        dragging = false;
        activePointers.clear();
        camera.angularSensibilityX = savedAngularX;
        camera.angularSensibilityY = savedAngularY;
      }
    },
    getAccumulatedAbs: () => accumulatedAbs,
    resetAccumulated: () => {
      accumulatedAbs = 0;
    },
    dispose: () => {
      scene.onPointerObservable.remove(observer);
      camera.angularSensibilityX = savedAngularX;
      camera.angularSensibilityY = savedAngularY;
    },
  };
}

export type EarthSunOrbitGuideHandle = {
  setVisible: (visible: boolean) => void;
  syncCenter: (worldPos: Vector3) => void;
  dispose: () => void;
};

/** Anneau d’orbite discret autour du Soleil (plan XZ). */
export function createEarthSunOrbitGuide(
  scene: Scene,
  radius: number = EARTH_SUN_ORBIT_RADIUS,
): EarthSunOrbitGuideHandle {
  const root = new TransformNode('earth-sun-orbit-root', scene);

  const torus = MeshBuilder.CreateTorus(
    'earth-sun-orbit-guide',
    { diameter: radius * 2, thickness: radius * 0.012, tessellation: 80 },
    scene,
  );
  torus.parent = root;
  torus.isPickable = false;
  torus.renderingGroupId = 1;

  const mat = new StandardMaterial('earth-sun-orbit-mat', scene);
  mat.disableLighting = true;
  mat.emissiveColor = new Color3(1, 0.82, 0.35);
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.alpha = 0.5;
  mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  torus.material = mat;

  root.setEnabled(false);

  return {
    setVisible: (visible) => root.setEnabled(visible),
    syncCenter: (worldPos) => {
      root.position.copyFrom(worldPos);
    },
    dispose: () => {
      torus.dispose();
      mat.dispose();
      root.dispose();
    },
  };
}

/** Vue pédagogique : Soleil + orbite + Terre lisibles ensemble. */
export function frameEarthSunOrbitOverview(
  camera: ArcRotateCamera,
  sunPos: Vector3,
  orbitRadius: number,
): void {
  camera.setTarget(sunPos.clone());
  camera.alpha = Math.PI * 0.35;
  camera.beta = 1.05;
  camera.radius = Math.max(orbitRadius * 2.35, 11);
  camera.lowerRadiusLimit = orbitRadius * 1.6;
  camera.upperRadiusLimit = orbitRadius * 4.2;
  camera.minZ = 0.1;
}

export function placeOnOrbit(angleRad: number, radius: number, out: Vector3): void {
  out.set(Math.cos(angleRad) * radius, 0, Math.sin(angleRad) * radius);
}
