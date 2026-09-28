import type { Quiz } from '@/types/quiz';

export const QUIZ_MISSION_06: Quiz = {
  id: 'quiz-mission-06',
  title: 'Les orbites',
  questions: [
    {
      id: 'q1-orbit',
      prompt: 'Une orbite, c’est…',
      choices: [
        { id: 'spin', label: 'Tourner sur soi-même (comme une toupie)' },
        { id: 'path', label: 'Le chemin autour du Soleil' },
        { id: 'glow', label: 'La lumière du Soleil' },
      ],
      correctChoiceId: 'path',
      explainCorrect: 'Oui : l’orbite, c’est la piste autour du Soleil. Tourner sur soi, c’est autre chose (jour/nuit).',
      explainWrong: 'Tourner sur soi = rotation. L’orbite, c’est avancer autour du Soleil.',
    },
    {
      id: 'q2-period',
      prompt: 'Plus une planète est proche du Soleil…',
      choices: [
        { id: 'slow', label: 'Plus son année est longue' },
        { id: 'fast', label: 'Plus son année est courte' },
        { id: 'same', label: 'Son année dure toujours 365 jours' },
      ],
      correctChoiceId: 'fast',
      explainCorrect: 'Exact : Mercure fait un tour bien plus vite que Jupiter.',
      explainWrong: 'Plus près → année plus courte. Seule la Terre a une année d’environ 365 jours.',
    },
    {
      id: 'q3-fall',
      prompt: 'Une orbite, on peut aussi la voir comme…',
      choices: [
        { id: 'rope', label: 'Une corde invisible qui tient la planète' },
        { id: 'fall', label: 'Une chute vers le centre, mais qui n’arrive jamais' },
        { id: 'push', label: 'Le Soleil qui pousse la planète en avant' },
      ],
      correctChoiceId: 'fall',
      explainCorrect:
        'Oui : elle tombe vers le centre, et avance assez vite sur le côté pour « rater » le sol — chute perpétuelle.',
      explainWrong: 'Pas de corde, et le Soleil n’éloigne pas. C’est une chute + un mouvement de côté.',
    },
    {
      id: 'q4-gravity',
      prompt: 'Si le Guide part trop lentement autour de la Terre…',
      choices: [
        { id: 'crash', label: 'Il tombe vers la Terre' },
        { id: 'escape', label: 'Il quitte la Terre pour toujours' },
        { id: 'freeze', label: 'Il s’arrête dans le ciel' },
      ],
      correctChoiceId: 'crash',
      explainCorrect: 'Oui : trop lent → pas assez de mouvement de côté, il tombe.',
      explainWrong: 'Trop lent = chute. Trop vite = il s’éloigne. L’arrêt total n’existe pas ici.',
    },
  ],
};
