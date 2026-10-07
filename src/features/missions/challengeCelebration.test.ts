import { describe, expect, it } from 'vitest';
import { listMissions } from '@/content/missions';
import { isCelebratedChallenge } from './challengeCelebration';

const steps = listMissions().flatMap((mission) => mission.steps);
const stepById = (id: string) => steps.find((step) => step.id === id)!;

describe('achievement feedback across all missions', () => {
  it('does not turn a film or a guided activation into a victory, while keeping progression gated', () => {
    for (const id of ['m11-journey', 'm10-film', 'm09-color']) {
      const step = stepById(id);
      expect(step.requiresSuccess).toBe(true);
      expect(isCelebratedChallenge(step)).toBe(false);
    }
  });
  it('retains celebration for tasks with a correct answer or a target to reach', () => {
    for (const id of [
      'm01-challenge-equator',
      'm01-challenge-orbit',
      'm02-observe',
      'm03-challenge-full',
      'm04-challenge-solar',
      'm05-challenge-order',
      'm05-scale',
      'm05-distances',
      'm06-challenge',
      'm06-fall',
      'm07-challenge',
      'm08-challenge',
      'm09-challenge',
      'm10-perspective',
      'm10-understand',
      'm11-locate',
      'm11-orbit',
    ]) {
      expect(stepById(id), id).toBeDefined();
      expect(isCelebratedChallenge(stepById(id)), id).toBe(true);
    }
  });
  it('does not show a challenge victory for observation, explanations, quizzes or rewards', () => {
    for (const step of steps.filter((step) => !['challenge', 'manipulate'].includes(step.kind))) {
      expect(isCelebratedChallenge(step), step.id).toBe(false);
    }
    for (const step of steps.filter(
      (step) => step.kind === 'manipulate' && !step.requiresSuccess,
    )) {
      expect(isCelebratedChallenge(step), step.id).toBe(false);
    }
  });
});
