'use client';

import { SceneControls } from '@/components/layout/SceneControls';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Constants,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
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
  PRISM_TARGETS,
  PRISM_TARGET_TEMP_K,
  TEMP_MAX_K,
  TEMP_MIN_K,
  TEMP_STEP_K,
  clampTemperatureK,
  isPrismMatch,
  peakPosition01,
  peakWavelengthNm,
  prismHint,
  prismProgress,
  rgbCss,
  sampleSpectrumCurve,
  starLightTargetFact,
  starLightTargetNameFr,
  temperatureLabelFr,
  temperatureToRgb,
  thermalBand,
  thermalBandLabelFr,
  type StarLightSceneMode,
  type StarLightTargetId,
} from '@/content/bodies/stellarLight';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { logger } from '@/lib/logger';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './StarLightScene.module.css';

export type StarLightSceneApi = {
  camera: MissionCameraApi;
  setMode: (mode: StarLightSceneMode) => void;
  setChallengeEnabled: (enabled: boolean) => void;
  setTemperatureK: (temperatureK: number) => void;
};

type StarLightSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: StarLightSceneApi) => void;
  onPrismSuccess?: () => void;
  onPrismMiss?: (hint: string) => void;
};

const SPECTRUM_COLORS = [
  '#6b2dff',
  '#0040ff',
  '#00a8ff',
  '#00e0a0',
  '#a8e000',
  '#ffe000',
  '#ff8a00',
  '#ff2a2a',
];

