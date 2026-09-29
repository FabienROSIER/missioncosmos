'use client';

import { SceneControls } from '@/components/layout/SceneControls';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  MeshBuilder,
  PointerEventTypes,
  Quaternion,
  StandardMaterial,
  Vector3,
  type LinesMesh,
  type Scene,
} from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { applyEngineResolution } from '@/3d/core/engineResolution';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi } from '@/3d/controls/missionCamera';
import {
  captureCameraHome,
  configureMissionCamera,
  createMissionCameraApi,
} from '@/3d/controls/missionCamera';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import {
  applyDayNightEarthMaterials,
  applyEmissiveSunMaterial,
  resolveGraphicsQuality,
  setupSceneLighting,
} from '@/3d/materials';
import {
  applyScenePerformancePriority,
  optimizeCelestialMeshes,
  startPerfMonitor,
} from '@/3d/performance';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { EARTH_BODY, SUN_BODY } from '@/content/bodies/catalog';
import {
  EARTH_AXIAL_TILT_DEG,
  NORTH_SUMMER_ANGLE,
  isNorthernSummer,
  northSeasonAt,
  seasonLabelFr,
  southSeasonAt,
} from '@/content/bodies/seasonsLearning';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { logger } from '@/lib/logger';
import styles from './SeasonsScene.module.css';

export type SeasonsSceneApi = {
  camera: MissionCameraApi;
  setOrbitAngle: (rad: number) => void;
  setTiltDeg: (deg: number) => void;
  setChallengeEnabled: (enabled: boolean) => void;
  setOrbitDragEnabled: (enabled: boolean) => void;
};

type SeasonsSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: SeasonsSceneApi) => void;
  onSummerSuccess?: () => void;
};

const ORBIT_R = 5.2;
const EARTH_R = 0.85;
const SUN_R = 1.35;

function createOrbitRing(scene: Scene, radius: number, quality: 'low' | 'high') {
  const mesh = MeshBuilder.CreateTorus(
    'season-orbit',
    {
      diameter: radius * 2,
      thickness: quality === 'low' ? 0.03 : 0.022,
      tessellation: quality === 'low' ? 48 : 72,
    },
    scene,
  );
  mesh.isPickable = false;
  const mat = new StandardMaterial('season-orbit-mat', scene);
  mat.disableLighting = true;
  mat.emissiveColor = new Color3(0.4, 0.65, 0.85);
  mat.alpha = 0.4;
  mesh.material = mat;
  return {
    mesh,
    dispose: () => {
      mesh.dispose();
      mat.dispose();
    },
  };
}

function createAxis(scene: Scene, length: number) {
  const mesh = MeshBuilder.CreateCylinder(
    'season-axis',
    { height: length, diameter: 0.045, tessellation: 8 },
    scene,
  );
  mesh.isPickable = false;
  const mat = new StandardMaterial('season-axis-mat', scene);
  mat.disableLighting = true;
  mat.emissiveColor = new Color3(0.75, 0.45, 0.95);
  mesh.material = mat;
  return {
    mesh,
    dispose: () => {
      mesh.dispose();
      mat.dispose();
    },
  };
}

function createRays(scene: Scene): {
  update: (from: Vector3, to: Vector3) => void;
  dispose: () => void;
} {
  let line: LinesMesh | null = null;
  const matColor = new Color3(1, 0.85, 0.35);
  return {
    update: (from, to) => {
      const points = [from.clone(), to.clone()];
      if (line) line.dispose();
      line = MeshBuilder.CreateLines('season-rays', { points }, scene);
      line.color = matColor;
      line.isPickable = false;
    },
    dispose: () => {
      line?.dispose();
      line = null;
    },
  };
}

