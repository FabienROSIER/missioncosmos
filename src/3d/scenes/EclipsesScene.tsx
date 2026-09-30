'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcRotateCamera, Color3, Vector3 } from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi } from '@/3d/controls/missionCamera';
import {
  captureCameraHome,
  configureMissionCamera,
  createMissionCameraApi,
} from '@/3d/controls/missionCamera';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { OrbitController } from '@/3d/entities/OrbitController';
import {
  applyDayNightEarthMaterials,
  applyEmissiveSunMaterial,
  applyHardTerminatorMaterials,
  createSimpleAtmosphere,
  resolveGraphicsQuality,
  setupSceneLighting,
} from '@/3d/materials';
import {
  applyScenePerformancePriority,
  optimizeCelestialMeshes,
  startPerfMonitor,
} from '@/3d/performance';
import { createEclipseShadows } from '@/3d/scenes/eclipseShadows';
import { createEclipseSurfaceEffects, eclipseAmount } from '@/3d/scenes/eclipseSurfaceEffects';
import { attachEclipseEarthPip } from '@/3d/scenes/eclipseEarthPip';
import { createCompanionSurfaceMarker } from '@/3d/scenes/companionSurfaceMarker';
import { EARTH_MAIN_LAYER, HOUSE_MESH_LAYER, MAIN_CAMERA_LAYER } from '@/3d/scenes/houseViewPip';
import { attachMoonOrbitDrag, createOrbitGuide } from '@/3d/scenes/moonOrbitDrag';
import { frameMoonPhasesOverview } from '@/3d/utils/cameraFraming';
import {
  classifyEclipse,
  ECLIPSE_LABELS,
  isEclipseMatch,
  type EclipseKind,
} from '@/3d/utils/eclipseAlignment';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { EARTH_BODY, MOON_BODY, SUN_BODY } from '@/content/bodies/catalog';
import { COMPANION_TEMP_NAME } from '@/content/companion';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { prefersReducedMotion } from '@/lib/motion';
import { logger } from '@/lib/logger';
import styles from './EclipsesScene.module.css';

export type EclipseTarget = 'solar' | 'lunar';

export type EclipsesSceneApi = {
  camera: MissionCameraApi;
  setMoonDragEnabled: (enabled: boolean) => void;
  setEclipseChallenge: (target: EclipseTarget | null) => void;
  /** Orbite penchée (étape « pas chaque mois »). */
  setOrbitTilted: (tilted: boolean) => void;
  setCinematicMode: (enabled: boolean) => void;
};

type EclipsesSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: EclipsesSceneApi) => void;
  onEclipseSuccess?: (target: EclipseTarget) => void;
};

const HOLD_MS = 750;
/** Soleil dans le plan de l’orbite (Y=0) — sinon alignement impossible. */
const SUN_DISTANCE = 6.4;
const MOON_ORBIT_RADIUS = 2.55;
/** Départ en quartier (angle π/2) ; angle 0 = éclipse solaire, π = lunaire. */
const MOON_START_ANGLE = Math.PI / 2;
/** Inclinaison pédagogique (~12°) pour montrer le « raté » d’ombre. */
const TILT_RAD = 0.22;

