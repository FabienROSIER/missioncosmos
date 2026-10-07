'use client';

import { useEffect, useId, useMemo, useState, type MouseEvent } from 'react';
import {
  constellationField,
  nearestFieldStar,
  starAppearance,
  type FieldStar,
} from '@/content/bodies/constellationStarFields';
import {
  artworkClipPoints,
  artworkMatrix,
  artworkMesh,
} from '@/content/bodies/constellationArtwork';
import { SceneControls } from '@/components/layout/SceneControls';
import { ConstellationVoyage } from './ConstellationVoyage';
import {
  CONSTELLATIONS,
  getConstellation,
  skyPoints,
  type ConstellationId,
} from '@/content/bodies/constellations';
import { withBasePath } from '@/lib/basePath';
import styles from './ConstellationsScene.module.css';

type Props = {
  className?: string;
  stepId: string;
  onSuccess: () => void;
  onSkipBonus?: () => void;
  /** Faux tant que « À toi de jouer » n’a pas ouvert la scène. */
  interactive?: boolean;
};

function SkyGlyph({
  star,
  selected,
  assisted,
  hint,
  glowId,
}: {
  star: FieldStar;
  selected: boolean;
  assisted: boolean;
  hint: boolean;
  glowId: string;
}) {
  const appearance = starAppearance(star.magnitude, assisted);
  return (
    <g data-sky-star={star.catalogId} data-selected={selected}>
      <circle
        cx={star.x}
        cy={star.y}
        r={appearance.radius * 4.5}
        fill={`url(#${glowId}-${selected ? 'gold' : 'white'})`}
        opacity={appearance.haloOpacity}
      />
      <circle
        cx={star.x}
        cy={star.y}
        r={appearance.radius}
        fill={selected ? '#f4c95f' : '#f5f7fb'}
        opacity={appearance.opacity}
      />
      {hint && (
        <circle cx={star.x} cy={star.y} r="27" fill="none" stroke="#f4c95f" strokeWidth="3" />
      )}
    </g>
  );
}

