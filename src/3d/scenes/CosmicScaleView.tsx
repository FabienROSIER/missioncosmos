'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Constants,
  Matrix,
  Mesh,
  MeshBuilder,
  ShaderMaterial,
  StandardMaterial,
  TransformNode,
  Vector3,
  VertexData,
} from '@babylonjs/core';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { createGalaxySpecimen } from '@/3d/entities/createGalaxySpecimen';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import {
  applyEmissiveSunMaterial,
  applyPlanetaryMaterials,
  createSimpleAtmosphere,
  resolveGraphicsQuality,
  setupSceneLighting,
} from '@/3d/materials';
import { optimizeCelestialMeshes } from '@/3d/performance';
import { MOON_BODY } from '@/content/bodies/catalog';
import {
  PLANET_ORDER,
  SOLAR_SYSTEM_SUN,
  planetDefinition,
  resolveOrbit,
  resolveSunRadius,
  orbitalAngularSpeed,
  SOLAR_SYSTEM_PLANETS,
} from '@/content/bodies/solarSystem';
import { SOLAR_NEIGHBOUR_STARS, SUN_NEIGHBOURHOOD } from '@/content/bodies/milkyWay';
import { prefersReducedMotion } from '@/lib/motion';
import {
  COSMIC_PROXIMA,
  cosmicScaleFrame,
  deepFieldGalaxies,
  isDeepFieldFeatured,
  moonBesideEarth,
  scaleLevelAlongJump,
} from '@/content/bodies/cosmicScale';
import styles from './CosmicScaleView.module.css';

/** The same textured bodies and galaxy volumes as M10/M11, in nested frames.
 * Logarithmic frame scaling compresses the immense empty distances, not the relative
 * orbital layout. All members of an outgoing frame shrink together. */
