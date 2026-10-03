'use client';
import { useEffect, useState } from 'react';
import { SceneControls } from '@/components/layout/SceneControls';
import { DISTANCE_STOPS, DELIVERY_TARGETS } from '@/content/bodies/cosmicDistances';
import { shuffleArray } from '@/lib/shuffle';
import { CosmicScaleView } from './CosmicScaleView';
import { LightTravelChallenge } from './LightTravelChallenge';
import styles from './CosmicDistancesScene.module.css';
type Props = {
  className?: string;
  stepId: string;
  onSuccess: () => void;
  onMiss: (text: string) => void;
  onClearFeedback: () => void;
};
export function CosmicDistancesScene({
  className,
  stepId,
  onSuccess,
  onMiss,
  onClearFeedback,
}: Props) {
  const [index, setIndex] = useState(0),
    [delivered, setDelivered] = useState<string[]>([]),
    [cards, setCards] = useState([...DELIVERY_TARGETS]),
    [status, setStatus] = useState('');
  const journey = stepId === 'm12-journey',
    ordering = stepId === 'm12-order';
  const stop = DISTANCE_STOPS[index]!;
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('');
      if (stepId === 'm12-intro' || journey) setIndex(0);
      if (ordering) {
        setIndex(6);
        setDelivered([]);
        setCards(shuffleArray([...DELIVERY_TARGETS]));
      }
      if (stepId === 'm12-explain') setIndex(6);
    }, 0);
    return () => clearTimeout(timer);
  }, [stepId, journey, ordering]);
  const travel = (destination: number) => {
    setIndex(destination);
    if (journey && destination === 6) onSuccess();
  };
  const send = (card: (typeof DELIVERY_TARGETS)[number]) => {
    if (delivered.includes(card.id)) return;
    if (card.id !== DELIVERY_TARGETS[delivered.length]?.id) {
      const text = 'Cette destination est encore trop loin. Cherche une destination plus proche.';
      setStatus(text);
      onMiss(text);
      return;
    }
    onClearFeedback();
    setStatus('✓ Destination préparée !');
    setIndex([0, 1, 3, 5][delivered.length]!);
    const next = [...delivered, card.id];
    setDelivered(next);
    if (next.length === 4) onSuccess();
  };
  if (stepId === 'm12-signals')
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
        <LightTravelChallenge
          onSuccess={onSuccess}
          onMiss={onMiss}
          onClearFeedback={onClearFeedback}
        />
      </div>
    );
  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      data-distance-stop={stop.id}
    >
      <CosmicScaleView
        className={styles.canvas}
        level={index}
        paused={false}
        maxTransitionSeconds={ordering ? 2 : undefined}
        onReady={() => {}}
      />
      <header className={styles.title}>
        <span>{ordering ? 'LES MESSAGES DU ROBOT' : `REPÈRE ${index + 1}/7`}</span>
        <strong>{ordering ? 'Du plus proche au plus lointain' : stop.title}</strong>
        {!ordering && (
          <>
            <small>{stop.measure}</small>
            <b>{stop.value}</b>
          </>
        )}
      </header>
      {!ordering && index === 5 && (
        <div className={styles.galaxyLabels}>
          <span>Voie lactée</span>
          <span>Andromède</span>
        </div>
      )}
      <p className={styles.caption}>
        {ordering ? 'Messages préparés : ' + delivered.length + '/4' : stop.note}
      </p>
      {(journey || ordering || stepId === 'm12-complete') && (
        <SceneControls className={styles.controls}>
          {ordering ? (
            <>
              <div className={styles.buttons}>
                {cards.map((card) => (
                  <button
                    key={card.id}
                    data-distance-card={card.id}
                    hidden={delivered.includes(card.id)}
                    onClick={() => send(card)}
                  >
                    {card.label}
                  </button>
                ))}
              </div>
              <p role="status">{status}</p>
            </>
          ) : (
            <>
              <label>
                Repère du voyage
                <select
                  aria-label="Repère du voyage"
                  value={index}
                  onChange={(e) => travel(Number(e.target.value))}
                >
                  {DISTANCE_STOPS.map((s, i) => (
                    <option key={s.id} value={i}>
                      {i + 1}. {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.buttons}>
                <button disabled={index === 0} onClick={() => travel(index - 1)}>
                  Plus près
                </button>
                <button disabled={index === 6} onClick={() => travel(index + 1)}>
                  Plus loin
                </button>
              </div>
              <small>Le voisinage apparaît pendant le changement d’échelle.</small>
            </>
          )}
        </SceneControls>
      )}
    </div>
  );
}
