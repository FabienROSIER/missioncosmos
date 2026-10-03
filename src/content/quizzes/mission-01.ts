import type { Quiz } from '@/types/quiz';

/** Quiz Mission 01 — forme, équateur, pôles. */
export const QUIZ_MISSION_01: Quiz = {
  id: 'quiz-mission-01',
  title: 'Un peu de mémoire',
  questions: [
    {
      id: 'q1-shape',
      prompt: 'La Terre, c’est plutôt…',
      choices: [
        { id: 'flat', label: 'Une assiette plate' },
        { id: 'ball', label: 'Une boule (sphère)' },
        { id: 'cube', label: 'Un cube' },
      ],
      correctChoiceId: 'ball',
      explainCorrect: 'Oui : la Terre est ronde comme une boule.',
      explainWrong: 'Regarde encore le globe : on peut tourner tout autour. Ce n’est pas plat.',
    },
    {
      id: 'q2-equator',
      prompt: 'L’équateur, c’est…',
      choices: [
        { id: 'top', label: 'Le point tout en haut' },
        { id: 'middle', label: 'Le grand cercle au milieu' },
        { id: 'bottom', label: 'Le point tout en bas' },
      ],
      correctChoiceId: 'middle',
      explainCorrect: 'Exact : l’équateur est le grand cercle au milieu de la Terre.',
      explainWrong:
        'L’équateur n’est pas un pôle : c’est le cercle imaginaire qui sépare les moitiés nord et sud.',
    },
    {
      id: 'q3-poles',
      prompt: 'Les pôles Nord et Sud, c’est…',
      choices: [
        { id: 'middle-band', label: 'La bande autour du milieu' },
        { id: 'axis-ends', label: 'Les bouts de l’axe de rotation' },
        { id: 'oceans', label: 'Seulement des océans' },
      ],
      correctChoiceId: 'axis-ends',
      explainCorrect: 'Oui : les pôles sont les extrémités de l’axe autour duquel la Terre tourne.',
      explainWrong:
        'Les pôles sont les deux extrémités de l’axe de rotation, pas le cercle du milieu.',
    },
    {
      id: 'q4-orbit',
      prompt: 'L’orbite de la Terre, c’est…',
      choices: [
        { id: 'spin', label: 'La Terre qui tourne sur elle-même' },
        { id: 'path-sun', label: 'Le chemin de la Terre autour du Soleil' },
        { id: 'equator-line', label: 'Le cercle de l’équateur sur le globe' },
      ],
      correctChoiceId: 'path-sun',
      explainCorrect:
        'Exact : l’orbite est le chemin de la Terre autour du Soleil. Un tour dure environ une année ; il n’y a pas de rail dans l’espace.',
      explainWrong:
        'Tourner sur soi-même, c’est la rotation (jour/nuit). L’orbite, c’est avancer autour du Soleil.',
    },
  ],
};
