import type { MissionStep } from '@/types/mission';

const PLAY_STEP_KINDS = new Set<MissionStep['kind']>(['observe', 'manipulate', 'challenge']);
const GUIDE_EMBEDDED_STEP_IDS = new Set(['m05-scale', 'm05-distances']);

/** Étapes dont les manipulations commencent explicitement après la consigne du Guide. */
export function isPlayGatedStep(step: MissionStep): boolean {
  return PLAY_STEP_KINDS.has(step.kind) && !GUIDE_EMBEDDED_STEP_IDS.has(step.id);
}

type SceneInteractionState = {
  step: MissionStep;
  guideExpanded: boolean;
  playStarted: boolean;
  challengeSolved: boolean;
};

/** Autorise les entrées de la scène uniquement pendant la phase de jeu. */
export function canInteractWithScene({
  step,
  guideExpanded,
  playStarted,
  challengeSolved,
}: SceneInteractionState): boolean {
  // Cette introduction demande immédiatement de tourner le globe pour progresser.
  if (step.id === 'm01-intro') return true;
  if (!isPlayGatedStep(step) || challengeSolved) return false;
  return playStarted && !guideExpanded;
}
