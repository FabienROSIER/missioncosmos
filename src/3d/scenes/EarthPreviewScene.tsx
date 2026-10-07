'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  FresnelParameters,
  StandardMaterial,
  Vector3,
  type Camera,
  type DirectionalLight,
  type Observer,
  type Scene,
} from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi, MissionCameraHome } from '@/3d/controls/missionCamera';
import {
  captureCameraHome,
  configureMissionCamera,
  setupPlanetMissionCamera,
} from '@/3d/controls/missionCamera';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { CelestialLabel } from '@/3d/entities/CelestialLabel';
import {
  applyEmissiveSunMaterial,
  applyPlanetaryMaterials,
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
  createEarthMarkers,
  type EarthMarkerId,
  type EarthMarkersHandle,
} from '@/3d/scenes/earthMarkers';
import {
  attachEarthSunOrbitDrag,
  createEarthSunOrbitGuide,
  EARTH_SUN_ORBIT_RADIUS,
  EARTH_SUN_ORBIT_SUCCESS_RAD,
  frameEarthSunOrbitOverview,
  placeOnOrbit,
  type EarthSunOrbitDragHandle,
  type EarthSunOrbitGuideHandle,
} from '@/3d/scenes/earthSunOrbit';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { EARTH_BODY, SUN_BODY } from '@/content/bodies/catalog';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { logger } from '@/lib/logger';
import { SceneControls } from '@/components/layout/SceneControls';
import {
  EARTH_BEACONS,
  earthYearProgress,
  isEarthRecordComplete,
} from '@/content/bodies/earthNavigation';
import styles from './EarthPreviewScene.module.css';

export type { EarthMarkerId };

export type EarthSceneApi = {
  camera: MissionCameraApi;
  setMarkersVisible: (visible: boolean) => void;
  setMarkerHighlight: (id: EarthMarkerId | null) => void;
  setChallengePickEnabled: (enabled: boolean) => void;
  /** Détecte une rotation significative du globe (auto-avance pédagogique). */
  setOrbitDetectEnabled: (enabled: boolean) => void;
  /** Affiche Soleil + anneau d’orbite (vue maquette). */
  setOrbitViewEnabled: (enabled: boolean) => void;
  /** Active le drag défi « avance sur l’orbite ». */
  setOrbitChallengeEnabled: (enabled: boolean) => void;
};

type EarthPreviewSceneProps = {
  stepId?: string;
  interactionAllowed?: boolean;
  challengeSolved?: boolean;
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: EarthSceneApi) => void;
  onMarkerPick?: (id: EarthMarkerId) => void;
  /** Appelé une fois quand l’enfant a assez tourné / zoomé le globe. */
  onSignificantOrbit?: () => void;
  /** Appelé quand la Terre a assez avancé sur son orbite (défi Soleil). */
  onOrbitChallengeSuccess?: () => void;
  /** Affiche les repères pôles/équateur dès le départ. */
  markersVisible?: boolean;
};

type LabelState = {
  scene: Scene;
  camera: Camera;
  position: Vector3;
  text: string;
  visible: boolean;
};

/** Scène Mission 01 — Terre + marqueurs, puis optionnellement Soleil / orbite. */
/** ~25° de rotation ou zoom net = « j’ai exploré le globe ». */
const ORBIT_ALPHA_THRESHOLD = 0.45;
const ORBIT_BETA_THRESHOLD = 0.35;
const ORBIT_RADIUS_RATIO = 0.12;

