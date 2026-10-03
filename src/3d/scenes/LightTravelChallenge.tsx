'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Matrix,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { createGalaxySpecimen } from '@/3d/entities/createGalaxySpecimen';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import {
  applyPlanetaryMaterials,
  createSimpleAtmosphere,
  resolveGraphicsQuality,
  setupSceneLighting,
} from '@/3d/materials';
import { optimizeCelestialMeshes } from '@/3d/performance';
import { SceneControls } from '@/components/layout/SceneControls';
import { EARTH_BODY } from '@/content/bodies/catalog';
import {
  LIGHT_TRAVEL_ANIMATION_SECONDS,
  LIGHT_TRAVEL_LAYOUT,
  LIGHT_TRAVEL_MAX_MILLION_YEARS,
  LIGHT_TRAVEL_SOURCES,
  allSignalsArrived,
  arrivedSourceIds,
  elapsedMillionYears,
  formatMillionYears,
  isOldestImageSource,
  lightTravelWorldPosition,
  pulseProgress,
  type LightTravelSourceId,
} from '@/content/bodies/lightTravel';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './LightTravelChallenge.module.css';

type Phase = 'ready' | 'running' | 'question' | 'done';

/** Screen offsets keep distance chips away from the galaxies. */
const LABEL_OFFSETS = [
  { x: -56, y: 48 },
  { x: 60, y: -52 },
  { x: -64, y: -70 },
] as const;

