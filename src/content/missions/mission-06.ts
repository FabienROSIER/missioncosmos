import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

export const REWARD_ORBITS: Reward = {
  id: 'reward-orbits',
  title: 'Gardien des orbites',
  description:
    'Tu sais qu’une orbite est un chemin autour du Soleil, que plus une planète est proche plus son année est courte, et qu’orbiter, c’est tomber tout en avançant de côté pour éviter le centre.',
  kind: 'badge',
};

/**
 * Mission 06 — Les orbites.
 * Scène dédiée (3 planètes) : trajectoires, vitesse, périodes, chute perpétuelle.
 */
export const MISSION_06: Mission = assertValidMission({
  id: 'mission-06',
  locale: 'fr',
  variantGroupId: 'mission-06',
  title: 'Les orbites',
  difficulty: 'medium',
  prerequisites: ['mission-05'],
  learningObjectives: [
    'Voir une orbite comme un chemin autour du Soleil.',
    'Comparer des périodes : proche du Soleil → année plus courte.',
    'Relier distance et durée d’un tour (sans formules).',
    'Comprendre qu’une orbite est une chute qui n’arrive jamais (vitesse de côté + attraction).',
  ],
  introQuestion: 'Pourquoi Mercure fait-elle le tour du Soleil plus vite que Jupiter ?',
  sceneId: 'orbits',
  allowedInteractions: ['rotate', 'zoom', 'pick'],
  activities: [
    {
      id: 'act-orbits-watch',
      title: 'Regarder les tours',
      description: 'Observe Mercure, la Terre et Jupiter sur leurs pistes.',
      sceneId: 'orbits',
    },
  ],
  steps: [
    {
      id: 'm06-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'Les planètes tournent autour du Soleil. Est-ce que toutes mettent le même temps pour faire un tour ?',
      ctaLabel: 'Je regarde',
    },
    {
      id: 'm06-observe',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Comparer les tours',
      body: 'Les anneaux sont les orbites. Ici, trois planètes. Utilise Pause ou Rapide : Mercure file, Jupiter avance doucement. Tu peux aussi toucher une planète pour voir la durée de son année.',
      guideReminder: 'Change la vitesse, ou touche une planète.',
      successFeedback: 'Tu as comparé les tours. Plus une planète est proche, plus son année est courte.',
      ctaLabel: 'Trouver la plus rapide',
    },
    {
      id: 'm06-challenge',
      kind: 'challenge',
      title: 'Défi : la plus rapide',
      body: 'Quelle planète finit un tour en premier ? Touche-la.',
      requiresSuccess: true,
      challengeOrbitRace: true,
      successFeedback: 'Oui ! Mercure est la plus proche : son année est la plus courte.',
      hint: 'Regarde celle qui tourne le plus vite autour du Soleil.',
    },
    {
      id: 'm06-fall',
      kind: 'challenge',
      title: 'Défi : chute qui tourne',
      body: 'Lance le Guide autour de la Terre. Règle la vitesse : trop lent il tombe, trop vite il s’enfuit. Trouve le juste milieu en essayant.',
      requiresSuccess: true,
      challengeOrbitFall: true,
      successFeedback:
        'Bravo ! Le Guide tombe vers la Terre, mais avance assez vite de côté pour la manquer. Il reste en orbite.',
      hint: 'Regarde ce qui se passe après le lancement, puis ajuste un peu — pas d’un seul coup.',
      ctaLabel: 'Continuer',
    },
    {
      id: 'm06-explain',
      kind: 'explain',
      title: 'Pourquoi ça tourne ?',
      body: 'Le Soleil attire les planètes. Leur mouvement de côté les garde en orbite. Plus près du Soleil, un tour dure moins longtemps.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm06-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Quatre questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-06',
    },
    {
      id: 'm06-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Gardien des orbites.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm06-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux encore regarder les tours, ou revenir à la carte.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm06-race',
    prompt: 'Touche la planète qui finit un tour en premier.',
    successFeedback: 'Oui ! Mercure.',
    hint: 'Celle qui est la plus proche du Soleil.',
  },
  finalExplanation:
    'Une orbite est le chemin autour du Soleil. Plus près → année plus courte. Attraction + vitesse de côté = chute qui n’arrive jamais. Les cercles ici sont une maquette.',
  rewardIds: [REWARD_ORBITS.id],
  funFacts: [
    'Un « jour » sur Jupiter dure seulement environ 10 heures — mais son année dure environ 12 années terrestres !',
  ],
  glossaryIds: ['orbite', 'periode-orbitale', 'gravite', 'soleil', 'planete'],
  quizId: 'quiz-mission-06',
  assets: [
    {
      id: 'AST-012',
      path: '/assets/models/solarsystem/celestial-bodies/',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Cercles pour comparer. Temps accéléré, durées des tours respectées. Tailles et distances simplifiées.',
});
