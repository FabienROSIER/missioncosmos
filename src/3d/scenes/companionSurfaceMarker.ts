import {
  Color3,
  Matrix,
  MeshBuilder,
  Quaternion,
  StandardMaterial,
  TransformNode,
  Vector3,
  type AbstractMesh,
  type Observer,
  type Scene,
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
  /** Oriente le compagnon vers une cible monde sans le déplacer (France fixe). */
  lookToward: (worldTarget: Vector3) => void;
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

type SurfaceBeaconHandle = {
  root: TransformNode;
  meshes: AbstractMesh[];
  setLayerMask: (mask: number) => void;
  setVisibility: (visibility: number) => void;
  dispose: () => void;
};

/**
 * Repère visuel indépendant de la taille du compagnon :
 * cible cyan/or + onde pulsante posées au sol.
 */
function createSurfaceBeacon(
  scene: Scene,
  earthPivot: TransformNode,
  earthRadius: number,
  companionHeight: number,
  reducedMotion: boolean,
): SurfaceBeaconHandle {
  const root = new TransformNode('companion-location-beacon', scene);
  root.parent = earthPivot;

  const diameter = Math.min(
    earthRadius * 0.4,
    Math.max(companionHeight * 1.05, earthRadius * 0.16),
  );
  const thickness = Math.max(earthRadius * 0.008, diameter * 0.045);

  const darkMat = new StandardMaterial('companion-beacon-outline-mat', scene);
  darkMat.disableLighting = true;
  darkMat.emissiveColor = new Color3(0.015, 0.025, 0.045);
  darkMat.alpha = 0.78;
  darkMat.backFaceCulling = false;
  darkMat.disableDepthWrite = true;

  const glowMat = new StandardMaterial('companion-beacon-glow-mat', scene);
  glowMat.disableLighting = true;
  glowMat.emissiveColor = new Color3(0.25, 0.95, 1);
  glowMat.alpha = 0.95;
  glowMat.backFaceCulling = false;
  glowMat.disableDepthWrite = true;

  const pulseMat = new StandardMaterial('companion-beacon-pulse-mat', scene);
  pulseMat.disableLighting = true;
  pulseMat.emissiveColor = new Color3(1, 0.72, 0.18);
  pulseMat.alpha = 0.5;
  pulseMat.backFaceCulling = false;
  pulseMat.disableDepthWrite = true;

  const outline = MeshBuilder.CreateTorus(
    'companion-beacon-outline',
    { diameter, thickness: thickness * 2.15, tessellation: 40 },
    scene,
  );
  const ring = MeshBuilder.CreateTorus(
    'companion-beacon-ring',
    { diameter, thickness, tessellation: 40 },
    scene,
  );
  const pulse = MeshBuilder.CreateTorus(
    'companion-beacon-pulse',
    { diameter: diameter * 1.08, thickness: thickness * 0.8, tessellation: 40 },
    scene,
  );

  outline.material = darkMat;
  ring.material = glowMat;
  pulse.material = pulseMat;

  const meshes: AbstractMesh[] = [outline, ring, pulse];
  const tickDistance = diameter * 0.68;
  const tickLength = diameter * 0.25;
  for (let i = 0; i < 4; i += 1) {
    const angle = (i * Math.PI) / 2;
    const tick = MeshBuilder.CreateBox(
      `companion-beacon-tick-${i}`,
      { width: tickLength, height: thickness * 1.25, depth: thickness * 1.65 },
      scene,
    );
    tick.position.set(Math.cos(angle) * tickDistance, 0, Math.sin(angle) * tickDistance);
    tick.rotation.y = -angle;
    tick.material = glowMat;
    meshes.push(tick);
  }

  for (const mesh of meshes) {
    mesh.parent = root;
    mesh.position.y += earthRadius * 0.008;
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.renderingGroupId = 1;
  }

  let elapsed = 0;
  let observer: Observer<Scene> | null = null;
  if (reducedMotion) {
    pulse.scaling.setAll(1.22);
    pulseMat.alpha = 0.32;
  } else {
    observer = scene.onBeforeRenderObservable.add(() => {
      elapsed = (elapsed + scene.getEngine().getDeltaTime() / 1800) % 1;
      const scale = 1 + elapsed * 0.62;
      pulse.scaling.set(scale, 1, scale);
      pulseMat.alpha = 0.52 * (1 - elapsed);
    });
  }

  return {
    root,
    meshes,
    setLayerMask: (mask) => {
      for (const mesh of meshes) mesh.layerMask = mask;
    },
    setVisibility: (visibility) => {
      for (const mesh of meshes) mesh.visibility = visibility;
    },
    dispose: () => {
      if (observer) scene.onBeforeRenderObservable.remove(observer);
      for (const mesh of meshes) mesh.dispose();
      darkMat.dispose();
      glowMat.dispose();
      pulseMat.dispose();
      root.dispose();
    },
  };
}

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
 * Rotation locale du compagnon :
 * - +Y local = normale sortante (tête vers le ciel) ;
 * - −Z local = direction du regard projetée sur la tangente.
 *
 * Les axes forment impérativement une base directe (déterminant +1).
 * Une base réfléchie donne un quaternion incohérent et couchait le modèle.
 */
export function surfaceOrientationQuaternion(
  outward: Vector3,
  lookDirection: Vector3,
): Quaternion {
  const up =
    outward.lengthSquared() > 1e-8
      ? outward.clone().normalize()
      : Vector3.Up();
  let forward = lookDirection.subtract(up.scale(Vector3.Dot(lookDirection, up)));
  if (forward.lengthSquared() < 1e-8) {
    forward = Vector3.Cross(up, new Vector3(1, 0, 0));
    if (forward.lengthSquared() < 1e-8) forward = Vector3.Cross(up, new Vector3(0, 0, 1));
  }
  forward.normalize();

  // Modèle regardant vers −Z : X = forward × up garantit X × Y = Z.
  const right = Vector3.Cross(forward, up).normalize();
  const localZ = forward.scale(-1);
  const rotMat = Matrix.Identity();
  Matrix.FromXYZAxesToRef(right, up, localZ, rotMat);
  return Quaternion.FromRotationMatrix(rotMat).normalize();
}

/** Oriente le pivot sans toucher à son échelle uniforme. */
function orientOnSurface(
  pivot: TransformNode,
  outward: Vector3,
  lookDirection: Vector3,
): void {
  const orientation = surfaceOrientationQuaternion(outward, lookDirection);
  if (!pivot.rotationQuaternion) {
    pivot.rotationQuaternion = orientation;
  } else {
    pivot.rotationQuaternion.copyFrom(orientation);
  }
  pivot.rotation.set(0, 0, 0);
}

/**
 * Fondu d’occlusion autour du limbe :
 * - pleinement visible côté caméra ;
 * - transition douce pendant le passage derrière le bord ;
 * - invisible seulement une fois nettement derrière la Terre.
 */
export function companionOcclusionOpacity(viewDot: number): number {
  const fadeStart = 0.1;
  const hiddenAt = -0.2;
  const linear = Math.min(1, Math.max(0, (viewDot - hiddenAt) / (fadeStart - hiddenAt)));
  return linear * linear * (3 - 2 * linear);
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
  const baseMeshVisibility = new Map(
    loaded.meshes.map((mesh) => [mesh, mesh.visibility] as const),
  );
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
  const beacon = createSurfaceBeacon(scene, earthPivot, earthRadius, height, reduced);
  beacon.root.position.copyFrom(pivot.position);
  beacon.root.rotationQuaternion =
    pivot.rotationQuaternion?.clone() ?? Quaternion.Identity();

  const syncBeaconTransform = () => {
    beacon.root.position.copyFrom(pivot.position);
    if (!beacon.root.rotationQuaternion) {
      beacon.root.rotationQuaternion = Quaternion.Identity();
    }
    if (pivot.rotationQuaternion) {
      beacon.root.rotationQuaternion.copyFrom(pivot.rotationQuaternion);
    }
  };

  let missionVisible = true;
  let occlusionOpacity = 1;

  const applyEnabled = () => {
    const enabled = missionVisible && occlusionOpacity > 0.001;
    pivot.setEnabled(enabled);
    beacon.root.setEnabled(enabled);
    if (enabled) {
      for (const mesh of loaded.meshes) {
        mesh.visibility = (baseMeshVisibility.get(mesh) ?? 1) * occlusionOpacity;
      }
      beacon.setVisibility(occlusionOpacity);
    }
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
      beacon.setLayerMask(mask);
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
      syncBeaconTransform();
    },
    lookToward: (worldTarget) => {
      const center = earthPivot.getAbsolutePosition();
      const outwardWorld = companionWorldPos().subtract(center);
      const toTarget = worldTarget.subtract(companionWorldPos());
      if (outwardWorld.lengthSquared() < 1e-8 || toTarget.lengthSquared() < 1e-8) return;
      const inv = Matrix.Invert(earthPivot.getWorldMatrix());
      orientOnSurface(
        pivot,
        Vector3.TransformNormal(outwardWorld, inv),
        Vector3.TransformNormal(toTarget, inv),
      );
      syncBeaconTransform();
    },
    updateOcclusion: (cameraWorldPos) => {
      const center = earthPivot.getAbsolutePosition();
      const toCam = cameraWorldPos.subtract(center);
      const toComp = companionWorldPos().subtract(center);
      if (toCam.lengthSquared() < 1e-8 || toComp.lengthSquared() < 1e-8) {
        occlusionOpacity = 1;
        applyEnabled();
        return;
      }
      toCam.normalize();
      toComp.normalize();
      occlusionOpacity = companionOcclusionOpacity(Vector3.Dot(toCam, toComp));
      applyEnabled();
    },
    dispose: () => {
      beacon.dispose();
      loaded.dispose();
    },
  };
}
