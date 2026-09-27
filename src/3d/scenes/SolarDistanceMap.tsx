'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AU_KM,
  PLANET_ORDER,
  SOLAR_SYSTEM_PLANETS,
  commonScaleRadius,
  distancePosition,
  type PlanetId,
} from '@/content/bodies/solarSystem';
import { celestialPortraitUrl } from '@/content/bodies/solarLearningGames';
import styles from './SolarSystemScene.module.css';

const number = (value: number, digits = 2) =>
  value.toLocaleString('fr-FR', { maximumFractionDigits: digits });

/** Règle radiale : demi-grands axes, pas une photographie des positions orbitales. */
export function SolarDistanceMap({ compact = false }: { compact?: boolean }) {
  const [inner, setInner] = useState(false);
  const [common, setCommon] = useState(false);
  const [selected, setSelected] = useState<PlanetId>('earth');
  const [width, setWidth] = useState(600);
  const chart = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = chart.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, entry!.contentRect.width)),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const span = inner ? 1.6 : 30.07;
  const length = width - 40;
  const x = (au: number) => 20 + distancePosition(au, span, length);
  const ticks = inner ? [0, 0.5, 1, 1.5] : [0, 5, 10, 15, 20, 25, 30];
  const choose = (id: PlanetId) => {
    setSelected(id);
    if (SOLAR_SYSTEM_PLANETS[id].approxAu > span) setInner(false);
  };
  const body = SOLAR_SYSTEM_PLANETS[selected];
  const chartH = compact ? 110 : 144;
  const markerY = chartH - 62;
  return (
    <section
      className={compact ? styles.distancePanelCompact : styles.distancePanel}
      aria-label="Laboratoire des distances"
    >
      <div className={styles.modeRow} role="group" aria-label="Étendue de la règle">
        <button
          type="button"
          className={!inner ? styles.hudBtnActive : styles.hudBtn}
          aria-pressed={!inner}
          onClick={() => setInner(false)}
        >
          Neptune
        </button>
        <button
          type="button"
          className={inner ? styles.hudBtnActive : styles.hudBtn}
          aria-pressed={inner}
          onClick={() => {
            setInner(true);
            if (body.approxAu > 1.6) choose('earth');
          }}
        >
          Zoom Mars
        </button>
        <button
          type="button"
          className={common ? styles.hudBtnActive : styles.hudBtn}
          aria-pressed={common}
          onClick={() => setCommon(!common)}
        >
          {common ? 'Repères' : 'Vraies tailles'}
        </button>
      </div>
      <div ref={chart} className={styles.distanceChart}>
        <svg
          width="100%"
          height={chartH}
          viewBox={`0 0 ${width} ${chartH}`}
          role="img"
          aria-label={
            common
              ? 'Astres à la même échelle que les distances, presque invisibles.'
              : 'Planètes à leurs distances moyennes au Soleil.'
          }
        >
          <defs>
            <clipPath id="map-clip-sun">
              <circle cx="20" cy={markerY} r={common ? Math.max(commonScaleRadius('sun', span, length), 2) : 10} />
            </clipPath>
            {PLANET_ORDER.map((id) => (
              <clipPath key={`map-clip-${id}`} id={`map-clip-${id}`}>
                <circle cx="0" cy="0" r="9" />
              </clipPath>
            ))}
          </defs>
          <line
            x1="20"
            x2={width - 20}
            y1={chartH - 28}
            y2={chartH - 28}
            stroke="#49667e"
          />
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={x(tick)}
                x2={x(tick)}
                y1={chartH - 32}
                y2={chartH - 22}
                stroke="#7191ab"
              />
              <text
                x={x(tick)}
                y={chartH - 8}
                fill="#aec1d2"
                fontSize="10"
                textAnchor="middle"
              >
                {number(tick)} UA
              </text>
            </g>
          ))}
          {common ? (
            <circle
              cx="20"
              cy={markerY}
              r={commonScaleRadius('sun', span, length)}
              fill="#ffce75"
            />
          ) : (
            <g>
              <image
                href={celestialPortraitUrl('sun')}
                x={10}
                y={markerY - 10}
                width="20"
                height="20"
                clipPath="url(#map-clip-sun)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle cx="20" cy={markerY} r="10" fill="none" stroke="#ffd16f" strokeWidth="1.5" />
            </g>
          )}
          {PLANET_ORDER.filter((id) => SOLAR_SYSTEM_PLANETS[id].approxAu <= span).map((id) => {
            const cx = x(SOLAR_SYSTEM_PLANETS[id].approxAu);
            const selectedStroke = id === selected ? '#ffd27a' : '#78bfcd';
            if (common) {
              return (
                <circle
                  key={id}
                  cx={cx}
                  cy={markerY}
                  r={commonScaleRadius(id, span, length)}
                  fill={id === selected ? '#ffd27a' : '#9ae0e8'}
                />
              );
            }
            return (
              <g
                key={id}
                transform={`translate(${cx} ${markerY})`}
                className={styles.svgBeacon}
                onClick={() => choose(id)}
              >
                <image
                  href={celestialPortraitUrl(id)}
                  x="-9"
                  y="-9"
                  width="18"
                  height="18"
                  clipPath={`url(#map-clip-${id})`}
                  preserveAspectRatio="xMidYMid slice"
                />
                <circle r="9" fill="none" stroke={selectedStroke} strokeWidth={id === selected ? 2.5 : 1.5} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className={styles.planetChoiceGrid} role="group" aria-label="Choisir une planète">
        {PLANET_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => choose(id)}
            aria-pressed={selected === id}
            className={selected === id ? styles.planetChoiceActive : styles.planetChoice}
          >
            <span
              className={styles.planetChoiceThumb}
              style={{ backgroundImage: `url(${celestialPortraitUrl(id)})` }}
              aria-hidden
            />
            <span className={styles.planetChoiceLabel}>{SOLAR_SYSTEM_PLANETS[id].nameFr}</span>
          </button>
        ))}
      </div>
      <p className={styles.distanceReadoutCompact}>
        <strong>{body.nameFr}</strong> · {number(body.approxAu, 3)} UA ≈{' '}
        {number((body.approxAu * AU_KM) / 1e6, 1)} M km
        {common
          ? ' · tailles réelles (presque invisibles)'
          : ' · portraits agrandis (pas à l’échelle)'}
      </p>
    </section>
  );
}
