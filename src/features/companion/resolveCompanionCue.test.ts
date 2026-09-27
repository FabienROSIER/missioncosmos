import { describe, expect, it } from 'vitest';
import { resolveCompanionCue } from '@/features/companion/resolveCompanionCue';

describe('resolveCompanionCue', () => {
  it('pose hint + soft retry sur erreur', () => {
    const cue = resolveCompanionCue({
      stepKind: 'challenge',
      challengeSolved: false,
      feedback: 'wrong',
      isComplete: false,
    });
    expect(cue.pose).toBe('hint');
    expect(cue.line).toMatch(/Pas grave/i);
  });

  it('pose happy sur réussite', () => {
    const cue = resolveCompanionCue({
      stepKind: 'challenge',
      challengeSolved: true,
      feedback: 'success',
      isComplete: false,
    });
    expect(cue.pose).toBe('happy');
  });

  it('welcome en intro', () => {
    const cue = resolveCompanionCue({
      stepKind: 'intro',
      challengeSolved: false,
      feedback: 'none',
      isComplete: false,
    });
    expect(cue.pose).toBe('welcome');
  });

  it('curiosité sobre en explain si funFact', () => {
    const cue = resolveCompanionCue({
      stepKind: 'explain',
      challengeSolved: false,
      feedback: 'none',
      isComplete: false,
      funFact: 'La Terre tourne en 24 heures.',
    });
    expect(cue.pose).toBe('thinking');
    expect(cue.line).toContain('24 heures');
  });
});