/** Scène Mission 04 — éclipses solaire / lunaire + ombres simplifiées. */
export function EclipsesScene({
  className,
  fill = false,
  onSceneApi,
  onEclipseSuccess,
}: EclipsesSceneProps) {
  const [pipKind, setPipKind] = useState<EclipseKind>('none');
  const [pipExpanded, setPipExpanded] = useState(false);
  const pipFrameRef = useRef<HTMLDivElement | null>(null);
  const onEclipseSuccessRef = useRef(onEclipseSuccess);
  const onSceneApiRef = useRef(onSceneApi);

  useEffect(() => {
    onEclipseSuccessRef.current = onEclipseSuccess;
  }, [onEclipseSuccess]);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.04,
      sunIntensity: 1.85,
      contrast: 1.18,
      hemiDiffuse: new Color3(0.25, 0.28, 0.35),
      hemiGround: new Color3(0.02, 0.025, 0.03),
    });

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.7 : 0.8,
      segments: quality === 'low' ? 24 : 48,
    });
    // Sinon le dôme étoilé noir, visible par les deux caméras, recouvre le Layer ciel du PiP.
    background.dome.layerMask = EARTH_MAIN_LAYER;

    // Soleil, Terre, orbite lunaire : même plan Y=0 (éclipses possibles)
    const sunPos = new Vector3(SUN_DISTANCE, 0, 0);
    const sun = await CelestialBodyEntity.create(scene, {
      definition: {
        ...SUN_BODY,
        visual: { ...SUN_BODY.visual, visualRadius: 1.75 },
      },
      position: sunPos,
      spin: true,
    });
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    lighting.sunLight.direction = new Vector3(-1, 0, 0);

    const earth = await CelestialBodyEntity.create(scene, {
      definition: {
        ...EARTH_BODY,
        visual: { ...EARTH_BODY.visual, visualRadius: 0.85 },
        scientific: { ...EARTH_BODY.scientific, axialTiltDeg: 0 },
      },
      spin: false,
    });
    applyDayNightEarthMaterials(scene, earth.meshes);
    optimizeCelestialMeshes(earth.meshes, quality, 'planet');

    const atmosphere = createSimpleAtmosphere(scene, earth.pivot, {
      quality,
      scale: 1.045,
      alpha: 0.28,
      litBySun: true,
      color: new Color3(0.45, 0.65, 0.98),
    });

    const moon = await CelestialBodyEntity.create(scene, {
      definition: {
        ...MOON_BODY,
        scientific: { ...MOON_BODY.scientific, axialTiltDeg: 0 },
      },
      spin: false,
    });
    const moonTerminator = applyHardTerminatorMaterials(
      scene,
      moon.meshes,
      lighting.sunLight.direction,
      { softEdge: 0.07, nightLevel: 0.015, dayBoost: new Color3(1.7, 1.62, 1.55) },
    );
    optimizeCelestialMeshes(moon.meshes, quality, 'planet');

    const orbit = new OrbitController(scene, moon.pivot, {
      center: earth.pivot,
      radius: MOON_ORBIT_RADIUS,
      startAngle: MOON_START_ANGLE,
      clockwise: true,
      angularSpeed: 0.18,
      tidalLock: true,
      facingOffsetRad: Math.PI,
    });
    const orbitGuide = createOrbitGuide(scene, MOON_ORBIT_RADIUS, { mainCameraOnly: true });
    orbitGuide.syncCenter(earth.pivot.getAbsolutePosition());

    const shadows = createEclipseShadows(scene);
    shadows.setVisible(true);
    shadows.setHighlight('both');
    const surfaceFx = createEclipseSurfaceEffects(scene);

    const companion = await createCompanionSurfaceMarker(scene, earth.pivot, 0.85, {
      dynamic: true,
      height: 0.32,
    });
    companion.setLayerMask(HOUSE_MESH_LAYER);
    companion.syncLookAt(moon.pivot.getAbsolutePosition());

    await Promise.all([sun.playAppear(), earth.playAppear(), moon.playAppear()]);

    const camera = scene.activeCamera;
    let drag: ReturnType<typeof attachMoonOrbitDrag> | null = null;
    let challengeTarget: EclipseTarget | null = null;
    let holdAccum = 0;
    let successSent = false;
    let moonPip: ReturnType<typeof attachEclipseEarthPip> | null = null;

    const readBodies = () => ({
      earth: earth.pivot.getAbsolutePosition(),
      sun: sun.pivot.getAbsolutePosition(),
      moon: moon.pivot.getAbsolutePosition(),
    });

    if (camera instanceof ArcRotateCamera) {
      camera.layerMask = MAIN_CAMERA_LAYER;

      frameMoonPhasesOverview(
        camera,
        earth.pivot.getAbsolutePosition(),
        sun.pivot.getAbsolutePosition(),
        MOON_ORBIT_RADIUS,
      );

      const lockedAlpha = camera.alpha;
      const lockedBeta = camera.beta;

      configureMissionCamera(camera, {
        lowerBetaLimit: lockedBeta,
        upperBetaLimit: lockedBeta,
        lowerAlphaLimit: lockedAlpha,
        upperAlphaLimit: lockedAlpha,
      });

      const home = captureCameraHome(camera);
      const cameraApi = createMissionCameraApi(camera, home, earth.pivot, earth.meshes);

      drag = attachMoonOrbitDrag(scene, orbit, camera);

      const canvasEl = engine.getRenderingCanvas();
      const frameEl = pipFrameRef.current;
      if (canvasEl && frameEl) {
        moonPip = attachEclipseEarthPip({
          scene,
          mainCamera: camera,
          earthPivot: earth.pivot,
          moonPivot: moon.pivot,
          sunPivot: sun.pivot,
          earthRadius: 0.85,
          moonRadius: MOON_BODY.visual.visualRadius,
          earthMeshes: earth.meshes,
          sunMeshes: sun.meshes,
          frameEl,
          canvasEl,
          onEclipseChange: (kind) => setPipKind(kind),
        });
      }

      let lastPipKind: EclipseKind = 'none';
      let cinematicMode = false;

      const setCinematicMode = (enabled: boolean) => {
        if (cinematicMode === enabled) return;
        cinematicMode = enabled;
        orbit.stop();
        drag?.setEnabled(!enabled);

        if (enabled) {
          camera.lowerAlphaLimit = null;
          camera.upperAlphaLimit = null;
          camera.lowerBetaLimit = 0.22;
          camera.upperBetaLimit = Math.PI - 0.22;
          camera.angularSensibilityX = 1200;
          camera.angularSensibilityY = 1200;
          if (!prefersReducedMotion()) orbit.start();
        } else {
          orbit.stop();
          camera.alpha = lockedAlpha;
          camera.beta = lockedBeta;
          camera.lowerAlphaLimit = lockedAlpha;
          camera.upperAlphaLimit = lockedAlpha;
          camera.lowerBetaLimit = lockedBeta;
          camera.upperBetaLimit = lockedBeta;
        }
      };

      const syncObs = scene.onBeforeRenderObservable.add(() => {
        companion.syncLookAt(moon.pivot.getAbsolutePosition());
        companion.updateOcclusion(camera.position);
        shadows.sync(sun.pivot, earth.pivot, moon.pivot);
        const b = readBodies();
        const kind = classifyEclipse(b.earth, b.sun, b.moon);
        shadows.setHighlight(kind === 'none' ? 'both' : kind);

        const amounts = eclipseAmount(kind, b.earth, b.sun, b.moon);
        // Ombre Terre sur la Lune (croissant) + direction des rayons (= loin du Soleil)
        moonTerminator.setEarthOccluder(b.earth, 0.85);
        moonTerminator.setSunDirection(b.earth.subtract(b.sun).normalize());
        surfaceFx.sync({
          kind,
          earth: earth.pivot,
          moon: moon.pivot,
          sun: sun.pivot,
          earthRadius: 0.85,
          lunarAmount: amounts.lunar,
          solarAmount: amounts.solar,
        });

        if (kind !== lastPipKind) {
          lastPipKind = kind;
          setPipKind(kind);
        }

        if (!challengeTarget || successSent) return;
        const dt = scene.getEngine().getDeltaTime();
        if (isEclipseMatch(b.earth, b.sun, b.moon, challengeTarget)) {
          holdAccum += dt;
          if (holdAccum >= HOLD_MS) {
            successSent = true;
            onEclipseSuccessRef.current?.(challengeTarget);
          }
        } else {
          holdAccum = 0;
        }
      });

      onSceneApiRef.current?.({
        camera: cameraApi,
        setMoonDragEnabled: (enabled) => {
          if (!cinematicMode) drag?.setEnabled(enabled);
        },
        setEclipseChallenge: (target) => {
          challengeTarget = target;
          holdAccum = 0;
          successSent = false;
          if (target) shadows.setHighlight(target);
        },
        setOrbitTilted: (tilted) => {
          const i = tilted ? TILT_RAD : 0;
          orbit.setInclination(i);
          orbitGuide.setInclination(i);
        },
        setCinematicMode,
      });

      const perf = startPerfMonitor(scene, { label: 'mission-04-eclipses' });
      logger.info('Mission 04 rendu prêt', {
        quality,
        moonOrbit: MOON_ORBIT_RADIUS,
        perf: perf.getSnapshot(),
      });

      return () => {
        moonPip?.dispose();
        scene.onBeforeRenderObservable.remove(syncObs);
        drag?.dispose();
        orbit.dispose();
        orbitGuide.dispose();
        companion.dispose();
        shadows.dispose();
        surfaceFx.dispose();
        moonTerminator.dispose();
        perf.dispose();
        atmosphere?.dispose();
        moon.dispose();
        earth.dispose();
        sun.dispose();
        background.dispose();
        lighting.dispose();
      };
    }

    return () => {
      orbit.dispose();
      orbitGuide.dispose();
      companion.dispose();
      shadows.dispose();
      surfaceFx.dispose();
      moonTerminator.dispose();
      atmosphere?.dispose();
      moon.dispose();
      earth.dispose();
      sun.dispose();
      background.dispose();
      lighting.dispose();
    };
  }, []);

  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        onSceneReady={onSceneReady}
        loadingMessage="Approche Soleil, Terre et Lune…"
      />
      <div
        ref={pipFrameRef}
        className={`${styles.earthPip} ${pipExpanded ? styles.earthPipExpanded : ''}`}
        aria-label={`Vue avec ${COMPANION_TEMP_NAME}`}
      >
        <div className={styles.earthPipChrome}>
          <div className={styles.pipChromeTop}>
            <p className={styles.earthPipLabel}>Avec {COMPANION_TEMP_NAME}</p>
            <p className={styles.earthPipBadge}>{ECLIPSE_LABELS[pipKind]}</p>
          </div>
          <p className={styles.safety}>
            <span className={styles.safetyFull}>
              Ne regarde jamais le vrai Soleil sans filtre !
            </span>
            <span className={styles.safetyCompact}>Soleil : filtre obligatoire</span>
          </p>
        </div>
        <button
          type="button"
          className={styles.pipExpandButton}
          aria-label={
            pipExpanded ? 'Réduire la vue avec le Guide' : 'Agrandir la vue avec le Guide'
          }
          aria-pressed={pipExpanded}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setPipExpanded((expanded) => !expanded)}
        >
          {pipExpanded ? '↙' : '↗'}
        </button>
      </div>
    </div>
  );
}
