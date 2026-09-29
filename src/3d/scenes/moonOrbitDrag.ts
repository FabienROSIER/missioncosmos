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
import type { OrbitController } from '@/3d/entities/OrbitController';
import { EARTH_MAIN_LAYER } from '@/3d/scenes/houseViewPip';

export type MoonOrbitDragHandle = {
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
};

/**
 * Glisser horizontalement déplace la Lune sur son orbite (caméra figée).
 * Même idée que attachEarthDragRotation (Mission 02).
 */
export function attachMoonOrbitDrag(
  scene: Scene,
  orbit: OrbitController,
  camera: ArcRotateCamera,
): MoonOrbitDragHandle {
  let enabled = true;
  let dragging = false;
  let lastX = 0;
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
      // Même sens que l’animation ciné (OrbitController.nudgeFromSwipe)
      orbit.nudgeFromSwipe(dx * 0.012);
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
    dispose: () => {
      scene.onPointerObservable.remove(observer);
      camera.angularSensibilityX = savedAngularX;
      camera.angularSensibilityY = savedAngularY;
    },
  };
}

export type OrbitGuideHandle = {
  syncCenter: (worldPos: Vector3) => void;
  setInclination: (radians: number) => void;
  dispose: () => void;
};

/**
 * Anneau d’orbite dans le plan XZ (même plan que OrbitController).
 * CreateTorus Babylon est déjà dans XZ — ne pas basculer avec rotation.x.
 * Racine dédiée : suit la Terre en translation seulement (pas sa rotation).
 */
export function createOrbitGuide(
  scene: Scene,
  radius: number,
  options?: { mainCameraOnly?: boolean },
): OrbitGuideHandle {
  const root = new TransformNode('moon-orbit-root', scene);

  const torus = MeshBuilder.CreateTorus(
    'moon-orbit-guide',
    { diameter: radius * 2, thickness: 0.014, tessellation: 72 },
    scene,
  );
  torus.parent = root;
  torus.isPickable = false;
  torus.renderingGroupId = 1;
  if (options?.mainCameraOnly) {
    torus.layerMask = EARTH_MAIN_LAYER;
  }

  const mat = new StandardMaterial('moon-orbit-mat', scene);
  mat.emissiveColor = new Color3(0.45, 0.65, 0.85);
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.alpha = 0.55;
  mat.disableLighting = true;
  torus.material = mat;

  return {
    syncCenter: (worldPos) => {
      root.position.copyFrom(worldPos);
    },
    setInclination: (radians) => {
      root.rotation.set(radians, 0, 0);
    },
    dispose: () => {
      torus.dispose();
      mat.dispose();
      root.dispose();
    },
  };
}
