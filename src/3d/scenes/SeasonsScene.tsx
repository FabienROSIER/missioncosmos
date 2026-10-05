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
  TransformNode,
  Vector3,
  type LinesMesh,
  type Scene,
} from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi } from '@/3d/controls/missionCamera';
import {
  animateCameraTo,
  captureCameraHome,
  configureMissionCamera,
  createMissionCameraApi,
} from '@/3d/controls/missionCamera';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import {
  applyDayNightEarthMaterials,
  applyEmissiveSunMaterial,
  createSimpleAtmosphere,
  resolveGraphicsQuality,
  setupSceneLighting,
} from '@/3d/materials';
import {
  applyScenePerformancePriority,
  optimizeCelestialMeshes,
  startPerfMonitor,
} from '@/3d/performance';
import {
  frameAnchoredBodies,
  keepFramingClearOfElement,
  measureBodiesFraming,
  orientCameraForAnchor,
  profileViewDirection,
  watchBodiesFraming,
  type FramingSphere,
} from '@/3d/utils/cameraFraming';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { EARTH_BODY, SUN_BODY } from '@/content/bodies/catalog';
import {
  EARTH_AXIAL_TILT_DEG,
  NORTH_SUMMER_ANGLE,
  isNorthernSummer,
  normalizeAngle,
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
  onSummerExit?: () => void;
  /** Découverte : déplacement sur l’orbite, ou curseur d’inclinaison. */
  onExplore?: (kind: 'orbit' | 'tilt') => void;
};

const ORBIT_R = 5.2;
const EARTH_R = 0.85;
const SUN_R = 1.35;

/** Soleil au centre et Terre sur toute l’orbite, pour le cadrage de départ. */
function seasonFramingSpheres(): FramingSphere[] {
  const earthReach = ORBIT_R + EARTH_R * 1.55;
  return [{ center: Vector3.Zero(), radius: Math.max(SUN_R * 1.16, earthReach) }];
}

