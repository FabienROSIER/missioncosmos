import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

// Stable IDs preserve previously earned rewards and mission progression.
export const REWARD_STELLAR_LIGHT: Reward = {
  id: 'reward-stellar-light',
  title: 'Explorateur des couleurs',
  description: 'Tu as révélé les couleurs de la lumière et réussi tes mélanges de lumières.',
  kind: 'badge',
};

export const MISSION_09: Mission = assertValidMission({
  id: 'mission-09',
  locale: 'fr',
  variantGroupId: 'mission-09',
  title: 'Le secret des couleurs',
  difficulty: 'easy',
  prerequisites: ['mission-08'],
  learningObjectives: [
    'Découvrir que la lumière blanche du Soleil contient les couleurs de l’arc-en-ciel.',
    'Utiliser un prisme pour séparer ces couleurs.',
    'Explorer les mélanges de lumières rouge, verte et bleue.',
  ],
  introQuestion: 'Où se cachent les couleurs dans la lumière blanche ?',
  sceneId: 'stellar-light',
  allowedInteractions: ['rotate', 'zoom', 'pan', 'pick'],
  activities: [
    {
      id: 'act-prism-lab',
      title: 'Laboratoire des couleurs',
      description: 'Place un prisme, découvre l’arc-en-ciel et mélange trois lumières.',
      sceneId: 'stellar-light',
    },
  ],
  steps: [
    {
      id: 'm09-intro',
      kind: 'intro',
      title: 'Les couleurs cachées',
      body: 'La lumière du Soleil nous paraît blanche. Pourtant, elle cache plein de couleurs ! Dans ce laboratoire spatial, aide-nous à les découvrir.',
      ctaLabel: 'Ouvrir le laboratoire',
    },
    {
      id: 'm09-color',
      kind: 'challenge',
      completionMode: 'discovery',
      title: 'Place le prisme',
      guideReminder: 'Place le prisme sur le trajet de la lumière blanche.',
      body: 'Ce triangle de verre est un prisme. Touche-le, ou appuie sur « Placer le prisme », pour le mettre sur le trajet de la lumière blanche.',
      requiresSuccess: true,
      challengePrism: true,
      ctaLabel: 'Observer les couleurs',
      successFeedback: 'Regarde ! Le prisme a séparé les couleurs de la lumière.',
      hint: 'Touche le triangle de verre ou utilise le bouton dans les commandes.',
    },
    {
      id: 'm09-spectrum',
      kind: 'challenge',
      completionMode: 'discovery',
      requiresSuccess: true,
      title: 'Couleurs et mélanges',
      guideReminder:
        'Explore les couleurs, puis clique sur « Passer aux mélanges ». Allume le rouge et le vert.',
      body: 'Touche autant de couleurs que tu veux : elles sont dans la lumière blanche. Clique sur « Passer aux mélanges », puis allume rouge et vert pour faire du jaune. On mélange des lumières, pas de la peinture.',
      successFeedback: 'Le prisme sépare les couleurs. Rouge et vert ensemble font du jaune.',
      ctaLabel: 'Rallumer l’observatoire',
    },
    {
      id: 'm09-challenge',
      kind: 'challenge',
      title: 'Rallume l’observatoire',
      guideReminder: 'Crée la couleur demandée.',
      body: 'L’observatoire attend quatre couleurs : jaune, rose, bleu-vert (cyan), puis blanc. Choisis les lumières à allumer et valide chaque mélange. Tu peux essayer autant de fois que tu veux.',
      requiresSuccess: true,
      challengePrism: true,
      ctaLabel: 'C’est réussi !',
      successFeedback: 'Observatoire rallumé ! Tu as réussi les quatre mélanges.',
      hint: 'Allume ou éteins les projecteurs, observe l’écran, puis valide ton mélange.',
    },
    {
      id: 'm09-explain',
      kind: 'explain',
      title: 'Séparer et mélanger',
      body: 'Le prisme sépare les couleurs de la lumière blanche du Soleil. Les projecteurs font l’inverse : leurs lumières s’ajoutent sur l’écran. Rouge + vert + bleu donnent du blanc !',
      ctaLabel: 'Recevoir mon badge',
    },
    {
      id: 'm09-reward',
      kind: 'reward',
      title: 'Explorateur des couleurs',
      body: 'Ton badge est gagné ! Tu as découvert l’arc-en-ciel et rallumé l’observatoire.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm09-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux continuer à jouer avec le prisme et les projecteurs, ou revenir à la carte.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm09-prism',
    prompt: 'Obtiens du jaune, du rose, du cyan et du blanc avec les trois projecteurs.',
    successFeedback: 'L’observatoire est rallumé !',
    hint: 'Change une lumière à la fois et observe l’écran.',
  },
  finalExplanation:
    'La lumière blanche du Soleil contient les couleurs de l’arc-en-ciel. Un prisme les sépare. Des lumières rouge, verte et bleue ajoutées ensemble donnent du blanc.',
  rewardIds: [REWARD_STELLAR_LIGHT.id],
  glossaryIds: ['prisme', 'lumiere-blanche', 'spectre', 'melange-lumieres', 'soleil'],
  assets: [],
  notToScaleNotice:
    'Laboratoire simplifié : trajets lumineux dessinés. Tailles et angles simplifiés pour observer.',
});
