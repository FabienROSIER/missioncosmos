'use client';

import { SceneControls } from '@/components/layout/SceneControls';

import '@babylonjs/core/Culling/ray';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Camera,
  Color3,
  Color4,
  Mesh,
  MeshBuilder,
  Quaternion,
  StandardMaterial,
  Vector3,
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
import { frameSolarSystemBody, frameSolarSystemOverview } from '@/3d/utils/solarSystemFraming';
import {
  PLANET_ORDER,
  sizeComparisonLayout,
  type ComparisonGroup,
  SOLAR_SYSTEM_PLANETS,
  SOLAR_SYSTEM_SUN,
  SUN_SIDEREAL_ROTATION_DAYS,
  orbitalAngularSpeed,
  planetDefinition,
  resolveOrbit,
  resolveSunRadius,
  spinAngularSpeed,
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
  /** Maquette, diamètres proportionnels ou règle des distances. */
  setScaleMode: (mode: SolarSystemScaleMode) => void;
  getScaleMode: () => SolarSystemScaleMode;
  setComparisonGroup: (group: ComparisonGroup) => void;
  setHideComparison: (hidden: boolean) => void;
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

function radiusFor(id: PlanetId): number {
  return SOLAR_SYSTEM_PLANETS[id].readableRadius;
}

/** Scène Mission 05 — Soleil + 8 planètes, fiches, modes de taille, défi d’ordre. */
export function SolarSystemScene({
  className,
  fill = false,
  onSceneApi,
  onOrderSuccess,
  onOrderMiss,
}: SolarSystemSceneProps) {
  const [hideComparison, setHideComparison] = useState(false);
  const [fact, setFact] = useState<FactCard | null>(null);
  const [scaleModeLabel, setScaleModeLabel] = useState<SolarSystemScaleMode>('readable');
  const [sizeLabels, setSizeLabels] = useState<Array<{ name: string; left: number; top: number }>>(
    [],
  );
  const [orderProgress, setOrderProgress] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mobilePickRef = useRef<((id: PlanetId | 'sun') => void) | null>(null);
  const apiRef = useRef<SolarSystemSceneApi | null>(null);
  const onSceneApiRef = useRef(onSceneApi);
  const onOrderSuccessRef = useRef(onOrderSuccess);
  const onOrderMissRef = useRef(onOrderMiss);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);
  useEffect(() => {
    onOrderSuccessRef.current = onOrderSuccess;
  }, [onOrderSuccess]);
  useEffect(() => {
    onOrderMissRef.current = onOrderMiss;
  }, [onOrderMiss]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.4 : quality === 'medium' ? 1.6 : 2;
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
    let group: ComparisonGroup = 'jupiter';
    let focusIndex = -1; // -1 = overview ; 0 = sun ; 1..8 = planets
    let pickEnabled = true;
    let orderChallenge = false;
    let orderIndex = 0;
    let orderDone = false;
    let cinematic = false;

    const sun = await CelestialBodyEntity.create(scene, {
      definition: {
        ...SOLAR_SYSTEM_SUN,
        visual: { ...SOLAR_SYSTEM_SUN.visual, visualRadius: resolveSunRadius() },
      },
      position: Vector3.Zero(),
      spin: true,
    });
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    sun.meshes.forEach((mesh) => {
      mesh.isPickable = mesh.getTotalVertices() > 0;
    });
    // Direction fixe (perf mobile) — le Soleil reste le point lumineux émissif au centre.
    lighting.sunLight.direction = new Vector3(-0.35, -0.55, -0.65);

    const planetEntities = new Map<PlanetId, CelestialBodyEntity>();
    const orbitRings: OrbitRing[] = [];

    // Angles aléatoires sur chaque orbite (toute la mission ; évoluent en mode ciné)
    const orbitAngles = PLANET_ORDER.map(() => Math.random() * Math.PI * 2);

    await Promise.all(
      PLANET_ORDER.map(async (id, i) => {
        const angle = orbitAngles[i]!;
        const orbit = resolveOrbit(id);
        const entity = await CelestialBodyEntity.create(scene, {
          definition: planetDefinition(id),
          position: new Vector3(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit),
          spin: true,
        });
        applyPlanetaryMaterials(scene, entity.meshes, quality);
        optimizeCelestialMeshes(entity.meshes, quality, 'planet');
        // Les GLB importés peuvent désactiver le picking ; ces astres sont interactifs.
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
        scale: 1.07,
        alpha: 0.24,
        color: new Color3(0.4, 0.68, 1),
      },
    );

    await Promise.all([
      sun.playAppear(),
      ...PLANET_ORDER.map((id) => planetEntities.get(id)!.playAppear()),
    ]);

    const saturnPivot = planetEntities.get('saturn')!.pivot;
    const saturnOrientation =
      saturnPivot.rotationQuaternion?.clone() ?? Quaternion.FromEulerVector(saturnPivot.rotation);
    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera)) {
      logger.warn('SolarSystemScene: caméra ArcRotate attendue');
    }

    const maxOrbit = () => Math.max(...PLANET_ORDER.map((id) => resolveOrbit(id)));

    const frameSizes = () => {
      if (!(camera instanceof ArcRotateCamera)) return;
      const layout = sizeComparisonLayout(group);
      const aspect = engine.getRenderWidth() / Math.max(engine.getRenderHeight(), 1);
      const margin = 0.4;
      const contentHalfW = layout.width / 2 + margin;
      const contentHalfH =
        Math.max(...layout.bodies.map((b) => (b.id === 'saturn' ? b.extent : b.radius))) + margin;
      // Remplir l’écran (fit largeur ou hauteur) — évite le forçage `3*aspect` qui miniaturisait en PC.
      let halfW: number;
      let halfH: number;
      if (contentHalfW / contentHalfH > aspect) {
        halfW = contentHalfW;
        halfH = contentHalfW / aspect;
      } else {
        halfH = contentHalfH;
        halfW = contentHalfH * aspect;
      }
      // Décale vers le haut pour laisser l’overlay bas sans masquer les astres.
      const upward = halfH * 0.08;
      camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
      camera.orthoLeft = -halfW;
      camera.orthoRight = halfW;
      camera.orthoTop = halfH - upward;
      camera.orthoBottom = -halfH - upward;
      camera.setTarget(Vector3.Zero());
      camera.alpha = Math.PI / 2;
      camera.lowerBetaLimit = camera.upperBetaLimit = Math.PI / 2;
      camera.beta = Math.PI / 2;
      camera.radius = 40;
      camera.minZ = 0.01;
      camera.maxZ = 10000;
      const viewH = halfH * 2;
      setSizeLabels(
        layout.bodies.map((body) => ({
          name: body.id === 'sun' ? 'Soleil' : SOLAR_SYSTEM_PLANETS[body.id].nameFr,
          left: (body.x / halfW + 1) * 50,
          top: ((halfH - upward + body.radius) / viewH) * 100,
        })),
      );
    };

    const applyLayout = () => {
      saturnPivot.rotationQuaternion = saturnOrientation.clone();
      if (scaleMode === 'sizes') saturnPivot.rotate(Vector3.Right(), 0.45);
      lighting.hemiLight.intensity = scaleMode === 'sizes' ? 0.6 : 0.12;
      scene.clearColor =
        scaleMode === 'sizes'
          ? new Color4(0.001, 0.002, 0.004, 1)
          : new Color4(0.03, 0.05, 0.09, 1);
      background.dome.setEnabled(scaleMode !== 'sizes');
      sun.pivot.setEnabled(scaleMode !== 'distances');
      sun.pivot.position.setAll(0);
      planetEntities.forEach((entity) => entity.pivot.setEnabled(scaleMode !== 'distances'));
      orbitRings.forEach((ring) => ring.mesh.setEnabled(scaleMode === 'readable'));
      if (camera instanceof ArcRotateCamera) {
        scene.stopAnimation(camera);
        scene.stopAnimation(camera.target);
        camera.inertialAlphaOffset = camera.inertialBetaOffset = camera.inertialRadiusOffset = 0;
        camera.mode = Camera.PERSPECTIVE_CAMERA;
        if (scaleMode === 'readable') {
          configureMissionCamera(camera, {
            lowerBetaLimit: 0.25,
            upperBetaLimit: Math.PI / 2.05,
          });
          camera.attachControl(engine.getRenderingCanvas(), true);
          camera._panningMouseButton = 1;
        } else camera.detachControl();
      }
      if (scaleMode === 'sizes') {
        sun.pivot.setEnabled(false);
        planetEntities.forEach((entity) => entity.pivot.setEnabled(false));
        for (const body of sizeComparisonLayout(group).bodies) {
          const entity = body.id === 'sun' ? sun : planetEntities.get(body.id)!;
          entity.pivot.setEnabled(true);
          entity.pivot.position.set(body.x, 0, 0);
          entity.pivot.scaling.setAll(body.radius);
        }
        frameSizes();
        return;
      }
      sun.pivot.scaling.setAll(resolveSunRadius());
      PLANET_ORDER.forEach((id, i) => {
        const entity = planetEntities.get(id)!;
        const angle = orbitAngles[i]!;
        const orbit = resolveOrbit(id);
        const r = radiusFor(id);
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
      if (scaleMode !== 'readable') return;
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
          orderHint:
            orderChallenge && !orderDone
              ? `Prochaine : ${SOLAR_SYSTEM_PLANETS[PLANET_ORDER[orderIndex]!].nameFr}`
              : undefined,
        });
        return;
      }
      const p = SOLAR_SYSTEM_PLANETS[id];
      setFact({
        name: p.nameFr,
        fact: p.fact,
        orderHint:
          orderChallenge && !orderDone
            ? `Prochaine : ${SOLAR_SYSTEM_PLANETS[PLANET_ORDER[orderIndex]!].nameFr}`
            : undefined,
      });
    };

    /** Fiche + surbrillance (Préc./Suiv. ou pick 3D). Ne valide pas l’étape découverte. */
    const presentBody = (id: PlanetId | 'sun') => {
      clearSelection();
      if (id === 'sun') sun.setSelected(true);
      else planetEntities.get(id)?.setSelected(true);
      showFactFor(id);
    };

    const focusBody = (id: SolarSystemFocusId) => {
      if (scaleMode !== 'readable') {
        if (id) showFactFor(id);
        return;
      }
      if (!(camera instanceof ArcRotateCamera)) return;
      scene.stopAnimation(camera);
      scene.stopAnimation(camera.target);
      const from = captureCameraHome(camera);
      if (id === null) {
        focusIndex = -1;
        clearSelection();
        setFact(null);
        frameSolarSystemOverview(camera, maxOrbit());
      } else if (id === 'sun') {
        focusIndex = 0;
        presentBody('sun');
        frameSolarSystemBody(camera, sun.pivot.position, resolveSunRadius());
      } else {
        const idx = PLANET_ORDER.indexOf(id);
        focusIndex = idx + 1;
        const entity = planetEntities.get(id);
        if (!entity) return;
        presentBody(id);
        frameSolarSystemBody(camera, entity.pivot.position, radiusFor(id));
      }
      // Mode ciné : cadrage immédiat, le suivi suit la planète en orbite chaque frame
      if (cinematic || prefersReducedMotion()) return;
      const to = captureCameraHome(camera);
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
          presentBody('sun');
          return;
        }
        const expected = PLANET_ORDER[orderIndex]!;
        if (id === expected) {
          presentBody(id);
          const entity = planetEntities.get(id);
          if (entity) {
            playPlanetSuccessHalo(scene, entity.pivot.position.clone(), radiusFor(id));
          }
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

      presentBody(id);
    };

    mobilePickRef.current = handlePick;

    sun.onPick.add(() => handlePick('sun'));
    for (const id of PLANET_ORDER) {
      planetEntities.get(id)!.onPick.add(() => handlePick(id));
    }

    if (camera instanceof ArcRotateCamera) {
      frameSolarSystemOverview(camera, maxOrbit());
      configureMissionCamera(camera, {
        lowerBetaLimit: 0.25,
        upperBetaLimit: Math.PI / 2.05,
      });
    }

    const home =
      camera instanceof ArcRotateCamera
        ? captureCameraHome(camera)
        : {
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
      if (orderChallenge) mode = 'readable';
      scaleMode = mode;
      focusIndex = -1;
      setFact(null);
      setScaleModeLabel(mode);
      setHideComparison(false);
      applyLayout();
      reframeAfterLayout();
    };

    const api: SolarSystemSceneApi = {
      camera: {
        ...cameraApi,
        recenter: async () => {
          if (scaleMode === 'sizes') frameSizes();
          else focusBody(null);
        },
      },
      setScaleMode,
      getScaleMode: () => scaleMode,
      setComparisonGroup: (next) => {
        group = next;
        setFact(null);
        if (scaleMode === 'sizes') applyLayout();
      },
      setHideComparison: (hidden) => {
        setHideComparison(hidden);
      },
      focusBody,
      focusNext,
      focusPrev,
      setOrderChallenge: (enabled) => {
        if (enabled) {
          // Ne pas réinitialiser si le défi tourne déjà (re-sync layout / parent).
          if (orderChallenge) return;
          orderChallenge = true;
          setScaleMode('readable');
          orderIndex = 0;
          orderDone = false;
          setOrderProgress(`0 / 8 — prochaine : ${SOLAR_SYSTEM_PLANETS.mercury.nameFr}`);
          setFact({
            name: 'Défi',
            fact: 'Touche les planètes dans l’ordre depuis le Soleil.',
            orderHint: `Prochaine : ${SOLAR_SYSTEM_PLANETS.mercury.nameFr}`,
          });
        } else {
          orderChallenge = false;
          setOrderProgress(null);
        }
      },
      setCinematicMode: (enabled) => {
        cinematic = enabled;
        if (enabled && camera instanceof ArcRotateCamera) {
          focusBody(null);
          // Spins gérés par l’horloge physique du mode ciné
          sun.setSpinning(false);
          for (const e of planetEntities.values()) e.setSpinning(false);
        } else if (!prefersReducedMotion()) {
          sun.setSpinning(true);
          for (const e of planetEntities.values()) e.setSpinning(true);
        }
      },
      setPickEnabled: (enabled) => {
        pickEnabled = enabled;
      },
    };
    apiRef.current = api;
    onSceneApiRef.current?.(api);
    const resize = new ResizeObserver(() => {
      engine.resize();
      if (scaleMode === 'sizes') frameSizes();
    });
    const canvas = engine.getRenderingCanvas();
    if (canvas) resize.observe(canvas);

    const perf = startPerfMonitor(scene, { label: 'mission-05-solar-system' });

    // Mode ciné (quiz+) : planètes en orbite + spin ; caméra suit le corps focalisé
    const cineObserver = scene.onBeforeRenderObservable.add(() => {
      if (scaleMode !== 'readable' || !cinematic || prefersReducedMotion()) {
        return;
      }
      const dt = scene.getEngine().getDeltaTime() / 1000;
      sun.pivot.rotate(Vector3.Up(), spinAngularSpeed(SUN_SIDEREAL_ROTATION_DAYS) * dt);

      PLANET_ORDER.forEach((id, i) => {
        const p = SOLAR_SYSTEM_PLANETS[id];
        // Antihoraire vu du nord (+Y) : (cos θ, sin θ) avec θ qui diminue
        orbitAngles[i] = (orbitAngles[i] ?? 0) - orbitalAngularSpeed(p.orbitalPeriodDays) * dt;
        const orbit = resolveOrbit(id);
        const angle = orbitAngles[i]!;
        const entity = planetEntities.get(id)!;
        entity.pivot.position.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);
        entity.pivot.rotate(Vector3.Up(), spinAngularSpeed(p.siderealRotationDays) * dt);
      });

      if (!(camera instanceof ArcRotateCamera)) return;
      if (focusIndex > 0) {
        const id = PLANET_ORDER[focusIndex - 1]!;
        const entity = planetEntities.get(id);
        if (entity) camera.setTarget(entity.pivot.position);
      } else if (focusIndex === 0) {
        camera.setTarget(sun.pivot.position);
      }
    });

    return () => {
      scene.onBeforeRenderObservable.remove(cineObserver);
      resize.disconnect();
      mobilePickRef.current = null;
      apiRef.current = null;
      perf.dispose();
      earthAtmosphere.dispose();
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

  return (
    <div
      ref={wrapRef}
      className={[
        styles.wrap,
        scaleModeLabel === 'sizes' ? styles.sizesView : '',
        scaleModeLabel === 'distances' ? styles.distancesView : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          styles.sceneViewport,
          hideComparison && scaleModeLabel === 'sizes' ? styles.mysteryViewport : '',
        ].join(' ')}
      >
        <BabylonCanvas className={styles.canvas} fill={fill} onSceneReady={onSceneReady} />
        {scaleModeLabel === 'sizes' &&
          !hideComparison &&
          sizeLabels.map((label) => (
            <span
              key={label.name}
              className={styles.sizeLabel}
              style={{ left: `${label.left}%`, top: `${label.top}%` }}
            >
              {label.name}
            </span>
          ))}
        {hideComparison && scaleModeLabel === 'sizes' && (
          <div className={styles.mystery}>
            <span aria-hidden="true">?</span>
            <p>Choisis une réponse pour voir les astres.</p>
          </div>
        )}
      </div>

      <SceneControls className={styles.hud} onPointerDown={(e) => e.stopPropagation()}>
        {scaleModeLabel === 'readable' && (
          <>
            {/* Pendant le défi d’ordre : pas de nav (évite un 1er « focus » sans validation). */}
            {!orderProgress ? (
              <div className={styles.navRow} role="group" aria-label="Navigation planètes">
                <button type="button" className={styles.hudBtn} onClick={onPrev}>
                  Précédente
                </button>
                <button type="button" className={styles.hudBtn} onClick={onOverview}>
                  Vue d’ensemble
                </button>
                <button type="button" className={styles.hudBtn} onClick={onNext}>
                  Suivante
                </button>
              </div>
            ) : null}
            {/* Pas de raccourcis par nom pendant le défi d’ordre (reconnaissance 3D). */}
            {!orderProgress ? (
              <div className={styles.mobileTargets} role="group" aria-label="Toucher une planète">
                {PLANET_ORDER.map((id) => (
                  <button
                    type="button"
                    key={id}
                    className={styles.hudBtn}
                    onClick={() => mobilePickRef.current?.(id)}
                  >
                    {SOLAR_SYSTEM_PLANETS[id].nameFr}
                  </button>
                ))}
              </div>
            ) : null}
            <p className={styles.progress}>
              Tailles, distances et positions choisies pour apprendre.
            </p>
          </>
        )}
        {orderProgress ? (
          <p className={styles.progress} role="status">
            {orderProgress}
          </p>
        ) : null}
        {fact && scaleModeLabel === 'readable' ? (
          <article className={styles.factCard}>
            <h2 className={styles.factTitle}>{fact.name}</h2>
            <p className={styles.factBody}>{fact.fact}</p>
            {fact.orderHint ? <p className={styles.factHint}>{fact.orderHint}</p> : null}
          </article>
        ) : null}
      </SceneControls>
    </div>
  );
}
