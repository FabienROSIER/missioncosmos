import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

export const REWARD_STARS: Reward = {
  id: 'reward-stars',
  title: 'Observateur d’étoiles',
  description:
    'Tu sais que le Soleil est une étoile, et qu’une étoile immense peut paraître petite si elle est très loin.',
  kind: 'badge',
};

/**
 * Mission 08 — Les étoiles
 */
export const MISSION_08: Mission = assertValidMission({
  id: 'mission-08',
  locale: 'fr',
  variantGroupId: 'mission-08',
  title: 'Les étoiles',
  difficulty: 'medium',
  prerequisites: ['mission-07'],
  learningObjectives: [
    'Reconnaître le Soleil comme une étoile.',
    'Comparer des étoiles : tailles et couleurs/températures simplifiées.',
    'Comprendre que la taille apparente n’est pas la taille réelle.',
  ],
  introQuestion: 'Le Soleil est-il une étoile comme les autres ?',
  sceneId: 'stars',
  allowedInteractions: ['rotate', 'zoom', 'pan', 'pick'],
  activities: [
    {
      id: 'act-stars-compare',
      title: 'Comparer des étoiles',
      description: 'Observe tailles, couleurs et taille apparente.',
      sceneId: 'stars',
    },
  ],
  steps: [
    {
      id: 'm08-intro',
      kind: 'intro',
      title: 'Une question',
      body: 'La nuit, le ciel est plein de points lumineux. Le Soleil, lui, est énorme… Est-ce la même chose ?',
      ctaLabel: 'Je regarde',
    },
    {
      id: 'm08-observe',
      kind: 'observe',
      completionMode: 'discovery',
      title: 'Comparer les tailles',
      body: 'Le Soleil est une étoile. Touche les étoiles autant que tu veux pour comparer leurs tailles. Les écarts de taille sont réduits dans cette maquette pour tout voir.',
      guideReminder: 'Touche les étoiles autant que tu veux pour comparer leurs tailles.',
      ctaLabel: 'Comparer les couleurs',
    },
    {
      id: 'm08-colors',
      kind: 'observe',
      completionMode: 'discovery',
      title: 'Comparer les couleurs',
      body: 'Touche les étoiles autant que tu veux pour découvrir leurs couleurs et températures. Le bleu indique une étoile plus chaude, le rouge une étoile plus froide. Ici, les disques ont la même taille pour comparer les couleurs.',
      guideReminder: 'Touche les étoiles autant que tu veux pour comparer leurs températures.',
      ctaLabel: 'Photographier les étoiles',
    },
    {
      id: 'm08-challenge',
      kind: 'challenge',
      title: 'Défi : photographe d’étoiles',
      body: 'Complète l’album de l’observatoire. Pour chaque étoile, rapproche ou éloigne le télescope afin que son disque remplisse le cadre, puis prends la photo.',
      requiresSuccess: true,
      challengeObservatory: true,
      successFeedback:
        'Album complet ! Les étoiles remplissent le même cadre malgré des tailles et distances très différentes.',
      hint: 'Si l’étoile déborde, éloigne le télescope. Si elle paraît trop petite, rapproche-le.',
    },
    {
      id: 'm08-explain',
      kind: 'explain',
      title: 'Taille vue, taille réelle',
      body: 'Le Soleil nous paraît grand parce qu’il est proche. Une géante rouge peut sembler un point dans le ciel si elle est très loin. La taille réelle et la taille apparente, ce n’est pas la même chose.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm08-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Quatre questions pour vérifier.',
      requiresSuccess: true,
      quizId: 'quiz-mission-08',
    },
    {
      id: 'm08-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Tu as gagné le badge Observateur d’étoiles.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm08-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux encore explorer, ou revenir à la carte. La lumière des étoiles t’attend ensuite.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm08-observatory',
    prompt: 'Photographie trois étoiles avec le même cadrage.',
    successFeedback: 'Oui ! Même cadrage, mais tailles et distances différentes.',
    hint: 'Ajuste la distance du télescope avant chaque photo.',
  },
  finalExplanation:
    'Le Soleil est une étoile. Les étoiles ont des tailles et des couleurs (températures) différentes. Une étoile peut paraître petite simplement parce qu’elle est loin.',
  rewardIds: [REWARD_STARS.id],
  funFacts: [
    'Si le Soleil était une balle de tennis, Bételgeuse serait plus large qu’un terrain de football — et pourtant, dans le ciel, elle reste un point.',
  ],
  glossaryIds: ['soleil', 'etoile', 'taille-apparente', 'geante-rouge', 'temperature-etoile'],
  quizId: 'quiz-mission-08',
  assets: [],
  notToScaleNotice:
    'Tailles simplifiées, distances choisies pour comparer. Bételgeuse : taille estimée.',
});
