import type { Quiz } from '@/types/quiz';

/** Quiz Mission 04 — éclipses. */
export const QUIZ_MISSION_04: Quiz = {
  id: 'quiz-mission-04',
  title: 'Les éclipses',
  questions: [
    {
      id: 'q1-solar',
      prompt: 'Une éclipse solaire, c’est quand…',
      choices: [
        { id: 'earth-shadow', label: 'L’ombre de la Terre cache la Lune' },
        { id: 'moon-front', label: 'La Lune passe devant le Soleil' },
        { id: 'sun-off', label: 'Le Soleil s’éteint' },
      ],
      correctChoiceId: 'moon-front',
      explainCorrect: 'Oui : vue depuis la Terre, la Lune cache le Soleil un moment.',
      explainWrong: 'Le Soleil ne s’éteint pas. Et l’ombre de la Terre sur la Lune, c’est l’éclipse lunaire.',
    },
    {
      id: 'q2-lunar',
      prompt: 'Une éclipse lunaire, c’est quand…',
      choices: [
        { id: 'in-shadow', label: 'La Lune entre dans l’ombre de la Terre' },
        { id: 'closer', label: 'La Lune se rapproche du Soleil' },
        { id: 'phase', label: 'La Lune devient un croissant' },
      ],
      correctChoiceId: 'in-shadow',
      explainCorrect: 'Exact : Soleil, Terre, puis Lune alignés — la Lune traverse l’ombre.',
      explainWrong: 'Un croissant, c’est une phase. Une éclipse lunaire, c’est l’ombre de la Terre.',
    },
    {
      id: 'q3-not-monthly',
      prompt: 'Pourquoi n’y a-t-il pas d’éclipse chaque mois ?',
      choices: [
        { id: 'tilt', label: 'L’orbite de la Lune est un peu penchée' },
        { id: 'rare-sun', label: 'Le Soleil brille trop rarement' },
        { id: 'random', label: 'C’est complètement au hasard' },
      ],
      correctChoiceId: 'tilt',
      explainCorrect:
        'Oui : la Lune passe souvent un peu au-dessus ou en dessous de l’ombre. Il faut un alignement précis.',
      explainWrong: 'Ce n’est pas le Soleil qui manque : c’est l’alignement, à cause de l’orbite penchée.',
    },
  ],
};
