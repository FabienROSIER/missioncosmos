import type { Quiz } from '@/types/quiz';

/** Quiz constellations — origine des figures du ciel. */
export const QUIZ_MISSION_CONSTELLATIONS: Quiz = {
  id: 'quiz-mission-constellations',
  title: 'Les dessins du ciel',
  questions: [
    {
      id: 'q1-origin',
      prompt: 'Qui a inventé les constellations, et pourquoi ?',
      choices: [
        {
          id: 'one-recent',
          label: 'Une seule personne, il y a peu de temps, pour décorer les cartes',
        },
        {
          id: 'ancient-peoples',
          label:
            'Des peuples très anciens, pour se repérer, suivre les saisons et raconter des histoires',
        },
        {
          id: 'stars-alone',
          label: 'Les étoiles, qui se sont rangées toutes seules en animaux',
        },
      ],
      correctChoiceId: 'ancient-peoples',
      explainCorrect:
        'Oui. Personne ne les a inventées tout seul. Il y a très longtemps, des peuples ont imaginé des personnages dans les étoiles pour retrouver leur chemin la nuit, reconnaître les saisons et raconter des histoires. Ceux de ta mission viennent surtout de la Grèce antique. D’autres pays ont vu d’autres figures dans le même ciel.',
      explainWrong:
        'Les étoiles ne se rangent pas toutes seules. Et ce n’est pas l’idée d’une seule personne récente : beaucoup de peuples ont imaginé des figures, il y a très longtemps.',
    },
  ],
};
