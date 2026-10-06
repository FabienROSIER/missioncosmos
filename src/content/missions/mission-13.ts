import { assertValidMission } from './validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

export const REWARD_BLACK_HOLE_DETECTIVE: Reward = {
  id: 'reward-black-hole-detective',
  title: 'Détective de l’invisible',
  kind: 'badge',
  description:
    'Tu sais utiliser les mouvements et la lumière pour chercher un objet invisible.',
};

export const MISSION_13: Mission = assertValidMission({
  id: 'mission-13',
  locale: 'fr',
  title: 'Les trous noirs',
  difficulty: 'easy',
  prerequisites: ['mission-12'],
  sceneId: 'black-holes',
  allowedInteractions: ['rotate', 'zoom', 'pick'],
  introQuestion: 'Comment découvrir quelque chose dont la lumière ne peut pas sortir ?',
  learningObjectives: [
    'Comprendre que l’horizon des événements est une frontière de non-retour.',
    'Comprendre qu’un trou noir n’aspire pas tout ce qui l’entoure.',
    'Utiliser les mouvements d’étoiles pour repérer un objet invisible.',
    'Distinguer le trou noir du gaz lumineux qui peut l’entourer.',
  ],
  activities: [
    {
      id: 'black-hole-observatory',
      title: 'L’observatoire de l’invisible',
      description:
        'Observe les orbites, le gaz chaud et les signaux pour comprendre les trous noirs.',
      sceneId: 'black-holes',
    },
  ],
  steps: [
    {
      id: 'm13-intro',
      kind: 'intro',
      title: 'Quelque chose d’invisible',
      body: 'Ces étoiles tournent autour d’une région sombre. Un trou noir concentre énormément de matière dans très peu de place. Sa gravité attire les objets proches, mais il n’aspire pas tout : des étoiles peuvent rester en orbite autour de lui.',
      ctaLabel: 'Suivre une étoile',
    },
    {
      id: 'm13-observe',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Des indices dans les orbites',
      body: 'Affiche la trajectoire de l’étoile dorée, puis suis son mouvement. Elle accélère quand elle se rapproche et ralentit quand elle s’éloigne. Son orbite révèle un objet invisible qui l’attire.',
      guideReminder: 'Affiche puis suis la trajectoire de l’étoile dorée.',
      successFeedback: 'Le mouvement de l’étoile révèle un objet invisible.',
      ctaLabel: 'Observer un autre exemple',
    },
    {
      id: 'm13-surroundings',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Ce qui brille autour',
      body: 'Dans cet autre exemple, du gaz très chaud forme un disque lumineux autour du trou noir. Ce gaz appartient aux alentours : tous les trous noirs n’ont pas un disque lumineux. Observe sa forme avant de commencer.',
      guideReminder: 'Clique directement sur le gaz chaud et lumineux.',
      successFeedback: 'Le gaz brille autour du trou noir ; la lumière ne vient pas de son intérieur.',
      ctaLabel: 'Tester les signaux',
    },
    {
      id: 'm13-signals',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'La frontière de non-retour',
      body: 'Ce dessin montre l’intérieur. Envoie la lumière vers l’extérieur, depuis le point dehors puis celui dedans.',
      guideReminder: 'Teste le point dehors, puis le point dedans.',
      successFeedback:
        'Depuis l’intérieur de l’horizon, même un signal lumineux ne peut plus ressortir.',
      ctaLabel: 'Relever le premier défi',
    },
    {
      id: 'm13-orbit',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Même masse, même orbite ?',
      body: 'Une planète tourne loin de son étoile. Imagine que nous remplaçons cette étoile par un trou noir de même masse, avec autant de matière. Choisis ce qui va se passer, puis vérifie avec l’expérience.',
      guideReminder: 'Choisis avant de lancer l’expérience.',
      hint: 'La masse au centre est restée la même. Observe aussi la distance de la planète.',
      successFeedback:
        'De loin, un trou noir attire comme un autre objet de même masse : la planète peut conserver son orbite.',
      ctaLabel: 'Chercher l’objet invisible',
    },
    {
      id: 'm13-detect',
      kind: 'challenge',
      requiresSuccess: true,
      title: 'Détective de l’invisible',
      body: 'L’objet invisible pourrait être dans l’une de ces trois régions. Cherche celle dont les étoiles tournent autour d’un même centre invisible. Les étoiles qui tournent donnent un indice à vérifier.',
      guideReminder: 'Cherche le centre commun des orbites.',
      hint: 'Affiche les trajectoires et cherche la région autour de laquelle elles s’organisent.',
      successFeedback: 'Ces étoiles tournent autour du même endroit. Cherchons l’objet invisible ici.',
      ctaLabel: 'Rassembler les découvertes',
    },
    {
      id: 'm13-explain',
      kind: 'explain',
      title: 'Trois indices essentiels',
      body: 'L’horizon des événements est une limite : une fois à l’intérieur, même la lumière ne ressort plus. De loin, un trou noir n’aspire pas davantage qu’un objet de même masse. Enfin, les mouvements d’étoiles ou le gaz chaud peuvent révéler un trou noir que nous ne voyons pas directement.',
      ctaLabel: 'Répondre au robot',
    },
    {
      id: 'm13-quiz',
      kind: 'quiz',
      title: 'Enquête sur l’invisible',
      body: 'Le robot te pose quatre questions sur l’horizon, les orbites et le gaz lumineux.',
      quizId: 'quiz-mission-13',
      requiresSuccess: true,
    },
    {
      id: 'm13-reward',
      kind: 'reward',
      title: 'Détective de l’invisible',
      body: 'Tu as trouvé des indices pour étudier un objet dont la lumière ne peut pas sortir.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm13-complete',
      kind: 'complete',
      title: 'Explore l’observatoire',
      body: 'Reviens librement aux orbites, au disque lumineux et à l’expérience des signaux.',
    },
  ],
  challenge: {
    id: 'black-hole-detection',
    prompt: 'Repère un objet invisible grâce aux mouvements des étoiles.',
    successFeedback: 'Les orbites ont révélé la région invisible.',
    hint: 'Cherche un centre commun aux trajectoires.',
  },
  finalExplanation:
    'Un trou noir possède un horizon des événements, frontière au-delà de laquelle rien ne peut ressortir. Il n’aspire pas tout : des objets assez éloignés peuvent rester en orbite. Les scientifiques le détectent grâce à ses effets sur son environnement.',
  quizId: 'quiz-mission-13',
  rewardIds: ['reward-black-hole-detective'],
  glossaryIds: ['trou-noir', 'horizon-evenements', 'disque-accretion', 'gravite', 'orbite'],
  assets: [],
  notToScaleNotice:
    'Tailles, distances et durées simplifiées. Certains effets d’un vrai trou noir ne sont pas représentés.',
});
