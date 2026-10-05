'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Vector3,
  type Camera,
  type Observer,
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
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { CelestialLabel } from '@/3d/entities/CelestialLabel';
import {
  applyDayNightEarthMaterials,
  applyEmissiveSunMaterial,
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
import {
  attachEarthDragRotation,
  type PipSkyPhase,
  type SurfaceLighting,
} from '@/3d/scenes/dayNightMarkers';
import {
  createCompanionSurfaceMarker,
  type CompanionSurfaceMarkerHandle,
} from '@/3d/scenes/companionSurfaceMarker';
import { attachHouseViewPip, EARTH_MAIN_LAYER } from '@/3d/scenes/houseViewPip';
import { frameDayNightOverview } from '@/3d/utils/cameraFraming';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { EARTH_BODY, SUN_BODY } from '@/content/bodies/catalog';
import { COMPANION_TEMP_NAME } from '@/content/companion';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { prefersReducedMotion } from '@/lib/motion';
import { logger } from '@/lib/logger';
import styles from './DayNightScene.module.css';

export type DayNightSceneApi = {
  camera: MissionCameraApi;
  setHouseVisible: (visible: boolean) => void;
  /** null = pas de défi ; sinon détecte quand le repère est du bon côté. */
  setLightingChallenge: (target: SurfaceLighting | null) => void;
  /** Découverte : réussie quand le Guide change de côté et y reste un moment. */
  setSideChangeDiscovery: (enabled: boolean) => void;
  setEarthDragEnabled: (enabled: boolean) => void;
  /**
   * Mode ciné (quiz+) : Terre tourne seule, les gestes pilotent la caméra.
   */
  setCinematicMode: (enabled: boolean) => void;
};

type DayNightSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: DayNightSceneApi) => void;
  onLightingSuccess?: (target: SurfaceLighting) => void;
  houseVisible?: boolean;
};

type LabelState = {
  scene: Scene;
  camera: Camera;
  position: Vector3;
  text: string;
  visible: boolean;
};

const HOLD_MS = 700;
/** Distance Soleil↔Terre (maquette) — assez loin pour ne pas coller, assez près pour rester en bord de cadre. */
const SUN_DISTANCE = 7.2;

