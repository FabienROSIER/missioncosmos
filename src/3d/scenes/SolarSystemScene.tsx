'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  type Mesh,
  type Scene,
} from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi } from '@/3d/controls/missionCamera';
import {
  animateCameraTo,
  captureCameraHome,
  configureMissionCamera,
  createMissionCameraApi,
} from '@/3d/controls/missionCamera';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import {
  applyEmissiveSunMaterial,
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
  frameSolarSystemBody,
  frameSolarSystemOverview,
} from '@/3d/utils/solarSystemFraming';
import {
  PLANET_ORDER,
  SOLAR_SYSTEM_PLANETS,
  SOLAR_SYSTEM_SUN,
  planetDefinition,
  resolveOrbit,
  resolveSunRadius,
  type PlanetId,
  type SolarSystemScaleMode,
} from '@/content/bodies/solarSystem';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { prefersReducedMotion } from '@/lib/motion';
import { logger } from '@/lib/logger';
import styles from './SolarSystemScene.module.css';

export type { SolarSystemScaleMode };
export type SolarSystemFocusId = PlanetId | 'sun' | null;

export type SolarSystemSceneApi = {
  camera: MissionCameraApi;
  /** Lisible (maquette) ou à l’échelle (tailles + distances ≈ réelles). */
  setScaleMode: (mode: SolarSystemScaleMode) => void;
  getScaleMode: () => SolarSystemScaleMode;
  focusBody: (id: SolarSystemFocusId) => void;
  focusNext: () => void;
  focusPrev: () => void;
  setOrderChallenge: (enabled: boolean) => void;
  setCinematicMode: (enabled: boolean) => void;
  setPickEnabled: (enabled: boolean) => void;
};

type SolarSystemSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: SolarSystemSceneApi) => void;
  onPlanetSelect?: (id: PlanetId | 'sun') => void;
  onOrderSuccess?: () => void;
  onOrderMiss?: (expected: PlanetId) => void;
};

type OrbitRing = {
  mesh: Mesh;
  baseRadius: number;
  dispose: () => void;
};

type FactCard = {
  name: string;
  fact: string;
  orderHint?: string;
};

function createOrbitRing(scene: Scene, radius: number, quality: 'low' | 'high'): OrbitRing {
  const tessellation = quality === 'low' ? 48 : 72;
  const mesh = MeshBuilder.CreateTorus(
    `ss-orbit-${radius.toFixed(2)}`,
    { diameter: radius * 2, thickness: quality === 'low' ? 0.02 : 0.016, tessellation },
    scene,
  );
  mesh.isPickable = false;
  mesh.renderingGroupId = 1;

  const mat = new StandardMaterial(`ss-orbit-mat-${radius.toFixed(2)}`, scene);
  mat.emissiveColor = new Color3(0.35, 0.5, 0.7);
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.alpha = 0.38;
  mat.disableLighting = true;
  mesh.material = mat;

  return {
    mesh,
    baseRadius: radius,
    dispose: () => {
      mesh.dispose();
      mat.dispose();
    },
  };
}

function radiusFor(id: PlanetId, mode: SolarSystemScaleMode): number {
  const p = SOLAR_SYSTEM_PLANETS[id];
  return mode === 'readable' ? p.readableRadius : p.toScaleRadius;
}