const SEASON_START_EARTH = new Vector3(
  Math.cos(NORTH_SUMMER_ANGLE) * ORBIT_R,
  0,
  Math.sin(NORTH_SUMMER_ANGLE) * ORBIT_R,
);
const SEASON_PROFILE = profileViewDirection(SEASON_START_EARTH.scale(-1).normalize());

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
  const root = new TransformNode('season-axis-root', scene);
  const mesh = MeshBuilder.CreateCylinder(
    'season-axis',
    { height: length, diameter: 0.07, tessellation: 12 },
    scene,
  );
  mesh.parent = root;
  mesh.isPickable = false;
  const mat = new StandardMaterial('season-axis-mat', scene);
  mat.disableLighting = true;
  mat.emissiveColor = new Color3(0.55, 0.9, 1);
  mesh.material = mat;

  // Pointe nord : forme + couleur distinctes pour lire immédiatement le sens.
  const north = MeshBuilder.CreateCylinder(
    'season-axis-north',
    { height: 0.2, diameterTop: 0, diameterBottom: 0.18, tessellation: 16 },
    scene,
  );
  north.parent = root;
  north.position.y = length / 2 + 0.1;
  north.isPickable = false;
  const northMat = new StandardMaterial('season-axis-north-mat', scene);
  northMat.disableLighting = true;
  northMat.emissiveColor = new Color3(1, 0.78, 0.2);
  north.material = northMat;

  // Extrémité sud arrondie, violette : contraste avec le nord et le fond.
  const south = MeshBuilder.CreateSphere(
    'season-axis-south',
    { diameter: 0.16, segments: 12 },
    scene,
  );
  south.parent = root;
  south.position.y = -length / 2;
  south.isPickable = false;
  const southMat = new StandardMaterial('season-axis-south-mat', scene);
  southMat.disableLighting = true;
  southMat.emissiveColor = new Color3(0.78, 0.38, 1);
  south.material = southMat;

  return {
    root,
    dispose: () => {
      north.dispose();
      south.dispose();
      mesh.dispose();
      mat.dispose();
      northMat.dispose();
      southMat.dispose();
      root.dispose();
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
  onSummerExit,
  onExplore,
}: SeasonsSceneProps) {
  const [tiltDeg, setTiltUi] = useState(EARTH_AXIAL_TILT_DEG);
  const [northLabel, setNorthLabel] = useState('Été');
  const [southLabel, setSouthLabel] = useState('Hiver');
  const [hint, setHint] = useState<string | null>(null);
  const runtimeRef = useRef<SeasonsSceneApi | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const onSceneApiRef = useRef(onSceneApi);
  const onSummerSuccessRef = useRef(onSummerSuccess);
  const onSummerExitRef = useRef(onSummerExit);
  const onExploreRef = useRef(onExplore);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onSummerSuccessRef.current = onSummerSuccess;
  }, [onSummerSuccess]);
  useEffect(() => {
    onSummerExitRef.current = onSummerExit;
  }, [onSummerExit]);
  useEffect(() => {
    onExploreRef.current = onExplore;
  }, [onExplore]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
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
    let challengePreparing = false;
    let dragEnabled = true;
    let cancelChallengeTransition: (() => void) | null = null;

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
    const atmosphere = createSimpleAtmosphere(scene, earth.pivot, {
      quality,
      scale: 1.05,
      alpha: 0.28,
      litBySun: true,
      color: new Color3(0.45, 0.68, 1),
    });
    earth.meshes.forEach((m) => {
      m.isPickable = true;
    });

    const orbit = createOrbitRing(scene, ORBIT_R, quality === 'low' ? 'low' : 'high');
    const axis = createAxis(scene, EARTH_R * 3.1);
    axis.root.parent = earth.pivot;
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
      sun.pivot.computeWorldMatrix(true);
      earth.pivot.computeWorldMatrix(true);
      const sunPosition = sun.pivot.getAbsolutePosition();
      const earthPosition = earth.pivot.getAbsolutePosition();
      // DirectionalLight.direction = sens de propagation des rayons : Soleil → Terre.
      lighting.sunLight.direction = earthPosition.subtract(sunPosition).normalize();
      rays.update(sunPosition, earthPosition);
      refreshLabels();

      if (challenge && !challengePreparing) {
        const northernSummer = isNorthernSummer(orbitAngle, tilt);
        if (!challengeDone && northernSummer) {
          challengeDone = true;
          setHint('Oui ! Été au nord.');
          onSummerSuccessRef.current?.();
        } else if (challengeDone && !northernSummer) {
          challengeDone = false;
          setHint('Tu as quitté la zone d’été — replace la Terre.');
          onSummerExitRef.current?.();
        }
      }
    };

    placeEarth();

    await Promise.all([sun.playAppear(), earth.playAppear()]);

    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('SeasonsScene: caméra ArcRotate attendue');
      return;
    }
    camera.lowerRadiusLimit = 7;
    camera.upperRadiusLimit = 16;
    camera.lowerBetaLimit = 0.35;
    camera.upperBetaLimit = Math.PI / 2 - 0.08;
    frameAnchoredBodies(camera, SEASON_START_EARTH, SEASON_PROFILE, seasonFramingSpheres());
    configureMissionCamera(camera, {
      skipLandscapeAutoZoom: true,
      lowerBetaLimit: 0.35,
      upperBetaLimit: Math.PI / 2 - 0.08,
    });
    const clearSeasonOverlay = () => {
      keepFramingClearOfElement(camera, seasonFramingSpheres(), hudRef.current);
    };
    clearSeasonOverlay();

    const home = captureCameraHome(camera);
    const baseCameraApi = createMissionCameraApi(camera, home, sun.pivot, [
      ...sun.meshes,
      ...earth.meshes,
    ]);
    const stopFramingWatch = watchBodiesFraming(
      camera,
      seasonFramingSpheres,
      (frame, stillAuto) => {
        baseCameraApi.setHome?.({
          alpha: stillAuto ? camera.alpha : home.alpha,
          beta: stillAuto ? camera.beta : home.beta,
          radius: stillAuto ? camera.radius : frame.radius,
          target: frame.center,
        });
      },
      undefined,
      (frame) => {
        orientCameraForAnchor(camera, SEASON_START_EARTH, SEASON_PROFILE, frame);
      },
      clearSeasonOverlay,
    );

    const canvas = engine.getRenderingCanvas();
    let cameraControlsAttached = true;
    let challengeCameraHome: ReturnType<typeof captureCameraHome> | null = null;
    let challengeCameraLocked = false;

    const setCameraControlsAttached = (attached: boolean) => {
      if (!canvas || attached === cameraControlsAttached) return;
      if (attached) {
        camera.attachControl(canvas, true);
        camera._panningMouseButton = 1;
      } else {
        camera.detachControl();
        camera.inertialAlphaOffset = 0;
        camera.inertialBetaOffset = 0;
        camera.inertialRadiusOffset = 0;
        camera.inertialPanningX = 0;
        camera.inertialPanningY = 0;
      }
      cameraControlsAttached = attached;
    };

    const setChallengeCameraLocked = (locked: boolean) => {
      if (locked === challengeCameraLocked) return;
      challengeCameraLocked = locked;
      scene.stopAnimation(camera);
      scene.stopAnimation(camera.target);

      if (locked) {
        challengeCameraHome = captureCameraHome(camera);
        setCameraControlsAttached(false);
        // Vue de défi avec une marge réelle autour de l’orbite, y compris sur les
        // écrans paysage peu hauts. Placée entre l’hiver et le printemps, mais
        // plus près du printemps, elle montre l’inclinaison sans regarder dans son axe.
        const fitted = measureBodiesFraming(camera, seasonFramingSpheres());
        camera.setTarget(Vector3.Zero());
        camera.alpha = Math.PI / 24;
        camera.beta = 0.88;
        camera.radius = fitted.radius;
      } else {
        setCameraControlsAttached(true);
        if (challengeCameraHome) {
          void animateCameraTo(camera, challengeCameraHome, 420);
          challengeCameraHome = null;
        }
      }
    };

    const cameraApi: MissionCameraApi = {
      getHome: baseCameraApi.getHome,
      recenter: async () => {
        if (challengeCameraLocked) return;
        await baseCameraApi.recenter();
      },
      focusOn: async (node, meshes) => {
        if (challengeCameraLocked) return;
        await baseCameraApi.focusOn(node, meshes);
      },
    };

    const startChallengeTransition = () => {
      cancelChallengeTransition?.();
      challengePreparing = true;

      const startAngle = orbitAngle;
      const springDelta = normalizeAngle(0 - startAngle);
      const autumnDelta = normalizeAngle(Math.PI - startAngle);
      const targetDelta =
        Math.abs(springDelta) <= Math.abs(autumnDelta) ? springDelta : autumnDelta;
      const durationMs = 1100;
      let elapsedMs = 0;

      const observer = scene.onBeforeRenderObservable.add(() => {
        elapsedMs = Math.min(durationMs, elapsedMs + engine.getDeltaTime());
        const progress = elapsedMs / durationMs;
        const easedProgress = progress * progress * (3 - 2 * progress);
        orbitAngle = normalizeAngle(startAngle + targetDelta * easedProgress);
        placeEarth();

        if (progress >= 1) {
          scene.onBeforeRenderObservable.remove(observer);
          cancelChallengeTransition = null;
          challengePreparing = false;
          orbitAngle = normalizeAngle(startAngle + targetDelta);
          placeEarth();
        }
      });

      cancelChallengeTransition = () => {
        scene.onBeforeRenderObservable.remove(observer);
        cancelChallengeTransition = null;
        challengePreparing = false;
      };
    };

    // Drag : faire glisser la Terre sur l’orbite (projection sur le plan XZ)
    let dragging = false;
    const pointerObs = scene.onPointerObservable.add((info) => {
      if (!dragEnabled || challengePreparing) return;
      if (info.type === PointerEventTypes.POINTERDOWN) {
        const mesh = info.pickInfo?.pickedMesh;
        const hitEarth =
          mesh && earth.meshes.some((m) => m === mesh || mesh.isDescendantOf(earth.pivot));
        dragging = Boolean(hitEarth);
        if (dragging) setCameraControlsAttached(false);
      } else if (
        info.type === PointerEventTypes.POINTERUP ||
        info.type === PointerEventTypes.POINTERDOUBLETAP
      ) {
        dragging = false;
        if (!challengeCameraLocked) setCameraControlsAttached(true);
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
        onExploreRef.current?.('orbit');
        if (challenge && !challengeDone && !isNorthernSummer(orbitAngle, tilt)) {
          setHint('Pas encore — cherche où le nord se penche vers le Soleil.');
        }
      }
    });

    const api: SeasonsSceneApi = {
      camera: cameraApi,
      setOrbitAngle: (rad) => {
        cancelChallengeTransition?.();
        orbitAngle = rad;
        placeEarth();
      },
      setTiltDeg: (deg) => {
        tilt = Math.min(35, Math.max(0, deg));
        placeEarth();
      },
      setChallengeEnabled: (enabled) => {
        const changed = challenge !== enabled;
        challenge = enabled;
        if (enabled && changed) {
          challengeDone = false;
          startChallengeTransition();
        } else if (!enabled) {
          cancelChallengeTransition?.();
        }
        setChallengeCameraLocked(enabled);
        setHint(enabled ? 'Place la Terre pour l’été au nord.' : null);
      },
      setOrbitDragEnabled: (enabled) => {
        dragEnabled = enabled;
        if (!enabled) {
          dragging = false;
          if (!challengeCameraLocked) setCameraControlsAttached(true);
        }
      },
    };
    runtimeRef.current = api;
    onSceneApiRef.current?.(api);

    const perf = startPerfMonitor(scene, { label: 'mission-07-seasons' });

    return () => {
      stopFramingWatch();
      perf.dispose();
      cancelChallengeTransition?.();
      setCameraControlsAttached(false);
      scene.onPointerObservable.remove(pointerObs);
      rays.dispose();
      axis.dispose();
      orbit.dispose();
      atmosphere.dispose();
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
    if (deg === 0) onExplore?.('tilt');
  };

  const jump = (rad: number) => {
    runtimeRef.current?.setOrbitAngle(rad);
    onExplore?.('orbit');
  };

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        mobileFovScale={1.65}
        onSceneReady={onSceneReady}
      />
      <SceneControls ref={hudRef} className={styles.hud}>
        <div className={styles.seasonRow} aria-live="polite">
          <p className={styles.seasonChip}>
            Nord : <strong>{northLabel}</strong>
          </p>
          <p className={styles.seasonChip}>
            Sud : <strong>{southLabel}</strong>
          </p>
        </div>
        <p className={styles.sliderLabel}>
          Inclinaison testée : {tiltDeg.toFixed(1).replace('.', ',')}°
        </p>
        <div className={styles.sliderWrap}>
          <input
            className={styles.slider}
            type="range"
            min={0}
            max={35}
            step={0.5}
            value={tiltDeg}
            onChange={(e) => setTilt(Number(e.target.value))}
            aria-label="Inclinaison testée dans la maquette"
            aria-valuetext={`${tiltDeg.toFixed(1).replace('.', ',')} degrés`}
          />
          <span className={styles.realTiltMarker} aria-hidden="true">
            <span className={styles.realTiltMarkerLabel}>Terre réelle : 23,5°</span>
          </span>
        </div>
        <p className={styles.experimentNote}>
          <strong>Expérience :</strong> ce curseur change seulement la maquette. En réalité,
          l&apos;axe de la Terre reste incliné d&apos;environ 23,5°.
        </p>
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
