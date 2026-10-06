import { assertValidMission } from './validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';
export const REWARD_DISTANCES: Reward = {
  id: 'reward-distances',
  title: 'Navigateur cosmique',
  kind: 'badge',
  description: 'Tu sais comparer des distances et les mesurer avec l’unité astronomique (UA) et l’année-lumière.',
};
export const MISSION_12: Mission = assertValidMission({
  id: 'mission-12',
  locale: 'fr',
  title: 'Les distances dans l’Univers',
  difficulty: 'easy',
  prerequisites: ['mission-11'],
  sceneId: 'cosmic-distances',
  allowedInteractions: ['pick', 'zoom'],
  introQuestion: 'Comment mesurer un voyage jusqu’aux étoiles ?',
  learningObjectives: [
    'Comparer les distances de la Lune aux galaxies.',
    'Comprendre l’unité astronomique et l’année-lumière.',
    'Comprendre que la lumière met du temps à voyager : regarder loin, c’est regarder dans le passé.',
    'Comprendre que l’Univers observable n’est pas tout l’Univers.',
  ],
  activities: [
    {
      id: 'cosmic-navigation',
      title: 'Le grand voyage',
      description:
        'Explore sept repères, classe les destinations, puis découvre que la lumière apporte des images du passé.',
      sceneId: 'cosmic-distances',
    },
  ],
  steps: [
    {
      id: 'm12-intro',
      kind: 'intro',
      title: 'Un voyage immense',
      body: 'La Lune nous semble loin. Pourtant, les étoiles et les galaxies sont beaucoup plus éloignées ! Le robot t’emmène comparer ces distances. Nous prenons du recul parmi les planètes et les galaxies de notre maquette.',
      ctaLabel: 'Lancer le voyage',
    },
    {
      id: 'm12-journey',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'De la Lune à l’Univers observable',
      body: 'Avance à ton rythme avec « Plus loin », et reviens avec « Plus près ». Observe les sept repères jusqu’à l’Univers observable, la partie de l’Univers que nous pouvons observer, puis prépare les destinations du robot. Distances raccourcies pour tout montrer.',
      guideReminder: 'Avec « Plus loin », observe ce qui apparaît autour de toi.',
      successFeedback: 'Notre voyage nous a montré des distances de plus en plus grandes.',
      ctaLabel: 'Préparer les destinations',
    },
    {
      id: 'm12-order',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Les destinations mélangées',
      body: 'Le robot prépare quatre messages lumineux depuis notre voisinage. Classe leurs destinations de la plus proche à la plus lointaine. Choisis chaque carte dans l’ordre pour préparer les quatre envois.',
      guideReminder: 'Choisis la destination la plus proche parmi les cartes restantes.',
      successFeedback: 'Les envois sont prêts : Lune, Soleil, Proxima, puis Andromède !',
      hint: 'Une étoile voisine est beaucoup plus loin que le Soleil, et une autre galaxie est encore plus loin.',
      ctaLabel: 'Voir les messagers de lumière',
    },
    {
      id: 'm12-signals',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Les messagers de lumière',
      body: 'Trois galaxies envoient un flash en même temps. Observe le voyage accéléré jusqu’à l’observatoire, puis choisis la galaxie dont l’image est la plus ancienne. Distances réduites, écarts respectés.',
      guideReminder: 'Envoie les flashs et suis la ligne du temps.',
      successFeedback:
        'La lumière transporte une ancienne image. Plus sa source est éloignée, plus cette image est ancienne.',
      hint: 'Le flash le plus long à arriver vient de plus loin : son image est la plus ancienne.',
      ctaLabel: 'Ce que nous avons découvert',
    },
    {
      id: 'm12-explain',
      kind: 'explain',
      title: 'La lumière apporte le passé',
      body: 'La lumière voyage très vite, mais l’espace est immense : elle met du temps à nous rejoindre. Regarder une galaxie lointaine, c’est recevoir une image partie il y a longtemps. L’année-lumière mesure le chemin parcouru par la lumière en un an. L’Univers observable, c’est la partie de l’Univers dont la lumière peut nous arriver ; ce n’est pas le bord de tout l’Univers.',
      ctaLabel: 'Répondre au robot',
    },
    {
      id: 'm12-quiz',
      kind: 'quiz',
      title: 'Prêt pour le grand voyage ?',
      body: 'Le robot te pose quelques questions sur les distances et la lumière reçue.',
      quizId: 'quiz-mission-12',
      requiresSuccess: true,
    },
    {
      id: 'm12-reward',
      kind: 'reward',
      title: 'Navigateur cosmique',
      body: 'Tu as classé les destinations et compris que la lumière apporte des images du passé !',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm12-complete',
      kind: 'complete',
      title: 'Explore les distances',
      body: 'Reviens sur les sept repères librement. La prochaine mission explorera les trous noirs.',
    },
  ],
  challenge: {
    id: 'cosmic-messages',
    prompt: 'Classe les quatre destinations de la plus proche à la plus lointaine.',
    successFeedback: 'Les quatre destinations sont rangées !',
  },
  finalExplanation:
    'L’UA et l’année-lumière sont des unités de distance. La lumière met du temps à voyager : plus une source est loin, plus l’image reçue est ancienne. L’Univers observable n’est pas tout l’Univers.',
  quizId: 'quiz-mission-12',
  rewardIds: ['reward-distances'],
  glossaryIds: ['unite-astronomique', 'annee-lumiere', 'univers-observable'],
  assets: [],
  notToScaleNotice:
    'Objets agrandis, distances raccourcies, temps accéléré. Les fiches précisent ce qu’on mesure. Le Système solaire continue au-delà de Neptune.',
});
