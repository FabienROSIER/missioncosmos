'use client';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SOLAR_SYSTEM_PLANETS } from '@/content/bodies/solarSystem';
import {
  DISTANCE_ROUND_COUNT,
  assessFlight,
  buildDistanceDeck,
  celestialPortraitUrl,
  nearestPlanetId,
  type DistanceFlight,
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
  const [deck] = useState<DistanceFlight[]>(() => buildDistanceDeck(DISTANCE_ROUND_COUNT));
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [schemaHost, setSchemaHost] = useState<HTMLElement | null>(null);
  const [order, setOrder] = useState(() => shuffledIndices(deck[0]!.choices.length));
  const flight = deck[round]!;
  const body = SOLAR_SYSTEM_PLANETS[flight.target];
  const assessment = assessFlight(choice ?? -1, flight);
  const solved = assessment.success;
  const lastRound = round === deck.length - 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSchemaHost(schemaPortalId ? document.getElementById(schemaPortalId) : null);
    }, 0);
    return () => clearTimeout(timer);
  }, [schemaPortalId]);

  const rail =
    !complete && schemaHost
      ? createPortal(
          <SolarDistanceRail
            flight={flight}
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
      <div
        className={`${quizStyles.root} ${quizStyles.compact}`}
        aria-label="Mini-jeu des distances"
      >
        <p className={quizStyles.progress}>
          {complete
            ? `Mission accomplie · ${deck.length} / ${deck.length}`
            : `Cap sur ${body.nameFr} · ${round + 1} / ${deck.length}`}
        </p>

        {complete ? (
          <p className={quizStyles.ok}>
            Bravo ! Entre les planètes, il y a surtout beaucoup de vide.
          </p>
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
            {!solved ? (
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
                      className={
                        selected
                          ? solved
                            ? styles.planetChoiceCorrect
                            : styles.planetChoiceActive
                          : styles.planetChoice
                      }
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
            ) : null}
            {solved ? (
              <SuccessCelebration
                key={round}
                inline={!schemaPortalId}
                compact={!schemaPortalId}
                portalId={schemaPortalId}
                title="Bonne réponse !"
                message={flight.discovery}
              />
            ) : choice !== null ? (
              <p className={quizStyles.hint} role="status">
                Pas tout à fait — réessaie !
              </p>
            ) : null}
            {solved && (
              <button
                type="button"
                className={quizStyles.next}
                onClick={() => {
                  if (lastRound) {
                    setComplete(true);
                    onComplete?.();
                  } else {
                    const next = round + 1;
                    setRound(next);
                    setChoice(null);
                    setOrder(shuffledIndices(deck[next]!.choices.length));
                  }
                }}
              >
                {lastRound ? 'J’ai réussi !' : 'Mission suivante →'}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