/** Scène Mission 02 — Soleil + Terre + compagnon, jour/nuit. */
export function DayNightScene({
  className,
  fill = false,
  onSceneApi,
  onLightingSuccess,
  houseVisible = false,
}: DayNightSceneProps) {
  const [label, setLabel] = useState<LabelState | null>(null);
  const [pipLighting, setPipLighting] = useState<PipSkyPhase>('day');
  const [pipExpanded, setPipExpanded] = useState(false);
  const companionRef = useRef<CompanionSurfaceMarkerHandle | null>(null);
  const pipFrameRef = useRef<HTMLDivElement | null>(null);
  const onLightingSuccessRef = useRef(onLightingSuccess);
  const onSceneApiRef = useRef(onSceneApi);
  const houseVisibleRef = useRef(houseVisible);

  useEffect(() => {
    onLightingSuccessRef.current = onLightingSuccess;
  }, [onLightingSuccess]);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);

  useEffect(() => {
    houseVisibleRef.current = houseVisible;
    companionRef.current?.setVisible(houseVisible);
  }, [houseVisible]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    // Fill quasi nul + neutre : face nuit noire, pas bleutée
    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.1,
      sunIntensity: 1.7,
      contrast: 1.15,
      hemiDiffuse: new Color3(0.35, 0.38, 0.45),
      hemiGround: new Color3(0.05, 0.055, 0.07),
    });

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.7 : 0.8,
      segments: quality === 'low' ? 24 : 48,
    });
    // Le fond spatial principal ne doit pas recouvrir le ciel dédié de la caméra PiP.
    background.dome.layerMask = EARTH_MAIN_LAYER;

    // Soleil = source des rayons (opposé à DirectionalLight.direction)
    const sunPos = MISSION_SUN_DIRECTION.scale(-SUN_DISTANCE);
    const sun = await CelestialBodyEntity.create(scene, {
      definition: SUN_BODY,
      position: sunPos,
      spin: true,
    });
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    // Aligne explicitement la lumière sur Soleil → Terre
    lighting.sunLight.direction = sunPos.negate().normalize();

    const earth = await CelestialBodyEntity.create(scene, {
      definition: EARTH_BODY,
      spin: false,
    });
    applyDayNightEarthMaterials(scene, earth.meshes);
    optimizeCelestialMeshes(earth.meshes, quality, 'planet');

    // Atmosphère éclairée : halo bleu seulement côté jour
    const atmosphere = createSimpleAtmosphere(scene, earth.pivot, {
      quality,
      scale: 1.045,
      alpha: 0.32,
      litBySun: true,
      color: new Color3(0.45, 0.65, 0.98),
    });

    const companion = await createCompanionSurfaceMarker(
      scene,
      earth.pivot,
      EARTH_BODY.visual.visualRadius,
    );
    companion.setVisible(houseVisibleRef.current);
    companionRef.current = companion;

    await Promise.all([sun.playAppear(), earth.playAppear()]);

    const camera = scene.activeCamera;
    let drag: ReturnType<typeof attachEarthDragRotation> | null = null;
    let challengeTarget: SurfaceLighting | null = null;
    let sideChangeDiscovery = false;
    let seenDay = false;
    let seenNight = false;
    let holdAccum = 0;
    let successSent = false;
    let housePip: ReturnType<typeof attachHouseViewPip> | null = null;

    if (camera instanceof ArcRotateCamera) {
      // Vue du dessus / côté : Soleil + Terre + jour/nuit visibles ensemble
      frameDayNightOverview(
        camera,
        earth.pivot.getAbsolutePosition(),
        sun.pivot.getAbsolutePosition(),
        lighting.sunLight.direction,
      );

      const lockedAlpha = camera.alpha;
      const lockedBeta = camera.beta;

      // Point de vue fixe au départ : on tourne la Terre, pas la caméra (zoom OK)
      configureMissionCamera(camera, {
        lowerBetaLimit: lockedBeta,
        upperBetaLimit: lockedBeta,
        lowerAlphaLimit: lockedAlpha,
        upperAlphaLimit: lockedAlpha,
      });

      const home = captureCameraHome(camera);
      const cameraApi = createMissionCameraApi(camera, home, earth.pivot, earth.meshes);

      drag = attachEarthDragRotation(scene, earth.pivot, camera);

      const canvasEl = engine.getRenderingCanvas();
      const frameEl = pipFrameRef.current;
      if (canvasEl && frameEl) {
        housePip = attachHouseViewPip({
          scene,
          mainCamera: camera,
          house: companion,
          earthPivot: earth.pivot,
          earthRadius: EARTH_BODY.visual.visualRadius,
          earthMeshes: earth.meshes,
          frameEl,
          canvasEl,
          onLightingChange: (phase) => setPipLighting(phase),
        });
      }

      let cinematicSpinObs: Observer<Scene> | null = null;
      let cinematicMode = false;

      const setCinematicMode = (enabled: boolean) => {
        if (cinematicMode === enabled) return;
        cinematicMode = enabled;

        if (cinematicSpinObs) {
          scene.onBeforeRenderObservable.remove(cinematicSpinObs);
          cinematicSpinObs = null;
        }
        earth.setSpinning(false);
        drag?.setEnabled(!enabled);

        if (enabled) {
          // Gestes → caméra libre (bornes douces)
          camera.lowerAlphaLimit = null;
          camera.upperAlphaLimit = null;
          camera.lowerBetaLimit = 0.22;
          camera.upperBetaLimit = Math.PI - 0.22;
          camera.angularSensibilityX = 1200;
          camera.angularSensibilityY = 1200;

          if (!prefersReducedMotion()) {
            // Rotation lente type « cinéma »
            cinematicSpinObs = scene.onBeforeRenderObservable.add(() => {
              const dt = scene.getEngine().getDeltaTime() / 1000;
              earth.pivot.rotate(Vector3.Up(), 0.22 * dt);
            });
          }
        } else {
          // Retour défis : caméra figée, glisser = Terre
          camera.alpha = lockedAlpha;
          camera.beta = lockedBeta;
          camera.lowerAlphaLimit = lockedAlpha;
          camera.upperAlphaLimit = lockedAlpha;
          camera.lowerBetaLimit = lockedBeta;
          camera.upperBetaLimit = lockedBeta;
        }
      };

      const finishLighting = (lit: SurfaceLighting) => {
        successSent = true;
        companion.play('cheer');
        onLightingSuccessRef.current?.(lit);
      };

      const checkObs = scene.onBeforeRenderObservable.add(() => {
        companion.updateOcclusion(camera.position);
        if (successSent) return;
        const lit = companion.getLighting();
        const dt = scene.getEngine().getDeltaTime();
        if (challengeTarget) {
          if (lit === challengeTarget) {
            holdAccum += dt;
            if (holdAccum >= HOLD_MS) finishLighting(challengeTarget);
          } else {
            holdAccum = 0;
          }
          return;
        }
        if (!sideChangeDiscovery) return;
        // Un tour continu repasse par le côté de départ : on retient les deux côtés,
        // sans exiger de s’arrêter.
        if (lit === 'day') seenDay = true;
        if (lit === 'night') seenNight = true;
        if (seenDay && seenNight) finishLighting(lit);
      });

      onSceneApiRef.current?.({
        camera: cameraApi,
        setHouseVisible: (visible) => companion.setVisible(visible),
        setLightingChallenge: (target) => {
          challengeTarget = target;
          holdAccum = 0;
          if (target) {
            sideChangeDiscovery = false;
            successSent = false;
          }
        },
        setSideChangeDiscovery: (enabled) => {
          if (enabled === sideChangeDiscovery) return;
          sideChangeDiscovery = enabled;
          holdAccum = 0;
          seenDay = false;
          seenNight = false;
          if (enabled) {
            challengeTarget = null;
            successSent = false;
            const started = companion.getLighting();
            seenDay = started === 'day';
            seenNight = started === 'night';
          }
        },
        setEarthDragEnabled: (enabled) => {
          if (!cinematicMode) drag?.setEnabled(enabled);
        },
        setCinematicMode,
      });

      setLabel({
        scene,
        camera,
        position: earth.pivot.getAbsolutePosition().add(new Vector3(0, 1.15, 0)),
        text: 'Terre',
        visible: true,
      });

      const perf = startPerfMonitor(scene, { label: 'mission-02-day-night' });
      logger.info('Mission 02 rendu prêt', {
        quality,
        sunDistance: SUN_DISTANCE,
        sunRadius: SUN_BODY.visual.visualRadius,
        perf: perf.getSnapshot(),
      });

      return () => {
        setLabel(null);
        housePip?.dispose();
        if (cinematicSpinObs) {
          scene.onBeforeRenderObservable.remove(cinematicSpinObs);
        }
        scene.onBeforeRenderObservable.remove(checkObs);
        drag?.dispose();
        companion.dispose();
        companionRef.current = null;
        perf.dispose();
        atmosphere?.dispose();
        earth.dispose();
        sun.dispose();
        background.dispose();
        lighting.dispose();
      };
    }

    return () => {
      companion.dispose();
      companionRef.current = null;
      atmosphere?.dispose();
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
        loadingMessage="Approche Soleil et Terre…"
      />
      <div
        ref={pipFrameRef}
        className={`${styles.housePip} ${pipExpanded ? styles.housePipExpanded : ''}`}
        aria-label={`Vue avec ${COMPANION_TEMP_NAME}`}
      >
        <div className={styles.housePipChrome}>
          <div className={styles.pipChromeTop}>
            <p className={styles.housePipLabel}>Avec {COMPANION_TEMP_NAME}</p>
            <p
              className={`${styles.housePipBadge} ${
                pipLighting === 'day'
                  ? styles.housePipBadgeDay
                  : pipLighting === 'twilight'
                    ? styles.housePipBadgeTwilight
                    : styles.housePipBadgeNight
              }`}
            >
              {pipLighting === 'day' ? 'Jour' : pipLighting === 'twilight' ? 'Crépuscule' : 'Nuit'}
            </p>
          </div>
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
      {label ? (
        <CelestialLabel
          scene={label.scene}
          camera={label.camera}
          worldPosition={label.position}
          text={label.text}
          visible={label.visible}
        />
      ) : null}
    </div>
  );
}
