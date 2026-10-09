import type { MissionStep } from '@/types/mission';

const PLAY_STEP_KINDS = new Set<MissionStep['kind']>(['observe', 'manipulate', 'challenge']);
const GUIDE_EMBEDDED_STEP_IDS = new Set(['m05-scale', 'm05-distances']);
/** Question affichée tout de suite : pas d’étape « À toi de jouer ». */
const IMMEDIATE_QUESTION_STEP_IDS = new Set(['m10-understand']);

/** Étapes dont les manipulations commencent explicitement après la consigne du Guide. */
export function isPlayGatedStep(step: MissionStep): boolean {
  if (IMMEDIATE_QUESTION_STEP_IDS.has(step.id)) return false;
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
  // La question s’affiche avec ses réponses : pas de bouton « À toi de jouer ».
  if (IMMEDIATE_QUESTION_STEP_IDS.has(step.id)) return !challengeSolved;
  if (!isPlayGatedStep(step) || challengeSolved) return false;
  return playStarted && !guideExpanded;
}

/**
 * Entrées 3D actives : session de jeu ouverte, ou bouton « À toi de jouer » affiché.
 * Un geste sur la scène démarre alors le jeu (guide replié, commandes visibles).
 * `playOffered` doit être faux pendant Relire (le jeu a déjà démarré).
 */
export function isSceneInputEnabled(sessionOpen: boolean, playOffered: boolean): boolean {
  return sessionOpen || playOffered;
}
