import {
  Matrix,
  Quaternion,
  Vector3,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import { loadCompanion, type CompanionClip, type LoadedCompanion } from '@/3d/entities/loadCompanion';
import { MISSION_SUN_DIRECTION } from '@/3d/materials/sceneLighting';
import type {
  HouseMarkerHandle,
  HouseViewPose,
  PipSkyPhase,
  SurfaceLighting,
} from '@/3d/scenes/dayNightMarkers';
import { prefersReducedMotion } from '@/lib/motion';

export type CompanionSurfaceMarkerHandle = HouseMarkerHandle & {
  play: (clip: CompanionClip) => void;
  /**
   * Place le compagnon sur la surface face à une direction monde (ex. vers la Lune).
   * Si null, garde la position lat/lon fixe (France).
   */
  syncLookAt: (worldTarget: Vector3 | null) => void;
  /**
   * Masque le compagnon s’il est derrière le globe par rapport à la caméra
   * (évite see-through + disparitions par z-fight).
   */
  updateOcclusion: (cameraWorldPos: Vector3) => void;
};

export type CompanionSurfaceOptions = {
  /** Hauteur personnage en unités scène (Terre rayon ~1). */
  height?: number;
  /** Position fixe (Mission 02). Ignoré si syncLookAt dynamique. */
  latDeg?: number;
  lonDeg?: number;
  /** Mode dynamique : pas de lat/lon fixe au départ. */
  dynamic?: boolean;
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

/** Oriente le pivot : +Y local = outward, −Z local vers look (tangent). */
function orientOnSurface(pivot: TransformNode, outward: Vector3, lookWorld: Vector3): void {
  const up = outward.clone().normalize();
  let forward = lookWorld.subtract(up.scale(Vector3.Dot(lookWorld, up)));
  if (forward.lengthSquared() < 1e-8) {
    forward = Vector3.Cross(up, new Vector3(1, 0, 0));
    if (forward.lengthSquared() < 1e-8) forward = Vector3.Cross(up, new Vector3(0, 0, 1));
  }
  forward.normalize();
  const right = Vector3.Cross(up, forward).normalize();
  const trueForward = Vector3.Cross(right, up).normalize();
  const rotMat = Matrix.Identity();
  Matrix.FromXYZAxesToRef(right, up, trueForward.scale(-1), rotMat);
  if (!pivot.rotationQuaternion) {
    pivot.rotationQuaternion = Quaternion.FromRotationMatrix(rotMat);
  } else {
    Quaternion.FromRotationMatrixToRef(rotMat, pivot.rotationQuaternion);
  }
  pivot.rotation.set(0, 0, 0);
}

/**
 * Compagnon 3D collé à la Terre — remplace le repère maison (M02)
 * ou marque le point de vue PiP (M03/M04).
 */
export async function createCompanionSurfaceMarker(
  scene: Scene,
  earthPivot: TransformNode,
  earthRadius: number,
  options: CompanionSurfaceOptions = {},
): Promise<CompanionSurfaceMarkerHandle> {
  const height = options.height ?? earthRadius * 0.11;
  const latDeg = options.latDeg ?? 46.6;
  const lonDeg = options.lonDeg ?? 2.4;
  const dynamic = options.dynamic ?? false;

  const loaded: LoadedCompanion = await loadCompanion(scene, height);
  const pivot = loaded.pivot;
  pivot.parent = earthPivot;
  pivot.rotationQuaternion = Quaternion.Identity();
  pivot.metadata = { markerId: 'companion' };

  for (const mesh of loaded.meshes) {
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
    // Après la Terre : lisible devant ; l’occlusion caméra masque le côté pile
    mesh.renderingGroupId = 1;
  }

  // Légèrement au-dessus du rayon Terre pour éviter d’être avalé par le GLB
  const surfaceRadius = earthRadius * 1.08;
  let localPos = latLonOnSphere(surfaceRadius, latDeg, lonDeg);
  if (!dynamic) {
    pivot.position.copyFrom(localPos);
    const outward = localPos.clone().normalize();
    const look = new Vector3(-outward.z, 0, outward.x);
    orientOnSurface(pivot, outward, look.lengthSquared() > 1e-8 ? look : new Vector3(1, 0, 0));
  } else {
    pivot.position.copyFrom(localPos);
    const outward = localPos.clone().normalize();
    orientOnSurface(pivot, outward, new Vector3(1, 0, 0));
  }

  const sunDir = MISSION_SUN_DIRECTION.clone().normalize();
  const reduced = prefersReducedMotion();
  let missionVisible = true;
  let frontFacing = true;

  const applyEnabled = () => {
    pivot.setEnabled(missionVisible && frontFacing);
  };

  if (reduced) {
    loaded.play('rest', false);
  } else {
    loaded.play('idle', true);
  }

  const companionWorldPos = () =>
    Vector3.TransformCoordinates(pivot.position, earthPivot.getWorldMatrix());

  const getLightingScore = () => {
    const world = companionWorldPos();
    const center = earthPivot.getAbsolutePosition();
    const outward = world.subtract(center);
    if (outward.lengthSquared() < 1e-8) return 0;
    outward.normalize();
    return Vector3.Dot(outward, sunDir.scale(-1));
  };

  const getViewPose = (): HouseViewPose => {
    const center = earthPivot.getAbsolutePosition();
    const feet = companionWorldPos();
    const outward = feet.subtract(center);
    if (outward.lengthSquared() < 1e-8) {
      return {
        eye: feet.clone(),
        target: feet.add(Vector3.Up()),
        up: new Vector3(0, 0, 1),
      };
    }
    outward.normalize();

    const toSun = sunDir.scale(-1);
    let towardHorizon = toSun.subtract(outward.scale(Vector3.Dot(toSun, outward)));
    if (towardHorizon.lengthSquared() < 1e-6) {
      towardHorizon = Vector3.Cross(outward, new Vector3(1, 0, 0));
      if (towardHorizon.lengthSquared() < 1e-6) {
        towardHorizon = Vector3.Cross(outward, new Vector3(0, 0, 1));
      }
    }
    towardHorizon.normalize();

    const sunElev = Vector3.Dot(toSun, outward);
    const dayT = Math.min(1, Math.max(0, (sunElev + 0.18) / 0.42));
    const smooth = dayT * dayT * (3 - 2 * dayT);

    const dayLook = toSun.clone().normalize();
    const nightLook = towardHorizon.scale(0.96).add(outward.scale(0.08)).normalize();
    let lookDir = Vector3.Lerp(nightLook, dayLook, smooth).normalize();
    if (sunElev < 0.08) {
      const groundBias = 0.1 * (1 - Math.min(1, Math.max(0, (sunElev + 0.2) / 0.28)));
      lookDir = lookDir.subtract(outward.scale(groundBias)).normalize();
    }

    const eye = feet.add(outward.scale(earthRadius * 0.035));
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
      missionVisible = visible;
      applyEnabled();
    },
    getLightingScore,
    getLighting: (): SurfaceLighting => (getLightingScore() > 0.12 ? 'day' : 'night'),
    getPipSkyPhase,
    getLocalPosition: () => pivot.position.clone(),
    getViewPose,
    setLayerMask: (mask) => {
      // Tous les meshes du GLB (hiérarchie imbriquée), pas seulement les enfants directs
      for (const mesh of loaded.meshes) {
        mesh.layerMask = mask;
      }
    },
    play: (clip) => {
      if (reduced && clip !== 'rest') return;
      loaded.play(clip, clip === 'idle' || clip === 'walk' || clip === 'run');
    },
    syncLookAt: (worldTarget) => {
      if (!worldTarget) return;
      const center = earthPivot.getAbsolutePosition();
      const toTarget = worldTarget.subtract(center);
      if (toTarget.lengthSquared() < 1e-8) return;
      toTarget.normalize();

      const inv = Matrix.Invert(earthPivot.getWorldMatrix());
      const localDir = Vector3.TransformNormal(toTarget, inv).normalize();
      localPos = localDir.scale(surfaceRadius);
      pivot.position.copyFrom(localPos);

      const lookLocal = Vector3.TransformNormal(
        worldTarget.subtract(companionWorldPos()).normalize(),
        inv,
      );
      orientOnSurface(pivot, localDir, lookLocal);
    },
    updateOcclusion: (cameraWorldPos) => {
      const center = earthPivot.getAbsolutePosition();
      const toCam = cameraWorldPos.subtract(center);
      const toComp = companionWorldPos().subtract(center);
      if (toCam.lengthSquared() < 1e-8 || toComp.lengthSquared() < 1e-8) {
        frontFacing = true;
        applyEnabled();
        return;
      }
      toCam.normalize();
      toComp.normalize();
      // > 0 = hémisphère face caméra ; marge pour rester visible près du limbe
      frontFacing = Vector3.Dot(toCam, toComp) > 0.05;
      applyEnabled();
    },
    dispose: () => {
      loaded.dispose();
    },
  };
}