function SpectrumPanel({
  temperatureK,
  compact,
}: {
  temperatureK: number;
  compact?: boolean;
}) {
  const curve = useMemo(() => sampleSpectrumCurve(temperatureK, compact ? 28 : 40), [
    temperatureK,
    compact,
  ]);
  const peakX = peakPosition01(temperatureK);
  const peakNm = Math.round(peakWavelengthNm(temperatureK));
  const w = 320;
  const h = compact ? 88 : 110;
  const pad = 8;
  const bandY = pad;
  const bandH = 18;
  const chartTop = bandY + bandH + 10;
  const chartH = h - chartTop - pad;
  const points = curve
    .map((p, i) => {
      const x = pad + ((p.wavelengthNm - 380) / (750 - 380)) * (w - pad * 2);
      const y = chartTop + chartH * (1 - p.intensity);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const peakPx = pad + peakX * (w - pad * 2);

  return (
    <div className={styles.spectrumPanel} aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${h}`} className={styles.spectrumSvg} role="img">
        <defs>
          <linearGradient id="starlight-rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            {SPECTRUM_COLORS.map((color, i) => (
              <stop
                key={color}
                offset={`${(i / (SPECTRUM_COLORS.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        </defs>
        <rect
          x={pad}
          y={bandY}
          width={w - pad * 2}
          height={bandH}
          rx={4}
          fill="url(#starlight-rainbow)"
          opacity={0.95}
        />
        <path d={points} fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth={2.2} />
        <line
          x1={peakPx}
          y1={bandY}
          x2={peakPx}
          y2={h - pad}
          stroke="rgba(255, 230, 140, 0.95)"
          strokeWidth={1.6}
          strokeDasharray="3 3"
        />
        <circle cx={peakPx} cy={chartTop + chartH * 0.08} r={4} fill="#ffe68a" />
      </svg>
      <p className={styles.spectrumCaption}>
        Pic ≈ {peakNm} nm · {temperatureLabelFr(temperatureK)}
      </p>
    </div>
  );
}

function TargetCard({ targetId }: { targetId: StarLightTargetId }) {
  const temp = PRISM_TARGET_TEMP_K[targetId];
  const rgb = temperatureToRgb(temp);
  const band = thermalBandLabelFr(thermalBand(temp));
  const silhouette = sampleSpectrumCurve(temp, 20);
  const path = silhouette
    .map((p, i) => {
      const x = (i / (silhouette.length - 1)) * 100;
      const y = 28 - p.intensity * 22;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className={styles.targetCard}>
      <div
        className={styles.targetSwatch}
        style={{ background: rgbCss(rgb), boxShadow: `0 0 16px ${rgbCss(rgb)}` }}
      />
      <div className={styles.targetMeta}>
        <strong>{starLightTargetNameFr(targetId)}</strong>
        <span>Étoile {band}</span>
        <svg className={styles.targetSilhouette} viewBox="0 0 100 32" aria-hidden="true">
          <path d={path} fill="none" stroke="rgba(230,236,255,0.85)" strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
}

/** Scène Mission 09 — laboratoire du prisme (couleur, spectre, défi). */
export function StarLightScene({
  className,
  fill = false,
  onSceneApi,
  onPrismSuccess,
  onPrismMiss,
}: StarLightSceneProps) {
  const [mode, setModeUi] = useState<StarLightSceneMode>('intro');
  const [temperatureK, setTemperatureUi] = useState(5800);
  const [challengeActive, setChallengeActive] = useState(false);
  const [targetId, setTargetId] = useState<StarLightTargetId>('proxima');
  const [completed, setCompleted] = useState<StarLightTargetId[]>([]);
  const [roundHint, setRoundHint] = useState<string | null>(null);
  const [roundOk, setRoundOk] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [fact, setFact] = useState<string | null>(
    'Bouge le curseur : la couleur change avec la température.',
  );

  const runtimeRef = useRef<StarLightSceneApi | null>(null);
  const hudRef = useRef<{
    setTemperature: (value: number) => void;
    validate: () => void;
  } | null>(null);
  const onSceneApiRef = useRef(onSceneApi);
  const onSuccessRef = useRef(onPrismSuccess);
  const onMissRef = useRef(onPrismMiss);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onSuccessRef.current = onPrismSuccess;
  }, [onPrismSuccess]);
  useEffect(() => {
    onMissRef.current = onPrismMiss;
  }, [onPrismMiss]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.2,
      sunIntensity: 0.25,
      contrast: 1.05,
      hemiDiffuse: new Color3(0.22, 0.26, 0.34),
      hemiGround: new Color3(0.02, 0.03, 0.04),
    });

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.68 : 0.8,
      segments: quality === 'low' ? 24 : 48,
    });

    let modeLocal: StarLightSceneMode = 'intro';
    let temperature = 5800;
    let challenge = false;
    let challengeDone = false;
    let currentTargetIndex = 0;
    let completedLocal: StarLightTargetId[] = [];
    let prismLit = false;

    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('StarLightScene: caméra ArcRotate attendue');
      return;
    }
    camera.setTarget(new Vector3(0.55, 0.2, 0));
    camera.alpha = -Math.PI / 2.05;
    camera.beta = 1.18;
    camera.radius = 9.2;
    camera.lowerRadiusLimit = 4.8;
    camera.upperRadiusLimit = 15;
    camera.lowerBetaLimit = 0.35;
    camera.upperBetaLimit = Math.PI - 0.35;
    configureMissionCamera(camera);
    const home = captureCameraHome(camera);
    const cameraApi = createMissionCameraApi(camera, home);

    // —— Lab star (color mutable, no surface texture) ——
    const starRoot = MeshBuilder.CreateSphere(
      'lab-star',
      { diameter: 2, segments: quality === 'low' ? 24 : 40 },
      scene,
    );
    starRoot.position = new Vector3(-3.2, 0.3, 0);
    const starMat = new StandardMaterial('lab-star-mat', scene);
    starMat.disableLighting = true;
    starMat.diffuseColor = Color3.Black();
    starMat.specularColor = Color3.Black();
    starMat.emissiveColor = new Color3(1, 0.86, 0.45);
    starRoot.material = starMat;
    starRoot.scaling.setAll(1.05);

    const glowTex = new DynamicTexture('lab-glow-tex', 256, scene, false);
    const paintGlow = (r: number, g: number, b: number) => {
      const ctx = glowTex.getContext();
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      const stop = (offset: number, bright: number, alpha: number) => {
        gradient.addColorStop(
          offset,
          `rgba(${Math.round(r * bright * 255)},${Math.round(g * bright * 255)},${Math.round(
            b * bright * 255,
          )},${alpha})`,
        );
      };
      stop(0, 1, 0.75);
      stop(0.45, 1, 0.55);
      stop(0.62, 0.45, 0.18);
      stop(1, 0, 0);
      ctx.clearRect(0, 0, 256, 256);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      glowTex.hasAlpha = true;
      glowTex.update();
    };
    paintGlow(1, 0.86, 0.45);

    const glow = MeshBuilder.CreatePlane('lab-glow', { size: 4.2 }, scene);
    glow.parent = starRoot;
    glow.billboardMode = Mesh.BILLBOARDMODE_ALL;
    glow.isPickable = false;
    const glowMat = new StandardMaterial('lab-glow-mat', scene);
    glowMat.disableLighting = true;
    glowMat.emissiveColor = Color3.Black();
    glowMat.emissiveTexture = glowTex;
    glowMat.opacityTexture = glowTex;
    glowMat.alpha = 0.72;
    glowMat.alphaMode = Constants.ALPHA_ADD;
    glowMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
    glowMat.disableDepthWrite = true;
    glowMat.backFaceCulling = false;
    glow.material = glowMat;

    // —— Beam (white light toward prism) ——
    const beam = MeshBuilder.CreateCylinder(
      'lab-beam',
      { height: 3.4, diameter: 0.12, tessellation: 12 },
      scene,
    );
    beam.rotation.z = Math.PI / 2;
    beam.position = new Vector3(-1.15, 0.3, 0);
    const beamMat = new StandardMaterial('lab-beam-mat', scene);
    beamMat.disableLighting = true;
    beamMat.emissiveColor = new Color3(0.95, 0.96, 1);
    beamMat.alpha = 0.55;
    beamMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
    beamMat.disableDepthWrite = true;
    beam.material = beamMat;
    beam.isPickable = false;

    // —— Prism (triangular extrusion) ——
    const prism = MeshBuilder.CreateCylinder(
      'lab-prism',
      { diameter: 1.15, height: 1.35, tessellation: 3 },
      scene,
    );
    prism.position = new Vector3(0.55, 0.3, 0);
    prism.rotation.y = Math.PI / 6;
    prism.rotation.z = Math.PI / 2;
    const prismMat = new StandardMaterial('lab-prism-mat', scene);
    prismMat.diffuseColor = new Color3(0.55, 0.75, 0.95);
    prismMat.specularColor = new Color3(0.8, 0.9, 1);
    prismMat.emissiveColor = new Color3(0.08, 0.12, 0.18);
    prismMat.alpha = 0.55;
    prismMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
    prismMat.backFaceCulling = false;
    prism.material = prismMat;
    prism.isPickable = false;

    // —— Rainbow fan ——
    const fanRoot = new TransformNode('lab-fan', scene);
    fanRoot.position = new Vector3(1.35, 0.3, 0);
    const fanPlanes: Mesh[] = [];
    const fanMats: StandardMaterial[] = [];
    const fanCount = quality === 'low' ? 5 : 7;
    for (let i = 0; i < fanCount; i += 1) {
      const t = i / (fanCount - 1);
      const plane = MeshBuilder.CreatePlane(`fan-${i}`, { width: 2.4, height: 0.28 }, scene);
      plane.parent = fanRoot;
      plane.position = new Vector3(1.15, (t - 0.5) * 1.35, 0);
      plane.rotation.z = (t - 0.5) * 0.55;
      plane.isPickable = false;
      const mat = new StandardMaterial(`fan-mat-${i}`, scene);
      mat.disableLighting = true;
      const stops = [
        [0.42, 0.18, 1],
        [0.05, 0.45, 1],
        [0.05, 0.9, 0.85],
        [0.35, 0.95, 0.2],
        [0.95, 0.9, 0.1],
        [1, 0.55, 0.05],
        [1, 0.2, 0.12],
      ];
      const c = stops[Math.min(stops.length - 1, Math.round(t * (stops.length - 1)))]!;
      mat.emissiveColor = new Color3(c[0]!, c[1]!, c[2]!);
      mat.alpha = 0.35;
      mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
      mat.disableDepthWrite = true;
      plane.material = mat;
      fanPlanes.push(plane);
      fanMats.push(mat);
    }

    const applyTemperature = (nextK: number) => {
      temperature = clampTemperatureK(nextK);
      const rgb = temperatureToRgb(temperature);
      starMat.emissiveColor = new Color3(rgb.r, rgb.g, rgb.b);
      paintGlow(rgb.r, rgb.g, rgb.b);
      setTemperatureUi(temperature);

      const band = thermalBand(temperature);
      if (modeLocal === 'color' || modeLocal === 'intro') {
        setFact(
          `Étoile ${thermalBandLabelFr(band)} · ${temperatureLabelFr(temperature)} · couleur mise à jour`,
        );
      } else if (modeLocal === 'spectrum' || modeLocal === 'lab' || modeLocal === 'explore') {
        setFact(
          `Pic ≈ ${Math.round(peakWavelengthNm(temperature))} nm · ${temperatureLabelFr(temperature)}`,
        );
      }

      // Intensity of fan follows peak position (highlight dominant band)
      const peak = peakPosition01(temperature);
      fanMats.forEach((mat, i) => {
        const center = i / Math.max(1, fanCount - 1);
        const dist = Math.abs(center - peak);
        const base = prismLit ? 0.55 : modeLocal === 'intro' ? 0.12 : 0.28;
        mat.alpha = Math.min(0.92, base + (1 - Math.min(1, dist * 2.2)) * 0.55);
      });
      beamMat.alpha = modeLocal === 'intro' ? 0.25 : prismLit ? 0.85 : 0.55;
      prismMat.emissiveColor = prismLit
        ? new Color3(0.35, 0.55, 0.9)
        : new Color3(0.08, 0.12, 0.18);
    };

    const applyModeVisibility = () => {
      const showOptics =
        modeLocal === 'spectrum' ||
        modeLocal === 'lab' ||
        modeLocal === 'compare' ||
        modeLocal === 'challenge' ||
        modeLocal === 'explore';
      beam.setEnabled(showOptics || modeLocal === 'color');
      prism.setEnabled(showOptics);
      fanRoot.setEnabled(showOptics);
      beamMat.alpha = modeLocal === 'color' ? 0.35 : modeLocal === 'intro' ? 0.2 : 0.55;

      if (modeLocal === 'intro' || modeLocal === 'color') {
        setFact('Bouge le curseur : plus froide → plus rouge ; plus chaude → plus bleue.');
      } else if (modeLocal === 'spectrum') {
        setFact('Le prisme étale la lumière : le pic se déplace avec la température.');
      } else if (modeLocal === 'lab') {
        setFact('Laboratoire libre — raies d’absorption omises volontairement.');
      } else if (modeLocal === 'compare') {
        setFact('Repères : Proxima (froide), Soleil (moyenne), Sirius A (chaude).');
      } else if (modeLocal === 'explore') {
        setFact('Explore encore le laboratoire du prisme.');
      }
      applyTemperature(temperature);
    };

    const startChallengeRound = (index: number) => {
      currentTargetIndex = index;
      const id = PRISM_TARGETS[index]!;
      setTargetId(id);
      setRoundOk(null);
      setRoundHint(
        `Commande ${index + 1}/3 : règle ${starLightTargetNameFr(id)} (${
          thermalBandLabelFr(thermalBand(PRISM_TARGET_TEMP_K[id]))
        }).`,
      );
      setFact(starLightTargetFact(id));
      applyTemperature(temperature);
    };

    const validate = () => {
      if (!challenge || challengeDone) return;
      const id = PRISM_TARGETS[currentTargetIndex]!;
      if (!isPrismMatch(temperature, id)) {
        const hint = prismHint(temperature, id);
        setRoundHint(hint);
        setRoundOk(null);
        onMissRef.current?.(hint);
        return;
      }

      if (!completedLocal.includes(id)) {
        completedLocal = [...completedLocal, id];
        setCompleted(completedLocal);
      }
      playPlanetSuccessHalo(scene, starRoot.position, 1.1);
      const progress = prismProgress(completedLocal);
      setRoundOk(`${starLightTargetNameFr(id)} validé · ${progress.done}/${progress.total}`);

      if (progress.complete) {
        challengeDone = true;
        prismLit = true;
        setCelebrating(true);
        applyTemperature(temperature);
        setRoundHint('Prisme activé — les trois commandes sont réussies !');
        onSuccessRef.current?.();
        return;
      }

      startChallengeRound(currentTargetIndex + 1);
    };

    const api: StarLightSceneApi = {
      camera: cameraApi,
      setMode: (next) => {
        modeLocal = next;
        setModeUi(next);
        if (next !== 'challenge') {
          challenge = false;
          setChallengeActive(false);
          setRoundHint(null);
          setRoundOk(null);
          if (!challengeDone) {
            prismLit = false;
            setCelebrating(false);
          }
        }
        applyModeVisibility();
      },
      setChallengeEnabled: (enabled) => {
        const changed = challenge !== enabled;
        challenge = enabled;
        if (enabled && changed) {
          challengeDone = false;
          prismLit = false;
          completedLocal = [];
          currentTargetIndex = 0;
          modeLocal = 'challenge';
          setModeUi('challenge');
          setChallengeActive(true);
          setCompleted([]);
          setCelebrating(false);
          temperature = 5800;
          applyModeVisibility();
          startChallengeRound(0);
        } else if (!enabled) {
          setChallengeActive(false);
          if (modeLocal === 'challenge') {
            modeLocal = 'explore';
            setModeUi('explore');
            applyModeVisibility();
          }
        }
      },
      setTemperatureK: (value) => {
        applyTemperature(value);
        if (challenge && !challengeDone) {
          setRoundHint(prismHint(temperature, PRISM_TARGETS[currentTargetIndex]!));
          setRoundOk(null);
        }
      },
    };
    runtimeRef.current = api;
    onSceneApiRef.current?.(api);

    hudRef.current = {
      setTemperature: (value) => {
        api.setTemperatureK(value);
      },
      validate,
    };

    applyModeVisibility();

    const perf = startPerfMonitor(scene, { label: 'mission-09-stellar-light' });

    let pulseT = 0;
    const pulseObs =
      quality !== 'high' || prefersReducedMotion()
        ? null
        : scene.onBeforeRenderObservable.add(() => {
            if (document.documentElement.dataset.uiMotion !== 'full' || document.hidden) return;
            pulseT += engine.getDeltaTime() * 0.001;
            glowMat.alpha = 0.62 + 0.08 * Math.sin(pulseT * 0.9);
          });

    return () => {
      perf.dispose();
      if (pulseObs) scene.onBeforeRenderObservable.remove(pulseObs);
      fanPlanes.forEach((p) => p.dispose());
      fanMats.forEach((m) => m.dispose());
      fanRoot.dispose();
      starRoot.dispose();
      starMat.dispose();
      glow.dispose();
      glowMat.dispose();
      glowTex.dispose();
      beam.dispose();
      beamMat.dispose();
      prism.dispose();
      prismMat.dispose();
      background.dispose();
      lighting.dispose();
      hudRef.current = null;
      runtimeRef.current = null;
    };
  }, []);

  const setTemperature = (value: number) => {
    setTemperatureUi(value);
    hudRef.current?.setTemperature(value);
  };

  const validate = () => {
    hudRef.current?.validate();
  };

  const progress = prismProgress(completed);
  const showSpectrum =
    mode === 'spectrum' ||
    mode === 'lab' ||
    mode === 'compare' ||
    mode === 'challenge' ||
    mode === 'explore';
  const showTempSlider = mode !== 'intro' || challengeActive;
  const rgb = temperatureToRgb(temperatureK);

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        mobileFovScale={1.45}
        onSceneReady={onSceneReady}
      />
      {celebrating ? <p className={styles.celebrate}>Prisme activé</p> : null}

      {showSpectrum ? (
        <div className={styles.spectrumDock}>
          <SpectrumPanel temperatureK={temperatureK} compact={challengeActive} />
        </div>
      ) : null}

      <SceneControls className={styles.hud}>
        {challengeActive ? (
          <>
            <p className={styles.progress}>
              <strong>
                Commandes : {progress.done} / {progress.total}
              </strong>
              <span className={styles.album} aria-label={`${progress.done} réglages réussis`}>
                {PRISM_TARGETS.map((id) => (
                  <span
                    key={id}
                    className={completed.includes(id) ? styles.photoDone : styles.photoEmpty}
                    title={starLightTargetNameFr(id)}
                  >
                    {completed.includes(id) ? '✓' : '○'}
                  </span>
                ))}
              </span>
            </p>
            <p className={styles.roundTitle}>
              Cible {Math.min(progress.done + 1, 3)}/3 — {starLightTargetNameFr(targetId)}
            </p>
            <TargetCard targetId={targetId} />
          </>
        ) : null}

        {fact ? (
          <p className={styles.fact} role="status">
            {fact}
          </p>
        ) : null}

        {showTempSlider || challengeActive ? (
          <>
            <p className={styles.sliderLabel}>
              <span
                className={styles.tempDot}
                style={{ background: rgbCss(rgb), boxShadow: `0 0 10px ${rgbCss(rgb)}` }}
              />
              Température : {temperatureLabelFr(temperatureK)} · étoile{' '}
              {thermalBandLabelFr(thermalBand(temperatureK))}
            </p>
            <input
              className={styles.slider}
              type="range"
              min={TEMP_MIN_K}
              max={TEMP_MAX_K}
              step={TEMP_STEP_K}
              value={temperatureK}
              onChange={(e) => setTemperature(Number(e.target.value))}
              aria-label="Température de l’étoile en kelvins"
            />
            <div className={styles.rangeLegend} aria-hidden="true">
              <span>Froide</span>
              <span>Chaude</span>
            </div>
          </>
        ) : null}

        {challengeActive ? (
          <button type="button" className={styles.actionBtn} onClick={validate}>
            Valider ce réglage
          </button>
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
          Spectre simplifié (corps noir) · raies d’absorption omises
        </p>
      </SceneControls>
    </div>
  );
}
