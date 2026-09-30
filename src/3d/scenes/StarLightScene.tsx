'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  ShaderMaterial,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
  VertexData,
} from '@babylonjs/core';
import { SceneControls } from '@/components/layout/SceneControls';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import {
  captureCameraHome,
  configureMissionCamera,
  createMissionCameraApi,
  type MissionCameraApi,
} from '@/3d/controls/missionCamera';
import { createLightBeam, createLightMasks, luminousMaterial } from '@/3d/fx/colourLight';
import { resolveGraphicsQuality, setupSceneLighting } from '@/3d/materials';
import { applyScenePerformancePriority, startPerfMonitor } from '@/3d/performance';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import {
  LIGHT_CHANNELS,
  LIGHT_COLOURS,
  MIX_TARGETS,
  RAINBOW_BANDS,
  lightHint,
  lightProgress,
  lightsOff,
  mixedLight,
  type LightChannel,
  type LightColourId,
  type LightSwitches,
  type StarLightSceneMode,
} from '@/content/bodies/stellarLight';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { withBasePath } from '@/lib/basePath';
import { getUiMotionSnapshot } from '@/lib/uiMotion';
import styles from './StarLightScene.module.css';

export type StarLightSceneApi = {
  camera: MissionCameraApi;
  setMode: (mode: StarLightSceneMode) => void;
};
type Props = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: StarLightSceneApi) => void;
  onPrismSuccess?: () => void;
  onPrismMiss?: (hint: string | null) => void;
};
type Controls = {
  place: () => void;
  toggle: (channel: LightChannel) => void;
  selectBand: (index: number | null) => void;
  validate: () => void;
  experiment: (prism: boolean) => void;
};
type Round = {
  targets: readonly LightColourId[];
  index: number;
  completed: LightColourId[];
  done: boolean;
};

const tint = (rgb: readonly number[]) => new Color3(rgb[0]!, rgb[1]!, rgb[2]!);
const colourStyle = (css: string) => ({ '--light-colour': css }) as CSSProperties;