export function EarthPreviewScene({
  stepId = 'm01-intro',
  interactionAllowed = false,
  challengeSolved = false,
  className,
  fill = false,
  onSceneApi,
  onMarkerPick,
  onSignificantOrbit,
  onOrbitChallengeSuccess,
  markersVisible = false,
}: EarthPreviewSceneProps) {
  const [orbitView, setOrbitView] = useState(false);
  const [yearProgress, setYearProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const controlsRef = useRef<{
    advance: () => void;
    look: () => void;
    pick: (id: EarthMarkerId) => void;
  } | null>(null);
  const [label, setLabel] = useState<LabelState | null>(null);
  const [sunLabel, setSunLabel] = useState<LabelState | null>(null);
  const markersRef = useRef<EarthMarkersHandle | null>(null);
  const onMarkerPickRef = useRef(onMarkerPick);
  const onSignificantOrbitRef = useRef(onSignificantOrbit);
  const onOrbitChallengeSuccessRef = useRef(onOrbitChallengeSuccess);
  const onSceneApiRef = useRef(onSceneApi);
  const markersVisibleRef = useRef(markersVisible);

  useEffect(() => {
    markersRef.current?.setRecorded(
      EARTH_BEACONS.filter((beacon) =>
        isEarthRecordComplete(beacon.stepId, stepId, challengeSolved),
      ).map((beacon) => beacon.id),
    );
  }, [stepId, challengeSolved, ready]);

  useEffect(() => {
    onMarkerPickRef.current = onMarkerPick;
  }, [onMarkerPick]);

  useEffect(() => {
    onSignificantOrbitRef.current = onSignificantOrbit;
  }, [onSignificantOrbit]);

  useEffect(() => {
    onOrbitChallengeSuccessRef.current = onOrbitChallengeSuccess;
  }, [onOrbitChallengeSuccess]);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);

  useEffect(() => {
    markersVisibleRef.current = markersVisible;
    markersRef.current?.setVisible(markersVisible);
  }, [markersVisible]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, { hemiIntensity: 0.23, contrast: 1.12 });
    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.7 : 0.8,
      segments: quality === 'low' ? 24 : 48,
    });

    const earth = await CelestialBodyEntity.create(scene, {
      definition: EARTH_BODY,
      spin: true,
    });
    applyPlanetaryMaterials(scene, earth.meshes, quality);
    optimizeCelestialMeshes(earth.meshes, quality, 'planet');

    const atmosphere = createSimpleAtmosphere(scene, earth.pivot, {
      quality,
      scale: 1.04,
      alpha: 0.01,
    });
    if (atmosphere.mesh.material instanceof StandardMaterial) {
      const rim = new FresnelParameters();
      rim.leftColor = Color3.Black();
      rim.rightColor = new Color3(0.5, 0.5, 0.5);
      rim.power = 3;
      atmosphere.mesh.material.opacityFresnelParameters = rim;
      atmosphere.mesh.material.backFaceCulling = true;
    }

    const markers = createEarthMarkers(
      scene,
      earth.pivot,
      EARTH_BODY.visual.visualRadius,
      earth.meshes,
    );
    markers.setVisible(markersVisibleRef.current);
    markersRef.current = markers;
    const markerObs = markers.onPick.add((id) => {
      onMarkerPickRef.current?.(id);
    });

    // Soleil + guide d’orbite : chargés tout de suite, masqués jusqu’au défi
    const sun = await CelestialBodyEntity.create(scene, {
      definition: {
        ...SUN_BODY,
        visual: { ...SUN_BODY.visual, visualRadius: 1.45 },
      },
      position: Vector3.Zero(),
      spin: true,
    });
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    sun.pivot.setEnabled(false);

    const orbitGuide: EarthSunOrbitGuideHandle = createEarthSunOrbitGuide(
      scene,
      EARTH_SUN_ORBIT_RADIUS,
    );

    await earth.playAppear();

    const camera = scene.activeCamera;
    let orbitObs: Observer<Scene> | null = null;
    let orbitBaseline: { alpha: number; beta: number; radius: number } | null = null;
    let orbitFired = false;
    let cameraApi: MissionCameraApi | null = null;
    let globeHome: MissionCameraHome | null = null;
    let orbitViewEnabled = false;
    let orbitChallengeEnabled = false;
    let earthOrbitAngle = 0;
    let orbitSuccessSent = false;
    let sunOrbitDrag: EarthSunOrbitDragHandle | null = null;
    const earthOrbitPos = new Vector3();
    const defaultSunDir = MISSION_SUN_DIRECTION.clone();

    const stopOrbitDetect = () => {
      if (orbitObs) {
        scene.onBeforeRenderObservable.remove(orbitObs);
        orbitObs = null;
      }
      orbitBaseline = null;
      orbitFired = false;
    };

    const startOrbitDetect = () => {
      if (!(camera instanceof ArcRotateCamera)) return;
      stopOrbitDetect();
      orbitBaseline = { alpha: camera.alpha, beta: camera.beta, radius: camera.radius };
      orbitObs = scene.onBeforeRenderObservable.add(() => {
        if (!orbitBaseline || orbitFired) return;
        const dAlpha = Math.abs(camera.alpha - orbitBaseline.alpha);
        const dBeta = Math.abs(camera.beta - orbitBaseline.beta);
        const dRadius =
          Math.abs(camera.radius - orbitBaseline.radius) / Math.max(orbitBaseline.radius, 1e-3);
        if (
          dAlpha < ORBIT_ALPHA_THRESHOLD &&
          dBeta < ORBIT_BETA_THRESHOLD &&
          dRadius < ORBIT_RADIUS_RATIO
        ) {
          return;
        }
        orbitFired = true;
        onSignificantOrbitRef.current?.();
      });
    };

    const syncSunLight = (sunLight: DirectionalLight) => {
      if (orbitViewEnabled) {
        // Rayons Soleil → Terre
        const dir = earth.pivot.position.subtract(sun.pivot.position);
        if (dir.lengthSquared() > 1e-6) sunLight.direction.copyFrom(dir.normalize());
      } else {
        sunLight.direction.copyFrom(defaultSunDir);
      }
    };

    const applyEarthOnOrbit = () => {
      placeOnOrbit(earthOrbitAngle, EARTH_SUN_ORBIT_RADIUS, earthOrbitPos);
      earth.pivot.position.copyFrom(earthOrbitPos);
      syncSunLight(lighting.sunLight);
      orbitGuide.syncCenter(sun.pivot.position);
    };

    const refreshLabels = () => {
      if (!(camera instanceof ArcRotateCamera)) return;
      setLabel({
        scene,
        camera,
        position: earth.pivot
          .getAbsolutePosition()
          .add(new Vector3(0, orbitViewEnabled ? 0.75 : 1.15, 0)),
        text: EARTH_BODY.scientific.nameFr,
        visible: true,
      });
      if (orbitViewEnabled) {
        setSunLabel({
          scene,
          camera,
          position: sun.pivot.getAbsolutePosition().add(new Vector3(0, 1.7, 0)),
          text: 'Soleil',
          visible: true,
        });
      } else {
        setSunLabel(null);
      }
    };

    const enterOrbitView = () => {
      if (!(camera instanceof ArcRotateCamera) || orbitViewEnabled) return;
      orbitViewEnabled = true;
      orbitSuccessSent = false;
      earthOrbitAngle = 0;
      setYearProgress(0);
      orbitGuide.setProgress(0);
      sunOrbitDrag?.resetAccumulated();

      markers.setVisible(false);
      sun.pivot.setEnabled(true);
      orbitGuide.setVisible(true);
      sun.pivot.position.setAll(0);
      // Terre plus petite que le Soleil (maquette pédagogique, pas à l’échelle)
      earth.pivot.scaling.setAll(0.52);
      applyEarthOnOrbit();

      if (!globeHome) globeHome = captureCameraHome(camera);
      frameEarthSunOrbitOverview(camera, sun.pivot.position, EARTH_SUN_ORBIT_RADIUS);
      configureMissionCamera(camera, {
        lowerBetaLimit: 0.55,
        upperBetaLimit: 1.35,
      });
      refreshLabels();
    };

    const exitOrbitView = () => {
      if (!(camera instanceof ArcRotateCamera) || !orbitViewEnabled) return;
      orbitViewEnabled = false;
      orbitChallengeEnabled = false;
      sunOrbitDrag?.setEnabled(false);

      sun.pivot.setEnabled(false);
      orbitGuide.setVisible(false);
      earth.pivot.position.setAll(0);
      earth.pivot.scaling.setAll(1);
      syncSunLight(lighting.sunLight);
      markers.setVisible(markersVisibleRef.current);

      if (globeHome) {
        camera.alpha = globeHome.alpha;
        camera.beta = globeHome.beta;
        camera.radius = globeHome.radius;
        camera.setTarget(globeHome.target.clone());
        camera.lowerRadiusLimit = Math.max(globeHome.radius * 0.55, 2.2);
        camera.upperRadiusLimit = Math.min(camera.upperRadiusLimit ?? 50, 50);
      }
      configureMissionCamera(camera);
      refreshLabels();
    };

    if (camera instanceof ArcRotateCamera) {
      cameraApi = setupPlanetMissionCamera(camera, earth.pivot, earth.meshes, {
        margin: 1.55,
        startFactor: 1.45,
        sunDirection: MISSION_SUN_DIRECTION,
      });
      camera.upperRadiusLimit = Math.min(camera.upperRadiusLimit ?? 20, 50);
      globeHome = captureCameraHome(camera);

      const advanceOrbit = (delta: number) => {
        if (!orbitViewEnabled || !orbitChallengeEnabled || orbitSuccessSent) return;
        earthOrbitAngle += delta;
        setYearProgress(earthYearProgress(earthOrbitAngle));
        orbitGuide.setProgress(earthOrbitAngle);
        applyEarthOnOrbit();
        refreshLabels();
        if (
          orbitChallengeEnabled &&
          !orbitSuccessSent &&
          Math.abs(earthOrbitAngle) >= EARTH_SUN_ORBIT_SUCCESS_RAD - 1e-8
        ) {
          orbitSuccessSent = true;
          sunOrbitDrag?.setEnabled(false);
          onOrbitChallengeSuccessRef.current?.();
        }
      };
      sunOrbitDrag = attachEarthSunOrbitDrag(scene, camera, advanceOrbit);
      sunOrbitDrag.setEnabled(false);
      let pickEnabled = false;
      controlsRef.current = {
        // Sens antihoraire vu du nord (+Y), comme le reste du système solaire.
        advance: () => advanceOrbit(-Math.PI / 6),
        look: () => {
          camera.alpha += Math.PI / 3;
        },
        pick: (id) => {
          if (pickEnabled) onMarkerPickRef.current?.(id);
        },
      };
      setReady(true);

      onSceneApiRef.current?.({
        camera: {
          ...cameraApi,
          recenter: async () => {
            if (orbitViewEnabled)
              frameEarthSunOrbitOverview(camera, sun.pivot.position, EARTH_SUN_ORBIT_RADIUS);
            else await cameraApi?.recenter();
          },
        },
        setMarkersVisible: (visible) => {
          markersVisibleRef.current = visible;
          if (!orbitViewEnabled) markers.setVisible(visible);
        },
        setMarkerHighlight: (id) => markers.setHighlight(id),
        setChallengePickEnabled: (enabled) => {
          pickEnabled = enabled;
          markers.setSurfacePickEnabled(enabled);
        },
        setOrbitDetectEnabled: (enabled) => {
          if (enabled && !orbitViewEnabled) startOrbitDetect();
          else stopOrbitDetect();
        },
        setOrbitViewEnabled: (enabled) => {
          setOrbitView(enabled);
          if (enabled) enterOrbitView();
          else exitOrbitView();
        },
        setOrbitChallengeEnabled: (enabled) => {
          if (enabled && !orbitChallengeEnabled) {
            if (!orbitViewEnabled) enterOrbitView();
          }
          orbitChallengeEnabled = enabled;
          sunOrbitDrag?.setEnabled(enabled);
        },
      });
    }

    earth.onPick.add(() => {
      refreshLabels();
    });

    refreshLabels();
    earth.setHighlighted(false);

    const perf = startPerfMonitor(scene, { label: 'mission-01-earth' });
    logger.info('Mission 01 rendu prêt', { quality, perf: perf.getSnapshot() });

    return () => {
      stopOrbitDetect();
      controlsRef.current = null;
      sunOrbitDrag?.dispose();
      setLabel(null);
      setSunLabel(null);
      markers.onPick.remove(markerObs);
      markers.dispose();
      markersRef.current = null;
      orbitGuide.dispose();
      perf.dispose();
      atmosphere?.dispose();
      sun.dispose();
      earth.dispose();
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
        mobileFovScale={orbitView ? 1.4 : 0.8}
        loadingMessage="Approche de la Terre…"
      />
      {ready ? (
        <div className={styles.heading} aria-hidden="true">
          <span>EXPÉDITION 01 · NOTRE PLANÈTE</span>
          <strong>{orbitView ? 'Le voyage d’une année' : 'Une maison à explorer'}</strong>
        </div>
      ) : null}
      {ready && ['m01-explain', 'm01-reward', 'm01-complete'].includes(stepId) ? (
        <div className={styles.summary}>
          <span className={styles.eyebrow}>EXPÉDITION ACCOMPLIE</span>
          <strong>Ta carte de navigation est complète</strong>
          <div className={styles.records}>
            {EARTH_BEACONS.map((beacon) => (
              <span key={beacon.id} data-done="true">
                ✓ {beacon.name}
              </span>
            ))}
            <span data-done="true">✓ Une année autour du Soleil</span>
          </div>
        </div>
      ) : null}
      {ready && interactionAllowed ? (
        <SceneControls className={styles.hud} aria-label="Carte de navigation terrestre">
          <p className={styles.eyebrow}>CARTE DE NAVIGATION</p>
          <div className={styles.records}>
            {EARTH_BEACONS.map((beacon) => {
              const done = isEarthRecordComplete(beacon.stepId, stepId, challengeSolved);
              return (
                <span key={beacon.id} data-done={done}>
                  {done ? '✓' : '○'} {done ? beacon.name : `Repère ${beacon.letter}`}
                </span>
              );
            })}
          </div>
          {orbitView ? (
            <>
              <p className={styles.title}>Ramène la Terre à son point de départ</p>
              <div className={styles.yearReadout}>
                <strong>{Math.round(yearProgress * 365)}</strong>
                <span>
                  jours environ
                  <br />
                  sur une année
                </span>
              </div>
              <progress
                className={styles.progress}
                max={1}
                value={yearProgress}
                aria-label="Tour du Soleil accompli"
              />
              <div className={styles.milestones}>
                <span>Départ</span>
                <span>½ tour</span>
                <span>1 année</span>
              </div>
              <button type="button" onClick={() => controlsRef.current?.advance()}>
                Avancer sur l’orbite →
              </button>
              <p className={styles.note}>
                Ou glisse sur la scène. Le trait vert suit ton voyage. Revenir en arrière fait
                reculer le compteur.
              </p>
            </>
          ) : stepId === 'm01-intro' ? (
            <>
              <p className={styles.title}>Observe notre planète sous un autre angle.</p>
              <button type="button" onClick={() => controlsRef.current?.look()}>
                Tourner autour de la Terre ↻
              </button>
            </>
          ) : (
            <>
              <p className={styles.title}>Quel repère correspond à ta recherche ?</p>
              <div className={styles.choices}>
                {EARTH_BEACONS.map((beacon) => (
                  <button
                    type="button"
                    key={beacon.id}
                    onClick={() => controlsRef.current?.pick(beacon.id)}
                  >
                    <b>{beacon.letter}</b>
                    <span>
                      {beacon.letter === 'A'
                        ? 'Bout nord de l’axe'
                        : beacon.letter === 'B'
                          ? 'Cercle au milieu'
                          : 'Bout sud de l’axe'}
                    </span>
                  </button>
                ))}
              </div>
              <p className={styles.note}>Tu peux aussi toucher directement les repères du globe.</p>
            </>
          )}
        </SceneControls>
      ) : null}
      {label ? (
        <CelestialLabel
          scene={label.scene}
          camera={label.camera}
          worldPosition={label.position}
          text={label.text}
          visible={label.visible}
        />
      ) : null}
      {sunLabel ? (
        <CelestialLabel
          scene={sunLabel.scene}
          camera={sunLabel.camera}
          worldPosition={sunLabel.position}
          text={sunLabel.text}
          visible={sunLabel.visible}
        />
      ) : null}
    </div>
  );
}
