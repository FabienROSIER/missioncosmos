import type { Quiz } from '@/types/quiz';

export const QUIZ_MISSION_08: Quiz = {
  id: 'quiz-mission-08',
  title: 'Les étoiles',
  questions: [
    {
      id: 'q1-sun-star',
      prompt: 'Le Soleil est…',
      choices: [
        { id: 'planet', label: 'Une planète très chaude' },
        { id: 'star', label: 'Une étoile' },
        { id: 'moon', label: 'Une lune géante' },
      ],
      correctChoiceId: 'star',
      explainCorrect: 'Oui : le Soleil est notre étoile.',
      explainWrong: 'Le Soleil n’est ni une planète ni une lune : c’est une étoile.',
    },
    {
      id: 'q2-apparent',
      prompt: 'Une étoile qui paraît toute petite dans le ciel…',
      choices: [
        { id: 'tiny', label: 'Est forcément minuscule' },
        { id: 'far', label: 'Peut être énorme, mais très loin' },
        { id: 'fake', label: 'N’existe pas vraiment' },
      ],
      correctChoiceId: 'far',
      explainCorrect: 'Exact : la taille apparente dépend aussi de la distance.',
      explainWrong: 'Une géante très loin peut sembler un simple point.',
    },
    {
      id: 'q3-color',
      prompt: 'En général, une étoile bleutée est…',
      choices: [
        { id: 'hotter', label: 'Plus chaude qu’une étoile rouge' },
        { id: 'colder', label: 'Plus froide qu’une étoile rouge' },
        { id: 'same', label: 'À la même température que toutes les autres' },
      ],
      correctChoiceId: 'hotter',
      explainCorrect: 'Oui : plus chaude → plus bleutée ; plus froide → plus rouge.',
      explainWrong: 'La couleur donne un indice sur la température de surface.',
    },
    {
      id: 'q4-betel',
      prompt: 'Bételgeuse est surtout…',
      choices: [
        { id: 'tiny-close', label: 'Une toute petite étoile toute proche' },
        { id: 'giant', label: 'Une géante rouge, bien plus grande que le Soleil' },
        { id: 'planet', label: 'Une planète rouge' },
      ],
      correctChoiceId: 'giant',
      explainCorrect: 'Oui : c’est une géante rouge. Taille estimée, qui peut varier.',
      explainWrong: 'Bételgeuse est une étoile géante, pas une planète.',
    },
  ],
};
