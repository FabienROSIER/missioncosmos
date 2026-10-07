import { describe, expect, it } from 'vitest';
import { MISSION_14 } from '@/content/missions/mission-14';
import { getQuizById, QUIZ_MISSION_14 } from '@/content/quizzes';

describe('mission 14 black holes content', () => {
  it('registers the quiz referenced by the mission', () => {
    expect(getQuizById(MISSION_14.quizId!)).toBe(QUIZ_MISSION_14);
    expect(QUIZ_MISSION_14.questions).toHaveLength(4);
  });

  it('gives every question one valid answer and helpful feedback', () => {
    QUIZ_MISSION_14.questions.forEach((question) => {
      expect(question.choices.some((choice) => choice.id === question.correctChoiceId)).toBe(true);
      expect(question.explainCorrect.length).toBeGreaterThan(20);
      expect(question.explainWrong.length).toBeGreaterThan(20);
    });
  });
});
