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
  PODIUM_STARS,
  SIZE_COMPARE_STARS,
  STARS,
  apparentAngularSize,
  clampApparentDistance,
  comparisonVisualRadius,
  isApparentSizeMatch,
  isPodiumOrderCorrect,
  observatoryProgress,
  radiusLabelFr,
  temperatureBandFr,
  type ObservatoryRound,
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

type SlotKey = 'small' | 'medium' | 'large';

const SLOT_ORDER: SlotKey[] = ['small', 'medium', 'large'];
const SLOT_LABEL: Record<SlotKey, string> = {
  small: 'Plus petite',
  medium: 'Au milieu',
  large: 'Plus grande',
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
  const [challengeRound, setChallengeRound] = useState<ObservatoryRound | null>(null);
  const [progressLabel, setProgressLabel] = useState('Observatoire : 0 / 2');
  const [selectedToken, setSelectedToken] = useState<StarId | null>(null);
  const [slots, setSlots] = useState<Partial<Record<SlotKey, StarId>>>({});
  const [roundHint, setRoundHint] = useState<string | null>(null);
  const [roundOk, setRoundOk] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [showReticle, setShowReticle] = useState(false);

  const runtimeRef = useRef<StarsSceneApi | null>(null);
  const hudRef = useRef<{
    setDistance: (value: number) => void;
    validateApparent: () => void;
    selectToken: (id: StarId) => void;
    placeToken: (slot: SlotKey) => void;
    validatePodium: () => void;
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
    let completed: ObservatoryRound[] = [];
    let round: ObservatoryRound | null = null;
    let podiumSlots: Partial<Record<SlotKey, StarId>> = {};
    let selected: StarId | null = null;

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

    const refreshProgressUi = () => {
      const progress = observatoryProgress(completed);
      setProgressLabel(`Observatoire : ${progress.done} / ${progress.total}`);
      if (progress.complete) {
        setCelebrating(true);
        setRoundOk('Observatoire activé !');
      }
    };

    const applyLayout = () => {
      hideAll();
      setShowReticle(false);
      setCelebrating(false);

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

      if (modeLocal === 'apparent' || (modeLocal === 'challenge' && round === 'apparent')) {
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

      if (modeLocal === 'challenge' && round === 'podium') {
        // Jetons de même taille : l’apparence ne trahit pas l’ordre réel.
        PODIUM_STARS.forEach((id, index) => {
          const x = (index - 1) * 2.05;
          showStar(id, new Vector3(x, 0.2, 0), 0.72);
        });
        setFact('Même taille affichée exprès : classe-les selon leur vraie taille.');
      }
    };

    const finishRound = (which: ObservatoryRound) => {
      if (!completed.includes(which)) completed = [...completed, which];
      refreshProgressUi();
      const star = stars.get(which === 'apparent' ? APPARENT_SIZE_STAR : 'sun');
      if (star?.root.isEnabled()) {
        playPlanetSuccessHalo(scene, star.root.position.clone(), star.root.scaling.x);
      }

      const progress = observatoryProgress(completed);
      if (progress.complete && !challengeDone) {
        challengeDone = true;
        setRoundHint(null);
        setCelebrating(true);
        onSuccessRef.current?.();
        return;
      }

      if (which === 'apparent') {
        round = 'podium';
        setChallengeRound('podium');
        setRoundOk('Manche 1 réussie — place les étoiles du plus petit au plus grand.');
        setRoundHint(null);
        podiumSlots = {};
        selected = null;
        setSlots({});
        setSelectedToken(null);
        applyLayout();
      }
    };

    const tryValidateApparent = () => {
      const size = apparentAngularSize(STARS[APPARENT_SIZE_STAR].radiusSolar, distance);
      if (isApparentSizeMatch(size)) {
        setRoundOk('Mire calée ! Une géante peut paraître petite si elle est loin.');
        finishRound('apparent');
        return;
      }
      const hint =
        size < APPARENT_TARGET
          ? 'Encore trop loin — rapproche un peu l’étoile.'
          : 'Encore trop près — éloigne un peu l’étoile.';
      setRoundOk(null);
      setRoundHint(hint);
      onMissRef.current?.(hint);
    };

    const tryValidatePodium = () => {
      const order = SLOT_ORDER.map((key) => podiumSlots[key]).filter(Boolean) as StarId[];
      if (order.length < 3) {
        const hint = 'Place une étoile dans chaque case.';
        setRoundHint(hint);
        onMissRef.current?.(hint);
        return;
      }
      if (isPodiumOrderCorrect(order)) {
        setRoundOk('Oui ! Du plus petit au plus grand.');
        finishRound('podium');
        return;
      }
      const hint = 'Pas encore — pense : naine rouge → Soleil → géante rouge.';
      setRoundOk(null);
      setRoundHint(hint);
      onMissRef.current?.(hint);
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
          round = null;
          setChallengeRound(null);
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
          round = 'apparent';
          modeLocal = 'challenge';
          distance = 55;
          podiumSlots = {};
          selected = null;
          setModeUi('challenge');
          setChallengeRound('apparent');
          setDistanceUi(distance);
          setSlots({});
          setSelectedToken(null);
          setRoundHint('Manche 1 : fais coïncider le disque avec la mire dorée.');
          setRoundOk(null);
          setCelebrating(false);
          refreshProgressUi();
          applyLayout();
        } else if (!enabled) {
          round = null;
          setChallengeRound(null);
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

      if (modeLocal === 'challenge' && round === 'podium') {
        selected = hit.id;
        setSelectedToken(hit.id);
        setRoundHint(`Jeton sélectionné : ${STARS[hit.id].nameFr}. Touche une case.`);
        return;
      }

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
        distance = clampApparentDistance(value);
        setDistanceUi(distance);
        applyLayout();
      },
      validateApparent: () => tryValidateApparent(),
      selectToken: (id: StarId) => {
        selected = id;
        setSelectedToken(id);
      },
      placeToken: (slot: SlotKey) => {
        if (!selected) {
          setRoundHint('Choisis d’abord une étoile (touche-la ou un jeton).');
          return;
        }
        const next: Partial<Record<SlotKey, StarId>> = { ...podiumSlots };
        for (const key of SLOT_ORDER) {
          if (next[key] === selected) delete next[key];
        }
        next[slot] = selected;
        podiumSlots = next;
        setSlots({ ...next });
        selected = null;
        setSelectedToken(null);
        setRoundHint(null);
      },
      validatePodium: () => tryValidatePodium(),
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

  const validateApparent = () => {
    hudRef.current?.validateApparent();
  };

  const selectToken = (id: StarId) => {
    setSelectedToken(id);
    hudRef.current?.selectToken(id);
  };

  const placeToken = (slot: SlotKey) => {
    hudRef.current?.placeToken(slot);
  };

  const validatePodium = () => {
    hudRef.current?.validatePodium();
  };

  const showApparentControls = mode === 'apparent' || challengeRound === 'apparent';
  const showPodiumControls = challengeRound === 'podium';

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        mobileFovScale={1.55}
        onSceneReady={onSceneReady}
      />
      {showReticle ? <div className={styles.reticle} aria-hidden="true" /> : null}
      {celebrating ? <p className={styles.celebrate}>Observatoire activé</p> : null}
      <SceneControls className={styles.hud}>
        {challengeRound ? (
          <p className={styles.progress}>
            <strong>{progressLabel}</strong>
          </p>
        ) : null}
        {fact ? (
          <p className={styles.fact} role="status">
            {fact}
          </p>
        ) : null}

        {showApparentControls ? (
          <>
            <p className={styles.roundTitle}>
              {challengeRound === 'apparent'
                ? 'Manche 1 — Mire télescopique'
                : 'Distance pédagogique'}
            </p>
            <p className={styles.sliderLabel}>
              Distance : {Math.round(distanceAu)} (plus grand = plus loin)
            </p>
            <input
              className={styles.slider}
              type="range"
              min={APPARENT_DISTANCE_MIN}
              max={APPARENT_DISTANCE_MAX}
              step={1}
              value={distanceAu}
              onChange={(e) => setDistance(Number(e.target.value))}
              aria-label="Distance de l’étoile"
            />
            {challengeRound === 'apparent' ? (
              <button type="button" className={styles.actionBtn} onClick={validateApparent}>
                Valider la mire
              </button>
            ) : null}
          </>
        ) : null}

        {showPodiumControls ? (
          <>
            <p className={styles.roundTitle}>Manche 2 — Podium des tailles</p>
            <div className={styles.tokenRow} role="group" aria-label="Jetons d’étoiles">
              {PODIUM_STARS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={styles.tokenBtn}
                  aria-pressed={selectedToken === id}
                  onClick={() => selectToken(id)}
                >
                  {STARS[id].nameFr}
                </button>
              ))}
            </div>
            <div className={styles.slotRow} role="group" aria-label="Cases du podium">
              {SLOT_ORDER.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={styles.slotBtn}
                  onClick={() => placeToken(slot)}
                >
                  <strong>{SLOT_LABEL[slot]}</strong>
                  {slots[slot] ? STARS[slots[slot]!].nameFr : '—'}
                </button>
              ))}
            </div>
            <button type="button" className={styles.actionBtn} onClick={validatePodium}>
              Valider le podium
            </button>
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
