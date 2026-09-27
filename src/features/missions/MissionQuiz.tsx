'use client';

import { useState } from 'react';
import { QuizChoice } from '@/components/ui/QuizChoice';
import type { CompanionFeedbackMood } from '@/features/companion';
import type { Quiz, QuizChoice as QuizChoiceData } from '@/types/quiz';
import styles from './MissionQuiz.module.css';

type MissionQuizProps = {
  quiz: Quiz;
  onSolved: () => void;
  /** Réaction compagnon selon la réponse. */
  onMoodChange?: (mood: CompanionFeedbackMood) => void;
};

function shuffleChoices(choices: QuizChoiceData[]): QuizChoiceData[] {
  const copy = [...choices];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Quiz multi-questions — une à la fois, choix mélangés.
 * Erreur = indice, on peut réessayer. onSolved quand toutes sont réussies.
 */
export function MissionQuiz({ quiz, onSolved, onMoodChange }: MissionQuizProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [questionOk, setQuestionOk] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState(() =>
    shuffleChoices(quiz.questions[0]!.choices),
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
    setShuffledChoices(shuffleChoices(nextQuestion.choices));
    onMoodChange?.('none');
  };

  const choiceState = (choiceId: string) => {
    if (!selectedId) return 'idle' as const;
    if (choiceId === selectedId && choiceId === question.correctChoiceId) return 'correct' as const;
    if (choiceId === selectedId && choiceId !== question.correctChoiceId) return 'incorrect' as const;
    if (questionOk && choiceId === question.correctChoiceId) return 'correct' as const;
    return 'idle' as const;
  };

  return (
    <div className={styles.root}>
      <p className={styles.progress}>
        Question {questionIndex + 1} / {quiz.questions.length}
      </p>
      <p className={styles.prompt}>{question.prompt}</p>
      <div className={styles.choices} role="group" aria-label={quiz.title}>
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
        <p className={isCorrect ? styles.ok : styles.hint} role="status">
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
