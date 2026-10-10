'use client';

import { SceneControls } from '@/components/layout/SceneControls';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcRotateCamera, Color3, PointerEventTypes, Vector3 } from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi } from '@/3d/controls/missionCamera';
import {
  captureCameraHome,
  configureMissionCamera,
  createMissionCameraApi,
} from '@/3d/controls/missionCamera';
import { createStarMesh, type StarMesh } from '@/3d/entities/createStarMesh';
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
import {
  sampleStarCinematic,
  STAR_FILM_CHAPTERS,
  STAR_FILM_DURATION,
} from '@/3d/utils/starCinematic';
import styles from './StarsScene.module.css';
import cinemaStyles from '@/components/layout/CinematicOverlay.module.css';

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
  onCinematicPlaying?: (playing: boolean) => void;
};

/** Scène Mission 08 — Soleil comme étoile, tailles, couleurs, taille apparente, défi observatoire. */
export function StarsScene({
  className,
  fill = false,
  onSceneApi,
  onObservatorySuccess,
  onObservatoryMiss,
  onCinematicPlaying,
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

  const [film, setFilm] = useState<'playing' | 'paused' | 'finished' | null>(null);
  const [filmChapter, setFilmChapter] = useState(0);
  const [reducedFilm, setReducedFilm] = useState(false);
  const filmRef = useRef<{
    play: () => void;
    pause: () => void;
    finish: () => void;
    next: () => void;
  } | null>(null);

  const runtimeRef = useRef<StarsSceneApi | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    onCinematicPlaying?.(film === 'playing' || film === 'paused');
  }, [film, onCinematicPlaying]);

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
    let factPinned = false;
    let challenge = false;
    let challengeDone = false;
    let pickEnabled = true;
    let distance = 55;
    let currentPhotoIndex = 0;
    let completed: StarId[] = [];
    let flashTimer: number | null = null;
    let startFilm = () => {};
    let filmVisible = false;

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
      star.setRadius(radius);
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
        const surfaceGap = 0.55;
        const radii = SIZE_COMPARE_STARS.map((id) => comparisonVisualRadius(STARS[id].radiusSolar));
        const totalWidth =
          radii.reduce((sum, radius) => sum + radius * 2, 0) + surfaceGap * (radii.length - 1);
        let cursor = -totalWidth / 2;
        SIZE_COMPARE_STARS.forEach((id, index) => {
          const radius = radii[index]!;
          const x = cursor + radius;
          showStar(id, new Vector3(x, 0, 0), radius);
          cursor += radius * 2 + surfaceGap;
        });
        if (!factPinned) {
          setFact(
            'Proxima est plus petite que le Soleil, Bételgeuse bien plus grande. Tailles simplifiées ici.',
          );
        }
        return;
      }

      if (modeLocal === 'colors') {
        const spacing = 2.1;
        COLOR_COMPARE_STARS.forEach((id, index) => {
          const x = (index - 1) * spacing;
          showStar(id, new Vector3(x, 0, 0), 0.85);
        });
        if (!factPinned) {
          setFact(
            'Rouge = plus froide · Bleutée = plus chaude. K : kelvins, pour mesurer la température.',
          );
        }
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
          `${STARS[starId].nameFr} · distance dans la maquette : ${Math.round(distance)} · ${
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
          `${STARS[starId].nameFr} · ${radiusLabelFr(
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
        startFilm();
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
    // Vue orthogonale à l’axe horizontal des comparaisons : les centres des
    // étoiles gardent ainsi exactement le même entraxe à l’écran.
    camera.alpha = -Math.PI / 2;
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

    let filmTime = 0;
    let filmPaused = false;
    let filmFinished = false;
    let announcedChapter = -1;
    let filmHome: ReturnType<typeof captureCameraHome> | null = null;
    const originalUpperLimit = camera.upperRadiusLimit;
    const reducedMotion = prefersReducedMotion();
    const renderFilm = () => {
      const frame = sampleStarCinematic(filmTime);
      hideAll();
      frame.stars.forEach(({ id, position }) => {
        const star = stars.get(id)!;
        star.root.setEnabled(true);
        star.root.position.copyFromFloats(...position);
      });
      camera.setTarget(Vector3.FromArray(frame.target));
      camera.setPosition(Vector3.FromArray(frame.camera));
      if (announcedChapter !== frame.chapter) {
        announcedChapter = frame.chapter;
        setFilmChapter(frame.chapter);
      }
    };
    const finishFilm = () => {
      if (!filmVisible || filmFinished) return;
      filmTime = STAR_FILM_DURATION;
      renderFilm();
      filmFinished = true;
      setFilm('finished');
      onSuccessRef.current?.();
    };
    const cancelFilm = () => {
      if (!filmVisible) return;
      filmVisible = false;
      setFilm(null);
      camera.upperRadiusLimit = originalUpperLimit;
      if (filmHome) {
        camera.setTarget(filmHome.target);
        camera.alpha = filmHome.alpha;
        camera.beta = filmHome.beta;
        camera.radius = filmHome.radius;
      }
      camera.attachControl(engine.getRenderingCanvas(), true);
    };
    startFilm = () => {
      if (!filmVisible) filmHome = captureCameraHome(camera);
      if (flashTimer != null) window.clearTimeout(flashTimer);
      filmVisible = true;
      filmTime = 0;
      sampleStarCinematic(0).stars.forEach(({ id, radius }) => stars.get(id)!.setRadius(radius));
      filmPaused = reducedMotion;
      filmFinished = false;
      announcedChapter = -1;
      scene.stopAnimation(camera);
      camera.detachControl();
      camera.inertialAlphaOffset = camera.inertialBetaOffset = camera.inertialRadiusOffset = 0;
      camera.inertialPanningX = camera.inertialPanningY = 0;
      camera.upperRadiusLimit = 100;
      setShowReticle(false);
      setCelebrating(false);
      setRoundOk(null);
      setRoundHint(null);
      setReducedFilm(reducedMotion);
      setFilm(reducedMotion ? 'paused' : 'playing');
      renderFilm();
    };
    filmRef.current = {
      play: startFilm,
      finish: finishFilm,
      pause: () => {
        filmPaused = !filmPaused;
        setFilm(filmPaused ? 'paused' : 'playing');
      },
      next: () => {
        const next = announcedChapter + 1;
        if (next >= STAR_FILM_CHAPTERS.length) {
          finishFilm();
          return;
        }
        // Reduced-motion version uses settled tableaux, without travelling shots.
        filmTime = STAR_FILM_CHAPTERS[next]!.tableau;
        renderFilm();
      },
    };
    const filmObserver = scene.onBeforeRenderObservable.add(() => {
      if (!filmVisible || filmPaused || filmFinished || document.hidden) return;
      filmTime += Math.min(engine.getDeltaTime() / 1000, 0.05);
      renderFilm();
      if (filmTime >= STAR_FILM_DURATION) finishFilm();
    });

    const api: StarsSceneApi = {
      camera: {
        ...cameraApi,
        recenter: () => (filmVisible ? Promise.resolve() : cameraApi.recenter()),
        focusOn: (node, meshes) =>
          filmVisible ? Promise.resolve() : cameraApi.focusOn(node, meshes),
      },
      setMode: (next) => {
        if (next === modeLocal) return;
        cancelFilm();
        factPinned = false;
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
          cancelFilm();
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
          cancelFilm();
          setChallengeActive(false);
          setShowReticle(modeLocal === 'apparent');
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
      if (!pickEnabled || filmVisible) return;
      if (info.type !== PointerEventTypes.POINTERPICK) return;
      const mesh = info.pickInfo?.pickedMesh;
      if (!mesh) return;
      const hit = Array.from(stars.values()).find(
        (star) => star.root === mesh || mesh.isDescendantOf(star.root),
      );
      if (!hit) return;

      if (modeLocal === 'colors') {
        factPinned = true;
        setFact(
          `${STARS[hit.id].nameFr} · ${STARS[hit.id].colorLabelFr} · ${temperatureBandFr(
            STARS[hit.id].temperatureK,
          )} (≈ ${STARS[hit.id].temperatureK} K)`,
        );
        return;
      }

      if (modeLocal === 'sizes' || modeLocal === 'explore' || modeLocal === 'sun') {
        factPinned = true;
        setFact(
          `${STARS[hit.id].nameFr} · ${radiusLabelFr(STARS[hit.id].radiusSolar)}${
            STARS[hit.id].estimateNote ? ` · ${STARS[hit.id].estimateNote}` : ''
          }`,
        );
      }
    });

    hudRef.current = {
      setDistance: (value: number) => {
        if (filmVisible) return;
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
        if (filmVisible) return;
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

    // La mire suit exactement la projection du rayon cible (1,05 unité).
    // Elle reste donc cohérente avec le seuil sur PC, mobile, orientation et zoom.
    const reticleObserver = scene.onBeforeRenderObservable.add(() => {
      const reticle = reticleRef.current;
      const canvas = engine.getRenderingCanvas();
      if (!reticle || !canvas) return;
      const viewHeight = Math.max(1, canvas.clientHeight * camera.viewport.height);
      const targetRadius = 1.05;
      const cameraDistance = Math.max(targetRadius + 0.01, camera.radius);
      const projectedDiameter =
        (viewHeight * targetRadius) /
        (Math.sqrt(cameraDistance * cameraDistance - targetRadius * targetRadius) *
          Math.tan(camera.fov / 2));
      reticle.style.setProperty(
        '--reticle-size',
        `${Math.max(48, Math.min(280, projectedDiameter))}px`,
      );
    });

    // Soft pulse on glow (reduced motion = skip)
    let pulseT = 0;
    const pulseObs =
      quality !== 'high' || prefersReducedMotion()
        ? null
        : scene.onBeforeRenderObservable.add(() => {
            if (document.documentElement.dataset.uiMotion !== 'full' || document.hidden) return;
            pulseT += engine.getDeltaTime() * 0.001;
            const a = 0.7 + 0.035 * Math.sin(pulseT * 0.8);
            stars.forEach((star) => {
              if (star.root.isEnabled()) star.glowMat.alpha = a;
            });
          });

    return () => {
      perf.dispose();
      scene.onBeforeRenderObservable.remove(filmObserver);
      filmRef.current = null;
      if (flashTimer != null) window.clearTimeout(flashTimer);
      scene.onBeforeRenderObservable.remove(reticleObserver);
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

  const showDistanceControls = !film && (mode === 'apparent' || challengeActive);
  const showProfilePip = !film && (mode === 'apparent' || challengeActive);
  const progress = photoProgress(completedPhotos);
  const profileStarId = challengeActive ? photoStar : APPARENT_SIZE_STAR;
  const profileDistanceMin = challengeActive ? PHOTO_DISTANCE_MIN : APPARENT_DISTANCE_MIN;
  const profileDistanceMax = challengeActive ? PHOTO_DISTANCE_MAX : APPARENT_DISTANCE_MAX;
  const telescopePosition =
    28 + ((distanceAu - profileDistanceMin) / (profileDistanceMax - profileDistanceMin)) * 62;
  const profileStarRadius = comparisonVisualRadius(STARS[profileStarId].radiusSolar);
  const profileStarSize = 2.5 + ((profileStarRadius - 0.28) / 1.55) * 2.8;
  const profileColor = STARS[profileStarId].color;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        mobileFovScale={1.55}
        onSceneReady={onSceneReady}
      />
      <div
        className={`${styles.profilePip} ${showProfilePip ? styles.profilePipVisible : ''}`}
        aria-hidden={!showProfilePip}
      >
        <div className={styles.profilePipChrome}>
          <p>Vue de profil</p>
          <strong>{STARS[profileStarId].nameFr}</strong>
          <span>Étoile ← distance → télescope</span>
        </div>
        <div className={styles.profileModel}>
          <div
            className={styles.profileStar}
            style={{
              width: `${profileStarSize}rem`,
              height: `${profileStarSize}rem`,
              background: `rgb(${profileColor.r * 255} ${profileColor.g * 255} ${
                profileColor.b * 255
              })`,
              color: `rgb(${profileColor.r * 255} ${profileColor.g * 255} ${profileColor.b * 255})`,
            }}
          />
          <div className={styles.profileRail} />
          <div
            className={styles.profileDistance}
            style={{ width: `${Math.max(6, telescopePosition - 19)}%` }}
          />
          <div className={styles.profileTelescope} style={{ left: `${telescopePosition}%` }}>
            <div className={styles.profileTube} />
            <div className={styles.profileStand} />
          </div>
        </div>
      </div>
      {showReticle ? <div ref={reticleRef} className={styles.reticle} aria-hidden="true" /> : null}
      {flashKey > 0 ? (
        <div key={flashKey} className={styles.photoFlash} aria-hidden="true" />
      ) : null}
      {celebrating ? <p className={styles.celebrate}>Observatoire activé</p> : null}
      {film ? (
        <section className={cinemaStyles.cinema} aria-label="Le ballet des distances">
          <div className={cinemaStyles.cinemaCaption} aria-live="polite" aria-atomic="true">
            <span>
              {film === 'finished'
                ? 'Album complet'
                : `Le ballet des distances · ${filmChapter + 1} / 4`}
            </span>
            <h2>{STAR_FILM_CHAPTERS[filmChapter]!.title}</h2>
            <p>{STAR_FILM_CHAPTERS[filmChapter]!.text}</p>
          </div>
          <div className={cinemaStyles.cinemaFooter}>
            <p>Tailles fixes pendant le film. Maquette simplifiée.</p>
            <div>
              {film === 'finished' ? (
                <button type="button" onClick={() => filmRef.current?.play()}>
                  Revoir le voyage
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      reducedFilm ? filmRef.current?.next() : filmRef.current?.pause()
                    }
                  >
                    {reducedFilm ? 'Étape suivante' : film === 'paused' ? 'Reprendre' : 'Pause'}
                  </button>
                  <button type="button" onClick={() => filmRef.current?.finish()}>
                    Passer
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      ) : null}
      {!film ? (
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
                  : 'Distance dans la maquette'}
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
                    <button
                      type="button"
                      className={styles.moveBtn}
                      onClick={() => shiftDistance(5)}
                    >
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
          <p className={styles.note}>
            {mode === 'colors'
              ? 'Disques de même taille pour comparer les couleurs · Températures en kelvins (K)'
              : 'Maquette simplifiée · Bételgeuse : taille estimée'}
          </p>
        </SceneControls>
      ) : null}
    </div>
  );
}
