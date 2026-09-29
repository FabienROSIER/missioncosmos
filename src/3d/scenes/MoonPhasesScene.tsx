'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
} from '@babylonjs/core';
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
import { MISSION_SUN_DIRECTION } from '@/3d/materials/sceneLighting';
import {
  applyScenePerformancePriority,
  optimizeCelestialMeshes,
  startPerfMonitor,
} from '@/3d/performance';
import { attachMoonEarthPip } from '@/3d/scenes/moonEarthPip';
import { createCompanionSurfaceMarker } from '@/3d/scenes/companionSurfaceMarker';
import { HOUSE_MESH_LAYER, MAIN_CAMERA_LAYER } from '@/3d/scenes/houseViewPip';
import { attachMoonOrbitDrag, createOrbitGuide } from '@/3d/scenes/moonOrbitDrag';
import { frameMoonPhasesOverview } from '@/3d/utils/cameraFraming';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import {
  elongationBetween,
  isPhaseMatch,
  MOON_PHASE_LABELS,
  type MoonPhaseId,
  phaseFromElongation,
} from '@/3d/utils/moonPhase';
import { EARTH_BODY, MOON_BODY, SUN_BODY } from '@/content/bodies/catalog';
import { COMPANION_TEMP_NAME } from '@/content/companion';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { prefersReducedMotion } from '@/lib/motion';
import { logger } from '@/lib/logger';
import styles from './MoonPhasesScene.module.css';

export type MoonPhasesSceneApi = {
  camera: MissionCameraApi;
  setMoonDragEnabled: (enabled: boolean) => void;
  /** null = pas de défi ; sinon détecte la phase cible. */
  setPhaseChallenge: (target: MoonPhaseId | null) => void;
  /**
   * Mode ciné (quiz+) : Lune orbite seule, gestes → caméra.
   */
  setCinematicMode: (enabled: boolean) => void;
};

type MoonPhasesSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: MoonPhasesSceneApi) => void;
  onPhaseSuccess?: (target: MoonPhaseId) => void;
};

const HOLD_MS = 700;
/** Un peu plus près pour rester visible au cadrage initial. */
const SUN_DISTANCE = 6.4;
/** Orbite lunaire maquette (non à l’échelle). */
const MOON_ORBIT_RADIUS = 2.55;
/** Angle initial ≈ quartier. */
const MOON_START_ANGLE = Math.PI / 2;

