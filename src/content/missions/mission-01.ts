import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

/** Récompense Mission 01 — collection locale (pas de loot aléatoire). */
export const REWARD_EARTH_EXPLORER: Reward = {
  id: 'reward-earth-explorer',
  title: 'Explorateur de la Terre',
  description: 'Tu connais la forme de la Terre, l’équateur, les pôles… et son orbite autour du Soleil.',
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
    'Découvrir que la Terre tourne autour du Soleil sur une orbite.',
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
      body: 'La Terre : assiette plate, ou boule ? Tourne le globe avec ton doigt (pince pour zoomer). Tu verras tous les côtés.',
      ctaLabel: 'C’est une boule !',
    },
    {
      id: 'm01-challenge-equator',
      kind: 'challenge',
      title: 'Défi : équateur',
      body: 'Des repères apparaissent. Touche le cercle jaune : l’équateur, au milieu de la Terre.',
      requiresSuccess: true,
      targetMarkerId: 'equator',
      successFeedback:
        'Oui ! L’équateur coupe la Terre en deux. C’est le cercle le plus long autour de la planète.',
      hint: 'Cherche la bande jaune au milieu, pas les points orange.',
    },
    {
      id: 'm01-challenge-north',
      kind: 'challenge',
      title: 'Défi : pôle Nord',
      body: 'Les points orange sont les pôles (bouts de l’axe). Touche le pôle Nord, en haut.',
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
      id: 'm01-challenge-orbit',
      kind: 'challenge',
      title: 'Défi : orbite',
      body: 'Voici le Soleil ! La Terre ne reste pas au même endroit : elle avance tout autour de lui. Glisse pour la faire bouger sur le cercle jaune. Ce chemin s’appelle une orbite.',
      requiresSuccess: true,
      challengeOrbit: true,
      successFeedback:
        'Bravo ! Une orbite, c’est comme une piste autour du Soleil. La Terre roule dessus sans s’arrêter. Un tour complet dure environ une année.',
      hint: 'Glisse à gauche ou à droite : la Terre doit suivre le cercle autour du Soleil.',
    },
    {
      id: 'm01-explain',
      kind: 'explain',
      title: 'Deux mouvements',
      body: 'La Terre fait deux choses en même temps : 1) elle tourne sur elle-même (comme une toupie) — ça fait le jour et la nuit ; 2) elle avance autour du Soleil sur son orbite — un grand tour, c’est une année. Le Soleil reste au milieu ; la Terre bouge autour. (Ici, tailles et distances sont une maquette.)',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm01-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Quelques questions rapides pour vérifier ce que tu as retenu.',
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
    'La Terre est presque ronde. L’équateur est le grand cercle au milieu ; les pôles sont les bouts de l’axe. Et la Terre avance aussi autour du Soleil sur une orbite — comme sur une piste : un grand tour ≈ une année.',
  rewardIds: [REWARD_EARTH_EXPLORER.id],
  funFacts: [
    'Deux mouvements : tourner sur soi ≈ 24 h (jour/nuit) ; un tour d’orbite autour du Soleil ≈ 365 jours (une année).',
  ],
  glossaryIds: ['equateur', 'pole', 'sphere', 'axe-rotation', 'orbite'],
  quizId: 'quiz-mission-01',
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
    'Attention : les tailles et distances ne sont pas comme dans l’espace réel. C’est une maquette pour apprendre.',
});
