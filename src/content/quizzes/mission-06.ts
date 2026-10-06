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
      explainWrong: 'Plus près du Soleil, un tour dure moins longtemps. Seule la Terre a une année d’environ 365 jours.',
    },
    {
      id: 'q3-fall',
      prompt: 'Une orbite, on peut aussi la voir comme…',
      choices: [
        { id: 'rope', label: 'Une corde invisible qui tient la planète' },
        { id: 'fall', label: 'Une chute, avec un mouvement de côté qui évite le centre' },
        { id: 'push', label: 'Le Soleil qui pousse la planète en avant' },
      ],
      correctChoiceId: 'fall',
      explainCorrect:
        'Attirée vers le Soleil, la planète avance aussi de côté : elle continue à tourner autour.',
      explainWrong:
        'Pas de corde, et le Soleil n’éloigne pas. Attirée vers le Soleil, la planète avance aussi de côté : elle continue à tourner autour.',
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
      explainCorrect: 'Trop lent : le Guide tombe. Trop rapide : il s’éloigne. Essaie entre les deux.',
      explainWrong: 'Trop lent : le Guide tombe. Trop rapide : il s’éloigne. Essaie entre les deux.',
    },
  ],
};
