'use client';

import { SceneControls } from '@/components/layout/SceneControls';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  Vector3,
  type Scene,
} from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi } from '@/3d/controls/missionCamera';
import {
  captureCameraHome,
  configureMissionCamera,
  createMissionCameraApi,
} from '@/3d/controls/missionCamera';
import { playPlanetSuccessHalo } from '@/3d/fx/planetSuccessHalo';
import { resolveGraphicsQuality, setupSceneLighting } from '@/3d/materials';
import { applyScenePerformancePriority, startPerfMonitor } from '@/3d/performance';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import {
  APPARENT_DISTANCE_MAX,
  APPARENT_DISTANCE_MIN,
  APPARENT_SIZE_STAR,
  APPARENT_TARGET,
  COLOR_COMPARE_STARS,
  PHOTO_DISTANCE_MAX,
  PHOTO_DISTANCE_MIN,
  PHOTO_STARS,
  PHOTO_TARGET,
  SIZE_COMPARE_STARS,
  STARS,
  apparentAngularSize,
  clampApparentDistance,
  comparisonVisualRadius,
  isPhotoFramed,
  photoApparentSize,
  photoFramingHint,
  photoProgress,
  radiusLabelFr,
  temperatureBandFr,
  type StarId,
  type StarsSceneMode,
} from '@/content/bodies/stars';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { logger } from '@/lib/logger';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './StarsScene.module.css';

export type StarsSceneApi = {
  camera: MissionCameraApi;
  setMode: (mode: StarsSceneMode) => void;
  setChallengeEnabled: (enabled: boolean) => void;
  setPickEnabled: (enabled: boolean) => void;
};

type StarsSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: StarsSceneApi) => void;
  onObservatorySuccess?: () => void;
  onObservatoryMiss?: (hint: string) => void;
};

type StarMesh = {
  id: StarId;
  root: Mesh;
  glow: Mesh;
  mat: StandardMaterial;
  glowMat: StandardMaterial;
  dispose: () => void;
};

function createStarMesh(scene: Scene, id: StarId, quality: 'low' | 'medium' | 'high'): StarMesh {
  const def = STARS[id];
  const segments = quality === 'low' ? 16 : quality === 'medium' ? 24 : 32;
  const root = MeshBuilder.CreateSphere(`star-${id}`, { diameter: 2, segments }, scene);
  root.isPickable = true;

  const mat = new StandardMaterial(`star-mat-${id}`, scene);
  mat.disableLighting = true;
  mat.emissiveColor = new Color3(def.color.r, def.color.g, def.color.b);
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  root.material = mat;

  const glow = MeshBuilder.CreateSphere(
    `star-glow-${id}`,
    { diameter: 2.55, segments: Math.max(12, segments - 8) },
    scene,
  );
  glow.parent = root;
  glow.isPickable = false;
  const glowMat = new StandardMaterial(`star-glow-mat-${id}`, scene);
  glowMat.disableLighting = true;
  glowMat.emissiveColor = new Color3(def.color.r, def.color.g, def.color.b);
  glowMat.alpha = quality === 'low' ? 0.18 : 0.28;
  glowMat.diffuseColor = Color3.Black();
  glowMat.specularColor = Color3.Black();
  glow.material = glowMat;

  return {
    id,
    root,
    glow,
    mat,
    glowMat,
    dispose: () => {
      glow.dispose();
      glowMat.dispose();
      root.dispose();
      mat.dispose();
    },
  };
}

function setStarRadius(star: StarMesh, radius: number) {
  star.root.scaling.setAll(Math.max(0.05, radius));
}

