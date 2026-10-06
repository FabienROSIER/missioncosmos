'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcRotateCamera, Color4, PointerEventTypes, Vector3 } from '@babylonjs/core';
import { BabylonCanvas, type BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { createGalaxySpecimen } from '@/3d/entities/createGalaxySpecimen';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { resolveGraphicsQuality } from '@/3d/materials/graphicsQuality';
import { SceneControls } from '@/components/layout/SceneControls';
import { prefersReducedMotion } from '@/lib/motion';
import { shuffleArray } from '@/lib/shuffle';
import {
  GALAXY_FAMILIES,
  GALAXY_FAMILY_LABELS,
  COSMIC_LEVELS,
  COSMIC_LEVEL_LABELS,
  acceptsCosmicLevel,
  type CosmicLevel,
  type GalaxyFamily,
} from '@/content/bodies/galaxies';
import styles from './GalaxiesScene.module.css';

type Props = {
  className?: string;
  stepId: string;
  onSuccess: () => void;
  onMiss: (message: string) => void;
  onClearFeedback: () => void;
};

export function GalaxiesScene({ className, stepId, onSuccess, onMiss, onClearFeedback }: Props) {
  const [family, setFamily] = useState<GalaxyFamily>('spiral');
  const [neighbour, setNeighbour] = useState(false);
  const [order, setOrder] = useState<GalaxyFamily[]>([...GALAXY_FAMILIES]);
  const [choiceOrder, setChoiceOrder] = useState<GalaxyFamily[]>([...GALAXY_FAMILIES]);
  const [levelOrder, setLevelOrder] = useState<CosmicLevel[]>([...COSMIC_LEVELS]);
  const [round, setRound] = useState(0);
  const [identified, setIdentified] = useState(false);
  const [placed, setPlaced] = useState<CosmicLevel[]>([]);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const isAlbum = stepId === 'm11-album';
  const isScale = stepId === 'm11-scale';
  const isNeighbour = ['m11-intro', 'm11-neighbour'].includes(stepId);
  const current = isAlbum ? (order[round] ?? 'spiral') : isNeighbour ? 'spiral' : family;
  const camera = useRef<ArcRotateCamera | null>(null);
  const exploreSeen = useRef({
    home: false,
    neighbour: false,
    families: new Set<GalaxyFamily>(),
    reported: false,
  });
  useEffect(() => {
    exploreSeen.current = {
      home: false,
      neighbour: false,
      families: new Set(),
      reported: false,
    };
  }, [stepId]);
  const sample = useRef({ current, faded: isScale || stepId === 'm11-quiz', neighbour });
  const tween = useRef<{ from: number; to: number; started: number } | null>(null);
  useEffect(() => {
    sample.current = {
      current,
      faded: isScale || stepId === 'm11-quiz',
      neighbour: isNeighbour && neighbour,
    };
  }, [current, isScale, stepId, neighbour, isNeighbour]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFailed(false);
      if (stepId === 'm11-intro') {
        setNeighbour(false);
        setFamily('spiral');
      }
      if (stepId === 'm11-album') {
        setOrder(shuffleArray([...GALAXY_FAMILIES]));
        setChoiceOrder(shuffleArray([...GALAXY_FAMILIES]));
        setRound(0);
        setIdentified(false);
      }
      if (stepId === 'm11-scale') {
        setPlaced([]);
        setLevelOrder(shuffleArray([...COSMIC_LEVELS]));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [stepId]);

  const onSceneReady = useCallback(({ scene }: BabylonSceneContext) => {
    scene.clearColor = new Color4(0.015, 0.025, 0.045, 1);
    const view = scene.activeCamera as ArcRotateCamera;
    view.setTarget(Vector3.Zero());
    view.radius = 43;
    view.alpha = -Math.PI / 2;
    view.beta = 0.45;
    view.lowerRadiusLimit = 26;
    view.upperRadiusLimit = 65;
    view.lowerBetaLimit = 0.08;
    view.upperBetaLimit = Math.PI - 0.08;
    view.panningSensibility = 0;
    camera.current = view;
    const background = createSpaceBackground(scene, undefined, { level: 0.2, segments: 24 });
    const quality = resolveGraphicsQuality();
    const reducedMotion = prefersReducedMotion();
    const count = quality === 'low' ? 2400 : quality === 'medium' ? 5000 : 8000;
    const specimens = GALAXY_FAMILIES.map((kind) =>
      createGalaxySpecimen(scene, kind, count, quality === 'low'),
    );
    const opacity = GALAXY_FAMILIES.map(() => 0);
    const pointer = scene.onPointerObservable.add((info) => {
      if (info.type === PointerEventTypes.POINTERDOWN) tween.current = null;
    });
    const render = scene.onBeforeRenderObservable.add(() => {
      const frame = Math.min(scene.getEngine().getDeltaTime(), 100) / 1000;
      const motion = tween.current;
      if (motion) {
        const p = Math.min(1, (performance.now() - motion.started) / 450);
        view.beta = motion.from + (motion.to - motion.from) * (p * p * (3 - 2 * p));
        if (p === 1) tween.current = null;
      }
      specimens.forEach((model, i) => {
        const target =
          GALAXY_FAMILIES[i] === sample.current.current ? (sample.current.faded ? 0.16 : 1) : 0;
        const previous = opacity[i] ?? 0;
        const next = reducedMotion
          ? target
          : previous + (target - previous) * Math.min(1, frame * 10);
        opacity[i] = Math.abs(target - next) < 0.003 ? target : next;
        model.update(view.position, opacity[i] ?? 0, sample.current.neighbour);
      });
    });
    setReady(true);
    return () => {
      camera.current = null;
      tween.current = null;
      scene.onBeforeRenderObservable.remove(render);
      scene.onPointerObservable.remove(pointer);
      specimens.forEach((model) => model.dispose());
      background.dispose();
    };
  }, []);

  const reportExplore = () => {
    if (exploreSeen.current.reported) return;
    exploreSeen.current.reported = true;
    onSuccess();
  };
  const markNeighbour = (showNeighbour: boolean) => {
    setNeighbour(showNeighbour);
    if (stepId !== 'm11-neighbour') return;
    const seen = exploreSeen.current;
    if (showNeighbour) seen.neighbour = true;
    else seen.home = true;
    if (seen.home && seen.neighbour) reportExplore();
  };
  const markFamily = (kind: GalaxyFamily) => {
    setFamily(kind);
    changeView(0.45);
    if (stepId !== 'm11-families') return;
    exploreSeen.current.families.add(kind);
    if (exploreSeen.current.families.size === GALAXY_FAMILIES.length) reportExplore();
  };
  const changeView = (beta: number) => {
    if (!camera.current) return;
    if (prefersReducedMotion()) camera.current.beta = beta;
    else tween.current = { from: camera.current.beta, to: beta, started: performance.now() };
  };
  const classify = (candidate: GalaxyFamily) => {
    if (identified) return;
    if (candidate !== current) {
      setFailed(true);
      onMiss(
        'Observe encore la forme : tourne la maquette pour chercher des bras ou la forme arrondie.',
      );
      return;
    }
    setFailed(false);
    setIdentified(true);
    onClearFeedback();
    if (round === GALAXY_FAMILIES.length - 1) onSuccess();
  };
  const place = (candidate: CosmicLevel) => {
    if (placed.includes(candidate)) return;
    if (!acceptsCosmicLevel(placed, candidate)) {
      setFailed(true);
      onMiss(
        'Pense à ce qui contient quoi : les planètes entourent le Soleil, et leur système appartient à notre galaxie.',
      );
      return;
    }
    setFailed(false);
    onClearFeedback();
    const next = [...placed, candidate];
    setPlaced(next);
    if (next.length === COSMIC_LEVELS.length) onSuccess();
  };

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      data-galaxy-family={current}
    >
      <BabylonCanvas
        className={styles.canvas}
        fill
        onSceneReady={onSceneReady}
        loadingMessage="Préparation de l’observatoire…"
      />
      {!isScale && stepId !== 'm11-quiz' && (
        <div className={styles.title}>
          <span>
            {isAlbum
              ? `ALBUM · FICHE ${round + 1}/${GALAXY_FAMILIES.length}`
              : 'DES ÎLES D’ÉTOILES'}
          </span>
          <strong>
            {isAlbum
              ? identified
                ? `${GALAXY_FAMILY_LABELS[current]} ✓`
                : 'Quelle est sa famille ?'
              : isNeighbour
                ? neighbour
                  ? 'Andromède'
                  : 'Voie lactée'
                : current === 'spiral'
                  ? 'Spirale'
                  : GALAXY_FAMILY_LABELS[current]}
          </strong>
          {isNeighbour && (
            <small>
              {neighbour
                ? 'Une autre galaxie · environ 2,5 millions d’années-lumière'
                : 'Notre galaxie · la maison du Soleil'}
            </small>
          )}
        </div>
      )}
      {isScale && (
        <div className={styles.zoomMap} aria-label="Du Soleil à la galaxie">
          <span className={styles.eyebrow}>DU PLUS PETIT AU PLUS GRAND</span>
          <div className={styles.levels}>
            {COSMIC_LEVELS.map((level, i) => (
              <div key={level} className={styles.level} data-placed={placed.includes(level)}>
                <span className={styles.symbol} data-level={level} aria-hidden="true">
                  {level === 'sun' ? '☀' : level === 'system' ? '◎' : '✺'}
                </span>
                <strong>
                  {placed.includes(level) ? COSMIC_LEVEL_LABELS[level] : `Niveau ${i + 1} ?`}
                </strong>
                <small>
                  {placed.includes(level)
                    ? ['Une étoile', 'Le Soleil et ses planètes', 'Énormément d’étoiles'][i]
                    : 'À compléter'}
                </small>
              </div>
            ))}
          </div>
          <p>
            Le Système solaire est minuscule dans la galaxie.
            <br />
            Ces cartes comparent des ensembles, pas leurs tailles réelles.
          </p>
        </div>
      )}
      <SceneControls className={styles.controls}>
        {isScale ? (
          <>
            <p>
              <strong>Prépare le zoom · {placed.length}/3</strong>
            </p>
            <div className={styles.buttons}>
              {levelOrder.map((level) => (
                <button
                  key={level}
                  data-cosmic-level={level}
                  hidden={placed.includes(level)}
                  disabled={placed.includes(level)}
                  onClick={() => place(level)}
                >
                  {COSMIC_LEVEL_LABELS[level]} {placed.includes(level) ? '✓' : ''}
                </button>
              ))}
            </div>
            <p role="status" className={failed ? styles.error : ''}>
              {failed
                ? 'Pas encore : choisis le plus petit objet restant.'
                : placed.length === 3
                  ? 'Les trois niveaux sont prêts !'
                  : 'Choisis le plus petit objet restant.'}
            </p>
          </>
        ) : (
          <>
            {isNeighbour ? (
              <div className={styles.buttons}>
                <button aria-pressed={!neighbour} onClick={() => markNeighbour(false)}>
                  Voie lactée
                </button>
                <button aria-pressed={neighbour} onClick={() => markNeighbour(true)}>
                  Andromède
                </button>
              </div>
            ) : (
              !isAlbum && (
                <div className={`${styles.buttons} ${styles.families}`}>
                  {GALAXY_FAMILIES.map((kind) => (
                    <button
                      key={kind}
                      aria-pressed={family === kind}
                      onClick={() => markFamily(kind)}
                    >
                      {kind === 'spiral' ? 'Spirale' : GALAXY_FAMILY_LABELS[kind]}
                    </button>
                  ))}
                </div>
              )
            )}
            <div className={styles.buttons} hidden={isAlbum && identified}>
              <button disabled={!ready} onClick={() => changeView(0.08)}>
                De face
              </button>
              <button disabled={!ready} onClick={() => changeView(Math.PI / 2 - 0.08)}>
                De profil
              </button>
            </div>
            {isAlbum ? (
              <>
                <div className={`${styles.buttons} ${styles.families}`} hidden={identified}>
                  {choiceOrder.map((kind) => (
                    <button
                      data-family-choice={kind}
                      key={kind}
                      disabled={identified || !ready}
                      onClick={() => classify(kind)}
                    >
                      {GALAXY_FAMILY_LABELS[kind]}
                    </button>
                  ))}
                </div>
                <p
                  role="status"
                  className={failed ? styles.error : identified ? styles.correct : ''}
                >
                  {failed
                    ? 'Cette étiquette ne correspond pas. Tourne la maquette et réessaie !'
                    : identified
                      ? '✓ Étiquette retrouvée !'
                      : 'Retrouve la famille de cette galaxie.'}
                </p>
                {identified && round < GALAXY_FAMILIES.length - 1 && (
                  <button
                    onClick={() => {
                      setRound(round + 1);
                      setIdentified(false);
                      setFailed(false);
                      changeView(0.45);
                    }}
                  >
                    Fiche suivante →
                  </button>
                )}
              </>
            ) : (
              <small>
                Tourne la maquette avec le doigt ou la souris. Les galaxies présentées sont des
                modèles simplifiés.
              </small>
            )}
          </>
        )}
      </SceneControls>
    </div>
  );
}