export function ConstellationsScene({
  className,
  stepId,
  onSuccess,
  onSkipBonus,
  interactive = true,
}: Props) {
  const artworkId = useId().replace(/:/g, '');
  const free = stepId === 'm10-complete';
  const intro = stepId === 'm10-intro' || stepId === 'm10-reward' || stepId === 'm10-quiz';
  const [exploring, setExploring] = useState<ConstellationId>('cassiopeia');
  const [found, setFound] = useState<number[]>([]);
  const [showArt, setShowArt] = useState(true);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [understood, setUnderstood] = useState(false);
  const selected = free ? exploring : stepId.replace('m10-', '');
  const item = getConstellation(selected);
  const points = skyPoints(item);
  const field = constellationField(item);
  const candidates = [...field.targets, ...field.neighbors];
  const mapPoints = points.slice(0, item.stars.length);
  const mapBounds =
    item.id === 'ursa-major'
      ? (() => {
          const minX = Math.min(...mapPoints.map((p) => p.x)) - 70;
          const minY = Math.min(...mapPoints.map((p) => p.y)) - 70;
          const width = Math.max(...mapPoints.map((p) => p.x)) - minX + 70;
          const height = Math.max(...mapPoints.map((p) => p.y)) - minY + 70;
          return `${minX} ${minY} ${width} ${height}`;
        })()
      : item.id === 'cygnus'
        ? '0 0 1000 1000'
        : '100 100 800 800';
  const mesh = useMemo(() => artworkMesh(getConstellation(selected)), [selected]);
  const artworkHref = withBasePath(
    `/assets/illustrations/constellations/${item.art.asset ?? (mesh ? `${item.id}-registered` : item.id)}.png`,
  );
  const solved = free || intro || found.length === item.stars.length;
  const visible = solved ? points.map((_, index) => index) : found;
  const edges = [...item.edges, ...(solved ? (item.extraEdges ?? []) : [])];
  useEffect(() => {
    if (hintIndex === null) return;
    const timeout = setTimeout(() => setHintIndex(null), 6000);
    return () => clearTimeout(timeout);
  }, [hintIndex]);

  const choose = (star: FieldStar) => {
    if (solved) return;
    const index = star.targetIndex;
    if (index === null) {
      setMessage(
        'Cette étoile est bien dans le ciel, mais elle ne fait pas partie du dessin de ta carte. Tes étoiles trouvées sont conservées !',
      );
      return;
    }
    if (found.includes(index)) return;
    const updated = [...found, index];
    setFound(updated);
    if (hintIndex === index) setHintIndex(null);
    if (updated.length === item.stars.length) {
      setMessage(item.reveal);
      onSuccess();
    } else
      setMessage(
        `Une étoile du dessin retrouvée ! ${updated.length} sur ${item.stars.length}. Compare les positions pour continuer.`,
      );
  };

  const chooseAtPointer = (event: MouseEvent<HTMLElement>) => {
    if (event.detail === 0 || solved) return;
    const sky = event.currentTarget.closest('[data-sky]') ?? event.currentTarget;
    const bounds = sky.getBoundingClientRect();
    const star = nearestFieldStar(
      candidates,
      ((event.clientX - bounds.left) / bounds.width) * 1000,
      ((event.clientY - bounds.top) / bounds.height) * 1000,
      bounds.width,
    );
    if (star) choose(star);
  };

  if (stepId === 'm10-perspective' || stepId === 'm10-film')
    return (
      <div className={`${styles.wrap} ${className ?? ''}`}>
        <ConstellationVoyage
          mode={stepId === 'm10-film' ? 'film' : 'perspective'}
          onSuccess={onSuccess}
          interactive={interactive}
        />
      </div>
    );
  if (stepId === 'm10-understand')
    return (
      <div className={`${styles.wrap} ${className ?? ''}`}>
        <div className={styles.question}>
          <span className={styles.eyebrow}>LE SECRET DES CONSTELLATIONS</span>
          <h2>Pourquoi le cygne a-t-il changé de forme ?</h2>
          <button
            disabled={understood}
            onClick={() =>
              setMessage(
                'Souviens-toi du film : les étoiles sont restées immobiles. C’est le vaisseau qui a voyagé.',
              )
            }
          >
            Les étoiles se sont déplacées pour faire un autre dessin.
          </button>
          <button
            disabled={understood}
            onClick={() => {
              setUnderstood(true);
              setMessage(
                'Oui ! Notre point de vue a changé. Les étoiles ne sont pas toutes à la même distance.',
              );
              onSuccess();
            }}
          >
            Nous avons regardé les mêmes étoiles depuis un autre endroit.
          </button>
          <p role="status">{message}</p>
        </div>
      </div>
    );

  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      <div className={styles.skyArea}>
        <div className={styles.sky} data-sky>
          <svg className={styles.chart} viewBox="0 0 1000 1000" aria-hidden="true">
            <defs>
              {(['white', 'gold'] as const).map((color) => (
                <radialGradient key={color} id={`${artworkId}-glow-${color}`}>
                  <stop
                    offset="0%"
                    stopColor={color === 'gold' ? '#ffe09b' : '#e4efff'}
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="12%"
                    stopColor={color === 'gold' ? '#ffe09b' : '#e4efff'}
                    stopOpacity="0.55"
                  />
                  <stop
                    offset="30%"
                    stopColor={color === 'gold' ? '#f4c95f' : '#bfdcff'}
                    stopOpacity="0.23"
                  />
                  <stop
                    offset="55%"
                    stopColor={color === 'gold' ? '#f4c95f' : '#bfdcff'}
                    stopOpacity="0.07"
                  />
                  <stop
                    offset="80%"
                    stopColor={color === 'gold' ? '#f4c95f' : '#bfdcff'}
                    stopOpacity="0.015"
                  />
                  <stop
                    offset="100%"
                    stopColor={color === 'gold' ? '#f4c95f' : '#bfdcff'}
                    stopOpacity="0"
                  />
                </radialGradient>
              ))}
            </defs>
            {solved && showArt && (
              <g className={styles.illustration} data-artwork={item.id}>
                {mesh ? (
                  mesh.map((triangle, index) => (
                    <g key={index} clipPath={`url(#${artworkId}-${index})`}>
                      <clipPath id={`${artworkId}-${index}`} clipPathUnits="userSpaceOnUse">
                        <polygon points={artworkClipPoints(triangle.to)} />
                      </clipPath>
                      <image
                        href={artworkHref}
                        width="1000"
                        height="1000"
                        preserveAspectRatio="none"
                        transform={`matrix(${artworkMatrix(triangle.matrix)})`}
                      />
                    </g>
                  ))
                ) : (
                  <image
                    href={artworkHref}
                    x={item.art.x}
                    y={item.art.y}
                    width={item.art.width}
                    height={item.art.height}
                    preserveAspectRatio="xMidYMid meet"
                    transform={item.art.mirror ? 'translate(1000 0) scale(-1 1)' : undefined}
                  />
                )}
              </g>
            )}
            {field.neighbors.map((star) => (
              <SkyGlyph
                key={star.catalogId}
                star={star}
                selected={false}
                assisted={false}
                hint={false}
                glowId={`${artworkId}-glow`}
              />
            ))}
            {edges
              .filter(([a, b]) => visible.includes(a) && visible.includes(b))
              .map(([a, b]) => (
                <line
                  key={`${a}-${b}`}
                  x1={points[a]!.x}
                  y1={points[a]!.y}
                  x2={points[b]!.x}
                  y2={points[b]!.y}
                  stroke={
                    item.id === 'ursa-major' && (a >= item.stars.length || b >= item.stars.length)
                      ? '#b7ccdc'
                      : '#7ed6df'
                  }
                  strokeWidth={
                    item.id === 'ursa-major' && (a >= item.stars.length || b >= item.stars.length)
                      ? 1.8
                      : 3
                  }
                  opacity={
                    item.id === 'ursa-major' && (a >= item.stars.length || b >= item.stars.length)
                      ? 0.65
                      : 1
                  }
                />
              ))}
            {field.targets.map((star, index) => (
              <SkyGlyph
                key={star.catalogId}
                star={star}
                selected={visible.includes(index)}
                assisted={!solved}
                hint={!solved && hintIndex === index}
                glowId={`${artworkId}-glow`}
              />
            ))}
            {solved &&
              field.extensions.map((star) => (
                <SkyGlyph
                  key={star.catalogId}
                  star={star}
                  selected={false}
                  assisted={false}
                  hint={false}
                  glowId={`${artworkId}-glow`}
                />
              ))}
          </svg>
          {!solved &&
            candidates.map((star) => (
              <button
                key={star.catalogId}
                className={styles.starTarget}
                style={{
                  left: `${star.x / 10}%`,
                  top: `${star.y / 10}%`,
                  zIndex: 2,
                }}
                disabled={star.targetIndex !== null && found.includes(star.targetIndex)}
                aria-label={`Étoile du ciel : ${star.name}`}
                data-star-id={star.catalogId}
                data-hint={star.targetIndex !== null && hintIndex === star.targetIndex}
                onClick={(event) => {
                  if (event.detail === 0) choose(star);
                  else chooseAtPointer(event);
                }}
              />
            ))}
        </div>
      </div>
      <div className={styles.skyTitle}>
        <span className={styles.eyebrow}>{solved ? 'DESSIN DÉCOUVERT' : 'ATLAS DU CIEL'}</span>
        <strong>{intro ? 'Les dessins du ciel' : item.title}</strong>
      </div>
      {!intro && (
        <SceneControls className={styles.controls}>
          {free ? (
            <div className={styles.tabs}>
              {CONSTELLATIONS.map((entry) => (
                <button
                  key={entry.id}
                  aria-pressed={item.id === entry.id}
                  onClick={() => {
                    setExploring(entry.id);
                    setShowArt(true);
                    setMessage('');
                  }}
                >
                  {entry.title}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className={styles.cardHeader}>
                <strong>Ta carte : {item.title}</strong>
                <span>
                  {found.length}/{item.stars.length} étoiles
                </span>
              </div>
              <svg
                className={styles.map}
                data-tall={item.id === 'ursa-major'}
                viewBox={mapBounds}
                role="img"
                aria-label={`Carte de ${item.title} : retrouve la forme en sélectionnant ses étoiles dans n’importe quel ordre`}
              >
                {item.edges.map(([a, b]) => (
                  <line
                    key={`${a}-${b}`}
                    x1={points[a]!.x}
                    y1={points[a]!.y}
                    x2={points[b]!.x}
                    y2={points[b]!.y}
                    stroke="#647e91"
                    strokeWidth="6"
                  />
                ))}
                {field.targets.map((star, index) => (
                  <g key={star.name}>
                    <circle
                      cx={points[index]!.x}
                      cy={points[index]!.y}
                      r={starAppearance(star.magnitude).radius * 3}
                      fill={found.includes(index) ? '#f4c95f' : '#e6f0fa'}
                    />
                  </g>
                ))}
              </svg>
            </>
          )}
          {solved ? (
            <>
              <p>{item.reveal}</p>
              <button aria-pressed={showArt} onClick={() => setShowArt(!showArt)}>
                {showArt ? 'Cacher le dessin' : 'Voir le dessin'}
              </button>
              <small>Les étoiles sont réelles. Les traits et les personnages sont imaginés.</small>
            </>
          ) : (
            <>
              <p role="status">
                {message ||
                  'Retrouve les étoiles qui forment le dessin de ta carte. Tu peux les choisir dans n’importe quel ordre.'}
              </p>
              <div className={styles.buttons}>
                <button
                  onClick={() => {
                    const missing = field.targets.findIndex(
                      (star) => !found.includes(star.targetIndex!),
                    );
                    setHintIndex(missing >= 0 ? missing : null);
                    setMessage(
                      'Une étoile manquante du dessin est entourée pendant quelques secondes.',
                    );
                  }}
                >
                  Un indice
                </button>
                <button
                  onClick={() => {
                    setFound([]);
                    setHintIndex(null);
                    setMessage('La carte est prête pour un nouvel essai.');
                  }}
                >
                  Recommencer le dessin
                </button>
              </div>
            </>
          )}
          <small>
            Luminosité adaptée à l’écran. Données sur les étoiles :{' '}
            <a href="https://github.com/astronexus/HYG-Database" target="_blank" rel="noreferrer">
              HYG 4.1, Astronexus
            </a>{' '}
            (CC BY-SA 4.0). Dessin simplifié.
          </small>
          {stepId === 'm10-aquila' && (
            <button onClick={onSkipBonus}>
              {solved ? 'Continuer le voyage' : 'Passer le bonus'}
            </button>
          )}
        </SceneControls>
      )}
    </div>
  );
}
