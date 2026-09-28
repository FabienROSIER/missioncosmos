import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

export const REWARD_SEASONS: Reward = {
  id: 'reward-seasons',
  title: 'Gardien des saisons',
  description:
    'Tu sais que les saisons viennent de l’inclinaison de la Terre — pas parce qu’elle est plus près du Soleil.',
  kind: 'badge',
};

/**
 * Mission 07 — Pourquoi y a-t-il des saisons ?
 */
export const MISSION_07: Mission = assertValidMission({
  id: 'mission-07',
  locale: 'fr',
  variantGroupId: 'mission-07',
  title: 'Les saisons',
  difficulty: 'medium',
  prerequisites: ['mission-06'],
  learningObjectives: [
    'Voir que la Terre est inclinée (~23,5°).',
    'Relier la position sur l’orbite à l’été / l’hiver selon l’hémisphère.',
    'Comprendre que l’été n’est pas dû à une Terre plus proche du Soleil.',
  ],
  introQuestion: 'Pourquoi fait-il chaud en été et froid en hiver ?',
  sceneId: 'seasons',
  allowedInteractions: ['rotate', 'zoom'],
  activities: [
    {
      id: 'act-seasons-orbit',
      title: 'Faire le tour du Soleil',
      description: 'Place la Terre et compare nord et sud.',
      sceneId: 'seasons',
    },
  ],
  steps: [
    {
      id: 'm07-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'En été il fait chaud, en hiver il fait froid. Est-ce parce que la Terre se rapproche du Soleil ?',
      ctaLabel: 'Je regarde',
    },
    {
      id: 'm07-observe',
      kind: 'observe',
      title: 'Une Terre penchée',
      body: 'La Terre n’est pas droite : elle est penchée d’environ 23°. L’axe violet montre cette inclinaison. Les rayons viennent du Soleil.',
      ctaLabel: 'Je vois l’inclinaison',
    },
    {
      id: 'm07-orbit',
      kind: 'manipulate',
      title: 'Faire le tour',
      body: 'Utilise les boutons ou glisse la Terre sur l’anneau. Regarde : quand c’est l’été au nord, c’est l’hiver au sud !',
      ctaLabel: 'J’ai comparé nord et sud',
    },
    {
      id: 'm07-tilt',
      kind: 'manipulate',
      title: 'Et sans inclinaison ?',
      body: 'Mets l’inclinaison à 0°. Plus de vrai été / hiver : l’inclinaison est indispensable pour les saisons.',
      ctaLabel: 'Je comprends',
    },
    {
      id: 'm07-challenge',
      kind: 'challenge',
      title: 'Défi : été au nord',
      body: 'Place la Terre pour que ce soit l’été dans l’hémisphère nord.',
      requiresSuccess: true,
      challengeNorthernSummer: true,
      successFeedback: 'Oui ! Le nord est penché vers le Soleil : c’est l’été au nord.',
      hint: 'Cherche où le nord (axe violet) se penche le plus vers le Soleil.',
    },
    {
      id: 'm07-explain',
      kind: 'explain',
      title: 'Pas la distance !',
      body: 'L’orbite est presque un cercle : la Terre n’est pas beaucoup plus près du Soleil en été. Ce qui compte, c’est l’inclinaison : un hémisphère reçoit des rayons plus directs. (Et attention : quand c’est l’été au nord, c’est l’hiver au sud !)',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm07-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Quatre questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-07',
    },
    {
      id: 'm07-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Gardien des saisons.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm07-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux encore faire tourner la Terre, ou revenir à la carte.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm07-summer-north',
    prompt: 'Place la Terre pour l’été au nord.',
    successFeedback: 'Oui ! Été au nord.',
    hint: 'Le nord doit se pencher vers le Soleil.',
  },
  finalExplanation:
    'Les saisons viennent de l’inclinaison de la Terre. L’été, un hémisphère est penché vers le Soleil (rayons plus directs). Ce n’est pas parce que la Terre est plus proche.',
  rewardIds: [REWARD_SEASONS.id],
  funFacts: [
    'En janvier, la Terre est même un peu plus près du Soleil… et c’est l’hiver dans l’hémisphère nord !',
  ],
  glossaryIds: ['orbite', 'gravite', 'soleil', 'inclinaison', 'hemisphere', 'saison'],
  quizId: 'quiz-mission-07',
  assets: [
    {
      id: 'AST-012',
      path: '/assets/models/solarsystem/celestial-bodies/',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Orbite presque circulaire pour comparer. Inclinaison réelle ≈ 23,5°. Maquette simplifiée.',
});