export function LightTravelChallenge({
  onSuccess,
  onMiss,
  onClearFeedback,
}: {
  onSuccess: () => void;
  onMiss: (text: string) => void;
  onClearFeedback: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [arrived, setArrived] = useState<LightTravelSourceId[]>([]);
  const [status, setStatus] = useState('');
  const [ready, setReady] = useState(false);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const earthLabel = useRef<HTMLSpanElement | null>(null);
  const emitAt = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('ready');
  const lastUiTick = useRef(-1);
  const reduced = useRef(prefersReducedMotion());

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const build = useCallback(async ({ scene, canvas }: BabylonSceneContext) => {
    const camera = scene.activeCamera as ArcRotateCamera;
    camera.alpha = Math.PI / 2;
    camera.beta = 0.68;
    camera.radius = 58;
    camera.lowerRadiusLimit = 48;
    camera.upperRadiusLimit = 72;
    camera.lowerBetaLimit = 0.45;
    camera.upperBetaLimit = 1.05;
    camera.panningSensibility = 0;
    camera.setTarget(new Vector3(18, 0, 0));
    const origin = new Vector3(0, 0, 0);

    const quality = resolveGraphicsQuality();
    const low = quality === 'low' || canvas.clientWidth < 640;
    const lighting = setupSceneLighting(scene, quality, {
      hemiIntensity: 0.32,
      sunIntensity: 1.35,
      contrast: 1.05,
    });
    const bg = createSpaceBackground(scene, undefined, { level: 0.22, segments: 24 });

    const earth = await CelestialBodyEntity.create(scene, {
      definition: {
        ...EARTH_BODY,
        visual: { ...EARTH_BODY.visual, visualRadius: 0.62 },
      },
      spin: true,
    });
    earth.pivot.position.copyFrom(origin);
    applyPlanetaryMaterials(scene, earth.meshes, quality);
    optimizeCelestialMeshes(earth.meshes, quality, 'planet');
    const atmosphere = createSimpleAtmosphere(scene, earth.pivot, {
      quality,
      scale: 1.07,
      alpha: 0.24,
      color: new Color3(0.4, 0.68, 1),
    });

    const tracks = LIGHT_TRAVEL_SOURCES.map((source, i) => {
      const layout = LIGHT_TRAVEL_LAYOUT[i]!;
      const world = lightTravelWorldPosition(source.sceneDistance, layout.yaw, layout.pitch);
      const frame = new TransformNode(`light-travel-galaxy-${source.id}`, scene);
      frame.position.set(world.x, world.y, world.z);
      frame.scaling.setAll(0.065);
      frame.rotation.x = 0.55;
      const model = createGalaxySpecimen(scene, 'spiral', low ? 900 : 1800, low, true);
      model.root.parent = frame;

      const path = MeshBuilder.CreateTube(
        `light-travel-path-${source.id}`,
        {
          path: [frame.position.clone(), origin.clone()],
          radius: 0.045,
          tessellation: 8,
          updatable: false,
        },
        scene,
      );
      const pathMat = new StandardMaterial(`light-travel-path-mat-${source.id}`, scene);
      pathMat.disableLighting = true;
      pathMat.emissiveColor = new Color3(0.35, 0.62, 0.78);
      pathMat.alpha = 0.4;
      pathMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
      path.material = pathMat;
      path.isPickable = false;

      const pulse = MeshBuilder.CreateSphere(
        `light-travel-pulse-${source.id}`,
        { diameter: 0.5, segments: 10 },
        scene,
      );
      const pulseMat = new StandardMaterial(`light-travel-pulse-mat-${source.id}`, scene);
      pulseMat.disableLighting = true;
      pulseMat.emissiveColor = new Color3(1, 0.92, 0.55);
      pulse.material = pulseMat;
      pulse.setEnabled(false);

      return {
        source,
        frame,
        model,
        path,
        pathMat,
        pulse,
        pulseMat,
        labelOffset: LABEL_OFFSETS[i]!,
      };
    });

    const render = scene.onBeforeRenderObservable.add(() => {
      camera.getViewMatrix();
      const project = (world: Vector3, node: HTMLElement | null, offsetX = 0, offsetY = 0) => {
        if (!node) return;
        const p = Vector3.Project(
          world,
          Matrix.Identity(),
          scene.getTransformMatrix(),
          camera.viewport.toGlobal(canvas.clientWidth, canvas.clientHeight),
        );
        if (p.z < 0 || p.z > 1) {
          node.style.visibility = 'hidden';
          return;
        }
        node.style.visibility = 'visible';
        node.style.left = `${p.x + offsetX}px`;
        node.style.top = `${p.y + offsetY}px`;
      };

      project(origin, earthLabel.current, 0, 40);
      tracks.forEach(({ frame, model, source, labelOffset }, i) => {
        model.update(camera.globalPosition, 1);
        const label = labels.current[i] ?? null;
        project(frame.position, label, labelOffset.x, labelOffset.y);
        label?.setAttribute('data-source', source.id);
      });

      const started = emitAt.current;
      if (started == null || phaseRef.current !== 'running') return;

      const seconds = Math.min(
        LIGHT_TRAVEL_ANIMATION_SECONDS,
        (performance.now() - started) / 1000,
      );

      tracks.forEach(({ frame, pulse, source }) => {
        const progress = pulseProgress(seconds, source.millionLightYears);
        const done = progress >= 1;
        pulse.setEnabled(progress > 0 && !done);
        if (progress > 0 && !done) {
          Vector3.LerpToRef(frame.position, origin, progress, pulse.position);
        }
      });

      const tick = Math.floor(seconds * 10);
      if (tick !== lastUiTick.current || allSignalsArrived(seconds)) {
        lastUiTick.current = tick;
        setElapsed(seconds);
        setArrived(arrivedSourceIds(seconds));
      }
      if (allSignalsArrived(seconds) && phaseRef.current === 'running') {
        phaseRef.current = 'question';
        setPhase('question');
        setStatus('Les trois flashs sont arrivés. Quelle image est la plus ancienne ?');
      }
    });

    setReady(true);
    return () => {
      scene.onBeforeRenderObservable.remove(render);
      tracks.forEach((track) => {
        track.model.dispose();
        track.frame.dispose();
        track.path.dispose();
        track.pathMat.dispose();
        track.pulse.dispose();
        track.pulseMat.dispose();
      });
      atmosphere.dispose();
      earth.dispose();
      lighting.dispose();
      bg.dispose();
    };
  }, []);

  const emit = () => {
    if (!ready || phase !== 'ready') return;
    onClearFeedback();
    setStatus('Les flashs partent en même temps, à la même vitesse.');
    setArrived([]);
    setElapsed(0);
    reduced.current = prefersReducedMotion();
    if (reduced.current) {
      setElapsed(LIGHT_TRAVEL_ANIMATION_SECONDS);
      setArrived(arrivedSourceIds(LIGHT_TRAVEL_ANIMATION_SECONDS));
      setPhase('question');
      setStatus('Les trois flashs sont arrivés. Quelle image est la plus ancienne ?');
      emitAt.current = null;
      return;
    }
    emitAt.current = performance.now();
    setPhase('running');
  };

  const answer = (id: LightTravelSourceId) => {
    if (phase !== 'question') return;
    if (!isOldestImageSource(id)) {
      setStatus('Plus loin = lumière partie plus tôt. Choisis la galaxie la plus éloignée.');
      onMiss(
        'La lumière de la galaxie la plus lointaine a voyagé plus longtemps. C’est son image que nous voyons la plus ancienne.',
      );
      return;
    }
    onClearFeedback();
    setPhase('done');
    setStatus(
      '✓ Oui ! La lumière transporte une ancienne image. Plus la source est loin, plus cette image est ancienne.',
    );
    onSuccess();
  };

  const timelinePercent = Math.min(
    100,
    (elapsedMillionYears(elapsed) / LIGHT_TRAVEL_MAX_MILLION_YEARS) * 100,
  );

  return (
    <div className={styles.wrap} data-light-travel-phase={phase}>
      <BabylonCanvas
        fill
        className={styles.canvas}
        onSceneReady={build}
        loadingMessage="Préparation des messagers de lumière…"
      />
      <header className={styles.title}>
        <small>LES MESSAGERS DE LUMIÈRE</small>
        <strong>
          {phase === 'question' || phase === 'done'
            ? 'Quelle galaxie voyons-nous dans le passé le plus lointain ?'
            : 'La lumière met du temps à voyager'}
        </strong>
      </header>
      <span ref={earthLabel} className={`${styles.marker} ${styles.homeMarker}`}>
        Terre
      </span>
      {LIGHT_TRAVEL_SOURCES.map((source, i) => (
        <span
          key={source.id}
          ref={(node) => {
            labels.current[i] = node;
          }}
          className={styles.marker}
          data-arrived={arrived.includes(source.id) ? 'true' : 'false'}
        >
          {source.millionLightYears} M a.l.
        </span>
      ))}
      <p className={styles.caption}>
        Maquette accélérée : distances proportionnelles 1 : 2 : 4. Les flashs avancent à la même
        vitesse.
      </p>
      <SceneControls className={styles.controls}>
        <div className={styles.timeline} aria-live="polite">
          <div className={styles.timelineHead}>
            <span>Temps écoulé depuis l’émission</span>
            <strong>{formatMillionYears(elapsedMillionYears(elapsed))}</strong>
          </div>
          <div
            className={styles.timelineTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={LIGHT_TRAVEL_MAX_MILLION_YEARS}
            aria-valuenow={Number(elapsedMillionYears(elapsed).toFixed(1))}
            aria-label="Temps écoulé depuis l’émission"
          >
            <span style={{ width: `${timelinePercent}%` }} />
          </div>
          <div className={styles.ticks}>
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>4 millions d’années</span>
          </div>
        </div>
        <ul className={styles.arrivals}>
          {LIGHT_TRAVEL_SOURCES.map((source) => (
            <li key={source.id} data-arrived={arrived.includes(source.id) ? 'true' : 'false'}>
              {arrived.includes(source.id)
                ? `✓ ${source.label} reçue après ${source.millionLightYears} million${source.millionLightYears > 1 ? 's' : ''} d’années`
                : `${source.label} : en voyage…`}
            </li>
          ))}
        </ul>
        {phase === 'ready' && (
          <button disabled={!ready} onClick={emit}>
            Émettre les flashs
          </button>
        )}
        {phase === 'running' && status ? <p role="status">{status}</p> : null}
        {(phase === 'question' || phase === 'done') && (
          <>
            <p className={styles.prompt} role="status">
              {status || 'Les trois flashs sont arrivés. Quelle image est la plus ancienne ?'}
            </p>
            <div className={styles.answers}>
              {LIGHT_TRAVEL_SOURCES.map((source) => (
                <button
                  key={source.id}
                  disabled={phase === 'done'}
                  aria-pressed={phase === 'done' && isOldestImageSource(source.id)}
                  onClick={() => answer(source.id)}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </>
        )}
        <small>Temps accéléré dans la maquette — pas à l’échelle réelle.</small>
      </SceneControls>
    </div>
  );
}
