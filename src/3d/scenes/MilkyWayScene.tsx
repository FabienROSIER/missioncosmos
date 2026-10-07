'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Constants,
  Matrix,
  Material,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  ShaderMaterial,
  TransformNode,
  Vector3,
  VertexData,
} from '@babylonjs/core';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { resolveGraphicsQuality } from '@/3d/materials/graphicsQuality';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { createMilkyWayGlow } from '@/3d/entities/createMilkyWayGlow';
import {
  applyEmissiveSunMaterial,
  applyPlanetaryMaterials,
  createSimpleAtmosphere,
  setupSceneLighting,
} from '@/3d/materials';
import { optimizeCelestialMeshes } from '@/3d/performance';
import {
  PLANET_ORDER,
  SOLAR_SYSTEM_PLANETS,
  SOLAR_SYSTEM_SUN,
  SUN_SIDEREAL_ROTATION_DAYS,
  orbitalAngularSpeed,
  planetDefinition,
  resolveOrbit,
  resolveSunRadius,
  spinAngularSpeed,
} from '@/content/bodies/solarSystem';
import { SceneControls } from '@/components/layout/SceneControls';
import {
  GALAXY_JOURNEY_DURATION,
  GALACTIC_ORBIT_DURATION,
  GALACTIC_ROUTES,
  galacticRoutePosition,
  type GalacticRouteId,
  GALAXY_LOCATIONS,
  SUN_NEIGHBOURHOOD,
  SOLAR_NEIGHBOUR_STARS,
  galaxyJourney,
  galaxyTransition,
  galaxyPoints,
} from '@/content/bodies/milkyWay';
import { prefersReducedMotion } from '@/lib/motion';
import { shuffleArray } from '@/lib/shuffle';
import styles from './MilkyWayScene.module.css';