export function CosmicScaleView({
  level,
  paused,
  className,
  onReady,
  maxTransitionSeconds,
}: {
  level: number;
  paused: boolean;
  className?: string;
  onReady: () => void;
  /** Cap any scale jump to this duration (ordering challenge). */
  maxTransitionSeconds?: number;
}) {
  const sample = useRef({ level, paused, maxTransitionSeconds });
  const ready = useRef(onReady);
  const sunLabelRef = useRef<HTMLSpanElement>(null);
  const proximaLabelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    sample.current = { level, paused, maxTransitionSeconds };
    ready.current = onReady;
  }, [level, paused, maxTransitionSeconds, onReady]);
  const build = useCallback(async ({ scene, engine, canvas }: BabylonSceneContext) => {
    const camera = scene.activeCamera as ArcRotateCamera;
    camera.detachControl();
    camera.minZ = 0.01;
    camera.maxZ = 1000;
    camera.radius = 43;
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 100;
    camera.beta = 0.65;
    camera.alpha = Math.PI / 2;
    const quality = resolveGraphicsQuality();
    const low = quality === 'low' || canvas.clientWidth < 640;
    const background = createSpaceBackground(scene, undefined, { level: 0.2, segments: 24 });
    setupSceneLighting(scene, quality, {
      hemiIntensity: 0.18,
      sunIntensity: 1.55,
      contrast: 1.1,
      sharpenEnabled: false,
    });
    const galacticFrame = new TransformNode('distance-galactic-frame', scene);
    const galaxy = createGalaxySpecimen(scene, 'spiral', low ? 2400 : 6500, low, true);
    galaxy.root.parent = galacticFrame;
    const andromedaFrame = new TransformNode('distance-andromeda-frame', scene);
    andromedaFrame.position.set(9, 0, 2);
    const andromeda = createGalaxySpecimen(scene, 'spiral', low ? 1800 : 4200, low, true);
    andromeda.root.parent = andromedaFrame;
    // Dense Hubble-like plate: a few detailed islands + hundreds of cheap fillers.
    // Parent scaled by remoteArrive so the plate rushes in from off-screen (dezoom).
    const remoteRoot = new TransformNode('distance-remote-root', scene);
    const remoteLayout = deepFieldGalaxies(low ? 160 : 260);
    const featuredLayout = remoteLayout.filter(isDeepFieldFeatured);
    const speckLayout = remoteLayout.filter((item) => !isDeepFieldFeatured(item));
    const remote = featuredLayout.map((item, i) => {
      const frame = new TransformNode(`distance-remote-frame-${i}`, scene);
      frame.parent = remoteRoot;
      frame.position.set(item.x, item.y, item.z);
      frame.rotation.y = item.yaw;
      frame.rotation.x = item.pitch;
      const pointBudget = Math.round((low ? 90 : 200) * (0.55 + item.scale / 0.08));
      const specimen = createGalaxySpecimen(
        scene,
        item.family,
        Math.max(60, Math.min(low ? 220 : 420, pointBudget)),
        low,
        true,
      );
      specimen.root.parent = frame;
      return { frame, specimen, scale: item.scale, brightness: item.brightness };
    });
    const speckMat = new ShaderMaterial(
      'distance-deep-field-specks',
      scene,
      {
        vertexSource: `precision highp float; attribute vec3 position; attribute vec4 color; attribute float pointSize;
        uniform mat4 worldViewProjection; uniform float opacity; uniform float sizeScale; varying vec4 tint;
        void main(){tint=vec4(color.rgb,color.a*opacity);gl_Position=worldViewProjection*vec4(position,1.0);gl_PointSize=max(1.0,pointSize*sizeScale);}`,
        fragmentSource: `precision highp float; varying vec4 tint;
        void main(){float r=length(gl_PointCoord-vec2(.5));if(r>.5)discard;
        float soft=exp(-r*r*18.0);gl_FragColor=vec4(mix(tint.rgb,vec3(1.0),0.2*soft),tint.a*soft);}`,
      },
      {
        attributes: ['position', 'color', 'pointSize'],
        uniforms: ['worldViewProjection', 'opacity', 'sizeScale'],
        needAlphaBlending: true,
      },
    );
    speckMat.fillMode = Constants.MATERIAL_PointFillMode;
    speckMat.alphaMode = Constants.ALPHA_ADD;
    speckMat.disableDepthWrite = true;
    const speckMesh = new Mesh('distance-deep-field-specks', scene);
    const speckData = new VertexData();
    speckData.positions = speckLayout.flatMap((g) => [g.x, g.y, g.z]);
    speckData.colors = speckLayout.flatMap((g) => {
      const warm = g.family === 'elliptical' ? 0.85 : g.family === 'irregular' ? 0.35 : 0.15;
      return [0.62 + 0.38 * warm, 0.78 + 0.12 * warm, 1 - 0.28 * warm, g.brightness];
    });
    speckData.indices = speckLayout.map((_, i) => i);
    speckData.applyToMesh(speckMesh);
    speckMesh.setVerticesData(
      'pointSize',
      speckLayout.map((g) => 2.2 + g.scale * 140),
      false,
      1,
    );
    speckMesh.parent = remoteRoot;
    speckMesh.material = speckMat;
    speckMesh.isPickable = false;
    const solar = new TransformNode('distance-solar-frame', scene);
    solar.parent = galacticFrame;
    const home = new Vector3(SUN_NEIGHBOURHOOD.x, SUN_NEIGHBOURHOOD.y, SUN_NEIGHBOURHOOD.z);
    solar.position.copyFrom(home);
    const sun = await CelestialBodyEntity.create(scene, {
      definition: {
        ...SOLAR_SYSTEM_SUN,
        visual: { ...SOLAR_SYSTEM_SUN.visual, visualRadius: resolveSunRadius() },
      },
      spin: false,
    });
    sun.pivot.parent = solar;
    applyEmissiveSunMaterial(scene, sun.meshes);
    optimizeCelestialMeshes(sun.meshes, quality, 'sun');
    const planets = await Promise.all(
      PLANET_ORDER.map(async (id, i) => {
        const entity = await CelestialBodyEntity.create(scene, {
          definition: planetDefinition(id),
          spin: false,
        });
        entity.pivot.parent = solar;
        const radius = resolveOrbit(id),
          angle = i * 1.7;
        entity.pivot.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
        applyPlanetaryMaterials(scene, entity.meshes, quality);
        optimizeCelestialMeshes(entity.meshes, quality, 'planet');
        const orbit = MeshBuilder.CreateTorus(
          `distance-orbit-${id}`,
          { diameter: radius * 2, thickness: 0.018, tessellation: low ? 48 : 72 },
          scene,
        );
        orbit.parent = solar;
        const mat = new StandardMaterial(`distance-orbit-light-${id}`, scene);
        mat.disableLighting = true;
        mat.emissiveColor = new Color3(0.35, 0.5, 0.7);
        mat.alpha = 0.35;
        orbit.material = mat;
        orbit.isPickable = false;
        return { id, entity, radius, angle, orbit };
      }),
    );
    const earth = planets.find((p) => p.id === 'earth')!;
    const atmosphere = createSimpleAtmosphere(scene, earth.entity.pivot, {
      quality,
      scale: 1.07,
      alpha: 0.24,
      color: new Color3(0.4, 0.68, 1),
    });
    const moon = await CelestialBodyEntity.create(scene, {
      definition: {
        ...MOON_BODY,
        visual: {
          ...MOON_BODY.visual,
          visualRadius: planetDefinition('earth').visual.visualRadius * 0.27,
        },
      },
      spin: false,
    });
    moon.pivot.parent = solar;
    applyPlanetaryMaterials(scene, moon.meshes, quality);
    optimizeCelestialMeshes(moon.meshes, quality, 'planet');
    const nearby = new TransformNode('distance-neighbour-frame', scene);
    nearby.parent = galacticFrame;
    nearby.position.copyFrom(home);
    const light = new ShaderMaterial(
      'distance-neighbour-light',
      scene,
      {
        vertexSource: `precision highp float; attribute vec3 position; attribute vec4 color; uniform mat4 worldViewProjection; uniform float size; varying vec4 tint; void main(){tint=color;gl_Position=worldViewProjection*vec4(position,1.0);gl_PointSize=size;}`,
        fragmentSource: `precision highp float; varying vec4 tint; uniform float opacity; void main(){float r=length(gl_PointCoord-vec2(.5));if(r>.5)discard;gl_FragColor=vec4(tint.rgb,tint.a*opacity*exp(-r*r*22.0));}`,
      },
      {
        attributes: ['position', 'color'],
        uniforms: ['worldViewProjection', 'size', 'opacity'],
        needAlphaBlending: true,
      },
    );
    light.fillMode = Constants.MATERIAL_PointFillMode;
    light.alphaMode = Constants.ALPHA_ADD;
    light.disableDepthWrite = true;
    const stars = new Mesh('distance-neighbour-stars', scene);
    stars.parent = nearby;
    const data = new VertexData();
    data.positions = SOLAR_NEIGHBOUR_STARS.flatMap((p) => [p.x * 3, p.y * 3, p.z * 3]);
    data.colors = SOLAR_NEIGHBOUR_STARS.flatMap((p) => [...p.color]);
    data.indices = SOLAR_NEIGHBOUR_STARS.map((_, i) => i);
    data.applyToMesh(stars);
    stars.material = light;
    const makePoint = (name: string, color: readonly number[]) => {
      const mesh = new Mesh(name, scene);
      mesh.parent = nearby;
      const vd = new VertexData();
      vd.positions = [0, 0, 0];
      vd.colors = [...color];
      vd.indices = [0];
      vd.applyToMesh(mesh);
      const mat = light.clone(`${name}-light`);
      mesh.material = mat;
      return { mesh, mat };
    };
    // Compact bright core + soft halo: a single oversized sprite looked dimmer than neighbours.
    const sunHalo = makePoint('distance-sun-halo', [1, 0.92, 0.55, 0.55]);
    const sunPoint = makePoint('distance-sun-point', [1, 1, 1, 1]);
    const proximaPoint = new Mesh('distance-proxima-point', scene);
    proximaPoint.parent = nearby;
    proximaPoint.position.set(COSMIC_PROXIMA.x, COSMIC_PROXIMA.y, COSMIC_PROXIMA.z);
    const proximaData = new VertexData();
    proximaData.positions = [0, 0, 0];
    proximaData.colors = [...COSMIC_PROXIMA.color];
    proximaData.indices = [0];
    proximaData.applyToMesh(proximaPoint);
    const proximaLight = light.clone('distance-proxima-point-light');
    proximaPoint.material = proximaLight;
    let current = sample.current.level;
    let lastWanted = current;
    let jump: { from: number; to: number; startedAt: number; duration: number } | null = null;
    const reduced = prefersReducedMotion();
    const bodyVisibility = [sun, moon, ...planets.map((p) => p.entity)].flatMap((entity) =>
      entity.meshes.map((mesh) => ({ mesh, visibility: mesh.visibility })),
    );
    const revealBody = (entity: CelestialBodyEntity, opacity: number) => {
      entity.pivot.setEnabled(opacity > 0.001);
      bodyVisibility.forEach(({ mesh, visibility }) => {
        if (entity.meshes.includes(mesh)) mesh.visibility = visibility * opacity;
      });
    };
    const placeLabel = (node: HTMLSpanElement | null, local: Vector3, visible: boolean) => {
      if (!node) return;
      if (!visible) {
        node.hidden = true;
        return;
      }
      nearby.computeWorldMatrix(true);
      const world = Vector3.TransformCoordinates(local, nearby.getWorldMatrix());
      const projected = Vector3.Project(
        world,
        Matrix.IdentityReadOnly,
        scene.getTransformMatrix(),
        camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()),
      );
      const onScreen =
        projected.z > 0 &&
        projected.z < 1 &&
        projected.x >= 0 &&
        projected.y >= 0 &&
        projected.x <= engine.getRenderWidth() &&
        projected.y <= engine.getRenderHeight();
      node.hidden = !onScreen;
      if (!onScreen) return;
      node.style.left = `${(projected.x / engine.getRenderWidth()) * canvas.clientWidth}px`;
      node.style.top = `${(projected.y / engine.getRenderHeight()) * canvas.clientHeight}px`;
    };
    const render = scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      const wanted = sample.current.level;
      if (wanted !== lastWanted) {
        lastWanted = wanted;
        const cap = sample.current.maxTransitionSeconds;
        jump =
          cap && Math.abs(wanted - current) > 1e-4
            ? { from: current, to: wanted, startedAt: performance.now(), duration: cap }
            : null;
      }
      if (reduced) {
        current = wanted;
        jump = null;
      } else if (jump) {
        // Timed ease-in-out: fast mid-flight, soft landing — avoids the strobe of constant speed.
        const elapsed = (performance.now() - jump.startedAt) / 1000;
        current = scaleLevelAlongJump(jump.from, jump.to, elapsed, jump.duration);
        if (elapsed >= jump.duration) {
          current = jump.to;
          jump = null;
        }
      } else {
        current =
          current + Math.sign(wanted - current) * Math.min(Math.abs(wanted - current), dt * 0.65);
      }
      const f = cosmicScaleFrame(current);
      galacticFrame.scaling.setAll(f.galaxyScale);
      galacticFrame.position.x = f.galaxyX;
      solar.scaling.setAll(f.solarScale);
      nearby.scaling.setAll(f.neighbourScale);
      if (!sample.current.paused && !reduced)
        planets.forEach((p) => {
          // Same right-handed physical clock as the orbit mission. Freeze the close
          // Earth view until the camera has left it, to keep its framing stable.
          if (current > 1.05)
            p.angle += orbitalAngularSpeed(SOLAR_SYSTEM_PLANETS[p.id].orbitalPeriodDays) * dt;
          p.entity.pivot.position.set(
            p.radius * Math.cos(p.angle),
            0,
            p.radius * Math.sin(p.angle),
          );
        });
      // Keep the lunar view isolated; readable orbit spacing is only introduced
      // after leaving the Earth–Moon neighbourhood, never in the close view.
      revealBody(sun, f.sunModelOpacity);
      revealBody(moon, f.moonModelOpacity);
      planets.forEach((p) => revealBody(p.entity, p.id === 'earth' ? 1 : f.planetModelOpacity));
      // Keep the Moon glued to Earth (outer side) so dezoom never parks it on the Sun.
      const earthPos = earth.entity.pivot.position;
      const moonPos = moonBesideEarth(earthPos.x, earthPos.y, earthPos.z);
      moon.pivot.position.set(moonPos.x, moonPos.y, moonPos.z);
      solar.computeWorldMatrix(true);
      const lookBesideEarth = moonBesideEarth(earthPos.x, earthPos.y, earthPos.z, 0.55);
      const earthWorld = Vector3.TransformCoordinates(
        new Vector3(lookBesideEarth.x, lookBesideEarth.y, lookBesideEarth.z),
        solar.getWorldMatrix(),
      );
      const homeWorld = Vector3.TransformCoordinates(home, galacticFrame.getWorldMatrix());
      // Neighbourhood → Milky Way: shrink stars in place and pull back, don't dive into the disc.
      camera.radius = f.cameraRadius;
      camera.setTarget(
        current < 1
          ? Vector3.Lerp(earthWorld, homeWorld, current)
          : current < 3
            ? homeWorld
            : Vector3.Lerp(homeWorld, Vector3.Zero(), f.cameraTargetMix),
      );
      camera.getViewMatrix();
      const eye = camera.globalPosition;
      galaxy.update(eye, f.galaxyOpacity);
      andromedaFrame.scaling.setAll(f.otherScale);
      andromeda.update(eye, f.otherOpacity, true);
      // Spread positions via remoteRoot; divide child scale so specimen size stays constant.
      const arrive = Math.max(f.remoteArrive, 1e-6);
      remoteRoot.scaling.setAll(arrive);
      remote.forEach(({ frame, specimen, scale, brightness }) => {
        frame.scaling.setAll((f.remoteScale * scale * 18) / arrive);
        specimen.update(eye, f.remoteOpacity * brightness);
      });
      const speckVisible = f.remoteOpacity > 0.001;
      speckMesh.setEnabled(speckVisible);
      speckMat.setFloat('opacity', f.remoteOpacity);
      speckMat.setFloat('sizeScale', 0.85 + f.remoteOpacity * 0.35);
      const neighbourVisible = f.neighbourOpacity > 0.001;
      const starSize = 7 - Math.min(4, Math.max(0, current - 3) * 4);
      light.setFloat('size', starSize);
      light.setFloat('opacity', f.neighbourOpacity);
      stars.setEnabled(neighbourVisible);
      const sunVisible = neighbourVisible && f.sunOpacity > 0.001;
      sunHalo.mesh.setEnabled(sunVisible);
      sunPoint.mesh.setEnabled(sunVisible);
      sunHalo.mat.setFloat('size', Math.max(16, starSize + 9));
      sunHalo.mat.setFloat(
        'opacity',
        Math.min(1, Math.max(f.sunOpacity, f.neighbourOpacity) * 0.85),
      );
      sunPoint.mat.setFloat('size', Math.max(9, starSize + 2));
      sunPoint.mat.setFloat('opacity', 1);
      proximaPoint.setEnabled(neighbourVisible);
      proximaLight.setFloat('size', Math.max(8, starSize + 1));
      proximaLight.setFloat('opacity', f.neighbourOpacity);
      const showStarLabels =
        neighbourVisible && f.neighbourArrive < 2.4 && current >= 2.45 && current < 3.75;
      placeLabel(sunLabelRef.current, Vector3.Zero(), showStarLabels);
      placeLabel(
        proximaLabelRef.current,
        new Vector3(COSMIC_PROXIMA.x, COSMIC_PROXIMA.y, COSMIC_PROXIMA.z),
        showStarLabels,
      );
      solar.setEnabled(current < 3.9);
      planets.forEach((p) =>
        p.orbit.setEnabled(
          (p.id === 'earth' ? current > 0.65 : f.planetModelOpacity > 0.001) && current < 2.9,
        ),
      );
      canvas.dataset.cosmicLevel = current.toFixed(3);
    });
    ready.current();
    return () => {
      scene.onBeforeRenderObservable.remove(render);
      [sun, moon, ...planets.map((p) => p.entity)].forEach((e) => e.dispose());
      atmosphere.dispose();
      galaxy.dispose();
      andromeda.dispose();
      remote.forEach((p) => p.specimen.dispose());
      speckMesh.dispose();
      speckMat.dispose();
      background.dispose();
    };
  }, []);
  return (
    <div className={[styles.stage, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        key="cosmic-scale-v14"
        fill
        className={styles.stage}
        onSceneReady={build}
        loadingMessage="Préparation du voyage cosmique…"
      />
      <span ref={sunLabelRef} className={styles.starLabel} hidden>
        Soleil
      </span>
      <span ref={proximaLabelRef} className={styles.starLabel} hidden>
        Proxima
      </span>
    </div>
  );
}
