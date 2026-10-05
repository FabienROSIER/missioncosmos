'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { createBlackHole } from '@/3d/entities/createBlackHole';
import { createStarMesh } from '@/3d/entities/createStarMesh';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { resolveGraphicsQuality } from '@/3d/materials/graphicsQuality';
import { SceneControls } from '@/components/layout/SceneControls';
import {
  BLACK_HOLE_VIEWS,
  BLACK_HOLE_ORBITS,
  type BlackHoleView,
} from '@/content/bodies/blackHolePreview';
import { eccentricAnomaly, orbitPoint, orbitSpeedRatio } from '@/3d/utils/blackHoleOrbit';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './BlackHoleScene.module.css';

type Props = {
  className?: string;
  /** Conservé pour l’aperçu visuel autonome. */
  view?: BlackHoleView;
  /** Fourni par MissionImmersive pour piloter la scène pédagogique. */
  stepId?: string;
  onSuccess?: () => void;
  onClearFeedback?: () => void;
  onInstruction?: (message: string) => void;
};

function viewForStep(stepId: string | undefined): BlackHoleView {
  if (stepId === 'm13-surroundings') return 'disk';
  if (stepId === 'm13-signals') return 'horizon';
  return 'orbits';
}

// A teaching spiral, not a relativistic ray trace. Its radius decreases all the
// way to the centre while successive turns get progressively tighter.
const INSIDE_SIGNAL_PATH = Array.from({ length: 241 }, (_, index) => {
  const progress = index / 240;
  const radius = 80 * Math.pow(1 - progress, 1.3);
  const angle = Math.PI / 2 - progress * Math.PI * 6;
  const x = 300 + radius * Math.cos(angle);
  const y = 250 + radius * Math.sin(angle);
  return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`;
}).join(' ');

export function BlackHoleScene({
  className,
  view,
  stepId,
  onSuccess,
  onClearFeedback,
  onInstruction,
}: Props) {
  const activeView = view ?? viewForStep(stepId);
  const [paused, setPaused] = useState(false);
  const [paths, setPaths] = useState(stepId !== 'm13-intro');
  const [followingOrbit, setFollowingOrbit] = useState(false);
  const [observedOrbit, setObservedOrbit] = useState(false);
  const [identifiedGas, setIdentifiedGas] = useState(false);
  const [identifiedCenter, setIdentifiedCenter] = useState(false);
  const [outsideSignal, setOutsideSignal] = useState(false);
  const [insideSignal, setInsideSignal] = useState(false);
  const camera = useRef<ArcRotateCamera | null>(null);
  const speedLabel = useRef<HTMLOutputElement | null>(null);
  const restartOrbit = useRef(false);
  const callbacks = useRef({ onSuccess, onClearFeedback, onInstruction });
  const options = useRef({
    view: activeView,
    stepId,
    paused,
    paths,
    followingOrbit,
    identifiedGas,
    identifiedCenter,
  });
  useEffect(() => {
    callbacks.current = { onSuccess, onClearFeedback, onInstruction };
  }, [onSuccess, onClearFeedback, onInstruction]);
  useEffect(() => {
    options.current = {
      view: activeView,
      stepId,
      paused,
      paths,
      followingOrbit,
      identifiedGas,
      identifiedCenter,
    };
  }, [activeView, stepId, paused, paths, followingOrbit, identifiedGas, identifiedCenter]);
  useEffect(() => {
    if (!followingOrbit || observedOrbit || stepId !== 'm13-observe') return;
    const timer = window.setTimeout(() => {
      setObservedOrbit(true);
      onClearFeedback?.();
      onSuccess?.();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [followingOrbit, observedOrbit, stepId, onClearFeedback, onSuccess]);
  const onSceneReady = useCallback(({ scene, engine }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    engine.setHardwareScalingLevel(
      1 / Math.min(window.devicePixelRatio || 1, quality === 'low' ? 1 : 1.5),
    );
    scene.clearColor = new Color4(0.015, 0.025, 0.045, 1);
    const cam = scene.activeCamera as ArcRotateCamera;
    cam.setTarget(Vector3.Zero());
    cam.radius = 25;
    cam.alpha = -Math.PI / 2;
    cam.beta = 1.27;
    cam.lowerRadiusLimit = 20;
    cam.upperRadiusLimit = 38;
    cam.lowerBetaLimit = 0.08;
    cam.upperBetaLimit = Math.PI - 0.08;
    cam.panningSensibility = 0;
    camera.current = cam;
    const background = createSpaceBackground(scene, undefined, { level: 0.28, segments: 24 });
    const hole = createBlackHole(scene, quality);
    // Opaque, unlit teaching marker: depth occludes the background and objects behind it.
    const darkSphere = MeshBuilder.CreateSphere(
      'orbital-black-hole',
      { diameter: 2.4, segments: 48 },
      scene,
    );
    const darkMaterial = new StandardMaterial('orbital-black-hole-dark', scene);
    darkMaterial.disableLighting = true;
    darkMaterial.diffuseColor = Color3.Black();
    darkMaterial.emissiveColor = Color3.Black();
    darkMaterial.specularColor = Color3.Black();
    darkSphere.material = darkMaterial;
    darkSphere.isPickable = false;
    // Volumes transparents réservés au picking pédagogique du disque et du centre.
    const pickMaterial = new StandardMaterial('black-hole-pick-material', scene);
    pickMaterial.disableLighting = true;
    pickMaterial.alpha = 0.001;
    pickMaterial.disableDepthWrite = true;
    const gasPicker = MeshBuilder.CreateTorus(
      'black-hole-gas-picker',
      { diameter: 11, thickness: 4.2, tessellation: 64 },
      scene,
    );
    gasPicker.material = pickMaterial;
    const centerPicker = MeshBuilder.CreateSphere(
      'black-hole-center-picker',
      { diameter: 3.4, segments: 24 },
      scene,
    );
    centerPicker.material = pickMaterial;
    const stars = (['sirius', 'sun', 'proxima'] as const).map((id, index) => {
      const star = createStarMesh(scene, id, quality);
      star.setRadius([0.22, 0.28, 0.2][index]!);
      star.root
        .getChildMeshes()
        .filter((mesh) => mesh.name.startsWith('star-label-'))
        .forEach((mesh) => mesh.setEnabled(false));
      return star;
    });
    const point = (index: number, angle: number) => {
      const { a, e, inclination } = BLACK_HOLE_ORBITS[index]!;
      const p = orbitPoint(a, e, angle, inclination);
      return new Vector3(p.x, p.y, p.z);
    };
    const orbits = stars.map((_, index) => {
      const line = MeshBuilder.CreateLines(
        `black-hole-orbit-${index}`,
        {
          points: Array.from({ length: 181 }, (_, n) => point(index, (n * Math.PI) / 90)),
        },
        scene,
      );
      line.color = index === 1 ? Color3.FromHexString('#f4c95f') : new Color3(0.25, 0.62, 0.7);
      line.alpha = index === 1 ? 0.85 : 0.5;
      line.isPickable = false;
      return line;
    });
    const reducedMotion = prefersReducedMotion();
    let time = 0;
    let orbitTime = 0;
    let lastView: BlackHoleView | undefined;
    let wasFollowing = false;
    const pointer = scene.onPointerObservable.add((info) => {
      const state = options.current;
      if (info.type !== PointerEventTypes.POINTERDOWN || state.stepId !== 'm13-surroundings')
        return;
      const pickedName = info.pickInfo?.pickedMesh?.name;
      if (pickedName === gasPicker.name && !state.identifiedGas) {
        setIdentifiedGas(true);
        callbacks.current.onInstruction?.(
          'Gaz chaud identifié. Maintenant, clique sur le centre sombre.',
        );
        return;
      }
      if (pickedName === centerPicker.name && state.identifiedGas && !state.identifiedCenter) {
        setIdentifiedCenter(true);
        callbacks.current.onClearFeedback?.();
        callbacks.current.onSuccess?.();
      }
    });
    const observer = scene.onBeforeRenderObservable.add(() => {
      const state = options.current;
      const delta = Math.min(engine.getDeltaTime(), 60) / 1000;
      if (!state.paused && !reducedMotion) {
        time += delta;
        if (state.view === 'orbits') orbitTime += delta;
      }
      if (restartOrbit.current) {
        orbitTime = 0;
        restartOrbit.current = false;
      }
      if (lastView !== state.view) {
        cam.alpha = -Math.PI / 2;
        cam.beta = state.view === 'horizon' ? Math.PI / 2 : state.view === 'orbits' ? 1.08 : 1.27;
        cam.radius = state.view === 'horizon' ? 20 : state.view === 'orbits' ? 29 : 25;
        cam.lowerAlphaLimit = state.view === 'horizon' ? -Math.PI / 2 : null;
        cam.upperAlphaLimit = state.view === 'horizon' ? -Math.PI / 2 : null;
        cam.lowerBetaLimit = state.view === 'horizon' ? Math.PI / 2 : 0.08;
        cam.upperBetaLimit = state.view === 'horizon' ? Math.PI / 2 : Math.PI - 0.08;
        lastView = state.view;
      }
      hole.setEnabled(state.view === 'disk');
      darkSphere.setEnabled(state.view === 'orbits');
      gasPicker.setEnabled(
        state.stepId === 'm13-surroundings' && state.view === 'disk' && !state.identifiedGas,
      );
      centerPicker.setEnabled(
        state.stepId === 'm13-surroundings' &&
          state.view === 'disk' &&
          state.identifiedGas &&
          !state.identifiedCenter,
      );
      hole.update(cam.globalPosition, time);
      stars.forEach((star, index) => {
        star.root.setEnabled(state.view === 'orbits');
        const orbit = BLACK_HOLE_ORBITS[index]!;
        // Shared central mass: n ∝ a^(-3/2); the golden star completes a lap in 18 s.
        const meanMotion = ((2 * Math.PI) / 18) * Math.pow(5.5 / orbit.a, 1.5);
        const eccentric = eccentricAnomaly(orbitTime * meanMotion + orbit.phase, orbit.e);
        star.root.position.copyFrom(point(index, eccentric));
        if (index === 1 && speedLabel.current && state.view === 'orbits') {
          const label = `×${orbitSpeedRatio(orbit.e, eccentric).toFixed(1).replace('.', ',')}`;
          if (speedLabel.current.textContent !== label) speedLabel.current.textContent = label;
        }
        orbits[index]!.setEnabled(state.view === 'orbits' && state.paths);
      });
      if (state.view === 'orbits' && state.followingOrbit) {
        cam.setTarget(stars[1]!.root.position);
        if (!wasFollowing) cam.radius = Math.min(cam.radius, 16);
        wasFollowing = true;
      } else if (wasFollowing) {
        cam.setTarget(Vector3.Zero());
        cam.radius = 29;
        wasFollowing = false;
      }
    });
    return () => {
      camera.current = null;
      scene.onBeforeRenderObservable.remove(observer);
      scene.onPointerObservable.remove(pointer);
      hole.dispose();
      darkSphere.dispose();
      darkMaterial.dispose();
      gasPicker.dispose();
      centerPicker.dispose();
      pickMaterial.dispose();
      background.dispose();
      stars.forEach((star) => star.dispose());
      orbits.forEach((line) => line.dispose());
    };
  }, []);
  const preset = (beta: number) => {
    if (!camera.current) return;
    camera.current.alpha = -Math.PI / 2;
    camera.current.beta = activeView === 'orbits' && beta === 1.27 ? 1.08 : beta;
    camera.current.radius = activeView === 'orbits' ? 32 : 25;
  };
  const detail = BLACK_HOLE_VIEWS.find((entry) => entry.id === activeView)!;
  const toggleOrbitTracking = () => {
    setPaths(true);
    setPaused(false);
    setFollowingOrbit((following) => !following);
  };
  const emitOutside = () => {
    setOutsideSignal(true);
    onClearFeedback?.();
  };
  const emitInside = () => {
    if (!outsideSignal) return;
    setInsideSignal(true);
    onClearFeedback?.();
    onSuccess?.();
  };
  return (
    <div className={[styles.scene, className].filter(Boolean).join(' ')}>
      <BabylonCanvas
        fill
        onSceneReady={onSceneReady}
        loadingMessage="Ouverture de l’observatoire…"
        mobileFovScale={1.1}
      />
      <header className={styles.heading}>
        <span>OBSERVATOIRE · 13</span>
        <h2>{detail.title}</h2>
      </header>
      {activeView === 'horizon' && (
        <div className={styles.horizonDiagram}>
          {/* This is a fixed explanatory cutaway, not a camera-dependent 3D object.
              Keep its boundary and labels together, visible at every graphics quality. */}
          <svg
            viewBox="0 0 600 500"
            role="img"
            aria-label="Coupe de l’horizon des événements : une frontière en pointillés sépare l’extérieur de l’intérieur, d’où aucun signal lumineux ne peut ressortir."
          >
            <circle cx="300" cy="250" r="145" fill="#070b16" />
            <circle
              cx="300"
              cy="250"
              r="145"
              fill="none"
              stroke="#3db8c5"
              strokeWidth="16"
              opacity="0.08"
            />
            <circle
              cx="300"
              cy="250"
              r="145"
              fill="none"
              stroke="#7ed6df"
              strokeWidth="3"
              strokeDasharray="9 7"
            />
            <text x="300" y="65" className={styles.exteriorLabel}>
              Extérieur
            </text>
            <text x="300" y={insideSignal ? '151' : '245'} className={styles.interiorLabel}>
              Intérieur
            </text>
            <text x="300" y={insideSignal ? '178' : '273'} className={styles.diagramCaption}>
              Aucun signal lumineux ne ressort
            </text>
            <path d="M 402 353 L 435 405 L 300 405" fill="none" stroke="#7ed6df" strokeWidth="2" />
            <circle cx="402" cy="353" r="4" fill="#7ed6df" />
            <text x="300" y="440" className={styles.exteriorLabel}>
              Horizon des événements
            </text>
            <text x="300" y="470" className={styles.diagramCaption}>
              Une limite, pas une paroi.
            </text>
            {stepId === 'm13-signals' && (
              <>
                <circle cx="470" cy="250" r="11" className={styles.outsideEmitter} />
                <text x="470" y="286" className={styles.emitterLabel}>
                  Dehors
                </text>
                {outsideSignal && (
                  <path d="M 482 250 L 10000 250" className={styles.escapedSignal} />
                )}
                <circle cx="300" cy="330" r="11" className={styles.insideEmitter} />
                <text x="300" y="366" className={styles.emitterLabel}>
                  Dedans
                </text>
                {insideSignal && (
                  <>
                    <path d={INSIDE_SIGNAL_PATH} className={styles.inwardTrail} />
                    <path d={INSIDE_SIGNAL_PATH} className={styles.trappedSignal} pathLength="1" />
                    <circle r="5" fill="#ffd1b4" className={styles.signalPulse}>
                      <animateMotion path={INSIDE_SIGNAL_PATH} dur="3s" fill="freeze" />
                    </circle>
                  </>
                )}
              </>
            )}
          </svg>
        </div>
      )}
      <div className={styles.bottom}>
        {activeView === 'orbits' && (
          <p className={styles.speed}>
            Étoile dorée · vitesse{' '}
            <output ref={speedLabel} aria-live="off">
              ×1,0
            </output>
            <small>par rapport à son passage le plus lent</small>
          </p>
        )}
        {stepId === 'm13-signals' && (outsideSignal || insideSignal) ? (
          <p className={styles.signalResult} role="status">
            {insideSignal
              ? 'Dedans : le signal se dirige vers le centre et ne ressort pas.'
              : 'Dehors : ce signal dirigé vers l’extérieur peut s’échapper.'}
          </p>
        ) : null}
        <p className={styles.note}>{detail.note}</p>
        <SceneControls className={styles.controls}>
          {activeView !== 'horizon' && (
            <>
              <button onClick={() => preset(1.27)}>Vue inclinée</button>
              <button onClick={() => preset(0.08)}>Vue de dessus</button>
              <button aria-pressed={paused} onClick={() => setPaused(!paused)}>
                {paused ? 'Animer' : 'Pause'}
              </button>
            </>
          )}
          {activeView === 'orbits' && (
            <>
              <button aria-pressed={paths} onClick={() => setPaths(!paths)}>
                Trajectoires
              </button>
              <button
                onClick={() => {
                  restartOrbit.current = true;
                  setPaused(false);
                }}
              >
                Revoir l’orbite
              </button>
            </>
          )}
          {stepId === 'm13-observe' && (
            <button aria-pressed={followingOrbit} onClick={toggleOrbitTracking}>
              {followingOrbit
                ? observedOrbit
                  ? 'Arrêter le suivi ✓'
                  : 'Suivi en cours…'
                : observedOrbit
                  ? 'Suivre à nouveau'
                  : 'Suivre l’étoile dorée'}
            </button>
          )}
          {stepId === 'm13-signals' && (
            <>
              <button aria-pressed={outsideSignal} disabled={outsideSignal} onClick={emitOutside}>
                {outsideSignal ? 'Signal dehors testé ✓' : 'Émettre dehors'}
              </button>
              <button
                aria-pressed={insideSignal}
                disabled={!outsideSignal || insideSignal}
                onClick={emitInside}
              >
                {insideSignal ? 'Signal dedans testé ✓' : 'Émettre dedans'}
              </button>
            </>
          )}
        </SceneControls>
      </div>
    </div>
  );
}
