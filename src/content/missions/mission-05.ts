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
    'Distinguer une maquette, des diamètres proportionnels et des distances à échelle linéaire.',
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
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: false,
      title: 'Huit planètes',
      body: 'Il y a 8 planètes. Planètes rapprochées, tailles changées pour bien les voir. Touche une planète, ou utilise Précédente / Suivante, pour lire sa fiche. Explore autant que tu veux, puis continue quand tu es prêt.',
      guideReminder: 'Touche une planète pour ouvrir sa fiche.',
      ctaLabel: 'Les ranger dans l’ordre',
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
      id: 'm05-scale',
      kind: 'manipulate',
      title: 'Comparer les tailles',
      body: 'Les diamètres gardent leurs vraies proportions — les astres sont juste rapprochés. Réponds aux 4 questions : tailles, puis rocheuses et gazeuses.',
      requiresSuccess: true,
      successFeedback: 'Bravo ! Tu as comparé les tailles.',
      ctaLabel: 'Continuer',
    },
    {
      id: 'm05-distances',
      kind: 'manipulate',
      title: 'Mesurer le vide',
      body: 'Aide la sonde : lis l’indice, touche un repère-planète. Tu peux réessayer.',
      requiresSuccess: true,
      successFeedback: 'Bravo ! Tu as compris les distances.',
      ctaLabel: 'Continuer',
    },
    {
      id: 'm05-explain',
      kind: 'explain',
      title: 'Et Pluton ?',
      body: 'Pluton est une planète naine. Elle n’est pas comptée parmi les huit planètes.',
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
    'Huit planètes orbitent autour du Soleil. La maquette aide à les repérer. On compare séparément leurs diamètres et leurs distances ; à une échelle commune, elles deviennent minuscules. Pluton est une planète naine.',
  rewardIds: [REWARD_SOLAR_SYSTEM.id],
  funFacts: [
    'Si la distance Terre–Soleil mesurait 100 mètres, Neptune serait à environ 3 kilomètres et le Soleil mesurerait environ 93 centimètres de diamètre.',
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
  notToScaleNotice: 'Trois vues : reconnaître les planètes, comparer leurs tailles, comparer leurs distances.',
});
