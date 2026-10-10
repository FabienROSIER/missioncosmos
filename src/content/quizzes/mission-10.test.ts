import { describe, expect, it } from 'vitest';
import { QUIZ_MISSION_10 } from './mission-10';
import { MISSION_10 } from '@/content/missions/mission-10';

describe('constellations quiz', () => {
  it('asks the voyage question inside the quiz and retains the origins question', () => {
    expect(QUIZ_MISSION_10.questions.map((question) => question.id)).toEqual([
      'q-viewpoint',
      'q1-origin',
    ]);
    const viewpoint = QUIZ_MISSION_10.questions[0]!;
    expect(viewpoint.choices.find((choice) => choice.id === viewpoint.correctChoiceId)?.label).toBe(
      'Nous avons regardé les mêmes étoiles depuis un autre endroit.',
    );
    const filmIndex = MISSION_10.steps.findIndex((step) => step.id === 'm10-film');
    expect(MISSION_10.steps[filmIndex + 1]!.id).toBe('m10-quiz');
    expect(MISSION_10.steps.some((step) => step.id === 'm10-understand')).toBe(false);
  });
});
