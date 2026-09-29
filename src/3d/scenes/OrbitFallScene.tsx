'use client';

import { SceneControls } from '@/components/layout/SceneControls';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  MeshBuilder,
  Quaternion,
  StandardMaterial,
  TransformNode,
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
import { loadCompanion } from '@/3d/entities/loadCompanion';
import {
  applyPlanetaryMaterials,
  resolveGraphicsQuality,
  setupSceneLighting,
} from '@/3d/materials';
import {
  applyScenePerformancePriority,
  optimizeCelestialMeshes,
  startPerfMonitor,
} from '@/3d/performance';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import {
  fallOrbitHint,
  speedFromSlider,
  type FallOrbitOutcome,
} from '@/content/bodies/orbitFallChallenge';
import { EARTH_BODY } from '@/content/bodies/catalog';
import { COMPANION_TEMP_NAME } from '@/content/companion';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { logger } from '@/lib/logger';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './OrbitFallScene.module.css';

export type OrbitFallSceneApi = {
  camera: MissionCameraApi;
};

type OrbitFallSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: OrbitFallSceneApi) => void;
  onFallSuccess?: () => void;
};

type FlightState = 'idle' | 'flying' | 'done';

const EARTH_R = 1.15;
const LAUNCH_R = 2.05;
const MU = 2.6 * 2.6 * LAUNCH_R;
const SUCCESS_ANGLE = (220 * Math.PI) / 180;
const MAX_FLIGHT_SEC = 7;
const TRAIL_MAX = 280;
/** Hauteur lisible en orbite (pieds → tête). */
const COMPANION_HEIGHT = 0.42;

type Runtime = {
  launch: () => void;
  reset: () => void;
};

/**
 * Face la direction d’envoi, pieds vers la Terre.
 * Sans Matrix (FromXYZAxes provoquait un mesh étiré sur ce GLB skinné).
 */
function orientCompanion(pivot: TransformNode, position: Vector3, velocity: Vector3) {
  const up = position.lengthSquared() > 1e-8 ? position.clone().normalize() : Vector3.Up();
  let face = velocity.clone();
  if (face.lengthSquared() < 1e-8) {
    face = new Vector3(-up.z, 0, up.x);
    if (face.lengthSquared() < 1e-8) face.set(1, 0, 0);
  }
  const radial = Vector3.Dot(face, up);
  face.x -= up.x * radial;
  face.y -= up.y * radial;
  face.z -= up.z * radial;
  if (face.lengthSquared() < 1e-8) {
    face = Vector3.Cross(up, new Vector3(0, 0, 1));
    if (face.lengthSquared() < 1e-8) face = new Vector3(1, 0, 0);
  }
  face.normalize();

  // FromLookDirectionLH aligne +Z sur le 1er vecteur ; le modèle regarde en −Z
  // → on passe l’opposé pour que le visage suive `face`.
  const back = new Vector3(-face.x, -face.y, -face.z);
  if (!pivot.rotationQuaternion) pivot.rotationQuaternion = Quaternion.Identity();
  Quaternion.FromLookDirectionLHToRef(back, up, pivot.rotationQuaternion);
  pivot.rotation.setAll(0);
}

function createTrailDrawer(scene: Scene) {
  const points: Vector3[] = [];
  let mesh: LinesMesh | null = null;
  const color = new Color3(0.55, 0.92, 1);
  let framesSinceDraw = 0;

  const clear = () => {
    points.length = 0;
    framesSinceDraw = 0;
    if (mesh) {
      mesh.dispose();
      mesh = null;
    }
  };

  const redraw = () => {
    if (points.length < 2) return;
    if (mesh) mesh.dispose();
    mesh = MeshBuilder.CreateLines('fall-trail', { points: points.map((p) => p.clone()) }, scene);
    mesh.color = color;
    mesh.isPickable = false;
  };

  const push = (p: Vector3) => {
    points.push(p.clone());
    if (points.length > TRAIL_MAX) points.shift();
    framesSinceDraw += 1;
    if (framesSinceDraw >= 3 || points.length === 2) {
      framesSinceDraw = 0;
      redraw();
    }
  };

  return {
    clear,
    push,
    dispose: () => {
      clear();
    },
  };
}

