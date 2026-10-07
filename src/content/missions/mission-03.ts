import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

/** Récompense Mission 03 — collection locale. */
export const REWARD_MOON_PHASES: Reward = {
  id: 'reward-moon-phases',
  title: 'Observateur de la Lune',
  description:
    'Tu sais pourquoi la Lune change de forme : on voit plus ou moins sa face éclairée par le Soleil.',
  kind: 'badge',
};

/**
 * Mission 03 — La Lune et ses phases.
 */
export const MISSION_03: Mission = assertValidMission({
  id: 'mission-03',
  locale: 'fr',
  variantGroupId: 'mission-03',
  title: 'Phases de la Lune',
  difficulty: 'easy',
  prerequisites: ['mission-02'],
  learningObjectives: [
    'Voir que le Soleil éclaire toujours une moitié de la Lune.',
    'Relier la position de la Lune autour de la Terre à la forme vue depuis la Terre.',
    'Corriger l’idée fausse : ce n’est pas l’ombre de la Terre qui crée les phases.',
  ],
  introQuestion: 'Pourquoi la Lune change-t-elle de forme dans le ciel ?',
  sceneId: 'moon-phases',
  allowedInteractions: ['rotate', 'zoom'],
  activities: [
    {
      id: 'act-moon-orbit',
      title: 'Déplacer la Lune',
      description: 'Fais glisser pour faire tourner la Lune autour de la Terre.',
      sceneId: 'moon-phases',
    },
  ],
  steps: [
    {
      id: 'm03-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'Parfois la Lune est ronde, parfois un croissant. Pourquoi change-t-elle de forme ?',
      ctaLabel: 'Faire une pleine Lune',
    },
    {
      id: 'm03-challenge-full',
      kind: 'challenge',
      title: 'Défi : pleine Lune',
      body: 'Le Soleil éclaire toujours une face de la Lune. Déplace-la pour la voir toute ronde dans la petite vue.',
      guideReminder: 'Mets la Lune à l’opposé du Soleil, puis relâche.',
      requiresSuccess: true,
      targetPhase: 'full',
      successFeedback: 'Oui ! Pleine Lune : on voit presque toute la face éclairée.',
      hint: 'Mets la Lune du côté opposé au Soleil, derrière la Terre.',
      ctaLabel: 'Faire un croissant',
    },
    {
      id: 'm03-challenge-crescent',
      kind: 'challenge',
      title: 'Défi : croissant',
      body: 'Déplace la Lune pour voir un fin croissant dans la petite vue.',
      guideReminder: 'Déplace la Lune sur son orbite, côté Soleil. Cherche un croissant dans la petite vue.',
      requiresSuccess: true,
      targetPhase: 'crescent',
      successFeedback: 'Bravo ! Un croissant : on ne voit qu’un bout de la face éclairée.',
      hint: 'Déplace la Lune sur son orbite, côté Soleil. Cherche un croissant dans la petite vue.',
      ctaLabel: 'Comprendre pourquoi',
    },
    {
      id: 'm03-explain',
      kind: 'explain',
      title: 'Pas l’ombre de la Terre',
      body: 'Les phases ne viennent pas de l’ombre de la Terre sur la Lune. C’est simplement la part éclairée qu’on voit selon la position de la Lune. L’ombre de la Terre, c’est autre chose : une éclipse.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm03-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Trois questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-03',
    },
    {
      id: 'm03-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Observateur de la Lune.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm03-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux explorer encore, ou revenir à la carte.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm03-full-moon',
    prompt: 'Fais une pleine Lune.',
    successFeedback: 'Oui ! Pleine Lune.',
    hint: 'Lune à l’opposé du Soleil.',
  },
  finalExplanation:
    'Le Soleil éclaire toujours une moitié de la Lune. Selon où elle se trouve autour de la Terre, on voit plus ou moins cette moitié : ce sont les phases.',
  rewardIds: [REWARD_MOON_PHASES.id],
  funFacts: [
    'La Lune met environ un mois à faire un tour autour de la Terre — c’est pour ça que les phases se répètent chaque mois.',
  ],
  glossaryIds: ['lune', 'phase-lune', 'soleil', 'eclipse'],
  quizId: 'quiz-mission-03',
  assets: [
    {
      id: 'AST-010',
      path: '/assets/models/solarsystem/celestial-bodies/earth/earth.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
    {
      id: 'AST-011',
      path: '/assets/models/solarsystem/celestial-bodies/moon/moon.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
    {
      id: 'AST-030',
      path: '/assets/models/solarsystem/celestial-bodies/sun/sun.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Attention : distances et tailles ne sont pas à l’échelle. Ici, c’est une maquette pour comprendre les phases.',
});