export function StarLightScene({
  className,
  fill = false,
  onSceneApi,
  onPrismSuccess,
  onPrismMiss,
}: Props) {
  const [mode, setMode] = useState<StarLightSceneMode>('intro');
  const [ready, setReady] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [lights, setLights] = useState<LightSwitches>(lightsOff);
  const [band, setBand] = useState<number | null>(null);
  const [prismExperiment, setPrismExperiment] = useState(true);
  const [round, setRound] = useState<Round>({
    targets: MIX_TARGETS,
    index: 0,
    completed: [],
    done: false,
  });
  const [message, setMessage] = useState('');
  const controls = useRef<Controls | null>(null);
  const callbacks = useRef({ onSceneApi, onPrismSuccess, onPrismMiss });
  useEffect(() => {
    callbacks.current = { onSceneApi, onPrismSuccess, onPrismMiss };
  }, [onSceneApi, onPrismSuccess, onPrismMiss]);

  const onSceneReady = useCallback(({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      quality === 'low' ? 1.25 : quality === 'medium' ? 1.5 : 2,
    );
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);
    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.6,
      sunIntensity: 0.7,
      contrast: 1.05,
    });
    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: 0.42,
      segments: quality === 'low' ? 24 : 40,
    });
    const camera = scene.activeCamera;
    if (!(camera instanceof ArcRotateCamera))
      return () => {
        background.dispose();
        lighting.dispose();
      };
    camera.setTarget(new Vector3(0, 0.05, 0));
    camera.alpha = -Math.PI / 2.08;
    camera.beta = 1.38;
    camera.radius = 12.4;
    camera.lowerRadiusLimit = 7;
    camera.upperRadiusLimit = 18;
    camera.lowerBetaLimit = 0.65;
    camera.upperBetaLimit = 2.05;
    configureMissionCamera(camera);
    const cameraApi = createMissionCameraApi(camera, captureCameraHome(camera));
    const masks = createLightMasks(scene, quality);
    const lab = new TransformNode('colour-laboratory', scene);
    const optics = new TransformNode('prism-experiment', scene);
    optics.parent = lab;
    const mixing = new TransformNode('projector-experiment', scene);
    mixing.parent = lab;

    const metal = new StandardMaterial('lab-brushed-metal', scene);
    metal.diffuseColor = new Color3(0.09, 0.16, 0.24);
    metal.specularColor = new Color3(0.35, 0.48, 0.6);
    metal.emissiveColor = new Color3(0.015, 0.03, 0.05);
    const trim = new StandardMaterial('lab-trim', scene);
    trim.diffuseColor = new Color3(0.21, 0.32, 0.42);
    trim.specularColor = new Color3(0.65, 0.75, 0.85);
    const base = MeshBuilder.CreateBox(
      'optical-bench',
      { width: 10.3, height: 0.22, depth: 2.4 },
      scene,
    );
    base.parent = lab;
    base.position.y = -1.45;
    base.material = metal;
    const rail = MeshBuilder.CreateBox(
      'bench-front-trim',
      { width: 10.3, height: 0.05, depth: 0.06 },
      scene,
    );
    rail.parent = lab;
    rail.position.set(0, -1.34, -1.21);
    rail.material = luminousMaterial(scene, 'bench-edge-glow', new Color3(0.08, 0.35, 0.45));
    rail.material.alpha = 0.5;

    const sun = MeshBuilder.CreateSphere(
      'sunlight-source',
      { diameter: 1.25, segments: quality === 'low' ? 20 : 32 },
      scene,
    );
    sun.parent = optics;
    sun.position.set(-3.65, 0.5, 0);
    const solarTexture = new Texture(
      withBasePath('/assets/models/solarsystem/celestial-bodies/sun/sun.webp'),
      scene,
    );
    solarTexture.anisotropicFilteringLevel = quality === 'low' ? 1 : 2;
    // Desaturate only the source star, preserving its original granulation and sunspots.
    // One texture lookup per fragment; no image processing pass over the coloured beams.
    const solarMat = new ShaderMaterial(
      'sunlight-greyscale',
      scene,
      {
        vertexSource: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 worldViewProjection;
        varying vec2 vUV;
        void main(void) {
          vUV = uv;
          gl_Position = worldViewProjection * vec4(position, 1.0);
        }
      `,
        fragmentSource: `
        precision highp float;
        varying vec2 vUV;
        uniform sampler2D solarTexture;
        uniform float brightness;
        void main(void) {
          vec3 surface = texture2D(solarTexture, vUV).rgb;
          float grey = dot(surface, vec3(0.2126, 0.7152, 0.0722));
          gl_FragColor = vec4(vec3(grey * brightness), 1.0);
        }
      `,
      },
      {
        attributes: ['position', 'uv'],
        uniforms: ['worldViewProjection', 'brightness'],
        samplers: ['solarTexture'],
      },
    );
    solarMat.setTexture('solarTexture', solarTexture);
    solarMat.setFloat('brightness', 0.92);
    sun.material = solarMat;
    const sunGlow = MeshBuilder.CreatePlane('sunlight-soft-halo', { size: 2.35 }, scene);
    sunGlow.parent = sun;
    sunGlow.billboardMode = Mesh.BILLBOARDMODE_ALL;
    sunGlow.material = luminousMaterial(scene, 'sunlight-halo', Color3.White(), masks.spot);
    sunGlow.material.alpha = 0.28;

    const prismRoot = new TransformNode('glass-prism', scene);
    prismRoot.parent = optics;
    const prism = new Mesh('prism-glass', scene);
    prism.parent = prismRoot;
    const glass = new VertexData();
    glass.positions = [
      -0.58, -0.55, -0.4, 0.58, -0.55, -0.4, 0, 0.72, -0.4, -0.58, -0.55, 0.4, 0.58, -0.55, 0.4, 0,
      0.72, 0.4,
    ];
    glass.indices = [0, 2, 1, 3, 4, 5, 0, 1, 4, 0, 4, 3, 1, 2, 5, 1, 5, 4, 2, 0, 3, 2, 3, 5];
    const normals: number[] = [];
    VertexData.ComputeNormals(glass.positions, glass.indices, normals);
    glass.normals = normals;
    glass.applyToMesh(prism);
    prism.convertToFlatShadedMesh();
    const glassMat = new StandardMaterial('prism-cut-glass', scene);
    glassMat.diffuseColor = new Color3(0.4, 0.68, 0.85);
    glassMat.emissiveColor = new Color3(0.06, 0.16, 0.23);
    glassMat.specularColor = Color3.White();
    glassMat.specularPower = 128;
    glassMat.alpha = 0.46;
    glassMat.backFaceCulling = false;
    prism.material = glassMat;
    prism.enableEdgesRendering(0.95);
    prism.edgesWidth = 2.5;
    prism.edgesColor = new Color4(0.65, 0.9, 1, 0.9);
    const prismStand = MeshBuilder.CreateCylinder(
      'prism-stand',
      { diameter: 1.2, height: 0.1, tessellation: quality === 'low' ? 16 : 32 },
      scene,
    );
    prismStand.parent = optics;
    prismStand.position.set(-0.55, -0.13, 0);
    prismStand.material = trim;
    const standStem = MeshBuilder.CreateCylinder(
      'prism-support',
      { diameter: 0.12, height: 1.15, tessellation: 12 },
      scene,
    );
    standStem.parent = optics;
    standStem.position.set(-0.55, -0.75, 0.35);
    standStem.material = metal;
    const destination = new Vector3(-0.55, 0.5, 0);
    const ring = MeshBuilder.CreateTorus(
      'prism-placement-target',
      { diameter: 1.45, thickness: 0.025, tessellation: 32 },
      scene,
    );
    ring.parent = optics;
    ring.position.copyFrom(destination);
    ring.rotation.x = Math.PI / 2;
    ring.material = luminousMaterial(scene, 'prism-target-cyan', new Color3(0.3, 0.9, 1));
    ring.material.alpha = 0.55;
    const whiteIn = createLightBeam(
      scene,
      'white-light-in',
      sun.position.add(new Vector3(0.55, 0, 0)),
      destination,
      Color3.White(),
      masks.beam,
      quality,
      0.24,
      0.3,
    );
    whiteIn.parent = optics;
    const whiteOut = createLightBeam(
      scene,
      'white-light-unsplit',
      destination,
      new Vector3(3.48, 0.5, 0),
      Color3.White(),
      masks.beam,
      quality,
      0.3,
      0.45,
    );
    whiteOut.parent = optics;
    const fan: TransformNode[] = [];
    const bands: Mesh[] = [];
    const spectrumScreen = MeshBuilder.CreateBox(
      'spectrum-screen',
      { width: 0.12, height: 3.55, depth: 1.9 },
      scene,
    );
    spectrumScreen.parent = optics;
    spectrumScreen.position.set(3.55, 0.25, 0);
    const spectrumMat = new StandardMaterial('spectrum-screen-matte', scene);
    spectrumMat.diffuseColor = new Color3(0.06, 0.09, 0.13);
    spectrumMat.specularColor = Color3.Black();
    spectrumScreen.material = spectrumMat;
    // White sunlight already reaches the screen while the prism rests on the bench.
    // Both spots sit on the receiving face, with one shared radial mask and no extra light.
    const whiteImpact = new TransformNode('white-screen-illumination', scene);
    whiteImpact.parent = optics;
    const whiteSpot = MeshBuilder.CreatePlane('white-screen-spot', { size: 0.9 }, scene);
    whiteSpot.parent = whiteImpact;
    whiteSpot.rotation.y = Math.PI / 2;
    whiteSpot.position.set(3.478, 0.5, 0);
    whiteSpot.material = luminousMaterial(scene, 'white-screen-core', Color3.White(), masks.spot);
    whiteSpot.material.alpha = 0.92;
    const diffuseSpot = MeshBuilder.CreatePlane('white-screen-diffusion', { size: 1.8 }, scene);
    diffuseSpot.parent = whiteImpact;
    diffuseSpot.rotation.y = Math.PI / 2;
    diffuseSpot.position.set(3.475, 0.5, 0);
    diffuseSpot.material = luminousMaterial(
      scene,
      'white-screen-diffuse',
      new Color3(0.85, 0.9, 1),
      masks.spot,
    );
    diffuseSpot.material.alpha = 0.32;
    RAINBOW_BANDS.forEach((colour, index) => {
      const y = 1.5 - index * 0.5;
      const beam = createLightBeam(
        scene,
        `rainbow-${index}`,
        destination.add(new Vector3(0.14, 0, 0)),
        new Vector3(3.46, y, 0),
        tint(colour.rgb),
        masks.beam,
        quality,
        0.12,
        0.48,
      );
      beam.parent = optics;
      fan.push(beam);
      const stripe = MeshBuilder.CreateBox(
        `spectrum-band-${index}`,
        { width: 0.15, height: 0.38, depth: 1.7 },
        scene,
      );
      stripe.parent = optics;
      stripe.position.set(3.46, y, 0);
      stripe.material = luminousMaterial(scene, `spectrum-colour-${index}`, tint(colour.rgb));
      stripe.material.alpha = 0.85;
      bands.push(stripe);
    });

    const screenFrame = MeshBuilder.CreateBox(
      'mixing-screen-frame',
      { width: 2.5, height: 3.3, depth: 0.16 },
      scene,
    );
    screenFrame.parent = mixing;
    screenFrame.position.set(3.05, 0.2, 0.28);
    screenFrame.material = trim;
    const screen = MeshBuilder.CreatePlane('mixing-screen', { width: 2.32, height: 3.1 }, scene);
    screen.parent = mixing;
    screen.position.set(3.05, 0.2, 0.18);
    const screenMat = new StandardMaterial('screen-matte', scene);
    screenMat.disableLighting = true;
    screenMat.emissiveColor = new Color3(0.025, 0.04, 0.07);
    screenMat.backFaceCulling = false;
    screen.material = screenMat;
    const screenCentre = new Vector3(3.05, 0.3, 0.08);
    const spot = MeshBuilder.CreatePlane('mixed-light-spot', { size: 2.15 }, scene);
    spot.parent = mixing;
    spot.position.copyFrom(screenCentre);
    const spotMat = luminousMaterial(scene, 'mixed-light-colour', Color3.White(), masks.spot);
    spotMat.alpha = 0.85;
    spot.material = spotMat;
    const projectors: Mesh[] = [];
    const projectorBeams: TransformNode[] = [];
    LIGHT_CHANNELS.forEach((channel, index) => {
      const pos = new Vector3(-3.05, 1.1 - index * 0.85, 0);
      const housing = MeshBuilder.CreateCylinder(
        `projector-${channel}`,
        { height: 0.65, diameter: 0.65, tessellation: quality === 'low' ? 16 : 24 },
        scene,
      );
      housing.parent = mixing;
      housing.position.copyFrom(pos);
      housing.rotation.z = Math.PI / 2;
      housing.material = metal;
      const lens = MeshBuilder.CreateSphere(
        `lens-${channel}`,
        { diameter: 0.47, segments: 16 },
        scene,
      );
      lens.parent = mixing;
      lens.position.copyFrom(pos.add(new Vector3(0.35, 0, 0)));
      lens.scaling.x = 0.3;
      lens.material = luminousMaterial(
        scene,
        `lens-colour-${channel}`,
        tint(LIGHT_COLOURS[channel].rgb),
      );
      projectors.push(lens);
      const beam = createLightBeam(
        scene,
        `projected-${channel}`,
        lens.position,
        screenCentre,
        tint(LIGHT_COLOURS[channel].rgb),
        masks.beam,
        quality,
        0.3,
        1.25,
      );
      beam.parent = mixing;
      projectorBeams.push(beam);
      const foot = MeshBuilder.CreateBox(
        `projector-foot-${channel}`,
        { width: 0.6, height: 0.15, depth: 0.8 },
        scene,
      );
      foot.parent = mixing;
      foot.position.set(pos.x, pos.y - 0.4, 0);
      foot.material = trim;
    });
    // Picking is restricted to the prism and the three large projector housings/lenses.
    lab.getChildMeshes().forEach((mesh) => {
      mesh.isPickable = false;
    });
    prism.isPickable = true;
    const projectorPicks = LIGHT_CHANNELS.map((channel, index) => {
      const housing = scene.getMeshByName(`projector-${channel}`)!;
      housing.isPickable = true;
      projectors[index]!.isPickable = true;
      return { housing, lens: projectors[index]!, channel };
    });

    let localMode: StarLightSceneMode | null = null;
    let localPlaced = false;
    let localLights = lightsOff();
    let localBand: number | null = null;
    let showPrism = false;
    let attempts = 0;
    let localRound: Round = { targets: MIX_TARGETS, index: 0, completed: [], done: false };
    const applyLights = () => {
      projectorBeams.forEach((beam, index) => {
        const on = localLights[LIGHT_CHANNELS[index]!];
        beam.setEnabled(on);
        (projectors[index]!.material as StandardMaterial).alpha = on ? 1 : 0.18;
      });
      const result = mixedLight(localLights);
      spot.setEnabled(result !== 'dark');
      spotMat.emissiveColor = tint(LIGHT_COLOURS[result].rgb);
      setLights({ ...localLights });
    };
    const applyOptics = () => {
      whiteOut.setEnabled(!localPlaced);
      whiteImpact.setEnabled(!localPlaced);
      spectrumMat.emissiveColor = localPlaced
        ? new Color3(0.015, 0.025, 0.04)
        : new Color3(0.06, 0.075, 0.095);
      ring.setEnabled(!localPlaced && localMode === 'place');
      fan.forEach((beam, index) => {
        beam.setEnabled(localPlaced);
        const highlighted = localBand === null || localBand === index;
        beam.getChildMeshes().forEach((mesh) => {
          const mat = mesh.material as StandardMaterial;
          mat.alpha = highlighted
            ? mat.name.endsWith('-core')
              ? 0.8
              : quality === 'low'
                ? 0.65
                : 0.55
            : 0.09;
        });
      });
      bands.forEach((stripe, index) => {
        stripe.setEnabled(localPlaced);
        (stripe.material as StandardMaterial).alpha =
          localBand === null || localBand === index ? 0.85 : 0.2;
      });
      prismRoot.position.copyFrom(localPlaced ? destination : new Vector3(-0.55, -0.7, -0.7));
      setPlaced(localPlaced);
      setBand(localBand);
    };
    const applyExperiment = () => {
      optics.setEnabled(showPrism);
      mixing.setEnabled(!showPrism);
      setPrismExperiment(showPrism);
      applyOptics();
      applyLights();
    };
    const place = () => {
      if (localMode !== 'place' || localPlaced) return;
      const start = prismRoot.position.clone();
      localPlaced = true;
      applyOptics();
      const motion = getUiMotionSnapshot();
      if (motion === 'full' || motion === 'standard') {
        const anim = new Animation(
          'snap-prism',
          'position',
          60,
          Animation.ANIMATIONTYPE_VECTOR3,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
        anim.setKeys([
          { frame: 0, value: start },
          { frame: 14, value: destination },
        ]);
        scene.beginDirectAnimation(prismRoot, [anim], 0, 14, false);
      }
      setMessage('Le prisme révèle les couleurs cachées dans la lumière blanche !');
      callbacks.current.onPrismSuccess?.();
    };
    const selectBand = (index: number | null) => {
      localBand = index;
      applyOptics();
    };
    const toggle = (channel: LightChannel) => {
      if (showPrism || localMode === 'intro' || localMode === 'review') return;
      localLights = { ...localLights, [channel]: !localLights[channel] };
      applyLights();
      setMessage('');
      callbacks.current.onPrismMiss?.(null);
    };
    const validate = () => {
      if (localMode !== 'challenge' || localRound.done) return;
      const target = localRound.targets[localRound.index]!;
      if (mixedLight(localLights) !== target) {
        attempts += 1;
        const hint = lightHint(localLights, target, attempts);
        setMessage(hint);
        callbacks.current.onPrismMiss?.(hint);
        return;
      }
      const completed = [...localRound.completed, target];
      callbacks.current.onPrismMiss?.(null);
      const done = lightProgress(completed, localRound.targets).complete;
      localRound = {
        ...localRound,
        completed,
        done,
        index: done ? localRound.index : localRound.index + 1,
      };
      setRound({ ...localRound });
      attempts = 0;
      setMessage(
        done
          ? 'Bravo ! Toutes les couleurs sont retrouvées.'
          : `Oui, ${LIGHT_COLOURS[target].name.toLowerCase()} ! À toi de trouver la couleur suivante.`,
      );
      if (done) {
        callbacks.current.onPrismSuccess?.();
      } else {
        localLights = lightsOff();
        applyLights();
      }
    };
    const api: StarLightSceneApi = {
      camera: cameraApi,
      setMode: (next) => {
        if (next === localMode) return;
        scene.stopAnimation(prismRoot);
        localMode = next;
        setMode(next);
        setMessage('');
        localBand = null;
        showPrism = next === 'intro' || next === 'place' || next === 'rainbow';
        if (next === 'intro' || next === 'place') localPlaced = false;
        else localPlaced = true; // Resuming later in the mission restores its experiment.
        if (next === 'intro') localLights = lightsOff();
        if (next === 'review') localLights = { red: true, green: true, blue: true };
        if (next === 'challenge') {
          localRound = { targets: MIX_TARGETS, index: 0, completed: [], done: false };
          setRound({ ...localRound });
          localLights = lightsOff();
          attempts = 0;
        }
        applyExperiment();
      },
    };
    const pointer = scene.onPointerObservable.add((info) => {
      if (info.type !== PointerEventTypes.POINTERTAP || !info.pickInfo?.hit) return;
      if (info.pickInfo.pickedMesh === prism) place();
      const picked = projectorPicks.find(
        (entry) =>
          entry.lens === info.pickInfo?.pickedMesh || entry.housing === info.pickInfo?.pickedMesh,
      );
      if (picked) toggle(picked.channel);
    });
    controls.current = {
      place,
      toggle,
      selectBand,
      validate,
      experiment: (prismMode) => {
        if (localMode !== 'explore') return;
        showPrism = prismMode;
        applyExperiment();
      },
    };
    api.setMode('intro');
    setReady(true);
    callbacks.current.onSceneApi?.(api);
    const perf = startPerfMonitor(scene, { label: 'mission-09-colours' });
    return () => {
      controls.current = null;
      scene.onPointerObservable.remove(pointer);
      scene.stopAnimation(prismRoot);
      perf.dispose();
      lab.dispose();
      masks.dispose();
      background.dispose();
      lighting.dispose();
    };
  }, []);

  const isRound = mode === 'challenge';
  const showRainbow = mode === 'rainbow' || (mode === 'explore' && prismExperiment);
  const showLights = !prismExperiment;
  const result = mixedLight(lights);
  const target = round.targets[round.index]!;
  const progress = lightProgress(round.completed, round.targets);
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        mobileFovScale={1}
        minHorizontalFov={0.94}
        onSceneReady={onSceneReady}
      />
      <div className={styles.sceneLabel} aria-hidden="true">
        <span className={styles.eyebrow}>LABORATOIRE DES COULEURS</span>
        <span>
          {prismExperiment ? 'Lumière blanche → prisme → arc-en-ciel' : 'Trois lumières → un écran'}
        </span>
      </div>
      {mode !== 'intro' && mode !== 'review' ? (
        <SceneControls className={styles.hud}>
          {mode === 'explore' ? (
            <div className={styles.tabs} role="group" aria-label="Expérience">
              <button
                aria-pressed={prismExperiment}
                onClick={() => controls.current?.experiment(true)}
              >
                Prisme
              </button>
              <button
                aria-pressed={!prismExperiment}
                onClick={() => controls.current?.experiment(false)}
              >
                Projecteurs
              </button>
            </div>
          ) : null}
          {mode === 'place' ? (
            <>
              <p className={styles.panelTitle}>Révèle les couleurs</p>
              <p className={styles.note}>Un appui suffit pour placer le triangle de verre.</p>
              <button
                className={styles.action}
                disabled={!ready || placed}
                onClick={() => controls.current?.place()}
              >
                {placed ? '✓ Prisme placé' : 'Placer le prisme'}
              </button>
            </>
          ) : null}
          {showRainbow ? (
            <>
              <p className={styles.panelTitle}>Retrouve une couleur</p>
              <div className={styles.rainbow} role="group" aria-label="Couleurs de l’arc-en-ciel">
                {RAINBOW_BANDS.map((colour, index) => (
                  <button
                    key={colour.name}
                    className={styles.band}
                    style={colourStyle(colour.css)}
                    aria-pressed={band === index}
                    onClick={() => controls.current?.selectBand(index)}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                    {colour.name}
                  </button>
                ))}
              </div>
              <button
                className={styles.secondary}
                aria-pressed={band === null}
                onClick={() => controls.current?.selectBand(null)}
              >
                Tout l’arc-en-ciel
              </button>
            </>
          ) : null}
          {showLights ? (
            <>
              {isRound ? (
                <>
                  <p className={styles.progress}>
                    Observatoire · {progress.done}/{progress.total} réussies
                  </p>
                  {round.done ? (
                    <p className={styles.success}>✓ Observatoire rallumé !</p>
                  ) : (
                    <div className={styles.target}>
                      <span
                        className={styles.targetSwatch}
                        style={colourStyle(LIGHT_COLOURS[target].css)}
                        aria-hidden="true"
                      />
                      <div>
                        <span className={styles.eyebrow}>COULEUR À TROUVER</span>
                        <strong>{LIGHT_COLOURS[target].name}</strong>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.panelTitle}>À toi les projecteurs</p>
              )}
              <div className={styles.projectors} role="group" aria-label="Lumières des projecteurs">
                {LIGHT_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    style={colourStyle(LIGHT_COLOURS[channel].css)}
                    className={styles.projector}
                    aria-pressed={lights[channel]}
                    disabled={!ready}
                    onClick={() => controls.current?.toggle(channel)}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                    <strong>{LIGHT_COLOURS[channel].name}</strong>
                    <small>{lights[channel] ? '✓ Allumé' : 'Éteint'}</small>
                  </button>
                ))}
              </div>
              <div className={styles.result} role="status">
                <span
                  className={styles.resultSwatch}
                  style={colourStyle(LIGHT_COLOURS[result].css)}
                  aria-hidden="true"
                />
                <span>
                  Sur l’écran : <strong>{LIGHT_COLOURS[result].name}</strong>
                </span>
              </div>
              {isRound && !round.done ? (
                <button
                  className={styles.action}
                  disabled={!ready}
                  onClick={() => controls.current?.validate()}
                >
                  Valider mon mélange
                </button>
              ) : null}
              <p className={styles.note}>On mélange des lumières, pas de la peinture.</p>
            </>
          ) : null}
          {message ? (
            <p className={styles.message} role="status">
              {message}
            </p>
          ) : null}
        </SceneControls>
      ) : null}
    </div>
  );
}
