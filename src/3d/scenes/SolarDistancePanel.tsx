'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SOLAR_SYSTEM_PLANETS } from '@/content/bodies/solarSystem';
import {
  DISTANCE_FLIGHTS,
  assessFlight,
  celestialPortraitUrl,
  nearestPlanetId,
} from '@/content/bodies/solarLearningGames';
import { SolarDistanceRail } from './SolarDistanceRail';
import quizStyles from '@/features/missions/MissionQuiz.module.css';
import styles from './SolarSystemScene.module.css';
import { shuffledIndices } from '@/lib/shuffle';

type SolarDistancePanelProps = {
  onComplete?: () => void;
  /** Id du conteneur viewport pour le schéma (hors bulle). */
  schemaPortalId?: string;
};

export function SolarDistancePanel({ onComplete, schemaPortalId }: SolarDistancePanelProps) {
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [schemaHost, setSchemaHost] = useState<HTMLElement | null>(null);
  const [order, setOrder] = useState(() => shuffledIndices(DISTANCE_FLIGHTS[0]!.choices.length));
  const flight = DISTANCE_FLIGHTS[round]!;
  const body = SOLAR_SYSTEM_PLANETS[flight.target];
  const assessment = assessFlight(choice ?? -1, round);
  const solved = assessment.success;

  useEffect(() => {
    if (!schemaPortalId) {
      setSchemaHost(null);
      return;
    }
    setSchemaHost(document.getElementById(schemaPortalId));
  }, [schemaPortalId]);

  const rail =
    !complete && schemaHost
      ? createPortal(
          <SolarDistanceRail
            round={round}
            choice={choice}
            solved={solved}
            order={order}
            onChoose={setChoice}
          />,
          schemaHost,
        )
      : null;

  return (
    <>
      {rail}
      <div className={`${quizStyles.root} ${quizStyles.compact}`} aria-label="Mini-jeu des distances">
        <p className={quizStyles.progress}>
          {complete ? 'Mission accomplie · 3 / 3' : `Cap sur ${body.nameFr} · ${round + 1} / 3`}
        </p>

        {complete ? (
          <p className={quizStyles.ok}>Bravo ! Entre les planètes, il y a surtout beaucoup de vide.</p>
        ) : (
          <>
            <div className={styles.flightTargetRow}>
              <span
                className={styles.planetChip}
                style={{ backgroundImage: `url(${celestialPortraitUrl(flight.target)})` }}
                aria-hidden
              />
              <p className={quizStyles.prompt}>{flight.hint}</p>
            </div>
            <div className={styles.planetChoiceGrid} role="group" aria-label="Choisir un repère">
              {order.map((originalIndex, displayIndex) => {
                const planetId = nearestPlanetId(flight.choices[originalIndex]!);
                const name = SOLAR_SYSTEM_PLANETS[planetId].nameFr;
                const selected = choice === originalIndex;
                const revealed = choice !== null;
                const num = displayIndex + 1;
                return (
                  <button
                    key={`${round}-${originalIndex}`}
                    type="button"
                    className={selected ? styles.planetChoiceActive : styles.planetChoice}
                    disabled={solved}
                    aria-pressed={selected}
                    aria-label={revealed ? `Repère ${num} : ${name}` : `Repère ${num}`}
                    onClick={() => setChoice(originalIndex)}
                  >
                    <span
                      className={revealed ? styles.planetChoiceThumb : styles.planetChoiceMarker}
                      style={
                        revealed
                          ? { backgroundImage: `url(${celestialPortraitUrl(planetId)})` }
                          : undefined
                      }
                      aria-hidden
                    />
                    <span className={styles.planetChoiceLabel}>
                      {revealed ? `${num}. ${name}` : `${num}.`}
                    </span>
                  </button>
                );
              })}
            </div>
            {choice !== null && (
              <p className={solved ? quizStyles.ok : quizStyles.hint} role="status">
                {solved ? flight.discovery : 'Pas tout à fait — réessaie !'}
              </p>
            )}
            {solved && (
              <button
                type="button"
                className={quizStyles.next}
                onClick={() => {
                  if (round === 2) {
                    setComplete(true);
                    onComplete?.();
                  } else {
                    const next = round + 1;
                    setRound(next);
                    setChoice(null);
                    setOrder(shuffledIndices(DISTANCE_FLIGHTS[next]!.choices.length));
                  }
                }}
              >
                {round === 2 ? 'J’ai réussi !' : 'Planète suivante →'}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
