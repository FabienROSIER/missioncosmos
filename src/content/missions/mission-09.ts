import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

export const REWARD_STELLAR_LIGHT: Reward = {
  id: 'reward-stellar-light',
  title: 'Gardien du spectre',
  description:
    'Tu sais que la couleur d’une étoile parle de sa température, et qu’un spectre montre où sa lumière est la plus forte.',
  kind: 'badge',
};

/**
 * Mission 09 — La lumière des étoiles
 */
export const MISSION_09: Mission = assertValidMission({
  id: 'mission-09',
  locale: 'fr',
  variantGroupId: 'mission-09',
  title: 'La lumière des étoiles',
  difficulty: 'medium',
  prerequisites: ['mission-08'],
  learningObjectives: [
    'Relier la couleur d’une étoile à sa température de surface.',
    'Lire un spectre simplifié (corps noir) et repérer le pic qui bouge.',
    'Comprendre qu’une étoile émet plusieurs couleurs, mais qu’une zone domine.',
  ],
  introQuestion: 'Pourquoi les étoiles n’ont-elles pas toutes la même couleur ?',
  sceneId: 'stellar-light',
  allowedInteractions: ['rotate', 'zoom', 'pan'],
  activities: [
    {
      id: 'act-prism-lab',
      title: 'Laboratoire du prisme',
      description: 'Chauffe ou refroidis une étoile et observe couleur + spectre.',
      sceneId: 'stellar-light',
    },
  ],
  steps: [
    {
      id: 'm09-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'Rouge, jaune, bleue… Les étoiles n’ont pas toutes la même couleur. Est-ce juste joli, ou ça veut dire quelque chose ?',
      ctaLabel: 'Je regarde',
    },
    {
      id: 'm09-color',
      kind: 'manipulate',
      title: 'Couleur = température',
      body: 'Bouge le curseur : plus l’étoile est froide, plus elle tire vers le rouge ; plus elle est chaude, plus elle tire vers le bleu. La température se mesure en kelvins (K).',
      ctaLabel: 'Je vois',
    },
    {
      id: 'm09-spectrum',
      kind: 'manipulate',
      title: 'Le prisme révèle le spectre',
      body: 'La lumière blanche traverse le prisme et s’étale en arc-en-ciel. Toutes les couleurs sont là, mais une zone brille plus fort — le pic se déplace avec la température.',
      ctaLabel: 'J’ai compris',
    },
    {
      id: 'm09-lab',
      kind: 'manipulate',
      title: 'Laboratoire libre',
      body: 'Explore librement : couleur de l’étoile, faisceau, spectre et pic bougent ensemble. Les vraies raies d’absorption sont volontairement omises ici.',
      ctaLabel: 'J’ai exploré',
    },
    {
      id: 'm09-compare',
      kind: 'observe',
      title: 'Trois références',
      body: 'Proxima (froide), le Soleil (moyenne) et Sirius A (chaude) : même mécanique, températures différentes. Tu vas les reproduire.',
      ctaLabel: 'Je suis prêt',
    },
    {
      id: 'm09-challenge',
      kind: 'challenge',
      title: 'Défi : commandes du prisme',
      body: 'Trois commandes de l’observatoire : régler Proxima, puis le Soleil, puis Sirius A. Même curseur, sans devoir viser un nombre exact.',
      requiresSuccess: true,
      challengePrism: true,
      successFeedback:
        'Prisme activé ! Tu as réglé les trois étoiles : froide, moyenne et chaude.',
      hint: 'Regarde la carte cible : si ton étoile est trop rouge, chauffe ; trop bleue, refroidis.',
    },
    {
      id: 'm09-explain',
      kind: 'explain',
      title: 'Ce que dit la lumière',
      body: 'La couleur d’une étoile raconte surtout sa température de surface. Un spectre simplifié montre où la lumière est la plus forte. Les astronomes utilisent aussi un spectroscope pour lire ces indices — et bien plus encore.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm09-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Quatre questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-09',
    },
    {
      id: 'm09-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Gardien du spectre.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm09-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux encore jouer avec le laboratoire, ou revenir à la carte. La Voie lactée t’attend ensuite.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm09-prism',
    prompt: 'Règle Proxima, le Soleil et Sirius A avec le curseur de température.',
    successFeedback: 'Oui ! Trois réglages, un prisme allumé.',
    hint: 'Utilise les indices « refroidis » / « chauffe » et la carte cible.',
  },
  finalExplanation:
    'Plus une étoile est chaude, plus sa lumière tire vers le bleu ; plus elle est froide, plus elle tire vers le rouge. Un spectre simplifié montre plusieurs couleurs, avec un pic qui se déplace.',
  rewardIds: [REWARD_STELLAR_LIGHT.id],
  funFacts: [
    'Même une étoile « rouge » émet un peu de bleu — mais le rouge domine. Notre spectre est une maquette de corps noir, sans les raies fines du ciel réel.',
  ],
  glossaryIds: ['spectre', 'spectroscope', 'kelvin', 'etoile', 'temperature-etoile', 'soleil'],
  quizId: 'quiz-mission-09',
  assets: [],
  notToScaleNotice:
    'Spectre pédagogique (corps noir simplifié). Raies d’absorption omises. Températures arrondies.',
});
