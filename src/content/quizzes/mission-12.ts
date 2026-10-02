import type { Quiz } from '@/types/quiz';
export const QUIZ_MISSION_12: Quiz = {
  id: 'quiz-mission-12',
  title: 'Navigateur cosmique',
  questions: [
    {
      id: 'q1-unit',
      prompt: 'Une année-lumière mesure…',
      choices: [
        { id: 'distance', label: 'Une distance' },
        { id: 'age', label: 'L’âge d’une étoile' },
        { id: 'speed', label: 'La vitesse d’un vaisseau' },
      ],
      correctChoiceId: 'distance',
      explainCorrect: 'Oui ! C’est la distance parcourue par la lumière en un an.',
      explainWrong:
        'Le mot « année » sert ici à définir le trajet de la lumière. Une année-lumière est une distance.',
    },
    {
      id: 'q2-au',
      prompt: 'À quoi correspond 1 UA ?',
      choices: [
        { id: 'moon', label: 'La distance moyenne Terre–Lune' },
        { id: 'sun', label: 'La distance moyenne Terre–Soleil' },
      ],
      correctChoiceId: 'sun',
      explainCorrect: 'Exact ! C’est environ 150 millions de kilomètres.',
      explainWrong: 'L’UA utilise la distance moyenne entre la Terre et le Soleil comme repère.',
    },
    {
      id: 'q3-visible',
      prompt: 'L’Univers observable, c’est…',
      choices: [
        { id: 'all', label: 'Tout l’Univers, avec son bord' },
        { id: 'visible', label: 'La région dont la lumière peut nous parvenir' },
      ],
      correctChoiceId: 'visible',
      explainCorrect: 'Oui ! L’Univers peut s’étendre au-delà de ce que nous pouvons observer.',
      explainWrong:
        'Observable ne veut pas dire tout l’Univers. La limite de ce que nous pouvons observer n’est pas un mur.',
    },
  ],
};