/** Scène Mission 03 — Soleil + Terre + Lune, phases + PiP depuis la Terre. */
export function MoonPhasesScene({
  className,
  fill = false,
  onSceneApi,
  onPhaseSuccess,
}: MoonPhasesSceneProps) {
  const [pipPhase, setPipPhase] = useState<MoonPhaseId>('quarter');
  const pipFrameRef = useRef<HTMLDivElement | null>(null);
  const onPhaseSuccessRef = useRef(onPhaseSuccess);
  const onSceneApiRef = useRef(onSceneApi);

  useEffect(() => {
    onPhaseSuccessRef.current = onPhaseSuccess;
  }, [onPhaseSuccess]);

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

    const sunPos = MISSION_SUN_DIRECTION.scale(-SUN_DISTANCE);
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
    lighting.sunLight.direction = sunPos.negate().normalize();

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

    const atmosphere =
      quality === 'low'
        ? null
        : createSimpleAtmosphere(scene, earth.pivot, {
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
    );
    optimizeCelestialMeshes(moon.meshes, quality, 'planet');

    const orbit = new OrbitController(scene, moon.pivot, {
      center: earth.pivot,
      radius: MOON_ORBIT_RADIUS,
      startAngle: MOON_START_ANGLE,
      // Sens corrigé pour l’animation de fin (+ drag aligné via nudgeFromSwipe)
      clockwise: true,
      angularSpeed: 0.2,
      tidalLock: true,
      // +Z local vers la Terre ; Math.PI si le GLB montrait la face opposée
      facingOffsetRad: Math.PI,
    });
    const orbitGuide = createOrbitGuide(scene, MOON_ORBIT_RADIUS, { mainCameraOnly: true });
    orbitGuide.syncCenter(earth.pivot.getAbsolutePosition());

    const companion = await createCompanionSurfaceMarker(scene, earth.pivot, 0.85, {
      dynamic: true,
      // Repère pédagogique lisible depuis la vue d’ensemble (pas une taille « réelle »)
      height: 0.32,
    });
    companion.setLayerMask(HOUSE_MESH_LAYER);
    companion.syncLookAt(moon.pivot.getAbsolutePosition());

    await Promise.all([sun.playAppear(), earth.playAppear(), moon.playAppear()]);

    const camera = scene.activeCamera;
    let drag: ReturnType<typeof attachMoonOrbitDrag> | null = null;
    let challengeTarget: MoonPhaseId | null = null;
    let holdAccum = 0;
    let successSent = false;
    let moonPip: ReturnType<typeof attachMoonEarthPip> | null = null;

    const readElongation = () => {
      const e = earth.pivot.getAbsolutePosition();
      const m = moon.pivot.getAbsolutePosition();
      const s = sun.pivot.getAbsolutePosition();
      return elongationBetween(
        { x: s.x - e.x, y: s.y - e.y, z: s.z - e.z },
        { x: m.x - e.x, y: m.y - e.y, z: m.z - e.z },
      );
    };

    if (camera instanceof ArcRotateCamera) {
      // Visible même si le PiP n’est pas encore branché (calque compagnon)
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
        moonPip = attachMoonEarthPip({
          scene,
          mainCamera: camera,
          earthPivot: earth.pivot,
          moonPivot: moon.pivot,
          sunPivot: sun.pivot,
          earthRadius: 0.85,
          earthMeshes: earth.meshes,
          frameEl,
          canvasEl,
          onPhaseChange: (phase) => setPipPhase(phase),
        });
      }

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

          if (!prefersReducedMotion()) {
            orbit.start();
          }
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

      const checkObs = scene.onBeforeRenderObservable.add(() => {
        companion.syncLookAt(moon.pivot.getAbsolutePosition());
        companion.updateOcclusion(camera.position);
        if (!challengeTarget || successSent) return;
        const elong = readElongation();
        const dt = scene.getEngine().getDeltaTime();
        if (isPhaseMatch(elong, challengeTarget)) {
          holdAccum += dt;
          if (holdAccum >= HOLD_MS) {
            successSent = true;
            onPhaseSuccessRef.current?.(challengeTarget);
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
        setPhaseChallenge: (target) => {
          challengeTarget = target;
          holdAccum = 0;
          successSent = false;
        },
        setCinematicMode,
      });

      const perf = startPerfMonitor(scene, { label: 'mission-03-moon-phases' });
      logger.info('Mission 03 rendu prêt', {
        quality,
        moonOrbit: MOON_ORBIT_RADIUS,
        startPhase: phaseFromElongation(readElongation()),
        perf: perf.getSnapshot(),
      });

      return () => {
        moonPip?.dispose();
        scene.onBeforeRenderObservable.remove(checkObs);
        drag?.dispose();
        orbit.dispose();
        orbitGuide.dispose();
        companion.dispose();
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
      <div ref={pipFrameRef} className={styles.earthPip} aria-hidden="true">
        <div className={styles.earthPipChrome}>
          <div className={styles.pipChromeTop}>
            <p className={styles.earthPipLabel}>Avec {COMPANION_TEMP_NAME}</p>
            <p className={styles.earthPipBadge}>
              <span className={styles.badgeFull}>{MOON_PHASE_LABELS[pipPhase]}</span>
              <span className={styles.badgeCompact}>
                {pipPhase === 'quarter' ? 'Quartier' : MOON_PHASE_LABELS[pipPhase]}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
