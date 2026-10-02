import { assertValidMission } from './validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';
export const REWARD_DISTANCES: Reward = {
  id: 'reward-distances',
  title: 'Navigateur cosmique',
  kind: 'badge',
  description: 'Tu sais comparer des distances et utiliser les repères UA et année-lumière.',
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
    'Distinguer une distance et un diamètre.',
    'Comprendre que l’Univers observable n’est pas tout l’Univers.',
  ],
  activities: [
    {
      id: 'cosmic-navigation',
      title: 'Le grand voyage',
      description: 'Explore sept repères et retrouve les messages lumineux qui nous parviennent.',
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
      body: 'Avance à ton rythme avec « Plus loin », et reviens avec « Plus près ». Observe les sept repères jusqu’à l’Univers observable, puis prépare les destinations du robot. Les immenses distances sont comprimées dans notre maquette.',
      guideReminder: 'Observe les distances : le voisinage apparaît pendant le recul.',
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
      ctaLabel: 'Chercher les vrais voisins',
    },
    {
      id: 'm12-signals',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Les faux voisins',
      body: 'De face, certaines galaxies semblent voisines. Mais sont-elles proches dans l’espace ? Tourne la maquette ou essaie « De côté ». Choisis les deux galaxies les plus proches, puis vérifie. Trois petites manches t’attendent !',
      guideReminder: 'Tourne la vue, puis choisis deux galaxies proches dans l’espace.',
      successFeedback:
        'Trois paires retrouvées ! Voisines dans une image ne veut pas toujours dire proches dans l’espace.',
      hint: 'Regarde de côté : deux galaxies côte à côte peuvent être très séparées en profondeur.',
      ctaLabel: 'Ce que nous avons découvert',
    },
    {
      id: 'm12-explain',
      kind: 'explain',
      title: 'Le ciel a de la profondeur',
      body: 'Une image du ciel cache les distances en profondeur : deux galaxies côte à côte peuvent être éloignées dans l’espace. L’année-lumière est une unité de distance. L’Univers observable désigne la région dont la lumière peut nous parvenir ; ce n’est pas le bord de tout l’Univers.',
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
      body: 'Tu as classé les destinations et démasqué les faux voisins !',
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
    'L’UA et l’année-lumière sont des unités de distance. Notre voisinage, notre galaxie et les autres galaxies correspondent à des échelles très différentes.',
  quizId: 'quiz-mission-12',
  rewardIds: ['reward-distances'],
  glossaryIds: ['unite-astronomique', 'annee-lumiere', 'univers-observable'],
  assets: [],
  notToScaleNotice:
    'Maquette 3D pédagogique : astres agrandis, espaces et temps comprimés. Le recul comprime les immenses sauts de distance. Les diamètres sont indiqués explicitement. Neptune ne marque pas la fin du Système solaire.',
});
