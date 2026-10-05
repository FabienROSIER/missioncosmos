import { assertValidMission } from './validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';
export const REWARD_MILKY_WAY: Reward = {
  id: 'reward-milky-way',
  title: 'Habitant de la Voie lactée',
  description: 'Tu as situé notre Système solaire dans notre galaxie.',
  kind: 'badge',
};
export const MISSION_10: Mission = assertValidMission({
  id: 'mission-10',
  locale: 'fr',
  title: 'Notre galaxie',
  difficulty: 'easy',
  prerequisites: ['mission-constellations'],
  learningObjectives: [
    'Distinguer une étoile, un système solaire et une galaxie.',
    'Situer le Soleil dans le disque de la Voie lactée, loin du centre.',
    'Reconnaître le disque, les bras et le renflement central.',
    'Comprendre que le Soleil et son système tournent autour du centre galactique.',
  ],
  introQuestion: 'Le Soleil a-t-il un quartier dans l’Univers ?',
  sceneId: 'milky-way',
  allowedInteractions: ['rotate', 'zoom', 'pick'],
  activities: [
    {
      id: 'galaxy-exploration',
      title: 'Notre quartier galactique',
      description: 'Recule depuis le Système solaire et explore la Voie lactée.',
      sceneId: 'milky-way',
    },
  ],
  steps: [
    {
      id: 'm10-intro',
      kind: 'intro',
      title: 'Le quartier du Soleil',
      body: 'Voici le Soleil et ses huit planètes. Ensemble, ils forment notre Système solaire. Mais le Soleil est aussi une étoile parmi beaucoup d’autres. Où habitent-elles ?',
      ctaLabel: 'Prendre du recul',
    },
    {
      id: 'm10-journey',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Du Soleil à la galaxie',
      body: 'Notre vaisseau recule très, très loin. Les planètes deviennent invisibles à cette échelle. Découvre l’immense ensemble auquel appartient le Soleil !',
      guideReminder: 'Observe notre voyage jusqu’à la Voie lactée.',
      successFeedback:
        'Voici la Voie lactée, notre galaxie ! Le Soleil et ses planètes en font partie.',
      ctaLabel: 'Explorer notre galaxie',
    },
    {
      id: 'm10-explore',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Un disque d’étoiles',
      body: 'Essaie « De face » et « De profil ». De face, tu vois un disque et des bras. De profil, le centre est plus épais. Chaque point représente beaucoup d’étoiles.',
      guideReminder: 'Regarde la galaxie de face, puis de profil.',
      successFeedback: 'Tu as vu le disque de face et le centre plus épais de profil.',
      ctaLabel: 'Chercher notre quartier',
    },
    {
      id: 'm10-locate',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Où habite le Soleil ?',
      body: 'Le Soleil ne se trouve ni au centre, ni à l’extérieur. Notre quartier est dans le disque, dans un petit bras appelé bras d’Orion. Touche le repère qui correspond à ce quartier.',
      guideReminder: 'Cherche un repère dans le disque, loin du centre.',
      successFeedback:
        'Oui ! Notre Système solaire est dans le disque, loin du centre de la Voie lactée.',
      hint: 'Observe la distance au centre et les limites du disque.',
      ctaLabel: 'Comprendre notre adresse',
    },
    {
      id: 'm10-explain',
      kind: 'explain',
      title: 'Notre adresse cosmique',
      body: 'La Terre est une planète du Système solaire. Le Soleil est l’étoile de ce système. Notre Système solaire appartient à la Voie lactée, une galaxie contenant énormément d’étoiles, du gaz et de la poussière. La gravité les rassemble.',
      ctaLabel: 'Trouver le voyage du Soleil',
    },
    {
      id: 'm10-orbit',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Le grand voyage du Soleil',
      body: 'Le Soleil voyage avec toutes ses planètes ! Ta mission : trouve le chemin qui lui fait faire un tour autour du centre de la galaxie, sans plonger dedans. Compare les trois trajets, puis lance le voyage.',
      guideReminder: 'Compare les trajets : lequel entoure le centre galactique ?',
      hint: 'Le centre doit être à l’intérieur du grand tour du Soleil.',
      successFeedback:
        'Bien joué ! Le Soleil tourne autour du centre galactique avec ses planètes. Un vrai tour dure environ 230 millions d’années !',
      ctaLabel: 'À toi de répondre',
    },
    {
      id: 'm10-quiz',
      kind: 'quiz',
      title: 'Notre adresse dans l’Univers',
      body: 'Le robot a quelques questions sur ce que tu viens de découvrir.',
      quizId: 'quiz-mission-10',
      requiresSuccess: true,
    },
    {
      id: 'm10-reward',
      kind: 'reward',
      title: 'Habitant de la Voie lactée',
      body: 'Tu sais retrouver notre quartier dans la galaxie !',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm10-complete',
      kind: 'complete',
      title: 'Explore librement',
      body: 'Continue à tourner la galaxie et à retrouver le Soleil. D’autres galaxies nous attendent ensuite !',
    },
  ],
  challenge: {
    id: 'locate-solar-neighbourhood',
    prompt: 'Situe notre Système solaire dans la Voie lactée.',
    successFeedback: 'Notre quartier est dans le disque, loin du centre.',
  },
  finalExplanation:
    'Le Soleil est une étoile de la Voie lactée. Avec ses planètes, il forme le Système solaire, une toute petite partie de notre galaxie.',
  quizId: 'quiz-mission-10',
  rewardIds: ['reward-milky-way'],
  glossaryIds: ['galaxie', 'voie-lactee', 'systeme-solaire', 'etoile'],
  funFacts: ['Le Soleil se trouve à environ 26 000 années-lumière du centre de notre galaxie.'],
  assets: [
    {
      id: 'AST-012',
      path: '/assets/models/solarsystem/celestial-bodies/',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Maquette simplifiée : bras artistiques, quartier du Soleil approximatif. Chaque point représente beaucoup d’étoiles. Tailles, distances et voyage ne sont pas à l’échelle.',
});
