import type { Mission, MissionStepKind } from '@/types/mission';

const STEP_KINDS = new Set<MissionStepKind>([
  'intro',
  'observe',
  'manipulate',
  'challenge',
  'explain',
  'quiz',
  'reward',
  'complete',
]);

/** Validation runtime légère (contenu éditorial, pas Zod). */
export function validateMission(mission: Mission): string[] {
  const errors: string[] = [];

  if (!mission.id?.trim()) errors.push('id manquant');
  if (!mission.title?.trim()) errors.push('title manquant');
  if (!mission.locale) errors.push('locale manquante');
  if (!mission.sceneId?.trim()) errors.push('sceneId manquant');
  if (!mission.introQuestion?.trim()) errors.push('introQuestion manquante');
  if (!mission.finalExplanation?.trim()) errors.push('finalExplanation manquante');
  if (!mission.steps?.length) errors.push('au moins une étape requise');
  if (!mission.learningObjectives?.length) errors.push('learningObjectives vide');
  if (!mission.allowedInteractions?.length) errors.push('allowedInteractions vide');
  if (!mission.challenge?.id) errors.push('challenge.id manquant');
  if (!mission.challenge?.prompt) errors.push('challenge.prompt manquant');

  const stepIds = new Set<string>();
  for (const step of mission.steps ?? []) {
    if (!step.id) errors.push('étape sans id');
    else if (stepIds.has(step.id)) errors.push(`étape dupliquée: ${step.id}`);
    else stepIds.add(step.id);

    if (!STEP_KINDS.has(step.kind)) errors.push(`kind invalide: ${step.kind}`);
    if (!step.title?.trim()) errors.push(`étape ${step.id}: title manquant`);
    if (!step.body?.trim()) errors.push(`étape ${step.id}: body manquant`);
  }

  const kinds = new Set((mission.steps ?? []).map((s) => s.kind));
  if (!kinds.has('intro')) errors.push('étape intro manquante');
  if (!kinds.has('complete') && !kinds.has('reward')) {
    errors.push('étape reward ou complete manquante');
  }

  return errors;
}

export function assertValidMission(mission: Mission): Mission {
  const errors = validateMission(mission);
  if (errors.length) {
    throw new Error(`Mission invalide (${mission.id}): ${errors.join('; ')}`);
  }
  return mission;
}