/**
 * Défi chute perpétuelle : compagnon 3D, curseur, traînée d’orbite.
 * En cas de réussite, le mouvement continue.
 */
export function OrbitFallScene({
  className,
  fill = false,
  onSceneApi,
  onFallSuccess,
}: OrbitFallSceneProps) {
  const [slider, setSlider] = useState(0.22);
  const [flight, setFlight] = useState<FlightState>('idle');
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<FallOrbitOutcome | null>(null);

  const runtimeRef = useRef<Runtime | null>(null);
  const sliderRef = useRef(slider);
  const attemptsRef = useRef(0);
  const onSceneApiRef = useRef(onSceneApi);
  const onFallSuccessRef = useRef(onFallSuccess);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onFallSuccessRef.current = onFallSuccess;
  }, [onFallSuccess]);
  useEffect(() => {
    sliderRef.current = slider;
  }, [slider]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.22,
      sunIntensity: 1.35,
      contrast: 1.05,
      hemiDiffuse: new Color3(0.32, 0.36, 0.45),
      hemiGround: new Color3(0.04, 0.05, 0.07),
    });
    lighting.sunLight.direction = new Vector3(-0.4, -0.5, -0.55);

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.65 : 0.78,
      segments: quality === 'low' ? 24 : 48,
    });

    const earth = await CelestialBodyEntity.create(scene, {
      definition: {
        ...EARTH_BODY,
        visual: { ...EARTH_BODY.visual, visualRadius: EARTH_R },
      },
      position: Vector3.Zero(),
      spin: true,
    });
    applyPlanetaryMaterials(scene, earth.meshes, quality);
    optimizeCelestialMeshes(earth.meshes, quality, 'planet');
    earth.meshes.forEach((m) => {
      m.isPickable = false;
    });

    const ghost = MeshBuilder.CreateTorus(
      'fall-ghost-orbit',
      { diameter: LAUNCH_R * 2, thickness: 0.012, tessellation: quality === 'low' ? 48 : 64 },
      scene,
    );
    ghost.isPickable = false;
    const ghostMat = new StandardMaterial('fall-ghost-mat', scene);
    ghostMat.disableLighting = true;
    ghostMat.emissiveColor = new Color3(0.25, 0.4, 0.55);
    ghostMat.alpha = 0.22;
    ghost.material = ghostMat;

    const companion = await loadCompanion(scene, COMPANION_HEIGHT);
    companion.meshes.forEach((m) => {
      m.isPickable = false;
      m.renderingGroupId = 1;
    });
    // Ne pas reparenter le GLB skinné (casse le bind → mesh étiré).
    const modelScale = companion.pivot.scaling.x;
    companion.play('idle', true);

    const placeCompanion = (position: Vector3, velocity: Vector3) => {
      companion.pivot.position.copyFrom(position);
      orientCompanion(companion.pivot, position, velocity);
      companion.pivot.scaling.setAll(modelScale);
    };

    const trail = createTrailDrawer(scene);

    const pos = new Vector3(LAUNCH_R, 0, 0);
    const vel = new Vector3(0, 0, 1);
    let flying = false;
    /** Après une réussite : on continue d’orbiter sans re-valider jusqu’au prochain lancement. */
    let coasting = false;
    /** Défi déjà signalé au parent (une seule fois). */
    let challengeReported = false;
    let accumAngle = 0;
    let lastAngle = 0;
    let flightTime = 0;
    let trailEvery = 0;
    let resetTimer: number | null = null;

    const clearResetTimer = () => {
      if (resetTimer !== null) {
        window.clearTimeout(resetTimer);
        resetTimer = null;
      }
    };

    const putIdle = () => {
      clearResetTimer();
      flying = false;
      coasting = false;
      accumAngle = 0;
      flightTime = 0;
      lastAngle = 0;
      trailEvery = 0;
      trail.clear();
      pos.set(LAUNCH_R, 0, 0);
      vel.set(0, 0, 1);
      placeCompanion(pos, vel);
      companion.play('idle', true);
      setFlight('idle');
      setOutcome(null);
      setStatus(challengeReported ? 'Tu peux relancer pour expérimenter.' : null);
    };

    putIdle();

    const finishFail = (result: Exclude<FallOrbitOutcome, 'orbit'>) => {
      flying = false;
      coasting = false;
      setFlight('done');
      setOutcome(result);
      setStatus(fallOrbitHint(result, sliderRef.current, attemptsRef.current));
      companion.play('confused', false);
      clearResetTimer();
      // Revient au point de lancement après ~3,5 s
      resetTimer = window.setTimeout(() => {
        resetTimer = null;
        if (flying || coasting) return;
        const hint = fallOrbitHint(result, sliderRef.current, attemptsRef.current);
        putIdle();
        setStatus(challengeReported ? 'Tu peux relancer pour expérimenter.' : hint);
      }, 3500);
    };

    const finishSuccess = () => {
      // Garde le vol en cours — on ne stoppe pas l’orbite
      coasting = true;
      setFlight('done');
      setOutcome('orbit');
      setStatus(
        challengeReported
          ? `Encore réussi ! Tu peux relancer pour tester d’autres vitesses.`
          : fallOrbitHint('orbit', sliderRef.current, attemptsRef.current),
      );
      companion.play('cheer', false);
      if (!challengeReported) {
        challengeReported = true;
        onFallSuccessRef.current?.();
      }
    };

    const launch = () => {
      // Interdit seulement pendant un vol « en cours » (pas en coasting post-succès)
      if (flying && !coasting) return;

      clearResetTimer();
      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);

      const vCirc = Math.sqrt(MU / LAUNCH_R);
      const speed = vCirc * speedFromSlider(sliderRef.current);
      trail.clear();
      pos.set(LAUNCH_R, 0, 0);
      vel.set(0, 0, speed);
      placeCompanion(pos, vel);
      companion.play('idle', true);
      trail.push(pos);

      flying = true;
      coasting = false;
      accumAngle = 0;
      flightTime = 0;
      lastAngle = 0;
      trailEvery = 0;
      setFlight('flying');
      setStatus(null);
      setOutcome(null);
    };

    runtimeRef.current = { launch, reset: putIdle };

    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('OrbitFallScene: caméra ArcRotate attendue');
      return;
    }
    camera.setTarget(Vector3.Zero());
    // Vue 3/4 haut : toute l’orbite visible, pas masquée derrière la Terre
    camera.alpha = -Math.PI / 2.35;
    camera.beta = 0.68;
    camera.radius = 8.1;
    camera.lowerRadiusLimit = 5.5;
    camera.upperRadiusLimit = 12;
    camera.lowerBetaLimit = 0.45;
    camera.upperBetaLimit = Math.PI / 2 - 0.12;
    configureMissionCamera(camera, { allowPan: false });

    const home = captureCameraHome(camera);
    const cameraApi = createMissionCameraApi(camera, home, earth.pivot, [
      ...earth.meshes,
      ...companion.meshes,
    ]);
    onSceneApiRef.current?.({ camera: cameraApi });

    const reduced = prefersReducedMotion();
    const observer = scene.onBeforeRenderObservable.add(() => {
      if (!flying) return;
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.04) * (reduced ? 0.55 : 1);
      flightTime += dt;

      const r = pos.length();
      if (r < 1e-4) return;
      const acc = pos.scale(-MU / (r * r * r));
      vel.addInPlace(acc.scale(dt));
      pos.addInPlace(vel.scale(dt));
      placeCompanion(pos, vel);

      trailEvery += 1;
      if (trailEvery % 2 === 0) trail.push(pos);

      const angle = Math.atan2(pos.z, pos.x);
      let dAng = angle - lastAngle;
      if (dAng > Math.PI) dAng -= Math.PI * 2;
      if (dAng < -Math.PI) dAng += Math.PI * 2;
      if (dAng > 0) accumAngle += dAng;
      lastAngle = angle;

      // Après succès : continue d’orbiter jusqu’à un nouveau lancement
      if (coasting) return;

      // Réussite = un vrai tour (ou presque), peu importe la position du curseur
      if (accumAngle >= SUCCESS_ANGLE) {
        finishSuccess();
        return;
      }
      if (r <= EARTH_R + 0.08) {
        finishFail('crash');
        return;
      }
      if (r > LAUNCH_R * 2.8) {
        finishFail('escape');
        return;
      }
      if (flightTime > MAX_FLIGHT_SEC) {
        if (accumAngle >= SUCCESS_ANGLE * 0.7) finishSuccess();
        else if (r < LAUNCH_R * 0.92) finishFail('crash');
        else if (r > LAUNCH_R * 1.4) finishFail('escape');
        else finishFail('crash');
      }
    });

    await earth.playAppear();
    const perf = startPerfMonitor(scene, { label: 'mission-06-orbit-fall' });

    return () => {
      clearResetTimer();
      perf.dispose();
      scene.onBeforeRenderObservable.remove(observer);
      trail.dispose();
      companion.dispose();
      ghost.dispose();
      ghostMat.dispose();
      earth.dispose();
      background.dispose();
      lighting.dispose();
      runtimeRef.current = null;
    };
  }, []);

  // Verrouille les contrôles seulement pendant un essai en cours (pas après succès)
  const controlsLocked = flight === 'flying' && outcome !== 'orbit';
  const success = outcome === 'orbit';

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas className={styles.canvas} fill={fill} onSceneReady={onSceneReady} />
      <SceneControls className={styles.hud}>
        <p className={styles.lead}>
          Règle la vitesse, puis lance {COMPANION_TEMP_NAME}. Observe : tombe, tourne, ou s’éloigne
          ?
        </p>
        <label className={styles.sliderLabel} htmlFor="orbit-fall-speed">
          Vitesse de lancement
        </label>
        <div className={styles.sliderRow}>
          <span className={styles.sliderEnd}>Lent</span>
          <input
            id="orbit-fall-speed"
            className={styles.slider}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(slider * 100)}
            disabled={controlsLocked}
            onChange={(e) => setSlider(Number(e.target.value) / 100)}
            aria-valuetext={`Vitesse ${Math.round(slider * 100)} pour cent`}
          />
          <span className={styles.sliderEnd}>Rapide</span>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.launch}
            disabled={controlsLocked}
            onClick={() => runtimeRef.current?.launch()}
          >
            Lancer
          </button>
          <button
            type="button"
            className={styles.retry}
            disabled={controlsLocked || flight === 'idle'}
            onClick={() => runtimeRef.current?.reset()}
          >
            Réessayer
          </button>
        </div>
        {status ? (
          <p className={success ? styles.ok : styles.hint} role="status">
            {success
              ? status.startsWith('Encore')
                ? status
                : `Oui ! ${COMPANION_TEMP_NAME} tombe vers la Terre, mais avance assez vite sur le côté — chute qui n’arrive jamais. Tu peux relancer pour expérimenter.`
              : status}
          </p>
        ) : null}
        {attempts > 0 ? <p className={styles.tries}>Essai {attempts}</p> : null}
        <p className={styles.note}>Maquette : pas un simulateur exact.</p>
      </SceneControls>
    </div>
  );
}