'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Camera,
  Color3,
  Matrix,
  MeshBuilder,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { createGalaxySpecimen } from '@/3d/entities/createGalaxySpecimen';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { resolveGraphicsQuality } from '@/3d/materials';
import { SceneControls } from '@/components/layout/SceneControls';
import {
  NEIGHBOUR_LAYOUTS,
  isClosestGalaxyPair,
  type NeighbourPosition,
} from '@/content/bodies/galaxyNeighbours';
import { shuffleArray } from '@/lib/shuffle';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './GalaxyNeighboursChallenge.module.css';

export function GalaxyNeighboursChallenge({
  onSuccess,
  onMiss,
  onClearFeedback,
}: {
  onSuccess: () => void;
  onMiss: (text: string) => void;
  onClearFeedback: () => void;
}) {
  const [round, setRound] = useState(0),
    [positions, setPositions] = useState([...NEIGHBOUR_LAYOUTS[0]!]);
  const [selected, setSelected] = useState<number[]>([]),
    [result, setResult] = useState<'correct' | 'wrong' | ''>(''),
    [status, setStatus] = useState(''),
    [ready, setReady] = useState(false);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const state = useRef({ positions, selected, result });
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const tween = useRef<{ from: number; to: number; start: number } | null>(null);
  useEffect(() => {
    state.current = { positions, selected, result };
  }, [positions, selected, result]);
  useEffect(() => {
    const timer = setTimeout(() => setPositions(shuffleArray([...NEIGHBOUR_LAYOUTS[0]!])), 0);
    return () => clearTimeout(timer);
  }, []);
  const select = (i: number) => {
    if (result === 'correct' || !ready) return;
    setSelected((old) =>
      old.includes(i) ? old.filter((n) => n !== i) : old.length < 2 ? [...old, i] : [old[1]!, i],
    );
    setResult('');
    setStatus('');
    onClearFeedback();
  };
  const build = useCallback(({ scene, engine, canvas }: BabylonSceneContext) => {
    const camera = scene.activeCamera as ArcRotateCamera;
    cameraRef.current = camera;
    camera.alpha = Math.PI / 2;
    camera.beta = Math.PI / 2;
    camera.radius = 43;
    camera.lowerRadiusLimit = 43;
    camera.upperRadiusLimit = 43;
    camera.lowerBetaLimit = 0.25;
    camera.upperBetaLimit = Math.PI - 0.25;
    camera.panningSensibility = 0;
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    const quality = resolveGraphicsQuality(),
      low = quality === 'low' || canvas.clientWidth < 640;
    const bg = createSpaceBackground(scene, undefined, { level: 0.2, segments: 24 });
    const models = Array.from({ length: 4 }, (_, i) => {
      const frame = new TransformNode(`neighbour-frame-${i}`, scene);
      frame.scaling.setAll(0.09);
      frame.rotation.x = 0.7;
      const model = createGalaxySpecimen(scene, 'spiral', low ? 1400 : 2800, low, true);
      model.root.parent = frame;
      return { frame, model };
    });
    const link = MeshBuilder.CreateLines(
      'galaxy-neighbour-link',
      { points: [Vector3.Zero(), Vector3.One()], updatable: true },
      scene,
    );
    link.isPickable = false;
    const render = scene.onBeforeRenderObservable.add(() => {
      const s = state.current;
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight),
        height = Math.max(10, 15 / aspect);
      camera.orthoTop = height;
      camera.orthoBottom = -height;
      camera.orthoLeft = -height * aspect;
      camera.orthoRight = height * aspect;
      const motion = tween.current;
      if (motion) {
        const t = Math.min(1, (performance.now() - motion.start) / 450);
        camera.alpha = motion.from + (motion.to - motion.from) * t * t * (3 - 2 * t);
        if (t === 1) tween.current = null;
      }
      camera.getViewMatrix();
      const placed: { x: number; y: number }[] = [];
      models.forEach(({ frame, model }, i) => {
        frame.position.copyFromFloats(...s.positions[i]!);
        model.update(camera.globalPosition, 1);
        const p = Vector3.Project(
          frame.position,
          Matrix.Identity(),
          scene.getTransformMatrix(),
          camera.viewport.toGlobal(canvas.clientWidth, canvas.clientHeight),
        );
        const label = labels.current[i];
        if (label) {
          const x = Math.max(24, Math.min(canvas.clientWidth - 24, p.x));
          let y = p.y + 24;
          while (placed.some((q) => Math.abs(q.x - x) < 46 && Math.abs(q.y - y) < 46)) y += 48;
          placed.push({ x, y });
          label.style.left = x + 'px';
          label.style.top = y + 'px';
          label.style.visibility = p.z < 0 || p.z > 1 ? 'hidden' : 'visible';
        }
      });
      link.setEnabled(s.selected.length === 2);
      if (s.selected.length === 2) {
        MeshBuilder.CreateLines(
          'galaxy-neighbour-link',
          {
            points: s.selected.map((i) => Vector3.FromArray([...s.positions[i]!])),
            instance: link,
          },
          scene,
        );
        link.color =
          s.result === 'wrong'
            ? new Color3(1, 0.3, 0.25)
            : s.result === 'correct'
              ? new Color3(0.45, 1, 0.65)
              : new Color3(0.35, 0.65, 0.75);
        link.alpha = s.result ? 1 : 0.35;
      }
    });
    const cancel = () => {
      tween.current = null;
    };
    canvas.addEventListener('pointerdown', cancel);
    setReady(true);
    return () => {
      canvas.removeEventListener('pointerdown', cancel);
      scene.onBeforeRenderObservable.remove(render);
      models.forEach((m) => {
        m.model.dispose();
        m.frame.dispose();
      });
      link.dispose();
      bg.dispose();
      cameraRef.current = null;
    };
  }, []);
  const view = (alpha: number) => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    if (prefersReducedMotion()) camera.alpha = alpha;
    else tween.current = { from: camera.alpha, to: alpha, start: performance.now() };
  };
  const verify = () => {
    if (selected.length !== 2 || result === 'correct') return;
    if (!isClosestGalaxyPair(positions, selected)) {
      setResult('wrong');
      setStatus('Ces galaxies sont séparées en profondeur. Tourne la vue pour comparer.');
      onMiss(
        'Deux galaxies peuvent sembler voisines de face et être éloignées dans l’espace. Essaie la vue de côté.',
      );
      return;
    }
    setResult('correct');
    setStatus('✓ Ces deux galaxies sont proches dans la maquette !');
    onClearFeedback();
    if (round === 2) onSuccess();
  };
  return (
    <div className={styles.wrap} data-neighbour-round={round + 1}>
      <BabylonCanvas
        fill
        className={styles.canvas}
        onSceneReady={build}
        loadingMessage="Préparation des faux voisins…"
      />
      <header className={styles.title}>
        <small>LES FAUX VOISINS · {round + 1}/3</small>
        <strong>Quelles galaxies sont proches dans l’espace ?</strong>
      </header>
      {positions.map((_, i) => (
        <button
          key={i}
          ref={(node) => {
            labels.current[i] = node;
          }}
          className={styles.label}
          aria-label={`Galaxie ${'ABCD'[i]}`}
          aria-pressed={selected.includes(i)}
          disabled={!ready || result === 'correct'}
          onClick={() => select(i)}
        >
          {'ABCD'[i]}
        </button>
      ))}
      <p className={styles.caption}>
        Tourne avec le doigt ou la souris. Même taille des modèles, positions fictives : on compare
        leur proximité en 3D.
      </p>
      <SceneControls className={styles.controls}>
        <div className={styles.row}>
          <button disabled={!ready} onClick={() => view(Math.PI / 2)}>
            De face
          </button>
          <button disabled={!ready} onClick={() => view(0)}>
            De côté
          </button>
        </div>
        <small>Choisis deux galaxies : {selected.length}/2</small>
        <button disabled={!ready || selected.length !== 2 || result === 'correct'} onClick={verify}>
          Vérifier mes voisins
        </button>
        <p role="status">{status}</p>
        {result === 'correct' && round < 2 && (
          <button
            onClick={() => {
              const next = round + 1;
              setPositions(shuffleArray([...NEIGHBOUR_LAYOUTS[next]!]));
              setRound(next);
              setSelected([]);
              setResult('');
              setStatus('');
              view(Math.PI / 2);
            }}
          >
            Manche suivante →
          </button>
        )}
      </SceneControls>
    </div>
  );
}
