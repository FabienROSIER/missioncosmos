import type { Quiz } from '@/types/quiz';
export const QUIZ_MISSION_12: Quiz = {
  id: 'quiz-mission-12',
  title: 'Des îles d’étoiles',
  questions: [
    {
      id: 'q1-neighbour',
      prompt: 'Andromède, c’est…',
      choices: [
        { id: 'galaxy', label: 'Une autre galaxie, très loin de nous' },
        { id: 'star', label: 'Une étoile de notre Système solaire' },
        { id: 'home', label: 'Un autre nom de la Voie lactée' },
      ],
      correctChoiceId: 'galaxy',
      explainCorrect: 'Oui ! Andromède et la Voie lactée sont deux galaxies différentes.',
      explainWrong:
        'Notre Soleil appartient à la Voie lactée. Andromède est une autre galaxie, avec ses propres étoiles.',
    },
    {
      id: 'q2-spiral',
      prompt: 'Quelle famille possède des bras qui s’enroulent ?',
      choices: [
        { id: 'elliptical', label: 'Les elliptiques' },
        { id: 'spiral', label: 'Les spirales' },
        { id: 'irregular', label: 'Les irrégulières' },
      ],
      correctChoiceId: 'spiral',
      explainCorrect: 'Exact ! La Voie lactée et Andromède sont des galaxies spirales.',
      explainWrong:
        'Repense aux maquettes : les bras s’enroulent autour du centre des galaxies spirales.',
    },
    {
      id: 'q3-light',
      prompt: 'Pourquoi une galaxie est-elle lumineuse ?',
      choices: [
        { id: 'sun', label: 'C’est une seule étoile gigantesque' },
        { id: 'stars', label: 'Elle contient énormément d’étoiles' },
      ],
      correctChoiceId: 'stars',
      explainCorrect:
        'Oui ! La lumière de nombreuses étoiles se mêle quand on regarde une galaxie de loin.',
      explainWrong:
        'Une galaxie contient beaucoup d’étoiles, ainsi que du gaz et de la poussière. Ce n’est pas un Soleil géant.',
    },
  ],
};
