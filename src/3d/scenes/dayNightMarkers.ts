import {
  Color3,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  Vector3,
  type ArcRotateCamera,
  type Observer,
  type PointerInfo,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import { MISSION_SUN_DIRECTION } from '@/3d/materials/sceneLighting';

export type SurfaceLighting = 'day' | 'night';

/** Phase ciel pour le badge PiP (avec crépuscule / aube). */
export type PipSkyPhase = 'day' | 'twilight' | 'night';

export type HouseViewPose = {
  eye: Vector3;
  target: Vector3;
  up: Vector3;
};

export type HouseMarkerHandle = {
  setVisible: (visible: boolean) => void;
  getLightingScore: () => number;
  getLighting: () => SurfaceLighting;
  getPipSkyPhase: () => PipSkyPhase;
  /** Position locale sur le pivot Terre (France). */
  getLocalPosition: () => Vector3;
  /** Pose caméra « debout près de la maison, regard vers le ciel ». */
  getViewPose: () => HouseViewPose;
  /** Masque calque (ex. cacher le mesh maison dans la vue PiP). */
  setLayerMask: (mask: number) => void;
  dispose: () => void;
};

/**
 * Coordonnées géographiques → position locale sur la sphère
 * (Y = pôle Nord du modèle, XZ = équateur, lon 0 ≈ +X).
 */
function latLonOnSphere(radius: number, latDeg: number, lonDeg: number): Vector3 {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return new Vector3(
    radius * cosLat * Math.cos(lon),
    radius * Math.sin(lat),
    radius * cosLat * Math.sin(lon),
  );
}

/**
 * Petit repère « maison » collé à la Terre — placé en France (≈ 46,6°N, 2,4°E).
 * Parenté au pivot Terre pour tourner avec elle.
 */
export function createHouseMarker(
  scene: Scene,
  earthPivot: TransformNode,
  earthRadius: number,
): HouseMarkerHandle {
  const root = MeshBuilder.CreateBox(
    'house-marker',
    { width: 0.1, height: 0.1, depth: 0.1 },
    scene,
  );
  root.parent = earthPivot;
  // Centre de la France métropolitaine (maquette texture : Y = Nord, lon 0 ≈ +X)
  const localPos = latLonOnSphere(earthRadius * 1.025, 46.6, 2.4);
  root.position.copyFrom(localPos);
  root.isPickable = false;
  root.metadata = { markerId: 'house' };

  const mat = new StandardMaterial('house-mat', scene);
  mat.diffuseColor = new Color3(0.95, 0.55, 0.2);
  mat.emissiveColor = new Color3(0.35, 0.15, 0.05);
  mat.specularColor = Color3.Black();
  root.material = mat;

  const roof = MeshBuilder.CreateCylinder(
    'house-roof',
    { diameterTop: 0, diameterBottom: 0.16, height: 0.1, tessellation: 4 },
    scene,
  );
  roof.parent = root;
  roof.position.y = 0.1;
  roof.rotation.y = Math.PI / 4;
  roof.isPickable = false;
  const roofMat = new StandardMaterial('house-roof-mat', scene);
  roofMat.diffuseColor = new Color3(0.85, 0.25, 0.2);
  roofMat.emissiveColor = new Color3(0.2, 0.05, 0.04);
  roofMat.specularColor = Color3.Black();
  roof.material = roofMat;

  const sunDir = MISSION_SUN_DIRECTION.clone().normalize();

  /** Position monde via le pivot (fiable même si le mesh maison est désactivé). */
  const houseWorldPos = () =>
    Vector3.TransformCoordinates(localPos, earthPivot.getWorldMatrix());

  const getLightingScore = () => {
    const world = houseWorldPos();
    const center = earthPivot.getAbsolutePosition();
    const outward = world.subtract(center);
    if (outward.lengthSquared() < 1e-8) return 0;
    outward.normalize();
    return Vector3.Dot(outward, sunDir.scale(-1));
  };

  const getViewPose = (): HouseViewPose => {
    const center = earthPivot.getAbsolutePosition();
    const houseWorld = houseWorldPos();
    const outward = houseWorld.subtract(center);
    if (outward.lengthSquared() < 1e-8) {
      return {
        eye: houseWorld.clone(),
        target: houseWorld.add(Vector3.Up()),
        up: new Vector3(0, 0, 1),
      };
    }
    outward.normalize();

    // Direction vers le Soleil (rayons = MISSION_SUN_DIRECTION)
    const toSun = sunDir.scale(-1);

    // Azimut : projection de « vers le Soleil » sur le plan tangent (horizon)
    let towardHorizon = toSun.subtract(outward.scale(Vector3.Dot(toSun, outward)));
    if (towardHorizon.lengthSquared() < 1e-6) {
      towardHorizon = Vector3.Cross(outward, new Vector3(1, 0, 0));
      if (towardHorizon.lengthSquared() < 1e-6) {
        towardHorizon = Vector3.Cross(outward, new Vector3(0, 0, 1));
      }
    }
    towardHorizon.normalize();

    const sunElev = Vector3.Dot(toSun, outward);
    // Blend continu jour ↔ nuit (évite le saut de caméra au crépuscule)
    const dayT = Math.min(1, Math.max(0, (sunElev + 0.18) / 0.42));
    const smooth = dayT * dayT * (3 - 2 * dayT);

    // Jour : viser le Soleil (pas de biais vers le sol → évite Soleil « sous » l’horizon)
    const dayLook = toSun.clone().normalize();
    const nightLook = towardHorizon.scale(0.96).add(outward.scale(0.08)).normalize();
    let lookDir = Vector3.Lerp(nightLook, dayLook, smooth).normalize();
    // Biais sol uniquement quand le Soleil est sous / à l’horizon
    if (sunElev < 0.08) {
      const groundBias = 0.1 * (1 - Math.min(1, Math.max(0, (sunElev + 0.2) / 0.28)));
      lookDir = lookDir.subtract(outward.scale(groundBias)).normalize();
    }

    // Proche de la surface (hauteur « personne »)
    const eye = houseWorld.add(outward.scale(earthRadius * 0.028));
    return {
      eye,
      target: eye.add(lookDir),
      up: outward,
    };
  };

  const getPipSkyPhase = (): PipSkyPhase => {
    const s = getLightingScore();
    if (s > 0.2) return 'day';
    if (s > -0.12) return 'twilight';
    return 'night';
  };

  return {
    setVisible: (visible) => {
      root.setEnabled(visible);
    },
    getLightingScore,
    getLighting: () => (getLightingScore() > 0.12 ? 'day' : 'night'),
    getPipSkyPhase,
    getLocalPosition: () => localPos.clone(),
    getViewPose,
    setLayerMask: (mask) => {
      root.layerMask = mask;
      roof.layerMask = mask;
    },
    dispose: () => {
      roof.dispose();
      root.dispose();
      mat.dispose();
      roofMat.dispose();
    },
  };
}

export type EarthDragRotationHandle = {
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
};

/**
 * Glisser horizontalement fait tourner la Terre (Soleil fixe).
 * Désactive temporairement la rotation caméra pendant le drag.
 */
export function attachEarthDragRotation(
  scene: Scene,
  earthPivot: TransformNode,
  camera: ArcRotateCamera,
): EarthDragRotationHandle {
  let enabled = true;
  let dragging = false;
  let lastX = 0;
  const savedAngularX = camera.angularSensibilityX;
  const savedAngularY = camera.angularSensibilityY;

  const observer: Observer<PointerInfo> = scene.onPointerObservable.add((info) => {
    if (!enabled) return;
    const evt = info.event as PointerEvent;

    if (info.type === PointerEventTypes.POINTERDOWN) {
      dragging = true;
      lastX = evt.clientX;
      camera.angularSensibilityX = 100000;
      camera.angularSensibilityY = 100000;
    } else if (
      info.type === PointerEventTypes.POINTERUP ||
      info.type === PointerEventTypes.POINTERDOUBLETAP
    ) {
      dragging = false;
      camera.angularSensibilityX = savedAngularX;
      camera.angularSensibilityY = savedAngularY;
    } else if (info.type === PointerEventTypes.POINTERMOVE && dragging) {
      const dx = evt.clientX - lastX;
      lastX = evt.clientX;
      earthPivot.rotate(Vector3.Up(), dx * 0.01);
    }
  });

  return {
    setEnabled: (next) => {
      enabled = next;
      if (!next && dragging) {
        dragging = false;
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
