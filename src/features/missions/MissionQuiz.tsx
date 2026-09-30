'use client';

import { useState } from 'react';
import { QuizChoice } from '@/components/ui/QuizChoice';
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
};

/**
 * Quiz multi-questions — une à la fois, choix mélangés.
 * Erreur = indice, on peut réessayer. onSolved quand toutes sont réussies.
 */
export function MissionQuiz({ quiz, onSolved, onMoodChange, compact = false }: MissionQuizProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [questionOk, setQuestionOk] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState(() =>
    shuffleArray(quiz.questions[0]!.choices),
  );

  const question = quiz.questions[questionIndex]!;
  const isLast = questionIndex >= quiz.questions.length - 1;
  const isCorrect = selectedId === question.correctChoiceId;

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
    <div className={[styles.root, compact ? styles.compact : ''].filter(Boolean).join(' ')}>
      <p className={styles.progress}>
        Question {questionIndex + 1} / {quiz.questions.length}
      </p>
      <p key={question.id} className={styles.prompt}>
        {question.prompt}
      </p>
      <div className={`${styles.choices} ui-stagger`} role="group" aria-label={quiz.title}>
        {shuffledChoices.map((choice) => (
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
        <button type="button" className={styles.next} onClick={onNextQuestion}>
          Question suivante
        </button>
      ) : null}
    </div>
  );
}
