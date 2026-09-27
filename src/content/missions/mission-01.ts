import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

/** Récompense Mission 01 — collection locale (pas de loot aléatoire). */
export const REWARD_EARTH_EXPLORER: Reward = {
  id: 'reward-earth-explorer',
  title: 'Explorateur de la Terre',
  description: 'Tu connais la forme de la Terre, l’équateur et les pôles.',
  kind: 'badge',
};

/**
 * Mission 01 — Notre Terre.
 * Phrases courtes, jargon expliqué via glossaire.
 */
export const MISSION_01: Mission = assertValidMission({
  id: 'mission-01',
  locale: 'fr',
  variantGroupId: 'mission-01',
  title: 'Notre Terre',
  difficulty: 'easy',
  prerequisites: [],
  learningObjectives: [
    'Comprendre que la Terre est une sphère (boule), pas un disque plat.',
    'Repérer l’équateur et les pôles Nord / Sud.',
    'Manipuler une représentation 3D pour observer la rotation.',
  ],
  introQuestion: 'La Terre ressemble-t-elle à une assiette plate, ou à une boule ?',
  sceneId: 'earth-preview',
  allowedInteractions: ['rotate', 'zoom', 'pick'],
  activities: [
    {
      id: 'act-earth-spin',
      title: 'Tourner la Terre',
      description: 'Fais pivoter le globe pour voir tous ses côtés.',
      sceneId: 'earth-preview',
    },
  ],
  steps: [
    {
      id: 'm01-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'La Terre ressemble-t-elle à une assiette plate, ou à une boule ? Observe bien le globe.',
      ctaLabel: 'C’est une boule !',
    },
    {
      id: 'm01-manipulate',
      kind: 'manipulate',
      title: 'À toi de jouer',
      body: 'Tourne la Terre avec ton doigt. Pince pour zoomer. Tu vois tous les côtés : c’est bien une boule.',
      ctaLabel: 'J’ai tourné la Terre',
    },
    {
      id: 'm01-observe-markers',
      kind: 'observe',
      title: 'Repères',
      body: 'Voici les pôles (Nord en haut, Sud en bas) et un grand cercle jaune : l’équateur, au milieu.',
      ctaLabel: 'Je vois les repères',
    },
    {
      id: 'm01-challenge-equator',
      kind: 'challenge',
      title: 'Défi : équateur',
      body: 'Touche le cercle jaune de l’équateur sur le globe.',
      requiresSuccess: true,
      targetMarkerId: 'equator',
      successFeedback: 'Oui ! C’est l’équateur : le grand cercle au milieu.',
      hint: 'Cherche la bande jaune au milieu, pas les points orange.',
    },
    {
      id: 'm01-explain-equator',
      kind: 'explain',
      title: 'L’équateur',
      body: 'L’équateur coupe la Terre en deux moitiés. C’est le cercle le plus long autour de la planète.',
      ctaLabel: 'Voir les pôles',
    },
    {
      id: 'm01-challenge-north',
      kind: 'challenge',
      title: 'Défi : pôle Nord',
      body: 'Les points orange sont les pôles : les bouts de l’axe de rotation. Touche le pôle Nord (en haut).',
      requiresSuccess: true,
      targetMarkerId: 'north-pole',
      successFeedback: 'Bravo ! C’est le pôle Nord.',
      hint: 'Regarde tout en haut du globe, le point orange.',
    },
    {
      id: 'm01-challenge-south',
      kind: 'challenge',
      title: 'Défi : pôle Sud',
      body: 'Maintenant touche le pôle Sud (le point orange en bas).',
      requiresSuccess: true,
      targetMarkerId: 'south-pole',
      successFeedback: 'Parfait ! C’est le pôle Sud.',
      hint: 'Tourne un peu le globe si besoin. Vise le point orange en bas.',
    },
    {
      id: 'm01-explain',
      kind: 'explain',
      title: 'Bravo',
      body: 'Équateur au milieu, pôles aux extrémités. La Terre tourne autour de l’axe qui relie les deux pôles.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm01-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Trois questions rapides pour vérifier ce que tu as retenu.',
      requiresSuccess: true,
      quizId: 'quiz-mission-01',
    },
    {
      id: 'm01-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Explorateur de la Terre. Tu le retrouveras dans ta collection.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm01-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux enchaîner sur la mission suivante, ou rester explorer un peu.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm01-pick-equator',
    prompt: 'Touche l’équateur sur le globe.',
    successFeedback: 'Oui ! C’est l’équateur : le grand cercle au milieu.',
    hint: 'Cherche le cercle jaune au milieu, pas les points aux extrémités.',
    targetMarkerId: 'equator',
  },
  finalExplanation:
    'La Terre est presque ronde, un peu aplatie aux pôles. L’équateur est le cercle le plus long. Les pôles sont les bouts de l’axe de rotation.',
  rewardIds: [REWARD_EARTH_EXPLORER.id],
  funFacts: [
    'La Terre tourne sur elle-même en environ 24 heures. C’est ce qui fait le jour et la nuit.',
  ],
  glossaryIds: ['equateur', 'pole', 'sphere', 'axe-rotation'],
  quizId: 'quiz-mission-01',
  assets: [
    {
      id: 'AST-010',
      path: '/assets/models/solarsystem/celestial-bodies/earth/earth.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Attention : les tailles et distances ne sont pas comme dans l’espace réel. C’est une maquette pour apprendre.',
});
