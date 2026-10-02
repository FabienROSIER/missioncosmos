import type { MissionStep } from '@/types/mission';

/** Progression gates also serve films and guided discoveries; they are not victories. */
export function isCelebratedChallenge(step: MissionStep): boolean {
  if (step.completionMode === 'discovery') return false;
  return step.kind === 'challenge' || (step.kind === 'manipulate' && step.requiresSuccess === true);
}
