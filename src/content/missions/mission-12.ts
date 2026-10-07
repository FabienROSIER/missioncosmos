import { assertValidMission } from './validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

export const REWARD_GALAXIES: Reward = {
  id: 'reward-galaxies',
  title: 'Explorateur des galaxies',
  kind: 'badge',
  description:
    'Tu reconnais plusieurs familles de galaxies et tu sais que notre galaxie n’est pas seule.',
};

export const MISSION_12: Mission = assertValidMission({
  id: 'mission-12',
  locale: 'fr',
  title: 'Les galaxies',
  difficulty: 'easy',
  prerequisites: ['mission-11'],
  sceneId: 'galaxies',
  allowedInteractions: ['rotate', 'zoom', 'pick'],
  introQuestion: 'Notre galaxie est-elle seule dans l’Univers ?',
  learningObjectives: [
    'Distinguer la Voie lactée des autres galaxies.',
    'Découvrir Andromède, une galaxie spirale voisine, très éloignée.',
    'Reconnaître les formes spirale, spirale barrée, elliptique et irrégulière.',
    'Comparer une étoile, un système planétaire et une galaxie.',
  ],
  activities: [
    {
      id: 'galaxy-album',
      title: 'Des îles d’étoiles',
      description: 'Observe les galaxies en trois dimensions et complète l’album du robot.',
      sceneId: 'galaxies',
    },
  ],
  steps: [
    {
      id: 'm12-intro',
      kind: 'intro',
      title: 'Au-delà de notre maison',
      body: 'Nous habitons la Voie lactée. Mais elle n’est pas seule : l’Univers contient énormément d’autres galaxies. Ce sont comme des îles d’étoiles, avec aussi du gaz et de la poussière !',
      ctaLabel: 'Rencontrer Andromède',
    },
    {
      id: 'm12-neighbour',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Bonjour, Andromède !',
      body: 'Regarde la Voie lactée, puis Andromède. Toutes deux ont des bras en spirale. Andromède est notre plus proche grande galaxie voisine, mais sa lumière met environ 2,5 millions d’années pour nous atteindre !',
      guideReminder: 'Affiche la Voie lactée, puis Andromède.',
      successFeedback: 'Deux spirales voisines. La lumière d’Andromède voyage très longtemps avant de nous arriver.',
      ctaLabel: 'Découvrir les familles',
    },
    {
      id: 'm12-families',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Les formes des galaxies',
      body: 'Une spirale a des bras qui s’enroulent dans un disque. Une spirale barrée a aussi une barre d’étoiles au centre. Une elliptique est arrondie, sans bras. Une irrégulière n’a pas de forme bien organisée. Ouvre les quatre maquettes.',
      guideReminder: 'Ouvre les quatre formes : spirale, barrée, elliptique, irrégulière.',
      successFeedback: 'Tu as vu les quatre familles. La suite : remettre les bonnes étiquettes.',
      ctaLabel: 'Compléter mon album',
    },
    {
      id: 'm12-album',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Les fiches mélangées',
      body: 'Le robot a perdu les étiquettes de son album ! Il y a quatre fiches à réparer. Une spirale barrée est une sorte de galaxie spirale : une barre d’étoiles traverse son centre et ses bras partent des deux bouts de la barre. Observe chaque maquette de face pour retrouver sa forme.',
      guideReminder: 'Tourne la galaxie et retrouve sa forme pour réparer les quatre fiches.',
      hint: 'De face, cherche une barre au centre de la spirale. Sinon, compare les bras, la forme arrondie ou la forme désorganisée.',
      successFeedback:
        'Album réparé ! Tu reconnais les spirales avec ou sans barre, les elliptiques et les irrégulières.',
      ctaLabel: 'Comparer les échelles',
    },
    {
      id: 'm12-scale',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Du petit au gigantesque',
      body: 'Les cartes du voyage sont mélangées : la Voie lactée, le Soleil et notre Système solaire. Touche-les du plus petit au plus grand pour préparer le voyage. Pense à ce qui est contenu dans quoi !',
      guideReminder: 'Range du plus petit au plus grand.',
      hint: 'Les planètes entourent le Soleil. Notre Système solaire appartient à la Voie lactée.',
      successFeedback:
        'Zoom prêt ! Une étoile fait partie d’un système, qui est une toute petite partie d’une galaxie.',
      ctaLabel: 'Des galaxies, pas des soleils géants',
    },
    {
      id: 'm12-explain',
      kind: 'explain',
      title: 'Chaque galaxie a ses étoiles',
      body: 'La lumière d’une galaxie vient de ses nombreuses étoiles : ce n’est pas un Soleil géant ! Notre Soleil appartient à la Voie lactée. Andromède est une autre galaxie, avec ses propres étoiles. Les couleurs et les distances de nos maquettes sont simplifiées.',
      ctaLabel: 'Répondre au robot',
    },
    {
      id: 'm12-quiz',
      kind: 'quiz',
      title: 'Ton album de galaxies',
      body: 'Le robot aimerait vérifier ce que vous avez découvert ensemble.',
      quizId: 'quiz-mission-12',
      requiresSuccess: true,
    },
    {
      id: 'm12-reward',
      kind: 'reward',
      title: 'Explorateur des galaxies',
      body: 'Ton album est prêt : tu sais maintenant que notre galaxie n’est pas seule !',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm12-complete',
      kind: 'complete',
      title: 'Continue ton exploration',
      body: 'Compare librement les quatre formes de galaxies. La prochaine mission t’aidera à mesurer les immenses distances de l’Univers.',
    },
  ],
  challenge: {
    id: 'galaxy-families',
    prompt: 'Répare les quatre fiches de l’album des galaxies.',
    successFeedback: 'Les quatre maquettes ont retrouvé leurs étiquettes !',
  },
  finalExplanation:
    'La Voie lactée et Andromède sont deux galaxies différentes. Une galaxie est un immense ensemble d’étoiles, de gaz et de poussière rassemblés par la gravité.',
  quizId: 'quiz-mission-12',
  rewardIds: ['reward-galaxies'],
  glossaryIds: [
    'galaxie',
    'voie-lactee',
    'andromede',
    'galaxie-spirale',
    'galaxie-spirale-barree',
    'galaxie-elliptique',
    'galaxie-irreguliere',
  ],
  assets: [],
  notToScaleNotice:
    'Formes, couleurs et tailles simplifiées. Ce n’est pas une carte du ciel. Les vraies proportions ne sont pas respectées.',
  funFacts: [
    'Andromède se trouve à environ 2,5 millions d’années-lumière de nous. Des galaxies plus petites sont encore plus proches.',
  ],
});
