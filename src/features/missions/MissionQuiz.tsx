'use client';

import { useEffect, useRef, useState } from 'react';
import { QuizChoice } from '@/components/ui/QuizChoice';
import { Companion, type CompanionVariant } from '@/components/game/Companion';
import type { CompanionFeedbackMood } from '@/features/companion';
import type { Quiz } from '@/types/quiz';
import styles from './MissionQuiz.module.css';
import { shuffleArray } from '@/lib/shuffle';

type MissionQuizProps = {
  quiz: Quiz;
  onSolved: () => void;
  /** Réaction compagnon selon la réponse. */
  onMoodChange?: (mood: CompanionFeedbackMood) => void;
  /** Densifie l’UI pour la bulle compagnon (pas de scroll). */
  compact?: boolean;
  immersive?: boolean;
  onContinue?: () => void;
  companionVariant?: CompanionVariant;
};

/**
 * Quiz multi-questions — une à la fois, choix mélangés.
 * Erreur = indice, on peut réessayer. onSolved quand toutes sont réussies.
 */
export function MissionQuiz({
  quiz,
  onSolved,
  onMoodChange,
  compact = false,
  immersive = false,
  onContinue,
  companionVariant,
}: MissionQuizProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [questionOk, setQuestionOk] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState(() =>
    shuffleArray(quiz.questions[0]!.choices),
  );

  const question = quiz.questions[questionIndex]!;
  const isLast = questionIndex >= quiz.questions.length - 1;
  const isCorrect = selectedId === question.correctChoiceId;
  const promptRef = useRef<HTMLHeadingElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (immersive) promptRef.current?.focus({ preventScroll: true });
  }, [questionIndex, immersive]);
  useEffect(() => {
    if (immersive && questionOk) actionRef.current?.focus({ preventScroll: true });
  }, [questionOk, immersive]);

  const onSelect = (choiceId: string) => {
    if (questionOk) return;
    setSelectedId(choiceId);
    const correct = choiceId === question.correctChoiceId;
    onMoodChange?.(correct ? 'success' : 'wrong');
    if (!correct) return;

    setQuestionOk(true);
    if (isLast) {
      onSolved();
    }
  };

  const onNextQuestion = () => {
    if (!questionOk || isLast) return;
    const nextIndex = questionIndex + 1;
    const nextQuestion = quiz.questions[nextIndex]!;
    setQuestionIndex(nextIndex);
    setSelectedId(null);
    setQuestionOk(false);
    setShuffledChoices(shuffleArray(nextQuestion.choices));
    onMoodChange?.('none');
  };

  const choiceState = (choiceId: string) => {
    if (!selectedId) return 'idle' as const;
    if (choiceId === selectedId && choiceId === question.correctChoiceId) return 'correct' as const;
    if (choiceId === selectedId && choiceId !== question.correctChoiceId)
      return 'incorrect' as const;
    if (questionOk && choiceId === question.correctChoiceId) return 'correct' as const;
    return 'idle' as const;
  };

  return (
    <div
      className={[styles.root, compact ? styles.compact : '', immersive ? styles.immersive : '']
        .filter(Boolean)
        .join(' ')}
      data-quiz-question={question.id}
    >
      <div className={styles.questionHeader}>
        {immersive ? (
          <Companion
            size="lg"
            variant={companionVariant}
            pose={questionOk ? 'happy' : selectedId ? 'hint' : 'thinking'}
            className={styles.quizCompanion}
            alt="Ton robot compagnon te pose la question"
          />
        ) : null}
        <div className={styles.questionText}>
          <p className={styles.progress}>
            {immersive ? `${quiz.title} · ` : ''}Question {questionIndex + 1} /{' '}
            {quiz.questions.length}
          </p>
          {immersive ? (
            <h2 ref={promptRef} tabIndex={-1} key={question.id} className={styles.prompt}>
              {question.prompt}
            </h2>
          ) : (
            <p key={question.id} className={styles.prompt}>
              {question.prompt}
            </p>
          )}
        </div>
      </div>
      <div className={`${styles.choices} ui-stagger`} role="group" aria-label={quiz.title}>
        {shuffledChoices
          .filter((choice) => !immersive || !questionOk || choice.id === selectedId)
          .map((choice) => (
            <QuizChoice
              key={`${question.id}-${choice.id}`}
              label={choice.label}
              state={choiceState(choice.id)}
              disabled={questionOk}
              onSelect={() => onSelect(choice.id)}
            />
          ))}
      </div>
      {selectedId ? (
        <p key={selectedId} className={isCorrect ? styles.ok : styles.hint} role="status">
          {isCorrect ? question.explainCorrect : question.explainWrong}
        </p>
      ) : null}
      {questionOk && !isLast ? (
        <button ref={actionRef} type="button" className={styles.next} onClick={onNextQuestion}>
          Question suivante
        </button>
      ) : null}
      {immersive && questionOk && isLast && onContinue ? (
        <button ref={actionRef} type="button" className={styles.next} onClick={onContinue}>
          Continuer
        </button>
      ) : null}
    </div>
  );
}