/** Scène Mission 05 — Soleil + 8 planètes, fiches, modes de taille, défi d’ordre. */
export function SolarSystemScene({
  className,
  fill = false,
  onSceneApi,
  onPlanetSelect,
  onOrderSuccess,
  onOrderMiss,
}: SolarSystemSceneProps) {
  const [fact, setFact] = useState<FactCard | null>(null);
  const [scaleModeLabel, setScaleModeLabel] = useState<SolarSystemScaleMode>('readable');
  const [orderProgress, setOrderProgress] = useState<string | null>(null);
  const apiRef = useRef<SolarSystemSceneApi | null>(null);
  const onSceneApiRef = useRef(onSceneApi);
  const onPlanetSelectRef = useRef(onPlanetSelect);
  const onOrderSuccessRef = useRef(onOrderSuccess);
  const onOrderMissRef = useRef(onOrderMiss);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onPlanetSelectRef.current = onPlanetSelect;
  }, [onPlanetSelect]);
  useEffect(() => {
    onOrderSuccessRef.current = onOrderSuccess;
  }, [onOrderSuccess]);
  useEffect(() => {
    onOrderMissRef.current = onOrderMiss;
  }, [onOrderMiss]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.12,
      sunIntensity: 1.55,
      contrast: 1.1,
      hemiDiffuse: new Color3(0.28, 0.3, 0.38),
      hemiGround: new Color3(0.02, 0.025, 0.03),
    });

    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.65 : 0.78,
      segments: quality === 'low' ? 24 : 48,
    });

    let scaleMode: SolarSystemScaleMode = 'readable';
    let focusIndex = -1; // -1 = overview ; 0 = sun ; 1..8 = planets
    let pickEnabled = true;
    let orderChallenge = false;
    let orderIndex = 0;
    let orderDone = false;
    let cinematic = false;

    const sun = await CelestialBodyEntity.create(scene, {
      definition: {
        ...SOLAR_SYSTEM_SUN,
        visual: { ...SOLAR_SYSTEM_SUN.visual, visualRadius: resolveSunRadius(scaleMode) },
      },
      position: Vector3.Zero(),
      spin: true,
    });
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    // Direction fixe (perf mobile) — le Soleil reste le point lumineux émissif au centre.
    lighting.sunLight.direction = new Vector3(-0.35, -0.55, -0.65);

    const planetEntities = new Map<PlanetId, CelestialBodyEntity>();
    const orbitRings: OrbitRing[] = [];

    // Angles étalés pour éviter l’alignement radial
    const startAngles = PLANET_ORDER.map((_, i) => (i / PLANET_ORDER.length) * Math.PI * 2 + 0.35);

    await Promise.all(
      PLANET_ORDER.map(async (id, i) => {
        const angle = startAngles[i]!;
        const orbit = resolveOrbit(id, scaleMode);
        const entity = await CelestialBodyEntity.create(scene, {
          definition: planetDefinition(id, scaleMode),
          position: new Vector3(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit),
          spin: true,
        });
        applyPlanetaryMaterials(scene, entity.meshes, quality);
        optimizeCelestialMeshes(entity.meshes, quality, 'planet');
        planetEntities.set(id, entity);
        orbitRings.push(createOrbitRing(scene, orbit, quality === 'low' ? 'low' : 'high'));
      }),
    );

    await Promise.all([
      sun.playAppear(),
      ...PLANET_ORDER.map((id) => planetEntities.get(id)!.playAppear()),
    ]);

    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('SolarSystemScene: caméra ArcRotate attendue');
    }

    const maxOrbit = () =>
      Math.max(...PLANET_ORDER.map((id) => resolveOrbit(id, scaleMode)));

    const applyLayout = () => {
      sun.pivot.scaling.setAll(resolveSunRadius(scaleMode));
      PLANET_ORDER.forEach((id, i) => {
        const entity = planetEntities.get(id)!;
        const angle = startAngles[i]!;
        const orbit = resolveOrbit(id, scaleMode);
        const r = radiusFor(id, scaleMode);
        entity.pivot.scaling.setAll(r);
        entity.pivot.position.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);
        const ring = orbitRings[i];
        if (ring) {
          const factor = orbit / ring.baseRadius;
          ring.mesh.scaling.x = factor;
          ring.mesh.scaling.z = factor;
        }
      });
    };

    const reframeAfterLayout = () => {
      if (focusIndex === -1 && camera instanceof ArcRotateCamera) {
        frameSolarSystemOverview(camera, maxOrbit());
      } else if (focusIndex === 0) {
        focusBody('sun');
      } else if (focusIndex > 0) {
        focusBody(PLANET_ORDER[focusIndex - 1]!);
      }
    };

    const clearSelection = () => {
      sun.setSelected(false);
      for (const e of planetEntities.values()) e.setSelected(false);
    };

    const showFactFor = (id: PlanetId | 'sun') => {
      if (id === 'sun') {
        setFact({
          name: 'Soleil',
          fact: 'Notre étoile. Les planètes tournent autour de lui.',
          orderHint: orderChallenge && !orderDone
            ? `Prochaine : ${SOLAR_SYSTEM_PLANETS[PLANET_ORDER[orderIndex]!].nameFr}`
            : undefined,
        });
        return;
      }
      const p = SOLAR_SYSTEM_PLANETS[id];
      setFact({
        name: p.nameFr,
        fact: p.fact,
        orderHint: orderChallenge && !orderDone
          ? `Prochaine : ${SOLAR_SYSTEM_PLANETS[PLANET_ORDER[orderIndex]!].nameFr}`
          : undefined,
      });
    };

    const selectBody = (id: PlanetId | 'sun') => {
      clearSelection();
      if (id === 'sun') sun.setSelected(true);
      else planetEntities.get(id)?.setSelected(true);
      showFactFor(id);
      onPlanetSelectRef.current?.(id);
    };

    const focusBody = (id: SolarSystemFocusId) => {
      if (!(camera instanceof ArcRotateCamera)) return;
      const from = captureCameraHome(camera);
      if (id === null) {
        focusIndex = -1;
        clearSelection();
        setFact(null);
        frameSolarSystemOverview(camera, maxOrbit());
      } else if (id === 'sun') {
        focusIndex = 0;
        selectBody('sun');
        frameSolarSystemBody(camera, sun.pivot.position, resolveSunRadius(scaleMode));
      } else {
        const idx = PLANET_ORDER.indexOf(id);
        focusIndex = idx + 1;
        const entity = planetEntities.get(id);
        if (!entity) return;
        selectBody(id);
        frameSolarSystemBody(camera, entity.pivot.position, radiusFor(id, scaleMode));
      }
      const to = captureCameraHome(camera);
      if (prefersReducedMotion()) return;
      camera.alpha = from.alpha;
      camera.beta = from.beta;
      camera.radius = from.radius;
      camera.setTarget(from.target);
      void animateCameraTo(camera, to, 480);
    };

    const focusNext = () => {
      // -1 overview → sun(0) → planets 1..8 → overview
      const next = focusIndex >= 8 ? -1 : focusIndex + 1;
      if (next === -1) focusBody(null);
      else if (next === 0) focusBody('sun');
      else focusBody(PLANET_ORDER[next - 1]!);
    };

    const focusPrev = () => {
      const prev = focusIndex <= -1 ? 8 : focusIndex - 1;
      if (prev === -1) focusBody(null);
      else if (prev === 0) focusBody('sun');
      else focusBody(PLANET_ORDER[prev - 1]!);
    };

    const handlePick = (id: PlanetId | 'sun') => {
      if (!pickEnabled || cinematic) return;

      if (orderChallenge && !orderDone) {
        if (id === 'sun') {
          selectBody('sun');
          return;
        }
        const expected = PLANET_ORDER[orderIndex]!;
        if (id === expected) {
          selectBody(id);
          orderIndex += 1;
          if (orderIndex >= PLANET_ORDER.length) {
            orderDone = true;
            setOrderProgress('8 / 8 — bravo !');
            setFact({
              name: SOLAR_SYSTEM_PLANETS[id].nameFr,
              fact: SOLAR_SYSTEM_PLANETS[id].fact,
              orderHint: 'Ordre complet !',
            });
            onOrderSuccessRef.current?.();
          } else {
            const nextName = SOLAR_SYSTEM_PLANETS[PLANET_ORDER[orderIndex]!].nameFr;
            setOrderProgress(`${orderIndex} / 8 — prochaine : ${nextName}`);
            setFact({
              name: SOLAR_SYSTEM_PLANETS[id].nameFr,
              fact: SOLAR_SYSTEM_PLANETS[id].fact,
              orderHint: `Prochaine : ${nextName}`,
            });
          }
          return;
        }
        onOrderMissRef.current?.(expected);
        setOrderProgress(`Indice : touche ${SOLAR_SYSTEM_PLANETS[expected].nameFr}`);
        setFact({
          name: SOLAR_SYSTEM_PLANETS[id].nameFr,
          fact: SOLAR_SYSTEM_PLANETS[id].fact,
          orderHint: `Pas encore — prochaine : ${SOLAR_SYSTEM_PLANETS[expected].nameFr}`,
        });
        clearSelection();
        planetEntities.get(id)?.setHighlighted(true);
        window.setTimeout(() => planetEntities.get(id)?.setHighlighted(false), 600);
        return;
      }

      selectBody(id);
    };

    sun.onPick.add(() => handlePick('sun'));
    for (const id of PLANET_ORDER) {
      planetEntities.get(id)!.onPick.add(() => handlePick(id));
    }

    if (camera instanceof ArcRotateCamera) {
      frameSolarSystemOverview(camera, maxOrbit());
      configureMissionCamera(camera, {
        allowPan: false,
        lowerBetaLimit: 0.25,
        upperBetaLimit: Math.PI / 2.05,
      });
    }

    const home = camera instanceof ArcRotateCamera ? captureCameraHome(camera) : {
      alpha: 0,
      beta: Math.PI / 3,
      radius: 20,
      target: Vector3.Zero(),
    };
    const cameraApi =
      camera instanceof ArcRotateCamera
        ? createMissionCameraApi(camera, home, sun.pivot, sun.meshes)
        : {
            recenter: async () => undefined,
            focusOn: async () => undefined,
            getHome: () => home,
          };

    const setScaleMode = (mode: SolarSystemScaleMode) => {
      scaleMode = mode;
      setScaleModeLabel(mode);
      applyLayout();
      reframeAfterLayout();
    };

    const api: SolarSystemSceneApi = {
      camera: cameraApi,
      setScaleMode,
      getScaleMode: () => scaleMode,
      focusBody,
      focusNext,
      focusPrev,
      setOrderChallenge: (enabled) => {
        orderChallenge = enabled;
        if (enabled) {
          orderIndex = 0;
          orderDone = false;
          setOrderProgress(`0 / 8 — prochaine : ${SOLAR_SYSTEM_PLANETS.mercury.nameFr}`);
          setFact({
            name: 'Défi',
            fact: 'Touche les planètes dans l’ordre depuis le Soleil.',
            orderHint: `Prochaine : ${SOLAR_SYSTEM_PLANETS.mercury.nameFr}`,
          });
        } else {
          setOrderProgress(null);
        }
      },
      setCinematicMode: (enabled) => {
        cinematic = enabled;
        if (enabled && camera instanceof ArcRotateCamera) {
          focusBody(null);
        }
      },
      setPickEnabled: (enabled) => {
        pickEnabled = enabled;
      },
    };
    apiRef.current = api;
    onSceneApiRef.current?.(api);

    const perf = startPerfMonitor(scene, { label: 'mission-05-solar-system' });

    // Lente dérive caméra en mode ciné
    let cineObserver = scene.onBeforeRenderObservable.add(() => {
      if (!cinematic || !(camera instanceof ArcRotateCamera) || prefersReducedMotion()) return;
      camera.alpha += 0.00035 * scene.getEngine().getDeltaTime();
    });

    return () => {
      scene.onBeforeRenderObservable.remove(cineObserver);
      apiRef.current = null;
      perf.dispose();
      for (const ring of orbitRings) ring.dispose();
      for (const e of planetEntities.values()) e.dispose();
      sun.dispose();
      background.dispose();
      lighting.dispose();
    };
  }, []);

  const onPrev = () => apiRef.current?.focusPrev();
  const onNext = () => apiRef.current?.focusNext();
  const onOverview = () => apiRef.current?.focusBody(null);
  const onToggleScale = () => {
    const api = apiRef.current;
    if (!api) return;
    const next = api.getScaleMode() === 'toScale' ? 'readable' : 'toScale';
    api.setScaleMode(next);
    if (next === 'toScale') api.focusBody(null);
  };

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas className={styles.canvas} fill={fill} onSceneReady={onSceneReady} />

      <div className={styles.hud} onPointerDown={(e) => e.stopPropagation()}>
        <div className={styles.navRow} role="group" aria-label="Navigation planètes">
          <button type="button" className={styles.hudBtn} onClick={onPrev}>
            Préc.
          </button>
          <button type="button" className={styles.hudBtn} onClick={onOverview}>
            Vue d’ensemble
          </button>
          <button type="button" className={styles.hudBtn} onClick={onNext}>
            Suiv.
          </button>
        </div>
        <div className={styles.modeRow} role="group" aria-label="Échelle">
          <button
            type="button"
            className={scaleModeLabel === 'toScale' ? styles.hudBtnActive : styles.hudBtn}
            onClick={onToggleScale}
            aria-pressed={scaleModeLabel === 'toScale'}
            title="Tailles et distances ≈ réelles (bascule)"
          >
            À l’échelle
          </button>
        </div>
        {scaleModeLabel === 'toScale' ? (
          <p className={styles.progress} role="note">
            Tailles ≈ réelles et distances ≈ UA (Neptune ≈ 30× plus loin). Zoome : surtout du vide. Le Soleil est un peu grossi pour le voir.
          </p>
        ) : null}
        {orderProgress ? (
          <p className={styles.progress} role="status">
            {orderProgress}
          </p>
        ) : null}
        {fact ? (
          <article className={styles.factCard}>
            <h2 className={styles.factTitle}>{fact.name}</h2>
            <p className={styles.factBody}>{fact.fact}</p>
            {fact.orderHint ? <p className={styles.factHint}>{fact.orderHint}</p> : null}
          </article>
        ) : null}
      </div>
    </div>
  );
}
