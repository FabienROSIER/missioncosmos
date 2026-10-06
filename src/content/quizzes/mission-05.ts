import type { Quiz } from '@/types/quiz';

export const QUIZ_MISSION_05: Quiz = {
  id: 'quiz-mission-05',
  title: 'Le Système solaire',
  questions: [
    {
      id: 'q1-count',
      prompt: 'Combien y a-t-il de planètes autour du Soleil ?',
      choices: [
        { id: '8', label: '8' },
        { id: '9', label: '9' },
        { id: '12', label: '12' },
      ],
      correctChoiceId: '8',
      explainCorrect: 'Oui : 8 planètes, de Mercure à Neptune.',
      explainWrong: 'Huit planètes : Pluton est classée parmi les planètes naines.',
    },
    {
      id: 'q2-order',
      prompt: 'Quelle planète est la plus proche du Soleil ?',
      choices: [
        { id: 'earth', label: 'La Terre' },
        { id: 'mercury', label: 'Mercure' },
        { id: 'jupiter', label: 'Jupiter' },
      ],
      correctChoiceId: 'mercury',
      explainCorrect: 'Exact : Mercure est la première.',
      explainWrong: 'La plus proche, c’est Mercure.',
    },
    {
      id: 'q3-distances',
      prompt: 'Dans la vraie vie, les distances entre planètes…',
      choices: [
        { id: 'tight', label: 'Sont collées comme sur la maquette' },
        { id: 'huge', label: 'Sont énormes : il y a surtout du vide' },
        { id: 'equal', label: 'Sont toutes égales' },
      ],
      correctChoiceId: 'huge',
      explainCorrect: 'Oui : l’espace entre les planètes est immense. La maquette les rapproche pour tout voir.',
      explainWrong: 'En vrai, il y a surtout du vide. On rapproche les planètes pour qu’elles tiennent à l’écran.',
    },
    {
      id: 'q4-pluto',
      prompt: 'Pluton, c’est…',
      choices: [
        { id: '9th', label: 'La 9e planète' },
        { id: 'dwarf', label: 'Une planète naine' },
        { id: 'star', label: 'Une petite étoile' },
      ],
      correctChoiceId: 'dwarf',
      explainCorrect: 'Oui : planète naine, pas une 9e planète du système solaire.',
      explainWrong: 'Pluton n’est pas une 9e planète : on la classe parmi les planètes naines.',
    },
  ],
};