/** Scène Mission 07 — Soleil, Terre inclinée, orbite, saisons N/S. */
export function SeasonsScene({
  className,
  fill = false,
  onSceneApi,
  onSummerSuccess,
}: SeasonsSceneProps) {
  const [tiltDeg, setTiltUi] = useState(EARTH_AXIAL_TILT_DEG);
  const [northLabel, setNorthLabel] = useState('Été');
  const [southLabel, setSouthLabel] = useState('Hiver');
  const [hint, setHint] = useState<string | null>(null);
  const runtimeRef = useRef<SeasonsSceneApi | null>(null);
  const onSceneApiRef = useRef(onSceneApi);
  const onSummerSuccessRef = useRef(onSummerSuccess);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onSummerSuccessRef.current = onSummerSuccess;
  }, [onSummerSuccess]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.18,
      sunIntensity: 1.45,
      contrast: 1.08,
      hemiDiffuse: new Color3(0.3, 0.34, 0.42),
      hemiGround: new Color3(0.03, 0.04, 0.05),
    });

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.65 : 0.78,
      segments: quality === 'low' ? 24 : 48,
    });

    const sun = await CelestialBodyEntity.create(scene, {
      definition: {
        ...SUN_BODY,
        visual: { ...SUN_BODY.visual, visualRadius: SUN_R },
      },
      position: Vector3.Zero(),
      spin: true,
    });
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    sun.meshes.forEach((m) => {
      m.isPickable = false;
    });

    let orbitAngle = NORTH_SUMMER_ANGLE;
    let tilt = EARTH_AXIAL_TILT_DEG;
    let challenge = false;
    let challengeDone = false;
    let dragEnabled = true;

    const earth = await CelestialBodyEntity.create(scene, {
      definition: {
        ...EARTH_BODY,
        scientific: { ...EARTH_BODY.scientific, axialTiltDeg: 0 },
        visual: { ...EARTH_BODY.visual, visualRadius: EARTH_R },
      },
      position: new Vector3(ORBIT_R, 0, 0),
      spin: true,
    });
    applyDayNightEarthMaterials(scene, earth.meshes);
    optimizeCelestialMeshes(earth.meshes, quality, 'planet');
    earth.meshes.forEach((m) => {
      m.isPickable = true;
    });

    const orbit = createOrbitRing(scene, ORBIT_R, quality === 'low' ? 'low' : 'high');
    const axis = createAxis(scene, EARTH_R * 2.6);
    axis.mesh.parent = earth.pivot;
    const rays = createRays(scene);

    const refreshLabels = () => {
      const n = northSeasonAt(orbitAngle, tilt);
      const s = southSeasonAt(orbitAngle, tilt);
      setNorthLabel(seasonLabelFr(n));
      setSouthLabel(seasonLabelFr(s));
      setTiltUi(tilt);
    };

    const placeEarth = () => {
      const x = Math.cos(orbitAngle) * ORBIT_R;
      const z = Math.sin(orbitAngle) * ORBIT_R;
      earth.pivot.position.set(x, 0, z);
      // Axe fixe dans l’espace : penché vers +Z (nord céleste pédagogique)
      const tiltRad = (tilt * Math.PI) / 180;
      earth.pivot.rotationQuaternion = Quaternion.RotationAxis(Vector3.Right(), tiltRad);
      earth.pivot.rotation.setAll(0);
      lighting.sunLight.direction = new Vector3(-x, 0.15, -z).normalize();
      rays.update(Vector3.Zero(), earth.pivot.position);
      refreshLabels();

      if (challenge && !challengeDone && isNorthernSummer(orbitAngle, tilt)) {
        challengeDone = true;
        setHint('Oui ! Été au nord.');
        onSummerSuccessRef.current?.();
      }
    };

    placeEarth();

    await Promise.all([sun.playAppear(), earth.playAppear()]);

    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('SeasonsScene: caméra ArcRotate attendue');
      return;
    }
    camera.setTarget(Vector3.Zero());
    camera.alpha = -Math.PI / 2.2;
    camera.beta = 0.72;
    camera.radius = 11;
    camera.lowerRadiusLimit = 7;
    camera.upperRadiusLimit = 16;
    camera.lowerBetaLimit = 0.4;
    camera.upperBetaLimit = Math.PI / 2 - 0.1;
    configureMissionCamera(camera, { allowPan: false });

    const home = captureCameraHome(camera);
    const cameraApi = createMissionCameraApi(camera, home, sun.pivot, [
      ...sun.meshes,
      ...earth.meshes,
    ]);

    // Drag : faire glisser la Terre sur l’orbite (projection sur le plan XZ)
    let dragging = false;
    const pointerObs = scene.onPointerObservable.add((info) => {
      if (!dragEnabled) return;
      if (info.type === PointerEventTypes.POINTERDOWN) {
        const mesh = info.pickInfo?.pickedMesh;
        const hitEarth =
          mesh && earth.meshes.some((m) => m === mesh || mesh.isDescendantOf(earth.pivot));
        dragging = Boolean(hitEarth);
      } else if (
        info.type === PointerEventTypes.POINTERUP ||
        info.type === PointerEventTypes.POINTERDOUBLETAP
      ) {
        dragging = false;
      } else if (info.type === PointerEventTypes.POINTERMOVE && dragging) {
        const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, null, camera);
        const n = Vector3.Up();
        const denom = Vector3.Dot(ray.direction, n);
        if (Math.abs(denom) < 1e-5) return;
        const t = -Vector3.Dot(ray.origin, n) / denom;
        if (t < 0) return;
        const hit = ray.origin.add(ray.direction.scale(t));
        orbitAngle = Math.atan2(hit.z, hit.x);
        placeEarth();
        if (challenge && !challengeDone && !isNorthernSummer(orbitAngle, tilt)) {
          setHint('Pas encore — cherche où le nord se penche vers le Soleil.');
        }
      }
    });

    const api: SeasonsSceneApi = {
      camera: cameraApi,
      setOrbitAngle: (rad) => {
        orbitAngle = rad;
        placeEarth();
      },
      setTiltDeg: (deg) => {
        tilt = Math.min(35, Math.max(0, deg));
        placeEarth();
      },
      setChallengeEnabled: (enabled) => {
        challenge = enabled;
        challengeDone = false;
        setHint(enabled ? 'Place la Terre pour l’été au nord.' : null);
      },
      setOrbitDragEnabled: (enabled) => {
        dragEnabled = enabled;
      },
    };
    runtimeRef.current = api;
    onSceneApiRef.current?.(api);

    const perf = startPerfMonitor(scene, { label: 'mission-07-seasons' });

    return () => {
      perf.dispose();
      scene.onPointerObservable.remove(pointerObs);
      rays.dispose();
      axis.dispose();
      orbit.dispose();
      earth.dispose();
      sun.dispose();
      background.dispose();
      lighting.dispose();
      runtimeRef.current = null;
    };
  }, []);

  const setTilt = (deg: number) => {
    setTiltUi(deg);
    runtimeRef.current?.setTiltDeg(deg);
  };

  const jump = (rad: number) => {
    runtimeRef.current?.setOrbitAngle(rad);
  };

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        mobileFovScale={1.65}
        onSceneReady={onSceneReady}
      />
      <SceneControls className={styles.hud}>
        <div className={styles.seasonRow} aria-live="polite">
          <p className={styles.seasonChip}>
            Nord : <strong>{northLabel}</strong>
          </p>
          <p className={styles.seasonChip}>
            Sud : <strong>{southLabel}</strong>
          </p>
        </div>
        <p className={styles.sliderLabel}>Inclinaison : {Math.round(tiltDeg)}°</p>
        <input
          className={styles.slider}
          type="range"
          min={0}
          max={35}
          step={1}
          value={Math.round(tiltDeg)}
          onChange={(e) => setTilt(Number(e.target.value))}
          aria-label="Inclinaison de la Terre"
        />
        <div className={styles.jumpRow} role="group" aria-label="Positions sur l’orbite">
          <button type="button" className={styles.jumpBtn} onClick={() => jump(0)}>
            Printemps
          </button>
          <button type="button" className={styles.jumpBtn} onClick={() => jump(NORTH_SUMMER_ANGLE)}>
            Été N
          </button>
          <button type="button" className={styles.jumpBtn} onClick={() => jump(Math.PI)}>
            Automne
          </button>
          <button
            type="button"
            className={styles.jumpBtn}
            onClick={() => jump(NORTH_SUMMER_ANGLE + Math.PI)}
          >
            Hiver N
          </button>
        </div>
        {hint ? (
          <p className={styles.hint} role="status">
            {hint}
          </p>
        ) : null}
        <p className={styles.note}>Glisse la Terre sur l’anneau · maquette simplifiée</p>
      </SceneControls>
    </div>
  );
}