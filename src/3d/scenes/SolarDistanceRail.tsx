'use client';

import { SOLAR_SYSTEM_PLANETS } from '@/content/bodies/solarSystem';
import {
  celestialPortraitUrl,
  nearestPlanetId,
  type DistanceFlight,
} from '@/content/bodies/solarLearningGames';
import styles from './SolarSystemScene.module.css';

type SolarDistanceRailProps = {
  flight: DistanceFlight;
  choice: number | null;
  solved: boolean;
  /** Permutation d’affichage des indices de choix (même ordre que la bulle). */
  order: number[];
  onChoose: (index: number) => void;
};

const RAIL_X_MIN = 36;
const RAIL_X_MAX = 764;

/** Schéma du voyage de la sonde — destiné au viewport principal (pas la bulle). */
export function SolarDistanceRail({
  flight,
  choice,
  solved,
  order,
  onChoose,
}: SolarDistanceRailProps) {
  const reference = SOLAR_SYSTEM_PLANETS[flight.reference];
  const referenceB = flight.referenceB ? SOLAR_SYSTEM_PLANETS[flight.referenceB] : null;
  const position = choice === null ? 0 : flight.choices[choice]!;
  // Échelle linéaire en UA, calée sur le point le plus loin (frise remplie, proportions gardées).
  const extentAu = Math.max(
    reference.approxAu,
    referenceB?.approxAu ?? 0,
    ...flight.choices,
  );
  const x = (au: number) => RAIL_X_MIN + (au / extentAu) * (RAIL_X_MAX - RAIL_X_MIN);
  const displayNumber = (originalIndex: number) => order.indexOf(originalIndex) + 1;

  return (
    <div className={styles.distanceRailViewport} aria-hidden={false}>
      <svg
        className={styles.flightRailViewport}
        viewBox="0 0 800 140"
        role="img"
        aria-label={
          referenceB
            ? `Repères entre ${reference.nameFr} et ${referenceB.nameFr}`
            : `Repères à comparer à ${reference.nameFr}`
        }
      >
        <defs>
          <linearGradient id="flight-trail-viewport">
            <stop stopColor="#ffc971" />
            <stop offset="1" stopColor="#81e3ec" />
          </linearGradient>
          <clipPath id="clip-sun-vp">
            <circle cx="0" cy="0" r="22" />
          </clipPath>
          <clipPath id="clip-ref-vp">
            <circle cx="0" cy="0" r="18" />
          </clipPath>
          <clipPath id="clip-ref-b-vp">
            <circle cx="0" cy="0" r="18" />
          </clipPath>
          {flight.choices.map((_, i) => (
            <clipPath key={`clip-vp-${i}`} id={`clip-vp-choice-${i}`}>
              <circle cx="0" cy="0" r="24" />
            </clipPath>
          ))}
        </defs>
        <line x1="36" x2="764" y1="72" y2="72" stroke="#55728a" strokeWidth="3" />
        <line
          x1="36"
          x2={x(position)}
          y1="72"
          y2="72"
          stroke="url(#flight-trail-viewport)"
          strokeWidth="4"
        />
        <g transform="translate(36 72)">
          <image
            href={celestialPortraitUrl('sun')}
            x="-22"
            y="-22"
            width="44"
            height="44"
            clipPath="url(#clip-sun-vp)"
            preserveAspectRatio="xMidYMid slice"
          />
          <circle r="22" fill="none" stroke="#ffd16f" strokeWidth="2.5" />
        </g>
        <text x="18" y="128" fill="#ffd16f" fontSize="16" fontWeight="700">
          Soleil
        </text>
        <g transform={`translate(${x(reference.approxAu)} 72)`}>
          <image
            href={celestialPortraitUrl(flight.reference)}
            x="-18"
            y="-18"
            width="36"
            height="36"
            clipPath="url(#clip-ref-vp)"
            preserveAspectRatio="xMidYMid slice"
          />
          <circle r="18" fill="none" stroke="#a9d3ed" strokeWidth="2" />
        </g>
        <text
          x={Math.max(80, x(reference.approxAu))}
          y="28"
          fill="#a9d3ed"
          fontSize="16"
          fontWeight="700"
          textAnchor="middle"
        >
          {reference.nameFr}
        </text>
        {referenceB && flight.referenceB && (
          <>
            <g transform={`translate(${x(referenceB.approxAu)} 72)`}>
              <image
                href={celestialPortraitUrl(flight.referenceB)}
                x="-18"
                y="-18"
                width="36"
                height="36"
                clipPath="url(#clip-ref-b-vp)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle r="18" fill="none" stroke="#a9d3ed" strokeWidth="2" />
            </g>
            <text
              x={Math.min(720, x(referenceB.approxAu))}
              y="28"
              fill="#a9d3ed"
              fontSize="16"
              fontWeight="700"
              textAnchor="middle"
            >
              {referenceB.nameFr}
            </text>
          </>
        )}
        {flight.choices.map((value, i) => {
          const planetId = nearestPlanetId(value);
          const selected = choice === i;
          const revealed = choice !== null;
          const name = SOLAR_SYSTEM_PLANETS[planetId].nameFr;
          const num = displayNumber(i);
          const stroke = selected ? (solved ? '#7cddbd' : '#ffd27a') : revealed ? '#78bfcd' : '#1e3d5c';
          return (
            <g
              key={i}
              transform={`translate(${x(value)} 72)`}
              className={styles.svgBeacon}
              onClick={() => {
                if (!solved) onChoose(i);
              }}
            >
              {revealed ? (
                <image
                  href={celestialPortraitUrl(planetId)}
                  x="-24"
                  y="-24"
                  width="48"
                  height="48"
                  clipPath={`url(#clip-vp-choice-${i})`}
                  preserveAspectRatio="xMidYMid slice"
                  opacity={selected ? 1 : 0.55}
                />
              ) : (
                <circle r="24" fill="#9fd4e8" stroke="none" />
              )}
              <circle r="24" fill="none" stroke={stroke} strokeWidth={selected ? 3 : 2.5} />
              <text y="48" textAnchor="middle" fontSize="14" fill="#e9faff" fontWeight="700">
                {revealed ? `${num}. ${name}` : `${num}.`}
              </text>
            </g>
          );
        })}
        {choice !== null && (
          <g transform={`translate(${x(position)} 30)`}>
            <path d="M-9 7 L0 -12 L9 7 L0 3 Z" fill="#c2f9ff" />
          </g>
        )}
      </svg>
    </div>
  );
}
