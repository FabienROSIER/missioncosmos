'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArcRotateCamera,
  Color3,
  Constants,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { constellationField, starAppearance } from '@/content/bodies/constellationStarFields';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { SceneControls } from '@/components/layout/SceneControls';
import {
  cygnusModel,
  CONSTELLATION_FILM_CHAPTERS,
  CONSTELLATION_FILM_DURATION,
  filmView,
  getConstellation,
  perspectiveSolved,
  perspectiveOffset,
  skyPoints,
} from '@/content/bodies/constellations';
import { withBasePath } from '@/lib/basePath';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './ConstellationsScene.module.css';

type Props = { mode: 'perspective' | 'film'; onSuccess: () => void };

/** Real Babylon scene: fixed model positions, camera movement only. */
export function ConstellationVoyage({ mode, onSuccess }: Props) {
  const [ready, setReady] = useState(false);
  const [offset, setOffset] = useState(82);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedFilm, setReducedFilm] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  const sample = useRef({ offset: mode === 'film' ? 0 : perspectiveOffset(82), lines: true });
  const callback = useRef(onSuccess);
  const completed = useRef(false);
  useEffect(() => {
    callback.current = onSuccess;
  }, [onSuccess]);

  const view = filmView(time);
  const chapter = CONSTELLATION_FILM_CHAPTERS[view.chapter]!;
  useEffect(() => {
    sample.current = {
      offset: mode === 'film' ? view.offset : perspectiveOffset(offset),
      lines: mode === 'perspective' || time < 7.3 || time >= 15,
    };
  }, [mode, view.offset, offset, time]);

  const finish = useCallback(() => {
    setDone(true);
    if (!completed.current) {
      completed.current = true;
      callback.current();
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      // Do not skip the voyage when a tab resumes after being hidden.
      const delta =
        previous === null || document.hidden ? 0 : Math.min((now - previous) / 1000, 0.05);
      previous = now;
      setTime((current) => Math.min(CONSTELLATION_FILM_DURATION, current + delta));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    if (time < CONSTELLATION_FILM_DURATION || !playing) return;
    // End animation before completing the mission step.
    const timer = setTimeout(() => {
      setPlaying(false);
      if (!done) finish();
    }, 0);
    return () => clearTimeout(timer);
  }, [time, playing, done, finish]);

  const onSceneReady = useCallback(
    ({ scene, engine, canvas }: BabylonSceneContext) => {
      const camera = scene.activeCamera;
      if (!(camera instanceof ArcRotateCamera)) return;
      camera.detachControl();
      camera.lowerRadiusLimit = null;
      camera.upperRadiusLimit = null;
      camera.lowerBetaLimit = null;
      camera.upperBetaLimit = null;
      camera.minZ = 0.1;
      camera.maxZ = 600;
      engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 1.5));
      // In the right-handed scene, a camera looking towards +Z has screen-right
      // along -X. Preserve the same handedness as the atlas instead of mirroring it.
      const points = cygnusModel().map((p) => new Vector3(-p.x, p.y, p.z));
      const starMaterial = new StandardMaterial('constellation-star', scene);
      starMaterial.disableLighting = true;
      starMaterial.emissiveColor = new Color3(0.9, 0.97, 1);
      starMaterial.diffuseColor = new Color3(0.9, 0.97, 1);
      const haloTexture = new DynamicTexture('cygnus-soft-light', 128, scene, false);
      const context = haloTexture.getContext();
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      for (const [stop, alpha] of [
        [0, 0.9],
        [0.12, 0.6],
        [0.3, 0.24],
        [0.55, 0.06],
        [0.8, 0.01],
        [1, 0],
      ])
        gradient.addColorStop(stop!, `rgba(200,225,255,${alpha})`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
      haloTexture.hasAlpha = true;
      haloTexture.getAlphaFromRGB = false;
      haloTexture.update();
      const haloMaterial = new StandardMaterial('cygnus-soft-light-material', scene);
      haloMaterial.disableLighting = true;
      haloMaterial.emissiveColor = Color3.Black();
      haloMaterial.diffuseColor = Color3.Black();
      haloMaterial.specularColor = Color3.Black();
      haloMaterial.emissiveTexture = haloTexture;
      haloMaterial.opacityTexture = haloTexture;
      haloMaterial.alphaMode = Constants.ALPHA_ADD;
      haloMaterial.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
      haloMaterial.disableDepthWrite = true;
      haloMaterial.backFaceCulling = false;
      const field = constellationField(getConstellation('cygnus'));
      const stars = points.map((point, index) => {
        const sphere = MeshBuilder.CreateSphere(
          `fixed-cygnus-star-${index}`,
          { diameter: 1, segments: 12 },
          scene,
        );
        sphere.position.copyFrom(point);
        sphere.material = starMaterial;
        sphere.isPickable = false;
        const halo = MeshBuilder.CreatePlane(`cygnus-soft-halo-${index}`, { size: 1 }, scene);
        halo.position.copyFrom(point);
        halo.billboardMode = Mesh.BILLBOARDMODE_ALL;
        halo.material = haloMaterial;
        halo.isPickable = false;
        return { sphere, halo, appearance: starAppearance(field.targets[index]!.magnitude) };
      });
      const lines = getConstellation('cygnus').edges.map(([a, b], index) => {
        const line = MeshBuilder.CreateLines(
          `cygnus-connection-${index}`,
          { points: [points[a]!, points[b]!] },
          scene,
        );
        line.color = new Color3(0.32, 0.5, 0.58);
        line.alpha = 0.25;
        line.isPickable = false;
        return line;
      });
      // A sparse geometric grid makes the side view readable without a starfield
      // texture that might be confused with the foreground stars.
      const depthGrid = MeshBuilder.CreateLineSystem(
        'depth-model-grid',
        {
          lines: [20, 40, 60, 80, 100, 120].flatMap((z) => [
            [new Vector3(-55, -45, z), new Vector3(55, -45, z)],
            [new Vector3(-55, -45, z), new Vector3(-55, 45, z)],
          ]),
        },
        scene,
      );
      depthGrid.color = new Color3(0.1, 0.19, 0.24);
      depthGrid.alpha = 0.24;
      depthGrid.isPickable = false;
      const observer = scene.onBeforeRenderObservable.add(() => {
        const value = sample.current.offset;
        camera.setTarget(new Vector3(0, 0, 65));
        camera.setPosition(new Vector3(value * 135, value * 26, -value * 8));
        const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
        camera.fov = 2 * Math.atan((500 / 900) * Math.max(1, 1 / Math.max(0.1, aspect)));
        // These are stellar markers: keep their magnitude-based cores legible
        // throughout the journey instead of letting distant model points vanish.
        const height = Math.max(1, canvas.clientHeight);
        for (const { sphere, halo, appearance } of stars) {
          const distance = Vector3.Distance(camera.position, sphere.position);
          const worldPerPixel = (2 * distance * Math.tan(camera.fov / 2)) / height;
          const diameter = worldPerPixel * Math.max(3, (appearance.radius * height * 2) / 1000);
          sphere.scaling.setAll(diameter);
          halo.scaling.setAll(diameter * 4.5);
        }
        lines.forEach((line) => line.setEnabled(sample.current.lines));
        depthGrid.setEnabled(Math.abs(value) > 0.1);
      });
      const reducedMotion = prefersReducedMotion();
      setReducedFilm(reducedMotion);
      setPlaying(mode === 'film' && !reducedMotion);
      setReady(true);
      return () => {
        scene.onBeforeRenderObservable.remove(observer);
      };
    },
    [mode],
  );

  const finishFilm = () => {
    setPlaying(false);
    setTime(CONSTELLATION_FILM_DURATION);
    finish();
  };
  const nextTableau = () => {
    const next = view.chapter + 1;
    if (next >= CONSTELLATION_FILM_CHAPTERS.length) finishFilm();
    else setTime(CONSTELLATION_FILM_CHAPTERS[next]!.tableau);
  };
  const verify = () => {
    if (perspectiveSolved(offset)) {
      setMessage('La croix est revenue ! Le vaisseau a retrouvé notre point de vue.');
      finish();
    } else
      setMessage(
        'Le dessin est encore déformé. Compare les ailes et les espacements à la carte, puis essaie une autre position sur le trajet.',
      );
  };
  const points = skyPoints(getConstellation('cygnus'));

  return (
    <>
      <BabylonCanvas
        className={styles.voyageCanvas}
        fill
        mobileFovScale={1}
        onSceneReady={onSceneReady}
        loadingMessage="Préparation du voyage entre les étoiles…"
      />
      <div className={styles.reference} aria-label="Carte du Cygne depuis la Terre">
        <span>Depuis la Terre</span>
        <svg viewBox="0 0 1000 1000" aria-hidden="true">
          {getConstellation('cygnus').edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={points[a]!.x}
              y1={points[a]!.y}
              x2={points[b]!.x}
              y2={points[b]!.y}
              stroke="#7ed6df"
              strokeWidth="10"
            />
          ))}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="18" fill="white" />
          ))}
        </svg>
      </div>
      {mode === 'film' && view.artVisible && (
        <div className={styles.filmFigure} aria-hidden="true">
          <Image
            src={withBasePath('/assets/illustrations/constellations/cygnus-aligned.png')}
            width={1254}
            height={1254}
            alt=""
          />
        </div>
      )}
      <div className={styles.filmCaption} aria-live="polite">
        <strong>{mode === 'film' ? chapter.title : 'Le vaisseau change de place'}</strong>
        <p>
          {mode === 'film'
            ? chapter.text
            : 'Les sept étoiles sont fixes. Retrouve leur dessin depuis notre point de départ.'}
        </p>
      </div>
      <SceneControls className={styles.controls}>
        {mode === 'perspective' ? (
          <>
            <label htmlFor="constellation-position">Position du vaisseau</label>
            <div className={styles.railLabels}>
              <span>Un côté du trajet</span>
              <span>L’autre côté</span>
            </div>
            <input
              id="constellation-position"
              type="range"
              min="0"
              max="100"
              step="1"
              value={offset}
              disabled={!ready || done}
              onChange={(event) => setOffset(Number(event.target.value))}
            />
            <button onClick={verify} disabled={!ready || done}>
              Vérifier mon point de vue
            </button>
            <p role="status">
              {message || 'Fais glisser le curseur ou utilise les flèches du clavier.'}
            </p>
          </>
        ) : (
          <>
            <div className={styles.buttons}>
              {time >= CONSTELLATION_FILM_DURATION ? (
                <button
                  disabled={!ready}
                  onClick={() => {
                    setTime(0);
                    setPlaying(!reducedFilm);
                  }}
                >
                  Revoir le voyage
                </button>
              ) : (
                <>
                  <button
                    disabled={!ready}
                    onClick={() => (reducedFilm ? nextTableau() : setPlaying(!playing))}
                  >
                    {reducedFilm ? 'Tableau suivant' : playing ? 'Pause' : 'Reprendre'}
                  </button>
                  <button disabled={!ready} onClick={finishFilm}>
                    Passer
                  </button>
                </>
              )}
            </div>
            <progress
              value={time}
              max={CONSTELLATION_FILM_DURATION}
              aria-label="Avancement du film"
            />
            <p role="status">
              {time >= CONSTELLATION_FILM_DURATION
                ? 'Voyage terminé ! Tu peux continuer ou le revoir.'
                : reducedFilm
                  ? 'Avance avec « Tableau suivant », sans mouvement automatique.'
                  : 'Observe comment le dessin change quand le vaisseau se déplace.'}
            </p>
          </>
        )}
        <small>
          Maquette : profondeurs de démonstration, pas distances réelles. Le voyage représente un
          immense déplacement.
        </small>
      </SceneControls>
    </>
  );
}
