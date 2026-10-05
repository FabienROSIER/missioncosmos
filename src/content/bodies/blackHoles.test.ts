import { describe, expect, it } from 'vitest';
import { MISSION_13 } from '@/content/missions/mission-13';
import { getQuizById, QUIZ_MISSION_13 } from '@/content/quizzes';

describe('mission 13 black holes content', () => {
  it('registers the quiz referenced by the mission', () => {
    expect(getQuizById(MISSION_13.quizId!)).toBe(QUIZ_MISSION_13);
    expect(QUIZ_MISSION_13.questions).toHaveLength(4);
  });

  it('gives every question one valid answer and helpful feedback', () => {
    QUIZ_MISSION_13.questions.forEach((question) => {
      expect(question.choices.some((choice) => choice.id === question.correctChoiceId)).toBe(true);
      expect(question.explainCorrect.length).toBeGreaterThan(20);
      expect(question.explainWrong.length).toBeGreaterThan(20);
    });
  });
});
