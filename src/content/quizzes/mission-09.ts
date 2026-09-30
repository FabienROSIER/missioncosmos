import type { Quiz } from '@/types/quiz';

export const QUIZ_MISSION_09: Quiz = {
  id: 'quiz-mission-09',
  title: 'La lumière des étoiles',
  questions: [
    {
      id: 'q1-color-temp',
      prompt: 'En général, une étoile plus bleue est…',
      choices: [
        { id: 'colder', label: 'Plus froide qu’une étoile rouge' },
        { id: 'hotter', label: 'Plus chaude qu’une étoile rouge' },
        { id: 'fake', label: 'Une illusion : toutes ont la même température' },
      ],
      correctChoiceId: 'hotter',
      explainCorrect: 'Oui : plus chaude → plus bleutée ; plus froide → plus rouge.',
      explainWrong: 'La couleur donne un indice sur la température de surface.',
    },
    {
      id: 'q2-spectrum',
      prompt: 'Dans notre laboratoire, le spectre montre…',
      choices: [
        { id: 'one', label: 'Une seule couleur exacte, rien d’autre' },
        {
          id: 'many',
          label: 'Plusieurs couleurs, avec une zone plus forte qui bouge',
        },
        { id: 'sound', label: 'Le son de l’étoile' },
      ],
      correctChoiceId: 'many',
      explainCorrect:
        'Exact : c’est une maquette de corps noir — le pic se déplace avec la température.',
      explainWrong: 'Toutes les couleurs sont présentes ; une zone domine selon la chaleur.',
    },
    {
      id: 'q3-kelvin',
      prompt: 'La température des étoiles se mesure souvent en…',
      choices: [
        { id: 'celsius', label: 'Degrés Celsius seulement' },
        { id: 'kelvin', label: 'Kelvins (K)' },
        { id: 'meters', label: 'Mètres' },
      ],
      correctChoiceId: 'kelvin',
      explainCorrect: 'Oui : les astronomes utilisent surtout le kelvin.',
      explainWrong: 'On parle en kelvins (K) pour la surface des étoiles.',
    },
    {
      id: 'q4-proxima',
      prompt: 'Parmi ces trois, laquelle est la plus froide ?',
      choices: [
        { id: 'sirius', label: 'Sirius A' },
        { id: 'sun', label: 'Le Soleil' },
        { id: 'proxima', label: 'Proxima du Centaure' },
      ],
      correctChoiceId: 'proxima',
      explainCorrect: 'Oui : Proxima est une naine rouge, plus froide que le Soleil et Sirius.',
      explainWrong: 'Proxima est rouge-orangée et plus froide ; Sirius est plus chaude.',
    },
  ],
};
