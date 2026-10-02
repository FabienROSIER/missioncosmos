import type { Quiz } from '@/types/quiz';
export const QUIZ_MISSION_10: Quiz = {
  id: 'quiz-mission-10',
  title: 'Notre galaxie',
  questions: [
    {
      id: 'q1-home',
      prompt: 'Où se trouve notre Système solaire ?',
      choices: [
        { id: 'inside', label: 'Dans la Voie lactée' },
        { id: 'outside', label: 'À l’extérieur de toutes les galaxies' },
        { id: 'centre', label: 'Au centre de la Voie lactée' },
      ],
      correctChoiceId: 'inside',
      explainCorrect:
        'Oui ! Notre Système solaire fait partie de la Voie lactée, loin de son centre.',
      explainWrong: 'Le Soleil est une étoile du disque de la Voie lactée. Il n’est pas au centre.',
    },
    {
      id: 'q2-galaxy',
      prompt: 'Une galaxie, c’est…',
      choices: [
        { id: 'star', label: 'Une seule étoile géante' },
        { id: 'group', label: 'Un immense ensemble d’étoiles, de gaz et de poussière' },
        { id: 'planets', label: 'Seulement les huit planètes du Soleil' },
      ],
      correctChoiceId: 'group',
      explainCorrect:
        'Exact ! La gravité rassemble les étoiles, le gaz et la poussière d’une galaxie.',
      explainWrong:
        'Une galaxie contient énormément d’étoiles. Le Soleil et ses planètes n’en sont qu’une toute petite partie.',
    },
    {
      id: 'q3-shape',
      prompt: 'Vue de profil, la Voie lactée ressemble surtout à…',
      choices: [
        { id: 'disk', label: 'Un disque avec un renflement au centre' },
        { id: 'sphere', label: 'Une boule pleine comme une planète' },
        { id: 'line', label: 'Une rangée de huit étoiles' },
      ],
      correctChoiceId: 'disk',
      explainCorrect: 'Oui : le disque contient les bras, et le centre est plus épais.',
      explainWrong:
        'Repense à la vue de profil : le disque est aplati et le centre plus épais. Il existe aussi des étoiles autour du disque.',
    },
  ],
};
