import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

/** Récompense Mission 04 — collection locale. */
export const REWARD_ECLIPSES: Reward = {
  id: 'reward-eclipses',
  title: 'Chasseur d’éclipses',
  description:
    'Tu sais aligner Soleil, Terre et Lune : éclipse solaire ou lunaire — et pourquoi ce n’est pas chaque mois.',
  kind: 'badge',
};

/**
 * Mission 04 — Les éclipses.
 */
export const MISSION_04: Mission = assertValidMission({
  id: 'mission-04',
  locale: 'fr',
  variantGroupId: 'mission-04',
  title: 'Les éclipses',
  difficulty: 'medium',
  prerequisites: ['mission-03'],
  learningObjectives: [
    'Distinguer éclipse solaire et éclipse lunaire.',
    'Manipuler l’alignement Soleil–Terre–Lune.',
    'Comprendre pourquoi il n’y a pas d’éclipse chaque mois (orbite un peu penchée).',
    'Ne jamais regarder le Soleil sans protection adaptée.',
  ],
  introQuestion: 'Pourquoi voit-on parfois le Soleil ou la Lune « disparaître » ?',
  sceneId: 'eclipses',
  allowedInteractions: ['rotate', 'zoom'],
  activities: [
    {
      id: 'act-eclipse-align',
      title: 'Aligner Soleil, Terre et Lune',
      description: 'Fais glisser la Lune pour créer une éclipse.',
      sceneId: 'eclipses',
    },
  ],
  steps: [
    {
      id: 'm04-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'Parfois le Soleil ou la Lune semble s’éteindre un moment. C’est une éclipse. Comment ça marche ?',
      ctaLabel: 'Je regarde',
    },
    {
      id: 'm04-observe',
      kind: 'observe',
      title: 'Deux ombres',
      body: 'Regarde les cônes d’ombre. Quand la Lune passe devant le Soleil : éclipse solaire. Quand l’ombre de la Terre touche la Lune : éclipse lunaire.',
      ctaLabel: 'Je vois les ombres',
    },
    {
      id: 'm04-manipulate',
      kind: 'manipulate',
      title: 'Bouge la Lune',
      body: 'Fais glisser pour déplacer la Lune. La petite fenêtre montre la vue avec le Guide. Attention : ne regarde jamais le vrai Soleil sans filtre spécial !',
      ctaLabel: 'J’ai essayé',
    },
    {
      id: 'm04-challenge-solar',
      kind: 'challenge',
      title: 'Défi : éclipse solaire',
      body: 'Place la Lune entre la Terre et le Soleil pour une éclipse solaire.',
      requiresSuccess: true,
      targetEclipse: 'solar',
      successFeedback: 'Oui ! La Lune cache le Soleil vu depuis la Terre.',
      hint: 'Mets la Lune du côté du Soleil, bien alignée.',
    },
    {
      id: 'm04-challenge-lunar',
      kind: 'challenge',
      title: 'Défi : éclipse lunaire',
      body: 'Place la Lune dans l’ombre de la Terre (côté opposé au Soleil).',
      requiresSuccess: true,
      targetEclipse: 'lunar',
      successFeedback: 'Parfait ! La Lune entre dans l’ombre de la Terre.',
      hint: 'Mets la Lune derrière la Terre, à l’opposé du Soleil.',
    },
    {
      id: 'm04-explain',
      kind: 'explain',
      title: 'Pas chaque mois',
      body: 'L’orbite de la Lune est un peu penchée. Souvent la Lune passe au-dessus ou en dessous de l’ombre : pas d’éclipse. Il faut un alignement précis. Et encore : ne regarde jamais le Soleil sans protection !',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm04-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Trois questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-04',
    },
    {
      id: 'm04-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Chasseur d’éclipses.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm04-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux explorer encore, ou revenir à la carte.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm04-align-solar',
    prompt: 'Fais une éclipse solaire.',
    successFeedback: 'Oui ! Éclipse solaire.',
    hint: 'Lune entre Terre et Soleil.',
  },
  finalExplanation:
    'Éclipse solaire : Lune devant le Soleil. Éclipse lunaire : Lune dans l’ombre de la Terre. Ce n’est pas chaque mois, car l’orbite est un peu penchée.',
  rewardIds: [REWARD_ECLIPSES.id],
  funFacts: [
    'Une éclipse totale de Soleil ne dure que quelques minutes au même endroit — la Lune avance vite.',
  ],
  glossaryIds: ['eclipse', 'ombre', 'lune', 'soleil', 'phase-lune'],
  quizId: 'quiz-mission-04',
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
    'Attention : distances, tailles et ombres sont simplifiées. Ne regarde jamais le vrai Soleil sans protection adaptée.',
});