type Props = {
  className?: string;
  stepId: string;
  onSuccess: () => void;
  onMiss: (message: string) => void;
  /** Gate « À toi de jouer » — le voyage ne démarre / ne valide qu’après. */
  interactive?: boolean;
  challengeSolved?: boolean;
};
export function MilkyWayScene({
  className,
  stepId,
  onSuccess,
  onMiss,
  interactive = true,
  challengeSolved = false,
}: Props) {
  const [ready, setReady] = useState(false);
  const [journey, setJourney] = useState(0);
  const [located, setLocated] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [route, setRoute] = useState<GalacticRouteId>('a');
  const [orbitProgress, setOrbitProgress] = useState(0);
  const [orbitRunning, setOrbitRunning] = useState(false);
  const [orbitDone, setOrbitDone] = useState(false);
  const [orbitFailed, setOrbitFailed] = useState(false);
  const [routeOrder, setRouteOrder] = useState(() => [...GALACTIC_ROUTES]);
  const [locationOrder, setLocationOrder] = useState(() => [...GALAXY_LOCATIONS]);
  const orbitSample = useRef({
    route,
    progress: orbitProgress,
    done: orbitDone,
    failed: orbitFailed,
  });
  const step = useRef(stepId);
  const completedStep = useRef('');
  const sample = useRef({ progress: 0, rotating: false, located: false });
  const events = useRef({ onSuccess, onMiss });
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const viewTransition = useRef<{
    startedAt: number;
    target: Vector3;
    radius: number;
    beta: number;
    alpha: number;
    endBeta: number;
    endAlpha: number;
  } | null>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const routeLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const routeOrderRef = useRef(routeOrder);
  useEffect(() => {
    events.current = { onSuccess, onMiss };
  }, [onSuccess, onMiss]);
  useEffect(() => {
    sample.current = { progress: journey, rotating, located };
  }, [journey, rotating, located]);
  useEffect(() => {
    orbitSample.current = { route, progress: orbitProgress, done: orbitDone, failed: orbitFailed };
  }, [route, orbitProgress, orbitDone, orbitFailed]);
  useEffect(() => {
    routeOrderRef.current = routeOrder;
  }, [routeOrder]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      if (stepId === 'm10-locate') setLocationOrder(shuffleArray(GALAXY_LOCATIONS));
      if (stepId === 'm10-orbit') {
        const order = shuffleArray(GALACTIC_ROUTES);
        setRouteOrder(order);
        setRoute(order[0]!.id);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [stepId, ready]);
  const succeed = useCallback(() => {
    if (completedStep.current === step.current) return;
    events.current.onSuccess();
  }, []);
  useEffect(() => {
    if (challengeSolved) completedStep.current = stepId;
  }, [challengeSolved, stepId]);
  // Reset d’étape (sans démarrer le voyage — attendre `interactive`).
  useEffect(() => {
    step.current = stepId;
    viewTransition.current = null;
    const timer = setTimeout(() => {
      setRotating(false);
      setOrbitRunning(false);
      if (stepId === 'm10-intro' || stepId === 'm10-orbit') {
        setRoute('a');
        setOrbitProgress(0);
        setOrbitDone(false);
        setOrbitFailed(false);
      }
      if (stepId === 'm10-intro') {
        setLocated(false);
        completedStep.current = '';
      }
      if (stepId !== 'm10-journey') {
        setJourney(stepId === 'm10-intro' ? 0 : 1);
        return;
      }
      if (!challengeSolved) setJourney(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [stepId, challengeSolved]);
  // Voyage : uniquement après « À toi de jouer » (sinon succeed était ignoré → blocage).
  useEffect(() => {
    if (stepId !== 'm10-journey' || !ready || !interactive) return;
    if (challengeSolved || completedStep.current === stepId) {
      setJourney(1);
      return;
    }
    if (reduced) return;
    let frame = 0;
    let previous: number | null = null;
    let elapsed = 0;
    const resetJourneyClock = () => {
      previous = null;
    };
    document.addEventListener('visibilitychange', resetJourneyClock);
    setJourney(0);
    const tick = (now: number) => {
      if (completedStep.current === stepId || challengeSolved) {
        setJourney(1);
        return;
      }
      if (previous !== null && !document.hidden) elapsed += Math.max(0, (now - previous) / 1000);
      previous = now;
      setJourney(galaxyJourney(elapsed));
      if (elapsed >= GALAXY_JOURNEY_DURATION) {
        setJourney(1);
        succeed();
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', resetJourneyClock);
    };
  }, [stepId, ready, reduced, interactive, challengeSolved, succeed]);
  // Si le voyage est terminé (skip / anim) mais la validation a été refusée, réessayer.
  useEffect(() => {
    if (stepId !== 'm10-journey' || journey < 1 || !interactive || challengeSolved) return;
    succeed();
  }, [stepId, journey, interactive, challengeSolved, succeed]);
  useEffect(() => {
    if (stepId !== 'm10-orbit' || !orbitRunning) return;
    let frame = 0;
    let previous: number | null = null;
    let elapsed = 0;
    const resetClock = () => {
      previous = null;
    };
    document.addEventListener('visibilitychange', resetClock);
    const tick = (now: number) => {
      if (previous !== null && !document.hidden) elapsed += (now - previous) / 1000;
      previous = now;
      const progress = Math.min(1, elapsed / GALACTIC_ORBIT_DURATION);
      setOrbitProgress(progress);
      if (progress === 1) {
        setOrbitRunning(false);
        const choice = GALACTIC_ROUTES.find((choice) => choice.id === route)!;
        if (choice.hint) {
          setOrbitFailed(true);
          events.current.onMiss(choice.hint);
        } else {
          setOrbitDone(true);
          succeed();
        }
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', resetClock);
    };
  }, [stepId, orbitRunning, route, succeed]);
  const launchOrbit = () => {
    if (!ready || orbitRunning || orbitDone) return;
    const choice = GALACTIC_ROUTES.find((choice) => choice.id === route)!;
    setOrbitFailed(false);
    setOrbitProgress(0);
    if (reduced) {
      setOrbitProgress(1);
      if (choice.hint) {
        setOrbitFailed(true);
        events.current.onMiss(choice.hint);
      } else {
        setOrbitDone(true);
        succeed();
      }
    } else setOrbitRunning(true);
  };
  const choose = useCallback(
    (id: string) => {
      if (step.current !== 'm10-locate' || completedStep.current === step.current) return;
      const choice = GALAXY_LOCATIONS.find((location) => location.id === id);
      if (!choice) return;
      if (!choice.correct) events.current.onMiss(choice.hint);
      else {
        setLocated(true);
        succeed();
      }
    },
    [succeed],
  );
  const onSceneReady = useCallback(
    async ({ scene, canvas, engine }: BabylonSceneContext) => {
      const camera = scene.activeCamera;
      if (!(camera instanceof ArcRotateCamera)) return;
      cameraRef.current = camera;
      camera.alpha = -Math.PI / 2;
      camera.beta = 0.52;
      camera.lowerBetaLimit = 0.06;
      camera.upperBetaLimit = Math.PI - 0.1;
      camera.lowerRadiusLimit = 3;
      camera.upperRadiusLimit = 65;
      camera.minZ = 0.05;
      camera.panningSensibility = 0;
      createSpaceBackground(scene, undefined, { level: 0.25, segments: 24 });
      const cloud = new Mesh('milky-way-star-cloud', scene);
      const quality = resolveGraphicsQuality();
      const lighting = setupSceneLighting(scene, quality, {
        hemiIntensity: 0.12,
        sunIntensity: 1.55,
        contrast: 1.1,
        sharpenEnabled: false,
        hemiDiffuse: new Color3(0.28, 0.3, 0.38),
        hemiGround: new Color3(0.02, 0.025, 0.03),
      });
      lighting.sunLight.direction = new Vector3(-0.35, -0.55, -0.65);
      const primaryCount = quality === 'low' ? 1600 : quality === 'medium' ? 3200 : 5200;
      const galacticPointSize = quality === 'low' ? 2.2 : 2.8;
      const galacticColor = (x: number, z: number, alpha = 0.42) => {
        const warmth = Math.exp(-(x * x + z * z) / 24);
        return [0.67 + 0.33 * warmth, 0.8 + 0.07 * warmth, 1 - 0.29 * warmth, alpha];
      };
      const points = galaxyPoints(primaryCount * (quality === 'low' ? 2 : 3));
      const vertex = new VertexData();
      vertex.positions = points.flatMap((point) => [point.x, point.y, point.z]);
      vertex.colors = points.flatMap((point, index) =>
        galacticColor(point.x, point.z, index < primaryCount ? 0.42 : 0.22),
      );
      vertex.indices = points.map((_, index) => index);
      vertex.applyToMesh(cloud);
      cloud.setVerticesData(
        'starScale',
        points.map((_, index) => (index < primaryCount ? 1 : 0.42)),
        false,
        1,
      );
      cloud.hasVertexAlpha = true;
      cloud.isPickable = false;
      const stars = new ShaderMaterial(
        'galactic-stars',
        scene,
        {
          vertexSource: `precision highp float;
          attribute vec3 position; attribute vec4 color; attribute float starScale;
          uniform mat4 worldViewProjection; uniform float pointSize;
          varying vec4 starColor;
          void main() { starColor = color; gl_Position = worldViewProjection * vec4(position, 1.0); gl_PointSize = pointSize * starScale; }`,
          fragmentSource: `precision highp float;
          varying vec4 starColor; uniform float opacity;
          void main() { float r = length(gl_PointCoord - vec2(0.5));
            if (r > 0.5) discard;
            gl_FragColor = vec4(mix(starColor.rgb, vec3(1.0), 0.4 * exp(-r*r*80.0)), starColor.a * opacity * exp(-r*r*16.0)); }`,
        },
        {
          attributes: ['position', 'color', 'starScale'],
          uniforms: ['worldViewProjection', 'pointSize', 'opacity'],
          needAlphaBlending: true,
        },
      );
      stars.fillMode = Material.PointFillMode;
      stars.disableDepthWrite = true;
      stars.alphaMode = Constants.ALPHA_ADD;
      stars.setFloat('pointSize', galacticPointSize);
      cloud.material = stars;
      // Halo qui suit bras + renflement (pas un disque circulaire dominant).
      const glow = createMilkyWayGlow(scene, quality === 'low' ? 12 : 20, undefined, {
        softEdge: true,
        diskStrength: 0.035,
        intensity: 1.25,
      });
      const solarRoot = new TransformNode('solar-system-neighbourhood', scene);
      const sun = Vector3.FromArray([
        SUN_NEIGHBOURHOOD.x,
        SUN_NEIGHBOURHOOD.y,
        SUN_NEIGHBOURHOOD.z,
      ]);
      solarRoot.position.copyFrom(sun);
      const createLightPoints = (
        name: string,
        positions: number[],
        colors: number[],
        size: number,
      ) => {
        const mesh = new Mesh(name, scene);
        const data = new VertexData();
        data.positions = positions;
        data.colors = colors;
        data.indices = positions.filter((_, index) => index % 3 === 0).map((_, index) => index);
        data.applyToMesh(mesh);
        mesh.setVerticesData('starScale', Array(positions.length / 3).fill(1), false, 1);
        mesh.hasVertexAlpha = true;
        mesh.isPickable = false;
        mesh.position.copyFrom(sun);
        const material = stars.clone(`${name}-light`);
        material.setFloat('pointSize', size);
        material.setFloat('opacity', 0);
        mesh.material = material;
        mesh.setEnabled(false);
        return { mesh, material };
      };
      const sunPoint = createLightPoints(
        'solar-location-point',
        [0, 0, 0],
        galacticColor(sun.x, sun.z),
        galacticPointSize,
      );
      const neighbours = createLightPoints(
        'solar-neighbour-stars',
        SOLAR_NEIGHBOUR_STARS.flatMap((star) => [star.x, star.y, star.z]),
        SOLAR_NEIGHBOUR_STARS.flatMap((star) => [...star.color]),
        5,
      );
      const luminous = (name: string, color: Color3) => {
        const material = new StandardMaterial(name, scene);
        material.disableLighting = true;
        material.emissiveColor = color;
        material.diffuseColor = Color3.Black();
        return material;
      };
      // Reuse the textured models, readable scale and physical clock of the solar/orbit missions.
      // Only the whole system is reduced uniformly to fit the galactic scene coordinates.
      const solarScale = 0.18;
      solarRoot.scaling.setAll(solarScale);
      const localSun = await CelestialBodyEntity.create(scene, {
        definition: {
          ...SOLAR_SYSTEM_SUN,
          visual: { ...SOLAR_SYSTEM_SUN.visual, visualRadius: resolveSunRadius() },
        },
        spin: false,
      });
      localSun.pivot.parent = solarRoot;
      applyEmissiveSunMaterial(scene, localSun.meshes);
      optimizeCelestialMeshes(localSun.meshes, quality, 'sun');
      localSun.meshes.forEach((mesh) => {
        mesh.isPickable = false;
      });
      const planets = await Promise.all(
        PLANET_ORDER.map(async (id, index) => {
          const radius = resolveOrbit(id);
          const angle = index * 1.7;
          const entity = await CelestialBodyEntity.create(scene, {
            definition: planetDefinition(id),
            position: new Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)),
            spin: false,
          });
          entity.pivot.parent = solarRoot;
          applyPlanetaryMaterials(scene, entity.meshes, quality);
          optimizeCelestialMeshes(entity.meshes, quality, 'planet');
          entity.meshes.forEach((mesh) => {
            mesh.isPickable = false;
          });
          const orbit = MeshBuilder.CreateTorus(
            `local-orbit-${id}`,
            {
              diameter: radius * 2,
              thickness: quality === 'low' ? 0.02 : 0.016,
              tessellation: quality === 'low' ? 48 : 72,
            },
            scene,
          );
          orbit.parent = solarRoot;
          orbit.isPickable = false;
          const material = luminous(`local-orbit-material-${id}`, new Color3(0.35, 0.5, 0.7));
          material.alpha = 0.38;
          material.specularColor = Color3.Black();
          orbit.material = material;
          return { id, entity, radius, angle };
        }),
      );
      const earthAtmosphere = createSimpleAtmosphere(
        scene,
        planets.find((p) => p.id === 'earth')!.entity.pivot,
        {
          quality,
          scale: 1.07,
          alpha: 0.24,
          color: new Color3(0.4, 0.68, 1),
        },
      );
      const candidates = GALAXY_LOCATIONS.map((location) => {
        const marker = MeshBuilder.CreateSphere(
          `galaxy-location-${location.id}`,
          { diameter: 0.8, segments: 12 },
          scene,
        );
        marker.position.set(location.x, location.y + 0.4, location.z);
        marker.material = luminous(
          `galaxy-location-color-${location.id}`,
          new Color3(0.3, 0.85, 0.95),
        );
        marker.metadata = { locationId: location.id };
        return marker;
      });
      const home = MeshBuilder.CreateTorus(
        'our-solar-neighbourhood',
        { diameter: 1.8, thickness: 0.08, tessellation: 36 },
        scene,
      );
      home.position.copyFrom(sun);
      home.position.y = 0.35;
      home.material = luminous('our-neighbourhood-light', new Color3(1, 0.8, 0.32));
      home.isPickable = false;
      const orbitPaths = GALACTIC_ROUTES.map(({ id }) => {
        const path = MeshBuilder.CreateLines(
          `galactic-route-${id}`,
          {
            points: Array.from({ length: 129 }, (_, i) => {
              const p = galacticRoutePosition(id, i / 128);
              return new Vector3(p.x, p.y, p.z);
            }),
          },
          scene,
        );
        path.color = new Color3(0.3, 0.85, 0.92);
        path.alpha = 0.65;
        path.isPickable = false;
        path.setEnabled(false);
        return path;
      });
      // Ancre HTML près de chaque trajet (légèrement décalée pour lisibilité).
      const routeLabelAnchors = GALACTIC_ROUTES.map(({ id }) => {
        const p = galacticRoutePosition(id, 0.28);
        const radial = Math.hypot(p.x, p.z) || 1;
        return new Vector3((p.x / radial) * (radial + 0.85), p.y + 0.55, (p.z / radial) * (radial + 0.85));
      });
      const travellingSun = MeshBuilder.CreateSphere(
        'travelling-sun',
        { diameter: 0.35, segments: 12 },
        scene,
      );
      travellingSun.material = luminous('travelling-sun-light', new Color3(1, 0.8, 0.3));
      travellingSun.isPickable = false;
      const galacticCentre = MeshBuilder.CreateSphere(
        'galactic-centre-marker',
        { diameter: 0.25, segments: 12 },
        scene,
      );
      galacticCentre.material = luminous('galactic-centre-light', new Color3(0.6, 0.9, 1));
      galacticCentre.isPickable = false;
      let previousStep = '';
      const pointer = scene.onPointerObservable.add((info) => {
        if (info.type === PointerEventTypes.POINTERDOWN) viewTransition.current = null;
        if (info.type === PointerEventTypes.POINTERPICK)
          choose(info.pickInfo?.pickedMesh?.metadata?.locationId ?? '');
      });
      const reducedMotion = prefersReducedMotion();
      let lastProgress = -1;
      const observer = scene.onBeforeRenderObservable.add(() => {
        const state = sample.current;
        const transition = galaxyTransition(state.progress);
        const isJourney = step.current === 'm10-journey',
          isIntro = step.current === 'm10-intro';
        const controlsLocked = isIntro || (isJourney && state.progress < 1);
        const isOrbit = step.current === 'm10-orbit';
        if (controlsLocked || lastProgress !== state.progress) {
          viewTransition.current = null;
          camera.setTarget(Vector3.Lerp(sun, Vector3.Zero(), state.progress));
          camera.radius = 9 + state.progress * 34;
          camera.beta = 0.52;
          camera.alpha = -Math.PI / 2;
        }
        lastProgress = state.progress;
        if (isOrbit && previousStep !== step.current) {
          camera.setTarget(Vector3.Zero());
          camera.radius = 43;
          camera.alpha = -Math.PI / 2;
          camera.beta = 0.08;
        }
        previousStep = step.current;
        const orbital = orbitSample.current;
        // Les 3 trajets restent visibles pour comparer ; l’actif est en surbrillance.
        orbitPaths.forEach((path, i) => {
          const id = GALACTIC_ROUTES[i]?.id;
          const active = id === orbital.route;
          path.setEnabled(isOrbit);
          if (!isOrbit) return;
          if (active && orbital.failed) {
            path.color.set(1, 0.35, 0.35);
            path.alpha = 1;
          } else if (active && orbital.done) {
            path.color.set(0.35, 1, 0.7);
            path.alpha = 1;
          } else if (active) {
            path.color.set(0.55, 0.95, 1);
            path.alpha = 1;
          } else {
            path.color.set(0.4, 0.55, 0.7);
            path.alpha = 0.28;
          }
          path.renderingGroupId = active ? 1 : 0;
        });
        travellingSun.setEnabled(isOrbit);
        galacticCentre.setEnabled(isOrbit);
        if (isOrbit) {
          const p = galacticRoutePosition(orbital.route, orbital.progress);
          travellingSun.position.set(p.x, p.y, p.z);
        }
        const view = viewTransition.current;
        if (view && !controlsLocked) {
          const t = Math.min(1, (performance.now() - view.startedAt) / 450);
          const eased = t * t * (3 - 2 * t);
          camera.setTarget(Vector3.Lerp(view.target, Vector3.Zero(), eased));
          camera.radius = view.radius + (43 - view.radius) * eased;
          camera.beta = view.beta + (view.endBeta - view.beta) * eased;
          camera.alpha = view.alpha + (view.endAlpha - view.alpha) * eased;
          if (t === 1) viewTransition.current = null;
        }
        const dt =
          document.hidden || reducedMotion ? 0 : Math.min(engine.getDeltaTime() / 1000, 0.05);
        if (state.rotating && !controlsLocked)
          camera.alpha += 0.06 * Math.min(engine.getDeltaTime() / 1000, 0.05);
        cloud.setEnabled(transition.galaxyOpacity > 0);
        stars.setFloat('opacity', transition.galaxyOpacity);
        camera.getViewMatrix();
        glow.update(camera.globalPosition, transition.glowOpacity);
        sunPoint.mesh.setEnabled(
          transition.sunOpacity > 0 &&
            !isOrbit &&
            !(step.current === 'm10-locate' && !state.located),
        );
        sunPoint.material.setFloat('opacity', transition.sunOpacity);
        neighbours.mesh.setEnabled(isJourney && transition.neighboursOpacity > 0);
        neighbours.material.setFloat('opacity', transition.neighboursOpacity);
        neighbours.material.setFloat('pointSize', transition.neighboursPointSize);
        neighbours.mesh.scaling.setAll(transition.neighboursScale);
        // The enlarged teaching model must disappear before the galactic view emerges.
        // An exponential reduction makes it sub-pixel rather than galaxy-sized.
        solarRoot.setEnabled(state.progress < 0.12);
        solarRoot.scaling.setAll(solarScale * transition.solarScale);
        if (dt > 0 && solarRoot.isEnabled()) {
          localSun.pivot.rotate(Vector3.Up(), spinAngularSpeed(SUN_SIDEREAL_ROTATION_DAYS) * dt);
          for (const planet of planets) {
            const definition = SOLAR_SYSTEM_PLANETS[planet.id];
            // Counterclockwise viewed from the north (+Y), as in the orbit cinematic.
            planet.angle -= orbitalAngularSpeed(definition.orbitalPeriodDays) * dt;
            planet.entity.pivot.position.set(
              planet.radius * Math.cos(planet.angle),
              0,
              planet.radius * Math.sin(planet.angle),
            );
            planet.entity.pivot.rotate(
              Vector3.Up(),
              spinAngularSpeed(definition.siderealRotationDays) * dt,
            );
          }
        }
        home.setEnabled(
          state.progress > 0.95 &&
            !isOrbit &&
            (state.located || step.current !== 'm10-locate'),
        );
        candidates.forEach((marker, index) => {
          const visible = step.current === 'm10-locate' && !state.located;
          marker.setEnabled(visible);
          const label = labelRefs.current[index];
          if (label) {
            label.hidden = !visible;
            const projected = Vector3.Project(
              marker.position,
              Matrix.IdentityReadOnly,
              scene.getTransformMatrix(),
              camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()),
            );
            label.style.left = `${(projected.x / engine.getRenderWidth()) * canvas.clientWidth}px`;
            label.style.top = `${(projected.y / engine.getRenderHeight()) * canvas.clientHeight}px`;
          }
        });
        const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
        const transform = scene.getTransformMatrix();
        routeLabelAnchors.forEach((anchor, index) => {
          const label = routeLabelRefs.current[index];
          if (!label) return;
          label.hidden = !isOrbit;
          if (!isOrbit) return;
          const id = GALACTIC_ROUTES[index]?.id;
          const letterIndex = routeOrderRef.current.findIndex((choice) => choice.id === id);
          label.textContent = letterIndex >= 0 ? String.fromCharCode(65 + letterIndex) : '';
          label.dataset.active = id === orbital.route ? 'true' : 'false';
          const projected = Vector3.Project(
            anchor,
            Matrix.IdentityReadOnly,
            transform,
            viewport,
          );
          label.style.left = `${(projected.x / engine.getRenderWidth()) * canvas.clientWidth}px`;
          label.style.top = `${(projected.y / engine.getRenderHeight()) * canvas.clientHeight}px`;
        });
      });
      setReduced(prefersReducedMotion());
      setReady(true);
      return () => {
        cameraRef.current = null;
        viewTransition.current = null;
        scene.onBeforeRenderObservable.remove(observer);
        scene.onPointerObservable.remove(pointer);
        earthAtmosphere.dispose();
        planets.forEach((planet) => planet.entity.dispose());
        localSun.dispose();
        lighting.dispose();
        glow.dispose();
        sunPoint.mesh.dispose();
        sunPoint.material.dispose();
        neighbours.mesh.dispose();
        neighbours.material.dispose();
        orbitPaths.forEach((path) => path.dispose());
        travellingSun.dispose(false, true);
        galacticCentre.dispose(false, true);
      };
    },
    [choose],
  );
  const changeView = (beta: number) => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    if (prefersReducedMotion()) {
      viewTransition.current = null;
      camera.setTarget(Vector3.Zero());
      camera.radius = 43;
      camera.beta = beta;
      camera.alpha = -Math.PI / 2;
    } else {
      // Take the shortest turn, including after free manipulation or another preset click.
      const alphaDelta = Math.atan2(
        Math.sin(-Math.PI / 2 - camera.alpha),
        Math.cos(-Math.PI / 2 - camera.alpha),
      );
      viewTransition.current = {
        startedAt: performance.now(),
        target: camera.target.clone(),
        radius: camera.radius,
        beta: camera.beta,
        alpha: camera.alpha,
        endBeta: beta,
        endAlpha: camera.alpha + alphaDelta,
      };
    }
    setRotating(false);
  };
  const galactic = !['m10-intro', 'm10-journey'].includes(stepId) || journey >= 0.18;
  const neighbourhood = stepId === 'm10-journey' && journey >= 0.025 && !galactic;
  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      <BabylonCanvas
        className={styles.canvas}
        fill
        mobileFovScale={1.15}
        onSceneReady={onSceneReady}
        loadingMessage="Préparation du voyage vers notre galaxie…"
      />
      <div className={styles.title}>
        <span>
          {galactic
            ? 'NOTRE GALAXIE'
            : neighbourhood
              ? 'LE VOISINAGE DU SOLEIL'
              : 'NOTRE SYSTÈME SOLAIRE'}
        </span>
        <strong>
          {galactic
            ? 'La Voie lactée'
            : neighbourhood
              ? 'Le Soleil parmi les étoiles'
              : 'Le Soleil et ses planètes'}
        </strong>
      </div>
      {GALAXY_LOCATIONS.map((location, index) => (
        <span
          hidden
          ref={(element) => {
            labelRefs.current[index] = element;
          }}
          key={location.id}
          className={styles.marker}
        >
          {String.fromCharCode(65 + locationOrder.findIndex((choice) => choice.id === location.id))}
        </span>
      ))}
      {GALACTIC_ROUTES.map((routeItem, index) => (
        <span
          hidden
          ref={(element) => {
            routeLabelRefs.current[index] = element;
          }}
          key={`route-label-${routeItem.id}`}
          className={styles.routeMarker}
          aria-hidden="true"
        />
      ))}
      {stepId === 'm10-orbit' && orbitFailed ? (
        <div className={`${styles.success} ${styles.failure}`} role="status">
          <span className={styles.successCheck} aria-hidden="true">
            ×
          </span>
          <strong>Ce trajet ne convient pas</strong>
          <p>{GALACTIC_ROUTES.find((choice) => choice.id === route)?.hint}</p>
        </div>
      ) : null}
      {stepId === 'm10-orbit' ? (
        <div className={styles.caption}>Point doré : Soleil · Point bleu : centre de la galaxie</div>
      ) : stepId === 'm10-journey' && journey >= 0.04 ? (
        <div className={styles.caption}>Les planètes deviennent invisibles à cette échelle.</div>
      ) : galactic && located ? (
        <div className={styles.caption}>
          Repère agrandi de notre quartier : le Soleil et son Système solaire
        </div>
      ) : null}
      <SceneControls className={styles.controls}>
        {stepId === 'm10-journey' && journey < 1 ? (
          <>
            <progress value={journey} max="1" aria-label="Voyage du Système solaire à la galaxie" />
            <button
              disabled={!ready}
              onClick={() => {
                setJourney(1);
                succeed();
              }}
            >
              {reduced ? 'Découvrir la galaxie' : 'Passer le voyage'}
            </button>
          </>
        ) : stepId === 'm10-orbit' ? (
          <>
            <div className={styles.buttons}>
              {routeOrder.map(({ id }, index) => (
                <button
                  key={id}
                  data-galactic-route={id}
                  aria-pressed={route === id}
                  disabled={orbitRunning || orbitDone}
                  onClick={() => {
                    setRoute(id);
                    setOrbitProgress(0);
                    setOrbitFailed(false);
                  }}
                >
                  Trajet {String.fromCharCode(65 + index)}
                </button>
              ))}
            </div>
            {orbitRunning ? (
              <progress
                value={orbitProgress}
                max="1"
                aria-label="Tour du Soleil autour de la galaxie"
              />
            ) : null}
            <button disabled={!ready || orbitRunning || orbitDone} onClick={launchOrbit}>
              {orbitDone
                ? 'Tour accompli !'
                : orbitRunning
                  ? 'Le Soleil voyage…'
                  : 'Lancer le voyage'}
            </button>
            <small>
              Compare les chemins dans la galaxie. Soleil agrandi pour le repérer. Voyage accéléré,
              chemin simplifié.
            </small>
          </>
        ) : galactic ? (
          <>
            <div className={styles.buttons}>
              <button onClick={() => changeView(0.08)}>De face</button>
              <button onClick={() => changeView(Math.PI / 2 - 0.08)}>De profil</button>
            </div>
            {!reduced ? (
              <button aria-pressed={rotating} onClick={() => setRotating(!rotating)}>
                {rotating ? 'Arrêter la rotation' : 'Faire tourner la vue'}
              </button>
            ) : null}
            {stepId === 'm10-locate' && !located ? (
              <div className={styles.buttons}>
                {locationOrder.map((location, index) => (
                  <button
                    key={location.id}
                    data-galaxy-location={location.id}
                    onClick={() => choose(location.id)}
                  >
                    Repère {String.fromCharCode(65 + index)}
                  </button>
                ))}
              </div>
            ) : null}
            <small>
              Tourne avec le doigt ou la souris, puis zoome pour explorer. Les boutons permettent
              aussi de choisir la vue et les repères.
            </small>
          </>
        ) : (
          <p>Une étoile et ses huit planètes : notre Système solaire.</p>
        )}
        <small>
          Maquette artistique, pas une photographie ni une carte précise. Chaque point représente
          beaucoup d’étoiles. Le Soleil et les planètes sont agrandis pour apprendre.
        </small>
      </SceneControls>
    </div>
  );
}
