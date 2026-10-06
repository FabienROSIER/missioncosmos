'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  Matrix,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { createBlackHole } from '@/3d/entities/createBlackHole';
import { createStarMesh } from '@/3d/entities/createStarMesh';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { applyPlanetaryMaterials, resolveGraphicsQuality } from '@/3d/materials';
import { SceneControls } from '@/components/layout/SceneControls';
import {
  BLACK_HOLE_VIEWS,
  BLACK_HOLE_ORBITS,
  type BlackHoleView,
} from '@/content/bodies/blackHolePreview';
import { eccentricAnomaly, orbitPoint, orbitSpeedRatio } from '@/3d/utils/blackHoleOrbit';
import { prefersReducedMotion } from '@/lib/motion';
import { EARTH_BODY } from '@/content/bodies/catalog';
import styles from './BlackHoleScene.module.css';

type OrbitPrediction = 'stable' | 'fall' | 'escape';
type DetectionRegion = 0 | 1 | 2;

type Props = {
  className?: string;
  /** Conservé pour l’aperçu visuel autonome. */
  view?: BlackHoleView;
  /** Fourni par MissionImmersive pour piloter la scène pédagogique. */
  stepId?: string;
  onSuccess?: () => void;
  onMiss?: (message: string) => void;
  onClearFeedback?: () => void;
  onInstruction?: (message: string) => void;
};

function viewForStep(stepId: string | undefined): BlackHoleView {
  if (stepId === 'm13-surroundings') return 'disk';
  if (stepId === 'm13-signals') return 'horizon';
  return 'orbits';
}

/** After the orbit-detection challenge, show one possible luminous-disk example. */
function isAccretionRevealStep(stepId: string | undefined): boolean {
  return (
    stepId === 'm13-explain' ||
    stepId === 'm13-quiz' ||
    stepId === 'm13-reward' ||
    stepId === 'm13-complete'
  );
}

