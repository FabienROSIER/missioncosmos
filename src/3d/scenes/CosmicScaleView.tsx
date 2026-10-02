'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Constants,
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
import { cosmicScaleFrame } from '@/content/bodies/cosmicScale';

/** The same textured bodies and galaxy volumes as M10/M11, in nested frames.
 * Logarithmic frame scaling compresses the immense empty distances, not the relative
 * orbital layout. All members of an outgoing frame shrink together. */
export function CosmicScaleView({
  level,
  paused,
  className,
  onReady,
}: {
  level: number;
  paused: boolean;
  className?: string;
  onReady: () => void;
}) {
  const sample = useRef({ level, paused });
  const ready = useRef(onReady);
  useEffect(() => {
    sample.current = { level, paused };
    ready.current = onReady;
  }, [level, paused, onReady]);
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
    const remote = Array.from({ length: low ? 24 : 48 }, (_, i) => {
      const frame = new TransformNode(`distance-remote-frame-${i}`, scene);
      const columns = low ? 6 : 8,
        rows = low ? 4 : 6;
      // Stratified, deterministic spacing: artistic specimens, not a sky map.
      frame.position.set(
        ((i % columns) / (columns - 1) - 0.5) * 38 + Math.sin(i * 2.7) * 0.8,
        Math.sin(i * 1.3) * 2,
        (Math.floor(i / columns) / (rows - 1) - 0.5) * 28 + Math.cos(i * 2.1) * 0.8,
      );
      const specimen = createGalaxySpecimen(
        scene,
        i % 3 === 0 ? 'elliptical' : i % 3 === 1 ? 'spiral' : 'irregular',
        low ? 180 : 350,
        low,
        true,
      );
      specimen.root.parent = frame;
      return { frame, specimen };
    });
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
    const sunPoint = new Mesh('distance-sun-point', scene);
    sunPoint.parent = nearby;
    const pointData = new VertexData();
    pointData.positions = [0, 0, 0];
    pointData.colors = [0.7, 0.82, 1, 0.6];
    pointData.indices = [0];
    pointData.applyToMesh(sunPoint);
    const sunLight = light.clone('distance-sun-point-light');
    sunPoint.material = sunLight;
    let current = sample.current.level;
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
    const render = scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      const wanted = sample.current.level;
      current = reduced
        ? wanted
        : current + Math.sign(wanted - current) * Math.min(Math.abs(wanted - current), dt * 0.65);
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
      moon.pivot.position.copyFrom(earth.entity.pivot.position).addInPlace(new Vector3(3.6, 0, 0));
      solar.computeWorldMatrix(true);
      const earthWorld = Vector3.TransformCoordinates(
        earth.entity.pivot.position.add(new Vector3(1.8, 0, 0)),
        solar.getWorldMatrix(),
      );
      const homeWorld = Vector3.TransformCoordinates(home, galacticFrame.getWorldMatrix());
      camera.setTarget(
        current < 1
          ? Vector3.Lerp(earthWorld, homeWorld, current)
          : current < 3
            ? homeWorld
            : Vector3.Lerp(homeWorld, Vector3.Zero(), Math.min(1, current - 3)),
      );
      camera.getViewMatrix();
      const eye = camera.globalPosition;
      galaxy.update(eye, f.galaxyOpacity);
      andromedaFrame.scaling.setAll(f.otherScale);
      andromeda.update(eye, f.otherOpacity, true);
      remote.forEach(({ frame, specimen }) => {
        frame.scaling.setAll(f.remoteScale);
        specimen.update(eye, f.remoteOpacity);
      });
      light.setFloat('size', 7 - Math.min(4, Math.max(0, current - 3) * 4));
      light.setFloat('opacity', f.neighbourOpacity);
      stars.setEnabled(f.neighbourOpacity > 0.001);
      sunPoint.setEnabled(current > 2.15);
      sunLight.setFloat('size', 3);
      sunLight.setFloat('opacity', f.sunOpacity);
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
      background.dispose();
    };
  }, []);
  return (
    <BabylonCanvas
      key="cosmic-scale-v5"
      fill
      className={className}
      onSceneReady={build}
      loadingMessage="Préparation du voyage cosmique…"
    />
  );
}
