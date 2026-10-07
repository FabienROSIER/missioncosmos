'use client';

import { SceneControls } from '@/components/layout/SceneControls';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  type AbstractMesh,
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
import { playPlanetSuccessHalo } from '@/3d/fx/planetSuccessHalo';
import {
  applyEmissiveSunMaterial,
  applyPlanetaryMaterials,
  createSimpleAtmosphere,
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
  ORBIT_COMPARE_META,
  ORBIT_COMPARE_PLANETS,
  ORBIT_RACE_WINNER,
  orbitYearLabel,
  type OrbitComparePlanetId,
} from '@/content/bodies/orbitsCompare';
import {
  EARTH_ORBIT_PERIOD_DAYS,
  SOLAR_SYSTEM_PLANETS,
  SOLAR_SYSTEM_SUN,
  SUN_SIDEREAL_ROTATION_DAYS,
  orbitalAngularSpeed,
  planetDefinition,
  spinAngularSpeed,
} from '@/content/bodies/solarSystem';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { logger } from '@/lib/logger';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './OrbitsScene.module.css';

export type OrbitSpeedPreset = 0 | 1 | 4;

export type OrbitsSceneApi = {
  camera: MissionCameraApi;
  setSpeed: (mult: OrbitSpeedPreset) => void;
  setPickEnabled: (enabled: boolean) => void;
  setRaceChallenge: (enabled: boolean) => void;
  setInfoEnabled: (enabled: boolean) => void;
};

type OrbitsSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: OrbitsSceneApi) => void;
  onRaceSuccess?: () => void;
  onRaceMiss?: () => void;
  /** Découverte : vitesse changée ou fiche d’une planète ouverte. */
  onExplore?: () => void;
};

type OrbitRing = {
  mesh: Mesh;
  dispose: () => void;
};

type PlanetCard = {
  name: string;
  yearLabel: string;
};

function createOrbitRing(scene: Scene, radius: number, quality: 'low' | 'high'): OrbitRing {
  const tessellation = quality === 'low' ? 48 : 72;
  const mesh = MeshBuilder.CreateTorus(
    `orb-ring-${radius.toFixed(2)}`,
    { diameter: radius * 2, thickness: quality === 'low' ? 0.028 : 0.022, tessellation },
    scene,
  );
  mesh.isPickable = false;
  mesh.renderingGroupId = 1;

  const mat = new StandardMaterial(`orb-ring-mat-${radius.toFixed(2)}`, scene);
  mat.emissiveColor = new Color3(0.42, 0.62, 0.82);
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.alpha = 0.45;
  mat.disableLighting = true;
  mesh.material = mat;

  return {
    mesh,
    dispose: () => {
      mesh.dispose();
      mat.dispose();
    },
  };
}

function planetDefForCompare(id: OrbitComparePlanetId) {
  const base = planetDefinition(id);
  const meta = ORBIT_COMPARE_META[id];
  return {
    ...base,
    visual: { ...base.visual, visualRadius: meta.visualRadius },
  };
}