/** Scène Mission 08 — Soleil comme étoile, tailles, couleurs, taille apparente, défi observatoire. */
export function StarsScene({
  className,
  fill = false,
  onSceneApi,
  onObservatorySuccess,
  onObservatoryMiss,
}: StarsSceneProps) {
  const [mode, setModeUi] = useState<StarsSceneMode>('sun');
  const [fact, setFact] = useState<string | null>(STARS.sun.shortFact);
  const [distanceAu, setDistanceUi] = useState(55);
  const [challengeActive, setChallengeActive] = useState(false);
  const [photoStar, setPhotoStar] = useState<StarId>('proxima');
  const [completedPhotos, setCompletedPhotos] = useState<StarId[]>([]);
  const [roundHint, setRoundHint] = useState<string | null>(null);
  const [roundOk, setRoundOk] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [showReticle, setShowReticle] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  const runtimeRef = useRef<StarsSceneApi | null>(null);
  const hudRef = useRef<{
    setDistance: (value: number) => void;
    shiftDistance: (delta: number) => void;
    takePhoto: () => void;
  } | null>(null);
  const onSceneApiRef = useRef(onSceneApi);
  const onSuccessRef = useRef(onObservatorySuccess);
  const onMissRef = useRef(onObservatoryMiss);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onSuccessRef.current = onObservatorySuccess;
  }, [onObservatorySuccess]);
  useEffect(() => {
    onMissRef.current = onObservatoryMiss;
  }, [onObservatoryMiss]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.22,
      sunIntensity: 0.35,
      contrast: 1.05,
      hemiDiffuse: new Color3(0.25, 0.28, 0.36),
      hemiGround: new Color3(0.02, 0.03, 0.04),
    });

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.7 : 0.82,
      segments: quality === 'low' ? 24 : 48,
    });

    let modeLocal: StarsSceneMode = 'sun';
    let challenge = false;
    let challengeDone = false;
    let pickEnabled = true;
    let distance = 55;
    let currentPhotoIndex = 0;
    let completed: StarId[] = [];
    let flashTimer: number | null = null;

    const photoStartDistance = (id: StarId) => {
      if (id === 'proxima') return 58;
      if (id === 'sun') return 14;
      return 58;
    };

    const stars = new Map<StarId, StarMesh>();
    (Object.keys(STARS) as StarId[]).forEach((id) => {
      stars.set(id, createStarMesh(scene, id, quality));
    });

    const hideAll = () => {
      stars.forEach((star) => {
        star.root.setEnabled(false);
      });
    };

    const showStar = (id: StarId, position: Vector3, radius: number) => {
      const star = stars.get(id);
      if (!star) return;
      star.root.setEnabled(true);
      star.root.position.copyFrom(position);
      setStarRadius(star, radius);
    };

    const applyLayout = () => {
      hideAll();
      setShowReticle(false);

      if (modeLocal === 'sun' || modeLocal === 'explore') {
        showStar('sun', Vector3.Zero(), 1.35);
        setFact(STARS.sun.shortFact);
        return;
      }

      if (modeLocal === 'sizes') {
        const spacing = 2.15;
        SIZE_COMPARE_STARS.forEach((id, index) => {
          const x = (index - 1) * spacing;
          showStar(id, new Vector3(x, 0, 0), comparisonVisualRadius(STARS[id].radiusSolar));
        });
        setFact('Tailles compressées pour tout voir : Proxima ≪ Soleil ≪ Bételgeuse.');
        return;
      }

      if (modeLocal === 'colors') {
        const spacing = 2.1;
        COLOR_COMPARE_STARS.forEach((id, index) => {
          const x = (index - 1) * spacing;
          showStar(id, new Vector3(x, 0, 0), 0.85);
        });
        setFact('Rouge = plus froide · Bleutée = plus chaude (simplifié).');
        return;
      }

      if (modeLocal === 'apparent') {
        const starId = APPARENT_SIZE_STAR;
        const angular = apparentAngularSize(STARS[starId].radiusSolar, distance);
        // Rayon d’affichage : calé pour que la mire CSS corresponde à APPARENT_TARGET.
        const displayRadius = (angular / APPARENT_TARGET) * 1.05;
        showStar(starId, new Vector3(0, 0, 0), displayRadius);
        setShowReticle(true);
        setFact(
          `${STARS[starId].nameFr} · distance pédagogique ${Math.round(distance)} · ${
            STARS[starId].estimateNote ?? 'géante rouge'
          }`,
        );
        return;
      }

      if (modeLocal === 'challenge') {
        const starId = PHOTO_STARS[currentPhotoIndex] ?? PHOTO_STARS[PHOTO_STARS.length - 1]!;
        const apparent = photoApparentSize(starId, distance);
        const displayRadius = (apparent / PHOTO_TARGET) * 1.05;
        showStar(starId, Vector3.Zero(), displayRadius);
        setShowReticle(true);
        setPhotoStar(starId);
        setFact(
          `${STARS[starId].nameFr} · vraie taille : ${radiusLabelFr(
            STARS[starId].radiusSolar,
          )}. Ajuste seulement la distance du télescope.`,
        );
      }
    };

    const takePhoto = () => {
      const starId = PHOTO_STARS[currentPhotoIndex];
      if (!starId || challengeDone) return;
      if (!isPhotoFramed(starId, distance)) {
        const hint = photoFramingHint(starId, distance);
        setRoundOk(null);
        setRoundHint(hint);
        onMissRef.current?.(hint);
        return;
      }

      completed = [...completed, starId];
      setCompletedPhotos([...completed]);
      setRoundHint(null);
      setRoundOk(`Photo réussie : ${STARS[starId].nameFr} !`);
      setFlashKey((key) => key + 1);
      const star = stars.get(starId);
      if (star) playPlanetSuccessHalo(scene, star.root.position.clone(), star.root.scaling.x);

      const progress = photoProgress(completed);
      if (progress.complete) {
        challengeDone = true;
        setCelebrating(true);
        setRoundOk('Album complet ! Même cadrage, mais tailles et distances très différentes.');
        onSuccessRef.current?.();
        return;
      }

      currentPhotoIndex += 1;
      const nextId = PHOTO_STARS[currentPhotoIndex]!;
      distance = photoStartDistance(nextId);
      setDistanceUi(distance);
      setPhotoStar(nextId);
      setRoundHint(
        `Nouvelle photo : ${STARS[nextId].nameFr}. Fais entrer son disque dans le cadre.`,
      );
      if (flashTimer != null) window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => applyLayout(), 260);
      applyLayout();
    };

    applyLayout();

    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('StarsScene: caméra ArcRotate attendue');
      return;
    }
    camera.setTarget(Vector3.Zero());
    camera.alpha = -Math.PI / 2.15;
    camera.beta = 1.15;
    camera.radius = 8.2;
    camera.lowerRadiusLimit = 4.5;
    camera.upperRadiusLimit = 14;
    camera.lowerBetaLimit = 0.35;
    camera.upperBetaLimit = Math.PI - 0.35;
    configureMissionCamera(camera);

    const home = captureCameraHome(camera);
    const cameraApi = createMissionCameraApi(camera, home, stars.get('sun')!.root, [
      ...Array.from(stars.values()).map((s) => s.root),
    ]);

    const api: StarsSceneApi = {
      camera: cameraApi,
      setMode: (next) => {
        modeLocal = next;
        setModeUi(next);
        if (next !== 'challenge') {
          challenge = false;
          setChallengeActive(false);
          setShowReticle(next === 'apparent');
          setRoundHint(null);
          setRoundOk(null);
          setCelebrating(false);
        }
        applyLayout();
      },
      setChallengeEnabled: (enabled) => {
        const changed = challenge !== enabled;
        challenge = enabled;
        if (enabled && changed) {
          challengeDone = false;
          completed = [];
          currentPhotoIndex = 0;
          modeLocal = 'challenge';
          distance = photoStartDistance(PHOTO_STARS[0]!);
          setModeUi('challenge');
          setChallengeActive(true);
          setPhotoStar(PHOTO_STARS[0]!);
          setCompletedPhotos([]);
          setDistanceUi(distance);
          setRoundHint('Photo 1/3 : rapproche ou éloigne le télescope pour remplir le cadre doré.');
          setRoundOk(null);
          setCelebrating(false);
          applyLayout();
        } else if (!enabled) {
          setChallengeActive(false);
          setShowReticle(false);
          if (modeLocal === 'challenge') {
            modeLocal = 'explore';
            setModeUi('explore');
            applyLayout();
          }
        }
      },
      setPickEnabled: (enabled) => {
        pickEnabled = enabled;
      },
    };
    runtimeRef.current = api;
    onSceneApiRef.current?.(api);

    const pointerObs = scene.onPointerObservable.add((info) => {
      if (!pickEnabled) return;
      if (info.type !== PointerEventTypes.POINTERDOWN) return;
      const mesh = info.pickInfo?.pickedMesh;
      if (!mesh) return;
      const hit = Array.from(stars.values()).find(
        (star) => star.root === mesh || mesh.isDescendantOf(star.root),
      );
      if (!hit) return;

      if (modeLocal === 'colors') {
        setFact(
          `${STARS[hit.id].nameFr} · ${STARS[hit.id].colorLabelFr} · ${temperatureBandFr(
            STARS[hit.id].temperatureK,
          )} (~${STARS[hit.id].temperatureK} K)`,
        );
        return;
      }

      if (modeLocal === 'sizes' || modeLocal === 'explore' || modeLocal === 'sun') {
        setFact(
          `${STARS[hit.id].nameFr} · ${radiusLabelFr(STARS[hit.id].radiusSolar)}${
            STARS[hit.id].estimateNote ? ` · ${STARS[hit.id].estimateNote}` : ''
          }`,
        );
      }
    });

    hudRef.current = {
      setDistance: (value: number) => {
        distance =
          modeLocal === 'challenge'
            ? Math.min(PHOTO_DISTANCE_MAX, Math.max(PHOTO_DISTANCE_MIN, value))
            : clampApparentDistance(value);
        setDistanceUi(distance);
        if (modeLocal === 'challenge') {
          setRoundHint(photoFramingHint(PHOTO_STARS[currentPhotoIndex]!, distance));
          setRoundOk(null);
        }
        applyLayout();
      },
      shiftDistance: (delta: number) => {
        const next = Math.min(PHOTO_DISTANCE_MAX, Math.max(PHOTO_DISTANCE_MIN, distance + delta));
        distance = next;
        setDistanceUi(next);
        setRoundHint(photoFramingHint(PHOTO_STARS[currentPhotoIndex]!, next));
        setRoundOk(null);
        applyLayout();
      },
      takePhoto,
    };

    const perf = startPerfMonitor(scene, { label: 'mission-08-stars' });

    // Soft pulse on glow (reduced motion = skip)
    let pulseT = 0;
    const pulseObs = prefersReducedMotion()
      ? null
      : scene.onBeforeRenderObservable.add(() => {
          pulseT += engine.getDeltaTime() * 0.001;
          const a = 0.2 + 0.08 * Math.sin(pulseT * 2.2);
          stars.forEach((star) => {
            if (star.root.isEnabled()) star.glowMat.alpha = a;
          });
        });

    return () => {
      perf.dispose();
      if (flashTimer != null) window.clearTimeout(flashTimer);
      if (pulseObs) scene.onBeforeRenderObservable.remove(pulseObs);
      scene.onPointerObservable.remove(pointerObs);
      stars.forEach((star) => star.dispose());
      background.dispose();
      lighting.dispose();
      hudRef.current = null;
      runtimeRef.current = null;
    };
  }, []);

  const setDistance = (value: number) => {
    setDistanceUi(value);
    hudRef.current?.setDistance(value);
  };

  const shiftDistance = (delta: number) => {
    hudRef.current?.shiftDistance(delta);
  };

  const takePhoto = () => {
    hudRef.current?.takePhoto();
  };

  const showDistanceControls = mode === 'apparent' || challengeActive;
  const progress = photoProgress(completedPhotos);

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        mobileFovScale={1.55}
        onSceneReady={onSceneReady}
      />
      {showReticle ? <div className={styles.reticle} aria-hidden="true" /> : null}
      {flashKey > 0 ? (
        <div key={flashKey} className={styles.photoFlash} aria-hidden="true" />
      ) : null}
      {celebrating ? <p className={styles.celebrate}>Observatoire activé</p> : null}
      <SceneControls className={styles.hud}>
        {challengeActive ? (
          <p className={styles.progress}>
            <strong>
              Album : {progress.done} / {progress.total}
            </strong>
            <span className={styles.album} aria-label={`${progress.done} photos réussies`}>
              {PHOTO_STARS.map((id) => (
                <span
                  key={id}
                  className={completedPhotos.includes(id) ? styles.photoDone : styles.photoEmpty}
                  title={STARS[id].nameFr}
                >
                  {completedPhotos.includes(id) ? '✓' : '○'}
                </span>
              ))}
            </span>
          </p>
        ) : null}
        {fact ? (
          <p className={styles.fact} role="status">
            {fact}
          </p>
        ) : null}

        {showDistanceControls ? (
          <>
            <p className={styles.roundTitle}>
              {challengeActive
                ? `Photo ${Math.min(progress.done + 1, 3)}/3 — ${STARS[photoStar].nameFr}`
                : 'Distance pédagogique'}
            </p>
            <p className={styles.sliderLabel}>
              🔭 Distance : {Math.round(distanceAu)} — glisse vers « loin » pour reculer
            </p>
            <input
              className={styles.slider}
              type="range"
              min={challengeActive ? PHOTO_DISTANCE_MIN : APPARENT_DISTANCE_MIN}
              max={challengeActive ? PHOTO_DISTANCE_MAX : APPARENT_DISTANCE_MAX}
              step={1}
              value={distanceAu}
              onChange={(e) => setDistance(Number(e.target.value))}
              aria-label="Distance de l’étoile"
            />
            <div className={styles.rangeLegend} aria-hidden="true">
              <span>Proche</span>
              <span>Loin</span>
            </div>
            {challengeActive ? (
              <>
                <div className={styles.distanceActions}>
                  <button
                    type="button"
                    className={styles.moveBtn}
                    onClick={() => shiftDistance(-5)}
                  >
                    ← Rapprocher
                  </button>
                  <button type="button" className={styles.moveBtn} onClick={() => shiftDistance(5)}>
                    Éloigner →
                  </button>
                </div>
                <button type="button" className={styles.actionBtn} onClick={takePhoto}>
                  Prendre la photo
                </button>
              </>
            ) : null}
          </>
        ) : null}

        {roundOk ? (
          <p className={styles.ok} role="status">
            {roundOk}
          </p>
        ) : null}
        {roundHint ? (
          <p className={styles.hint} role="status">
            {roundHint}
          </p>
        ) : null}
        <p className={styles.note}>Maquette simplifiée · Bételgeuse : rayon estimé</p>
      </SceneControls>
    </div>
  );
}