// Outer disk radius ≈ 8.6 × 0.12 = 1.0: compact and clear inside every orbit.
const ORBIT_ACCRETION_SCALE = 0.12;

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
  onMiss,
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
  const [orbitPrediction, setOrbitPrediction] = useState<OrbitPrediction | null>(null);
  const [comparisonRunning, setComparisonRunning] = useState(false);
  const [centralReplaced, setCentralReplaced] = useState(false);
  const [detectionPaths, setDetectionPaths] = useState(false);
  const [detectionChoice, setDetectionChoice] = useState<DetectionRegion | null>(null);
  const camera = useRef<ArcRotateCamera | null>(null);
  const speedLabel = useRef<HTMLOutputElement | null>(null);
  const regionButtons = useRef<Array<HTMLButtonElement | null>>([null, null, null]);
  const restartOrbit = useRef(false);
  const callbacks = useRef({ onSuccess, onMiss, onClearFeedback, onInstruction });
  const options = useRef({
    view: activeView,
    stepId,
    paused,
    paths,
    followingOrbit,
    identifiedGas,
    identifiedCenter,
    centralReplaced,
    detectionPaths,
  });
  useEffect(() => {
    callbacks.current = { onSuccess, onMiss, onClearFeedback, onInstruction };
  }, [onSuccess, onMiss, onClearFeedback, onInstruction]);
  useEffect(() => {
    options.current = {
      view: activeView,
      stepId,
      paused,
      paths,
      followingOrbit,
      identifiedGas,
      identifiedCenter,
      centralReplaced,
      detectionPaths,
    };
  }, [
    activeView,
    stepId,
    paused,
    paths,
    followingOrbit,
    identifiedGas,
    identifiedCenter,
    centralReplaced,
    detectionPaths,
  ]);
  useEffect(() => {
    if (!followingOrbit || observedOrbit || stepId !== 'm13-observe') return;
    const timer = window.setTimeout(() => {
      setObservedOrbit(true);
      onClearFeedback?.();
      onSuccess?.();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [followingOrbit, observedOrbit, stepId, onClearFeedback, onSuccess]);
  useEffect(() => {
    if (!comparisonRunning || stepId !== 'm13-orbit' || !orbitPrediction) return;
    callbacks.current.onClearFeedback?.();
    const replaceTimer = window.setTimeout(() => setCentralReplaced(true), 1100);
    const resultTimer = window.setTimeout(() => {
      setComparisonRunning(false);
      if (orbitPrediction === 'stable') {
        callbacks.current.onSuccess?.();
      } else {
        callbacks.current.onMiss?.(
          'Même masse au centre, même distance et même vitesse au départ : la planète garde son orbite.',
        );
      }
    }, 4300);
    return () => {
      window.clearTimeout(replaceTimer);
      window.clearTimeout(resultTimer);
    };
  }, [comparisonRunning, orbitPrediction, stepId]);
  const onSceneReady = useCallback(async ({ scene, engine }: BabylonSceneContext) => {
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
    const detectionChallengeSetup = stepId === 'm13-detect';
    // The detection challenge must not show any central black marker.
    const hole = detectionChallengeSetup ? null : createBlackHole(scene, quality);
    const darkSphere = detectionChallengeSetup
      ? null
      : MeshBuilder.CreateSphere(
          'orbital-black-hole',
          { diameter: 2.4, segments: 48 },
          scene,
        );
    const darkMaterial = detectionChallengeSetup
      ? null
      : new StandardMaterial('orbital-black-hole-dark', scene);
    if (darkSphere && darkMaterial) {
      darkMaterial.disableLighting = true;
      darkMaterial.diffuseColor = Color3.Black();
      darkMaterial.emissiveColor = Color3.Black();
      darkMaterial.specularColor = Color3.Black();
      darkSphere.material = darkMaterial;
      darkSphere.isPickable = false;
      darkSphere.setEnabled(false);
    }
    hole?.setEnabled(false);
    // Volumes transparents réservés au picking pédagogique du disque et du centre.
    const pickMaterial = detectionChallengeSetup
      ? null
      : new StandardMaterial('black-hole-pick-material', scene);
    if (pickMaterial) {
      pickMaterial.disableLighting = true;
      pickMaterial.alpha = 0.001;
      pickMaterial.disableDepthWrite = true;
    }
    const gasPicker = detectionChallengeSetup
      ? null
      : MeshBuilder.CreateTorus(
          'black-hole-gas-picker',
          { diameter: 11, thickness: 4.2, tessellation: 64 },
          scene,
        );
    if (gasPicker && pickMaterial) gasPicker.material = pickMaterial;
    const centerPicker = detectionChallengeSetup
      ? null
      : MeshBuilder.CreateSphere(
          'black-hole-center-picker',
          { diameter: 3.4, segments: 24 },
          scene,
        );
    if (centerPicker && pickMaterial) {
      centerPicker.material = pickMaterial;
      centerPicker.setEnabled(false);
    }
    const stars = detectionChallengeSetup
      ? []
      : (['sirius', 'sun', 'proxima'] as const).map((id, index) => {
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
    const orbits = detectionChallengeSetup
      ? []
      : stars.map((_, index) => {
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
    const challengeSun =
      stepId === 'm13-orbit' ? createStarMesh(scene, 'sun', quality) : null;
    challengeSun?.setRadius(1.25);
    challengeSun?.root
      .getChildMeshes()
      .filter((mesh) => mesh.name.startsWith('star-label-'))
      .forEach((mesh) => mesh.setEnabled(false));
    const challengePlanet =
      stepId === 'm13-orbit'
        ? await CelestialBodyEntity.create(scene, {
            definition: {
              ...EARTH_BODY,
              visual: { ...EARTH_BODY.visual, visualRadius: 0.58 },
            },
            spin: true,
          })
        : null;
    if (challengePlanet) {
      applyPlanetaryMaterials(scene, challengePlanet.meshes, quality);
      challengePlanet.meshes.forEach((mesh) => {
        mesh.isPickable = false;
      });
    }
    const challengeOrbit =
      stepId === 'm13-orbit'
        ? MeshBuilder.CreateTorus(
            'equal-mass-challenge-orbit',
            { diameter: 14, thickness: 0.035, tessellation: quality === 'low' ? 48 : 80 },
            scene,
          )
        : null;
    const challengeOrbitMaterial =
      stepId === 'm13-orbit' ? new StandardMaterial('equal-mass-orbit-material', scene) : null;
    if (challengeOrbit && challengeOrbitMaterial) {
      challengeOrbitMaterial.disableLighting = true;
      challengeOrbitMaterial.emissiveColor = Color3.FromHexString('#7ed6df');
      challengeOrbitMaterial.alpha = 0.55;
      challengeOrbit.material = challengeOrbitMaterial;
      challengeOrbit.isPickable = false;
    }
    const replacementRing =
      stepId === 'm13-orbit'
        ? MeshBuilder.CreateTorus(
            'equal-mass-black-hole-marker',
            { diameter: 2.9, thickness: 0.055, tessellation: 64 },
            scene,
          )
        : null;
    const replacementRingMaterial =
      stepId === 'm13-orbit'
        ? new StandardMaterial('equal-mass-black-hole-marker-material', scene)
        : null;
    if (replacementRing && replacementRingMaterial) {
      replacementRingMaterial.disableLighting = true;
      replacementRingMaterial.emissiveColor = Color3.FromHexString('#f4c95f');
      replacementRingMaterial.alpha = 0.85;
      replacementRing.material = replacementRingMaterial;
      replacementRing.isPickable = false;
    }
    const detectionCenters = [-7.5, 0, 7.5].map((x) => new Vector3(x, 0, 0));
    /** Wrong regions: each star orbits its own well-separated centre. */
    const falseFocusOffset = (starIndex: number): Vector3 => {
      const patterns = [
        new Vector3(-1.9, 0, -1.2),
        new Vector3(0.2, 0, 2.0),
        new Vector3(1.9, 0, -1.1),
      ] as const;
      return patterns[starIndex]!;
    };
    const detectionFocus = (region: DetectionRegion, starIndex: number): Vector3 => {
      const base = detectionCenters[region]!;
      if (region === 1) return base.clone();
      return base.add(falseFocusOffset(starIndex));
    };
    /** Screen badge sits on the barycentre of that region's orbital foci. */
    const regionBadgeAnchor = (region: DetectionRegion): Vector3 => {
      if (region === 1) return detectionCenters[1]!.clone();
      return detectionFocus(region, 0)
        .add(detectionFocus(region, 1))
        .add(detectionFocus(region, 2))
        .scale(1 / 3);
    };
    const detectionPoint = (
      region: DetectionRegion,
      starIndex: number,
      angle: number,
    ): Vector3 => {
      const focus = detectionFocus(region, starIndex);
      const sharedCenter = region === 1;
      // Shared focus = nested orbits. Separate foci = three clear mini-systems.
      const radius = sharedCenter ? 1.7 + starIndex * 0.95 : 1.15;
      const inclination = sharedCenter
        ? [-0.22, 0.08, 0.38][starIndex]!
        : [-0.18, 0.2, -0.12][starIndex]!;
      return new Vector3(
        focus.x + radius * Math.cos(angle),
        focus.y + radius * Math.sin(angle) * Math.sin(inclination),
        focus.z + radius * Math.sin(angle) * Math.cos(inclination),
      );
    };
    const detectionMaterial =
      stepId === 'm13-detect' ? new StandardMaterial('detection-stars-material', scene) : null;
    if (detectionMaterial) {
      detectionMaterial.disableLighting = true;
      detectionMaterial.emissiveColor = Color3.FromHexString('#fff1b8');
    }
    const detectionStars =
      stepId === 'm13-detect'
        ? detectionCenters.flatMap((_, regionIndex) =>
            Array.from({ length: 3 }, (_, starIndex) => {
              const mesh = MeshBuilder.CreateSphere(
                `detection-star-${regionIndex}-${starIndex}`,
                { diameter: 0.3 + starIndex * 0.06, segments: 12 },
                scene,
              );
              mesh.material = detectionMaterial;
              mesh.isPickable = false;
              return {
                mesh,
                region: regionIndex as DetectionRegion,
                starIndex,
                phase: regionIndex * 0.8 + starIndex * 2.1,
              };
            }),
          )
        : [];
    const detectionTrails =
      stepId === 'm13-detect'
        ? detectionStars.map(({ region, starIndex }) => {
            const trail = MeshBuilder.CreateLines(
              `detection-trail-${region}-${starIndex}`,
              {
                points: Array.from({ length: 81 }, (_, index) =>
                  detectionPoint(region, starIndex, (index * Math.PI * 2) / 80),
                ),
              },
              scene,
            );
            trail.color =
              region === 1 ? Color3.FromHexString('#7ed6df') : new Color3(0.48, 0.58, 0.68);
            trail.alpha = region === 1 ? 0.95 : 0.68;
            trail.isPickable = false;
            return trail;
          })
        : [];
    const reducedMotion = prefersReducedMotion();
    let time = 0;
    let orbitTime = 0;
    let challengeAngle = 0.35;
    let detectionTime = 0;
    let lastView: BlackHoleView | undefined;
    let wasFollowing = false;
    const pointer = scene.onPointerObservable.add((info) => {
      const state = options.current;
      if (
        info.type !== PointerEventTypes.POINTERDOWN ||
        state.stepId !== 'm13-surroundings' ||
        !gasPicker ||
        !centerPicker
      )
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
        if (state.stepId === 'm13-orbit') challengeAngle += delta * 0.42;
        if (state.stepId === 'm13-detect') detectionTime += delta;
      }
      if (restartOrbit.current) {
        orbitTime = 0;
        restartOrbit.current = false;
      }
      if (lastView !== state.view) {
        const reveal = isAccretionRevealStep(state.stepId);
        cam.alpha = -Math.PI / 2;
        cam.beta =
          state.view === 'horizon'
            ? Math.PI / 2
            : state.view === 'orbits'
              ? reveal
                ? 1.18
                : 1.08
              : 1.27;
        cam.radius =
          state.view === 'horizon' ? 20 : state.view === 'orbits' ? (reveal ? 26 : 29) : 25;
        cam.lowerAlphaLimit = state.view === 'horizon' ? -Math.PI / 2 : null;
        cam.upperAlphaLimit = state.view === 'horizon' ? -Math.PI / 2 : null;
        cam.lowerBetaLimit = state.view === 'horizon' ? Math.PI / 2 : 0.08;
        cam.upperBetaLimit = state.view === 'horizon' ? Math.PI / 2 : Math.PI - 0.08;
        lastView = state.view;
      }
      const equalMassChallenge = state.stepId === 'm13-orbit';
      const detectionChallenge = state.stepId === 'm13-detect';
      const accretionReveal = isAccretionRevealStep(state.stepId);
      // Detection must never show a central marker. After that challenge, the
      // orbits view may reveal one possible accretion-disk appearance.
      hole?.setEnabled(
        (state.view === 'disk' && !detectionChallenge) ||
          (state.view === 'orbits' && accretionReveal),
      );
      if (hole) {
        const scale = state.view === 'orbits' && accretionReveal ? ORBIT_ACCRETION_SCALE : 1;
        hole.setScale(scale);
      }
      darkSphere?.setEnabled(
        state.view === 'orbits' &&
          !detectionChallenge &&
          !accretionReveal &&
          (!equalMassChallenge || state.centralReplaced),
      );
      gasPicker?.setEnabled(
        state.stepId === 'm13-surroundings' && state.view === 'disk' && !state.identifiedGas,
      );
      centerPicker?.setEnabled(
        state.stepId === 'm13-surroundings' &&
          state.view === 'disk' &&
          state.identifiedGas &&
          !state.identifiedCenter,
      );
      hole?.update(cam.globalPosition, time);
      stars.forEach((star, index) => {
        star.root.setEnabled(
          state.view === 'orbits' && !equalMassChallenge && !detectionChallenge,
        );
        const orbit = BLACK_HOLE_ORBITS[index]!;
        // Shared central mass: n ∝ a^(-3/2); the golden star completes a lap in 18 s.
        const meanMotion = ((2 * Math.PI) / 18) * Math.pow(5.5 / orbit.a, 1.5);
        const eccentric = eccentricAnomaly(orbitTime * meanMotion + orbit.phase, orbit.e);
        star.root.position.copyFrom(point(index, eccentric));
        if (index === 1 && speedLabel.current && state.view === 'orbits') {
          const label = `×${orbitSpeedRatio(orbit.e, eccentric).toFixed(1).replace('.', ',')}`;
          if (speedLabel.current.textContent !== label) speedLabel.current.textContent = label;
        }
        orbits[index]!.setEnabled(
          state.view === 'orbits' &&
            state.paths &&
            !equalMassChallenge &&
            !detectionChallenge,
        );
      });
      challengeSun?.root.setEnabled(equalMassChallenge && !state.centralReplaced);
      challengePlanet?.pivot.setEnabled(equalMassChallenge);
      challengeOrbit?.setEnabled(equalMassChallenge);
      replacementRing?.setEnabled(equalMassChallenge && state.centralReplaced);
      if (challengePlanet && equalMassChallenge) {
        challengePlanet.pivot.position.set(
          7 * Math.cos(challengeAngle),
          0,
          7 * Math.sin(challengeAngle),
        );
      }
      detectionStars.forEach(({ mesh, region, starIndex, phase }) => {
        mesh.setEnabled(detectionChallenge);
        if (!detectionChallenge) return;
        const speed = region === 1 ? 0.9 / Math.pow(1.7 + starIndex * 0.95, 1.5) : 0.55;
        mesh.position.copyFrom(
          detectionPoint(region, starIndex, detectionTime * speed + phase),
        );
      });
      detectionTrails.forEach((trail) => {
        trail.setEnabled(detectionChallenge && state.detectionPaths);
      });
      if (detectionChallenge) {
        const canvas = engine.getRenderingCanvas();
        const renderWidth = engine.getRenderWidth();
        const renderHeight = engine.getRenderHeight();
        if (canvas && renderWidth > 0 && renderHeight > 0) {
          const viewport = cam.viewport.toGlobal(renderWidth, renderHeight);
          const transform = scene.getTransformMatrix();
          const canvasRect = canvas.getBoundingClientRect();
          detectionCenters.forEach((_, index) => {
            const button = regionButtons.current[index];
            if (!button) return;
            const parent = button.offsetParent as HTMLElement | null;
            const parentRect = parent?.getBoundingClientRect();
            const projected = Vector3.Project(
              regionBadgeAnchor(index as DetectionRegion),
              Matrix.IdentityReadOnly,
              transform,
              viewport,
            );
            const onScreen =
              projected.z > 0 &&
              projected.z < 1 &&
              projected.x >= -40 &&
              projected.y >= -40 &&
              projected.x <= renderWidth + 40 &&
              projected.y <= renderHeight + 40;
            button.hidden = !onScreen;
            if (!onScreen) return;
            // Anchor the badge on the orbital focus (common centre for B).
            const localX = (projected.x / renderWidth) * canvas.clientWidth;
            const localY = (projected.y / renderHeight) * canvas.clientHeight;
            const offsetX = parentRect ? canvasRect.left - parentRect.left : 0;
            const offsetY = parentRect ? canvasRect.top - parentRect.top : 0;
            button.style.left = `${localX + offsetX}px`;
            button.style.top = `${localY + offsetY}px`;
            button.style.visibility = 'visible';
          });
        }
      }
      if (
        state.view === 'orbits' &&
        state.followingOrbit &&
        !equalMassChallenge &&
        !detectionChallenge
      ) {
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
      hole?.dispose();
      darkSphere?.dispose();
      darkMaterial?.dispose();
      gasPicker?.dispose();
      centerPicker?.dispose();
      pickMaterial?.dispose();
      background.dispose();
      stars.forEach((star) => star.dispose());
      orbits.forEach((line) => line.dispose());
      challengeSun?.dispose();
      challengePlanet?.dispose();
      challengeOrbit?.dispose();
      challengeOrbitMaterial?.dispose();
      replacementRing?.dispose();
      replacementRingMaterial?.dispose();
      detectionStars.forEach(({ mesh }) => mesh.dispose());
      detectionTrails.forEach((trail) => trail.dispose());
      detectionMaterial?.dispose();
    };
  }, [stepId]);
  const preset = (beta: number) => {
    if (!camera.current) return;
    camera.current.alpha = -Math.PI / 2;
    camera.current.beta = activeView === 'orbits' && beta === 1.27 ? 1.08 : beta;
    camera.current.radius = activeView === 'orbits' ? 32 : 25;
  };
  const detail = BLACK_HOLE_VIEWS.find((entry) => entry.id === activeView)!;
  const equalMassChallenge = stepId === 'm13-orbit';
  const detectionChallenge = stepId === 'm13-detect';
  const accretionReveal = isAccretionRevealStep(stepId);
  const detectionSolved = detectionChoice === 1;
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
  const startEqualMassComparison = () => {
    if (!orbitPrediction || comparisonRunning) return;
    setCentralReplaced(false);
    setComparisonRunning(true);
  };
  const chooseOrbitPrediction = (prediction: OrbitPrediction) => {
    if (comparisonRunning) return;
    setOrbitPrediction(prediction);
    setCentralReplaced(false);
    onClearFeedback?.();
  };
  const chooseDetectionRegion = (region: DetectionRegion) => {
    setDetectionChoice(region);
    if (region === 1) {
      onClearFeedback?.();
      onSuccess?.();
      return;
    }
    onMiss?.(
      detectionPaths
        ? 'Ces trajectoires ne partagent pas toutes le même centre. Compare-les avec une autre région.'
        : 'Ce n’est pas la bonne région. Observe les mouvements ou affiche les trajectoires comme indice.',
    );
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
        <h2>
          {equalMassChallenge
            ? 'Même masse, autre objet'
            : detectionChallenge
              ? 'Trois régions à examiner'
              : detail.title}
        </h2>
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
      {detectionChallenge && (
        <div className={styles.candidateRegions} aria-label="Régions candidates">
          {(['A', 'B', 'C'] as const).map((label, index) => (
            <button
              key={label}
              type="button"
              ref={(node) => {
                regionButtons.current[index] = node;
              }}
              className={styles.candidateRegion}
              data-motion="stationary"
              data-selected={detectionChoice === index}
              data-result={
                detectionSolved ? (index === 1 ? 'correct' : 'wrong') : undefined
              }
              aria-label={`Sélectionner la région ${label}`}
              aria-pressed={detectionChoice === index}
              onClick={() => chooseDetectionRegion(index as DetectionRegion)}
            >
              <span>Région</span>
              {label}
            </button>
          ))}
        </div>
      )}
      <div className={styles.bottom}>
        {activeView === 'orbits' && !equalMassChallenge && !detectionChallenge && (
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
        <p className={styles.note}>
          {equalMassChallenge
            ? centralReplaced
              ? 'Même masse : la planète garde son orbite.'
              : 'Distance et vitesse de départ identiques.'
            : detectionChallenge
              ? detectionPaths
                ? 'Indice affiché · cherche un centre commun aux trois trajectoires'
                : 'Aucun trou noir visible · observe seulement les mouvements'
              : accretionReveal
                ? 'Exemple avec gaz lumineux · tous les trous noirs n’ont pas un disque'
                : detail.note}
        </p>
        <SceneControls className={styles.controls}>
          {activeView !== 'horizon' && !equalMassChallenge && !detectionChallenge && (
            <>
              <button onClick={() => preset(1.27)}>Vue inclinée</button>
              <button onClick={() => preset(0.08)}>Vue de dessus</button>
              <button aria-pressed={paused} onClick={() => setPaused(!paused)}>
                {paused ? 'Animer' : 'Pause'}
              </button>
            </>
          )}
          {activeView === 'orbits' && !equalMassChallenge && !detectionChallenge && (
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
          {equalMassChallenge && (
            <div className={styles.predictionControls}>
              <div className={styles.predictions} aria-label="Choisis ce qui va se passer">
                <button
                  aria-pressed={orbitPrediction === 'stable'}
                  disabled={comparisonRunning}
                  onClick={() => chooseOrbitPrediction('stable')}
                >
                  Elle garde son orbite
                </button>
                <button
                  aria-pressed={orbitPrediction === 'fall'}
                  disabled={comparisonRunning}
                  onClick={() => chooseOrbitPrediction('fall')}
                >
                  Elle tombe tout de suite
                </button>
                <button
                  aria-pressed={orbitPrediction === 'escape'}
                  disabled={comparisonRunning}
                  onClick={() => chooseOrbitPrediction('escape')}
                >
                  Elle s’échappe
                </button>
              </div>
              <button
                className={styles.launchComparison}
                disabled={!orbitPrediction || comparisonRunning}
                onClick={startEqualMassComparison}
              >
                {comparisonRunning
                  ? centralReplaced
                    ? 'Observation de l’orbite…'
                    : 'Remplacement en cours…'
                  : 'Lancer la comparaison'}
              </button>
            </div>
          )}
          {detectionChallenge && (
            <button
              aria-pressed={detectionPaths}
              onClick={() => {
                setDetectionPaths((visible) => !visible);
                onClearFeedback?.();
              }}
            >
              {detectionPaths ? 'Masquer les trajectoires' : 'Afficher les trajectoires'}
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
