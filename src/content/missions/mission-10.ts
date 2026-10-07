import { assertValidMission } from './validateMission';
import { CONSTELLATIONS } from '@/content/bodies/constellations';
import type { Reward } from '@/types/progress';

export const REWARD_CONSTELLATIONS: Reward = {
  id: 'reward-constellations',
  title: 'Cartographe du ciel',
  kind: 'badge',
  description: 'Tu as retrouvé les dessins du ciel et découvert les différentes distances de leurs étoiles.',
};

export const MISSION_10 = assertValidMission({
  id: 'mission-10',
  locale: 'fr',
  title: 'Les dessins du ciel',
  difficulty: 'easy',
  prerequisites: ['mission-09'],
  sceneId: 'constellations',
  allowedInteractions: ['pick', 'pan'],
  learningObjectives: [
    'Reconnaître quatre dessins de constellations.',
    'Distinguer les étoiles réelles des figures imaginées.',
    'Comprendre que le dessin dépend du point de vue et masque la profondeur.',
    'Savoir que des peuples anciens ont imaginé les constellations pour se repérer, suivre les saisons et raconter des histoires.',
  ],
  introQuestion: 'Les étoiles dessinent-elles vraiment des animaux dans l’espace ?',
  activities: [
    {
      id: 'act-sky-atlas',
      title: 'Atlas du ciel',
      description:
        'Retrouve des dessins, révèle leurs personnages et voyage entre les points de vue.',
      sceneId: 'constellations',
    },
  ],
  steps: [
    {
      id: 'm10-intro',
      kind: 'intro',
      title: 'Les dessins du ciel',
      body: 'Depuis longtemps, les humains imaginent des personnages et des animaux en regardant les étoiles. Ouvre ton atlas : nous allons retrouver quatre de ces dessins !',
      ctaLabel: 'Ouvrir mon atlas',
    },
    ...CONSTELLATIONS.slice(0, 4).map((item) => ({
      id: `m10-${item.id}`,
      kind: 'challenge' as const,
      title: `Retrouve ${item.title === 'Cassiopée' || item.title === 'Orion' ? '' : 'le dessin : '}${item.title}`,
      body: `${item.clue} Compare la place des étoiles et leurs écarts avec ta carte. Retrouve les étoiles du dessin dans n’importe quel ordre pour révéler ${item.figure}.`,
      guideReminder:
        'Compare la forme de la carte au ciel. Tu peux choisir les étoiles dans n’importe quel ordre.',
      requiresSuccess: true,
      successFeedback: item.reveal,
      ctaLabel: 'Découverte suivante',
    })),
    {
      id: 'm10-aquila',
      kind: 'observe',
      title: 'Une découverte bonus : l’Aigle',
      body: 'Envie d’un autre oiseau ? Repère la tête autour d’Altaïr, le corps, les ailes et la queue de l’Aigle. Choisis ses étoiles dans n’importe quel ordre. Cette découverte est un bonus : tu peux aussi continuer ton voyage.',
      ctaLabel: 'Partir en voyage',
    },
    {
      id: 'm10-perspective',
      kind: 'challenge',
      title: 'Retrouve notre point de vue',
      body: 'Le vaisseau a changé de place et le cygne est déformé ! Déplace le vaisseau avec le curseur. Retrouve la croix de ta carte, puis appuie sur « Vérifier mon point de vue ». Les étoiles restent immobiles.',
      guideReminder: 'Déplace le vaisseau pour retrouver la croix.',
      requiresSuccess: true,
      successFeedback:
        'Tu as retrouvé le dessin en changeant de point de vue. Aucune étoile n’a bougé !',
      ctaLabel: 'Voir le voyage',
    },
    {
      id: 'm10-film',
      kind: 'challenge',
      completionMode: 'discovery',
      title: 'Le voyage du Cygne',
      body: 'Observe le voyage : le vaisseau découvre le ciel de côté, puis revient à notre point de départ. Le film démarre tout seul. Tu peux le mettre en pause, le passer ou le revoir.',
      guideReminder:
        'Observe comment le dessin change pendant le voyage. Tu peux mettre le film en pause.',
      requiresSuccess: true,
      successFeedback: 'Le cygne revient quand nous retrouvons notre point de vue !',
      ctaLabel: 'Ce que j’ai découvert',
    },
    {
      id: 'm10-understand',
      kind: 'challenge',
      title: 'Qu’est-ce qui a changé ?',
      body: 'Pendant notre voyage, le dessin du cygne s’est déformé. Pourquoi ? Choisis l’explication qui correspond à ce que tu as observé.',
      requiresSuccess: true,
      successFeedback:
        'Exactement ! Les étoiles sont restées à leur place. Nous les avons regardées depuis un autre endroit.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm10-quiz',
      kind: 'quiz',
      title: 'D’où viennent les constellations ?',
      body: 'Une question sur ceux qui ont imaginé ces dessins, et pourquoi.',
      requiresSuccess: true,
      quizId: 'quiz-mission-10',
    },
    {
      id: 'm10-reward',
      kind: 'reward',
      title: 'Cartographe du ciel',
      body: 'Tu as retrouvé les dessins du ciel et découvert les différentes distances de leurs étoiles.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm10-complete',
      kind: 'complete',
      title: 'Ton atlas est ouvert',
      body: 'Mission accomplie ! Explore les cinq constellations, montre ou cache leurs figures, ou retourne à la carte.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm10-atlas',
    prompt: 'Retrouve quatre constellations et leur point de vue.',
    successFeedback: 'Tu es cartographe du ciel !',
  },
  finalExplanation:
    'Les étoiles sont réelles ; les traits et les personnages sont imaginés. Les étoiles sont à différentes distances et leur dessin apparent dépend de notre point de vue.',
  rewardIds: [REWARD_CONSTELLATIONS.id],
  quizId: 'quiz-mission-10',
  assets: [],
  notToScaleNotice:
    'Carte simplifiée. Voyage imaginaire en 3D : distances choisies pour l’expérience, différentes des vraies distances.',
});
