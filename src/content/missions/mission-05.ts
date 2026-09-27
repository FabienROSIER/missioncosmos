import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

export const REWARD_SOLAR_SYSTEM: Reward = {
  id: 'reward-solar-system',
  title: 'Cartographe du Système solaire',
  description:
    'Tu connais les 8 planètes dans l’ordre, et tu sais que Pluton n’est pas une 9e planète.',
  kind: 'badge',
};

export const MISSION_05: Mission = assertValidMission({
  id: 'mission-05',
  locale: 'fr',
  variantGroupId: 'mission-05',
  title: 'Le Système solaire',
  difficulty: 'medium',
  prerequisites: ['mission-04'],
  learningObjectives: [
    'Connaître les 8 planètes dans l’ordre depuis le Soleil.',
    'Comparer maquette lisible et vue à l’échelle (tailles + distances ≈ réelles).',
    'Ne pas compter Pluton comme 9e planète (planète naine).',
  ],
  introQuestion: 'Combien y a-t-il de planètes autour du Soleil, et dans quel ordre ?',
  sceneId: 'solar-system',
  allowedInteractions: ['rotate', 'zoom', 'pick'],
  activities: [
    {
      id: 'act-ss-explore',
      title: 'Explorer les planètes',
      description: 'Touche une planète pour lire sa fiche.',
      sceneId: 'solar-system',
    },
  ],
  steps: [
    {
      id: 'm05-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'Autour du Soleil tournent des planètes. Combien ? Dans quel ordre ? Observe la maquette.',
      ctaLabel: 'Je regarde',
    },
    {
      id: 'm05-observe',
      kind: 'observe',
      title: 'Huit planètes',
      body: 'Il y a 8 planètes. Ici, tailles et distances ne sont pas à l’échelle : c’est pour tout voir ensemble.',
      ctaLabel: 'Je vois le Soleil et les planètes',
    },
    {
      id: 'm05-manipulate',
      kind: 'manipulate',
      title: 'Touche les planètes',
      body: 'Touche une planète (ou utilise Préc. / Suiv.) pour lire une fiche courte. Explore un peu.',
      ctaLabel: 'J’ai exploré',
    },
    {
      id: 'm05-scale',
      kind: 'manipulate',
      title: 'À l’échelle',
      body: 'Touche « À l’échelle » : tailles et distances se rapprochent du réel (Jupiter énorme, Neptune très loin). Recule la vue — il y a surtout du vide. Retouche le bouton pour revenir à la maquette lisible.',
      ctaLabel: 'J’ai comparé',
    },
    {
      id: 'm05-challenge-order',
      kind: 'challenge',
      title: 'Défi : l’ordre',
      body: 'Touche les planètes dans l’ordre depuis le Soleil : Mercure → … → Neptune.',
      requiresSuccess: true,
      challengePlanetOrder: true,
      successFeedback: 'Bravo ! Les 8 planètes dans le bon ordre.',
      hint: 'La plus proche du Soleil d’abord : Mercure, puis Vénus, Terre, Mars…',
    },
    {
      id: 'm05-explain',
      kind: 'explain',
      title: 'Et Pluton ?',
      body: 'Pluton n’est pas une 9e planète : c’est une planète naine, plus petite, avec d’autres objets lointains. Les planètes du système solaire sont 8.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm05-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Quatre questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-05',
    },
    {
      id: 'm05-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Cartographe du Système solaire.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm05-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux encore explorer, ou revenir à la carte.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm05-order',
    prompt: 'Classe les planètes depuis le Soleil.',
    successFeedback: 'Oui ! Bon ordre.',
    hint: 'Commence par Mercure.',
  },
  finalExplanation:
    'Huit planètes orbitent autour du Soleil, de Mercure à Neptune. Les tailles et surtout les distances sont compressées pour rester visibles. Pluton est une planète naine, pas une 9e planète.',
  rewardIds: [REWARD_SOLAR_SYSTEM.id],
  funFacts: [
    'Si la Terre–Soleil faisait la longueur d’un terrain de foot, Neptune serait à plusieurs kilomètres — et le Soleil resterait une boule énorme.',
  ],
  glossaryIds: ['systeme-solaire', 'planete', 'planete-naine', 'soleil'],
  quizId: 'quiz-mission-05',
  assets: [
    {
      id: 'AST-012',
      path: '/assets/models/solarsystem/celestial-bodies/',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Maquette par défaut. Bouton « À l’échelle » = tailles et distances ≈ réelles (Soleil un peu grossi pour rester visible).',
});
