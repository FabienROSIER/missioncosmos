import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

/** Récompense Mission 02 — collection locale. */
export const REWARD_DAY_NIGHT: Reward = {
  id: 'reward-day-night',
  title: 'Gardien du jour et de la nuit',
  description: 'Tu sais pourquoi il fait jour et nuit : la Terre tourne, le Soleil brille toujours.',
  kind: 'badge',
};

/**
 * Mission 02 — Pourquoi fait-il jour et nuit ?
 */
export const MISSION_02: Mission = assertValidMission({
  id: 'mission-02',
  locale: 'fr',
  variantGroupId: 'mission-02',
  title: 'Jour et nuit',
  difficulty: 'easy',
  prerequisites: ['mission-01'],
  learningObjectives: [
    'Comprendre que le Soleil éclaire une face de la Terre.',
    'Relier la rotation de la Terre au passage jour / nuit.',
    'Corriger l’idée fausse : le Soleil ne s’éteint pas la nuit.',
  ],
  introQuestion: 'Pourquoi fait-il nuit ? Le Soleil s’éteint-il ?',
  sceneId: 'day-night',
  allowedInteractions: ['rotate', 'zoom'],
  activities: [
    {
      id: 'act-day-night-spin',
      title: 'Tourner la Terre',
      description: 'Fais glisser pour tourner la Terre face au Soleil.',
      sceneId: 'day-night',
    },
  ],
  steps: [
    {
      id: 'm02-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'Pourquoi fait-il jour, puis nuit ? Le Soleil s’éteint-il le soir ? Observe bien.',
      ctaLabel: 'Je regarde',
    },
    {
      id: 'm02-observe',
      kind: 'observe',
      title: 'Jour et nuit',
      body: 'Le Soleil éclaire un côté de la Terre : c’est le jour. L’autre côté est dans l’ombre : c’est la nuit.',
      ctaLabel: 'Je vois les deux faces',
    },
    {
      id: 'm02-manipulate',
      kind: 'manipulate',
      title: 'À toi de tourner',
      body: 'Fais glisser pour tourner la Terre. Le Guide change de côté : jour, puis nuit.',
      ctaLabel: 'J’ai tourné la Terre',
    },
    {
      id: 'm02-challenge-day',
      kind: 'challenge',
      title: 'Défi : au jour',
      body: 'Tourne la Terre pour mettre le Guide dans la lumière du Soleil (le jour).',
      requiresSuccess: true,
      targetLighting: 'day',
      successFeedback: 'Oui ! Le Guide est au jour : le Soleil l’éclaire.',
      hint: 'Tourne jusqu’à ce que le Guide soit du côté brillant, face au Soleil.',
    },
    {
      id: 'm02-challenge-night',
      kind: 'challenge',
      title: 'Défi : la nuit',
      body: 'Maintenant mets le Guide dans l’ombre (la nuit).',
      requiresSuccess: true,
      targetLighting: 'night',
      successFeedback: 'Parfait ! Le Guide est dans la nuit — le Soleil éclaire encore l’autre face.',
      hint: 'Tourne pour cacher le Guide derrière la Terre, loin du Soleil.',
    },
    {
      id: 'm02-explain',
      kind: 'explain',
      title: 'Le Soleil ne s’éteint pas',
      body: 'La nuit, le Soleil brille toujours. C’est la Terre qui tourne : on passe du côté éclairé au côté sombre. Un tour dure environ 24 heures.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm02-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Trois questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-02',
    },
    {
      id: 'm02-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Gardien du jour et de la nuit.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm02-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux enchaîner, ou rester explorer un peu.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm02-place-day',
    prompt: 'Mets le Guide au jour.',
    successFeedback: 'Oui ! Le Guide est au jour.',
    hint: 'Tourne la Terre face au Soleil.',
  },
  finalExplanation:
    'Le Soleil éclaire toujours. La Terre tourne sur elle-même en environ 24 heures : c’est pour ça qu’il fait jour, puis nuit.',
  rewardIds: [REWARD_DAY_NIGHT.id],
  funFacts: [
    'Le Soleil est une étoile : il brille tout le temps, même quand on ne le voit pas.',
  ],
  glossaryIds: ['sphere', 'axe-rotation', 'jour-nuit', 'soleil'],
  quizId: 'quiz-mission-02',
  assets: [
    {
      id: 'AST-010',
      path: '/assets/models/solarsystem/celestial-bodies/earth/earth.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
    {
      id: 'AST-011',
      path: '/assets/models/solarsystem/celestial-bodies/sun/sun.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Attention : le Soleil est beaucoup plus grand et plus loin en vrai. Ici, c’est une maquette pour comprendre.',
});