/** Scène Mission 06 — Soleil + 3 planètes, vitesse, défi période. */
export function OrbitsScene({
  className,
  fill = false,
  onSceneApi,
  onRaceSuccess,
  onRaceMiss,
  onExplore,
}: OrbitsSceneProps) {
  const [speed, setSpeedUi] = useState<OrbitSpeedPreset>(1);
  const [raceMode, setRaceMode] = useState(false);
  const [card, setCard] = useState<PlanetCard | null>(null);
  const [raceHint, setRaceHint] = useState<string | null>(null);
  const mobilePickRef = useRef<((id: OrbitComparePlanetId) => void) | null>(null);
  const apiRef = useRef<OrbitsSceneApi | null>(null);
  const onSceneApiRef = useRef(onSceneApi);
  const onRaceSuccessRef = useRef(onRaceSuccess);
  const onRaceMissRef = useRef(onRaceMiss);
  const onExploreRef = useRef(onExplore);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onRaceSuccessRef.current = onRaceSuccess;
  }, [onRaceSuccess]);
  useEffect(() => {
    onRaceMissRef.current = onRaceMiss;
  }, [onRaceMiss]);
  useEffect(() => {
    onExploreRef.current = onExplore;
  }, [onExplore]);

  const applySpeed = useCallback(
    (mult: OrbitSpeedPreset) => {
      // Défi course : Pause ou Normal seulement
      if (raceMode && mult > 1) return;
      setSpeedUi(mult);
      apiRef.current?.setSpeed(mult);
    },
    [raceMode],
  );

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.14,
      sunIntensity: 1.5,
      contrast: 1.08,
      hemiDiffuse: new Color3(0.3, 0.32, 0.4),
      hemiGround: new Color3(0.02, 0.025, 0.03),
    });

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.65 : 0.78,
      segments: quality === 'low' ? 24 : 48,
    });

    let pickEnabled = true;
    let infoEnabled = false;
    let raceChallenge = false;
    let raceDone = false;
    let speedMult: OrbitSpeedPreset = 1;

    const sun = await CelestialBodyEntity.create(scene, {
      definition: {
        ...SOLAR_SYSTEM_SUN,
        visual: { ...SOLAR_SYSTEM_SUN.visual, visualRadius: 1.35 },
      },
      position: Vector3.Zero(),
      spin: false,
    });
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    sun.meshes.forEach((mesh) => {
      mesh.isPickable = false;
    });
    lighting.sunLight.direction = new Vector3(-0.35, -0.55, -0.65);

    const planetEntities = new Map<OrbitComparePlanetId, CelestialBodyEntity>();
    const orbitRings: OrbitRing[] = [];
    const orbitAngles = ORBIT_COMPARE_PLANETS.map(() => Math.random() * Math.PI * 2);

    await Promise.all(
      ORBIT_COMPARE_PLANETS.map(async (id, i) => {
        const angle = orbitAngles[i]!;
        const orbit = ORBIT_COMPARE_META[id].orbitRadius;
        const entity = await CelestialBodyEntity.create(scene, {
          definition: planetDefForCompare(id),
          position: new Vector3(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit),
          spin: false,
        });
        applyPlanetaryMaterials(scene, entity.meshes, quality);
        optimizeCelestialMeshes(entity.meshes, quality, 'planet');
        entity.meshes.forEach((mesh) => {
          mesh.isPickable = mesh.getTotalVertices() > 0;
        });
        planetEntities.set(id, entity);
        orbitRings[i] = createOrbitRing(scene, orbit, quality === 'low' ? 'low' : 'high');
      }),
    );

    const earthAtmosphere = createSimpleAtmosphere(
      scene,
      planetEntities.get('earth')!.pivot,
      {
        quality,
        scale: 1.075,
        alpha: 0.26,
        color: new Color3(0.4, 0.68, 1),
      },
    );

    await Promise.all([
      sun.playAppear(),
      ...ORBIT_COMPARE_PLANETS.map((id) => planetEntities.get(id)!.playAppear()),
    ]);

    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('OrbitsScene: caméra ArcRotate attendue');
      return;
    }

    const maxOrbit = Math.max(
      ...ORBIT_COMPARE_PLANETS.map((id) => ORBIT_COMPARE_META[id].orbitRadius),
    );
    camera.setTarget(Vector3.Zero());
    camera.alpha = -Math.PI / 2.4;
    camera.beta = 1.05;
    camera.radius = maxOrbit * 2.35;
    camera.lowerRadiusLimit = maxOrbit * 1.2;
    camera.upperRadiusLimit = maxOrbit * 4.2;
    camera.lowerBetaLimit = 0.35;
    camera.upperBetaLimit = Math.PI / 2 - 0.08;
    configureMissionCamera(camera);

    const home = captureCameraHome(camera);
    const allMeshes: AbstractMesh[] = [
      ...sun.meshes,
      ...ORBIT_COMPARE_PLANETS.flatMap((id) => planetEntities.get(id)!.meshes),
    ];
    const cameraApi = createMissionCameraApi(camera, home, sun.pivot, allMeshes);

    const handlePick = (id: OrbitComparePlanetId) => {
      if (!pickEnabled) return;

      if (raceChallenge && !raceDone) {
        if (id === ORBIT_RACE_WINNER) {
          raceDone = true;
          setRaceHint(null);
          setCard({
            name: SOLAR_SYSTEM_PLANETS[id].nameFr,
            yearLabel: orbitYearLabel(id),
          });
          const entity = planetEntities.get(id)!;
          playPlanetSuccessHalo(
            scene,
            entity.pivot.position.clone(),
            ORBIT_COMPARE_META[id].visualRadius,
          );
          onRaceSuccessRef.current?.();
        } else {
          setRaceHint('Pas celle-là — regarde qui tourne le plus vite.');
          planetEntities.get(id)?.setHighlighted(true);
          window.setTimeout(() => planetEntities.get(id)?.setHighlighted(false), 500);
          onRaceMissRef.current?.();
        }
        return;
      }

      if (infoEnabled) {
        setCard({
          name: SOLAR_SYSTEM_PLANETS[id].nameFr,
          yearLabel: orbitYearLabel(id),
        });
        for (const pid of ORBIT_COMPARE_PLANETS) {
          planetEntities.get(pid)?.setSelected(pid === id);
        }
        onExploreRef.current?.();
      }
    };

    mobilePickRef.current = handlePick;

    const pickObs = ORBIT_COMPARE_PLANETS.map((id) =>
      planetEntities.get(id)!.onPick.add(() => handlePick(id)),
    );

    const reduced = prefersReducedMotion();
    const observer = scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05) * (reduced ? 0 : speedMult);
      if (dt <= 0) return;

      sun.pivot.rotate(Vector3.Up(), spinAngularSpeed(SUN_SIDEREAL_ROTATION_DAYS) * dt * 0.35);

      ORBIT_COMPARE_PLANETS.forEach((id, i) => {
        const p = SOLAR_SYSTEM_PLANETS[id];
        orbitAngles[i] = (orbitAngles[i] ?? 0) - orbitalAngularSpeed(p.orbitalPeriodDays) * dt;
        const orbit = ORBIT_COMPARE_META[id].orbitRadius;
        const angle = orbitAngles[i]!;
        const entity = planetEntities.get(id)!;
        entity.pivot.position.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);
        entity.pivot.rotate(Vector3.Up(), spinAngularSpeed(p.siderealRotationDays) * dt);
      });
    });

    const api: OrbitsSceneApi = {
      camera: cameraApi,
      setSpeed: (mult) => {
        const next = raceChallenge && mult > 1 ? 1 : mult;
        speedMult = next;
        setSpeedUi(next);
        if (next !== 1) onExploreRef.current?.();
      },
      setPickEnabled: (enabled) => {
        pickEnabled = enabled;
      },
      setRaceChallenge: (enabled) => {
        if (enabled) {
          if (raceChallenge) return;
          raceChallenge = true;
          setRaceMode(true);
          // Défi : forcer Normal (ou garder Pause si déjà en pause)
          if (speedMult > 1) {
            speedMult = 1;
            setSpeedUi(1);
          }
          raceDone = false;
          setRaceHint(null);
          for (const pid of ORBIT_COMPARE_PLANETS) {
            planetEntities.get(pid)?.setSelected(false);
            planetEntities.get(pid)?.setHighlighted(false);
          }
        } else {
          raceChallenge = false;
          setRaceMode(false);
          raceDone = false;
          setRaceHint(null);
        }
      },
      setInfoEnabled: (enabled) => {
        infoEnabled = enabled;
        if (!enabled) {
          setCard(null);
          for (const pid of ORBIT_COMPARE_PLANETS) {
            planetEntities.get(pid)?.setSelected(false);
          }
        }
      },
    };
    apiRef.current = api;
    onSceneApiRef.current?.(api);

    const perf = startPerfMonitor(scene, { label: 'mission-06-orbits' });

    return () => {
      perf.dispose();
      scene.onBeforeRenderObservable.remove(observer);
      pickObs.forEach((obs, i) => {
        const id = ORBIT_COMPARE_PLANETS[i]!;
        planetEntities.get(id)?.onPick.remove(obs);
      });
      earthAtmosphere.dispose();
      for (const ring of orbitRings) ring.dispose();
      for (const id of ORBIT_COMPARE_PLANETS) planetEntities.get(id)?.dispose();
      sun.dispose();
      background.dispose();
      lighting.dispose();
      mobilePickRef.current = null;
      apiRef.current = null;
    };
  }, []);

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas className={styles.canvas} fill={fill} onSceneReady={onSceneReady} />
      <SceneControls className={styles.hud} aria-label="Contrôles du temps">
        <div className={styles.speedRow} role="group" aria-label="Vitesse de simulation">
          {(
            [
              [0, 'Pause'],
              [1, 'Normal'],
              [4, 'Rapide'],
            ] as const
          ).map(([value, label]) => {
            const blocked = raceMode && value > 1;
            return (
              <button
                key={value}
                type="button"
                className={speed === value ? styles.speedActive : styles.speedBtn}
                aria-pressed={speed === value}
                disabled={blocked}
                title={blocked ? 'Indisponible pendant le défi' : undefined}
                onClick={() => applySpeed(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className={styles.mobileTargets} role="group" aria-label="Toucher une planète">
          {ORBIT_COMPARE_PLANETS.map((id) => (
            <button
              type="button"
              key={id}
              className={styles.speedBtn}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
                e.preventDefault();
                mobilePickRef.current?.(id);
              }}
              onClick={() => mobilePickRef.current?.(id)}
            >
              {SOLAR_SYSTEM_PLANETS[id].nameFr}
            </button>
          ))}
        </div>
        {card ? (
          <div className={styles.card} role="status">
            <p className={styles.cardTitle}>{card.name}</p>
            <p className={styles.cardBody}>Un tour = {card.yearLabel}</p>
          </div>
        ) : null}
        {raceHint ? (
          <p className={styles.raceHint} role="status">
            {raceHint}
          </p>
        ) : null}
        <p className={styles.scaleNote}>
          Cercles pour comparer · 1 tour Terre ≈ {Math.round(EARTH_ORBIT_PERIOD_DAYS)} j en vrai
        </p>
      </SceneControls>
    </div>
  );
}
