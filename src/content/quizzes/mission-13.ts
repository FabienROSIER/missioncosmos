import type { Quiz } from '@/types/quiz';
export const QUIZ_MISSION_13: Quiz = {
  id: 'quiz-mission-13',
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
      prompt: '1 UA, une unité astronomique, correspond à…',
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
        { id: 'visible', label: 'La partie de l’Univers dont la lumière peut nous arriver' },
      ],
      correctChoiceId: 'visible',
      explainCorrect: 'Oui ! L’Univers peut s’étendre au-delà de ce que nous pouvons observer.',
      explainWrong:
        'Observable ne veut pas dire tout l’Univers. La limite de ce que nous pouvons observer n’est pas un mur.',
    },
    {
      id: 'q4-lookback',
      prompt: 'Quand nous regardons Andromède aujourd’hui, nous la voyons…',
      choices: [
        { id: 'now', label: 'Exactement telle qu’elle est en ce moment' },
        { id: 'past', label: 'Telle qu’elle était il y a environ 2,5 millions d’années' },
      ],
      correctChoiceId: 'past',
      explainCorrect:
        'Oui ! Sa lumière a mis environ 2,5 millions d’années à nous rejoindre. Regarder loin, c’est regarder dans le passé.',
      explainWrong:
        'La lumière d’Andromède met environ 2,5 millions d’années à nous atteindre. Nous recevons donc une ancienne image.',
    },
  ],
};
