'use client';
import { useEffect, useRef, useState } from 'react';
import { QuizChoice } from '@/components/ui/QuizChoice';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { SIZE_RIDDLES } from '@/content/bodies/solarLearningGames';
import type { ComparisonGroup } from '@/content/bodies/solarSystem';
import styles from '@/features/missions/MissionQuiz.module.css';
import { shuffledIndices } from '@/lib/shuffle';

export function SolarSizeChallenge({
  onChange,
  onComplete,
}: {
  onChange: (group: ComparisonGroup | null, hidden: boolean, active: boolean) => void;
  onComplete?: () => void;
}) {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [order, setOrder] = useState(() => shuffledIndices(SIZE_RIDDLES[0]!.choices.length));
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current(SIZE_RIDDLES[0]!.group, false, true);
    return () => onChangeRef.current(null, false, false);
  }, []);

  const question = SIZE_RIDDLES[round]!;
  const correct = answer === question.correct;
  const total = SIZE_RIDDLES.length;
  const isLast = round >= total - 1;

  if (complete) {
    return (
      <div className={`${styles.root} ${styles.compact}`} aria-label="Mini-jeu des tailles">
        <p className={styles.ok}>Bravo ! Tu sais comparer les tailles.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles.compact}`} aria-label="Mini-jeu des tailles">
      <p className={styles.progress}>
        Question {round + 1} / {total}
      </p>
      <p className={styles.prompt}>{question.question}</p>
      {!correct ? (
        <div className={styles.choices}>
          {order.map((originalIndex) => {
            const label = question.choices[originalIndex]!;
            let state: 'idle' | 'correct' | 'incorrect' = 'idle';
            if (answer === originalIndex) state = correct ? 'correct' : 'incorrect';
            else if (correct && originalIndex === question.correct) state = 'correct';
            return (
              <QuizChoice
                key={`${round}-${originalIndex}-${label}`}
                label={label}
                state={state}
                disabled={correct}
                onSelect={() => {
                  setAnswer(originalIndex);
                  onChange(question.group, false, true);
                }}
              />
            );
          })}
        </div>
      ) : null}
      {correct ? (
        <SuccessCelebration
          key={round}
          portalId="mission-schema-root"
          title="Bonne réponse !"
          message={question.explanation}
        />
      ) : answer !== null ? (
        <p className={styles.hint} role="status">
          Regarde la comparaison, puis réessaie.
        </p>
      ) : null}
      {correct && (
        <button
          type="button"
          className={styles.next}
          onClick={() => {
            if (isLast) {
              setComplete(true);
              onChange(null, false, false);
              onComplete?.();
            } else {
              const next = round + 1;
              setRound(next);
              setAnswer(null);
              setOrder(shuffledIndices(SIZE_RIDDLES[next]!.choices.length));
              onChange(SIZE_RIDDLES[next]!.group, false, true);
            }
          }}
        >
          {isLast ? 'J’ai réussi !' : 'Question suivante →'}
        </button>
      )}
    </div>
  );
}
