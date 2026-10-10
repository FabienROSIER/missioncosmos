import type { Quiz } from '@/types/quiz';

/** Quiz constellations — origine des figures du ciel. */
export const QUIZ_MISSION_10: Quiz = {
  id: 'quiz-mission-10',
  title: 'Les dessins du ciel',
  questions: [
    {
      id: 'q-viewpoint',
      prompt: 'Pourquoi le cygne a-t-il changé de forme pendant le voyage ?',
      choices: [
        {
          id: 'stars-moved',
          label: 'Les étoiles se sont déplacées pour faire un autre dessin.',
        },
        {
          id: 'viewpoint-changed',
          label: 'Nous avons regardé les mêmes étoiles depuis un autre endroit.',
        },
      ],
      correctChoiceId: 'viewpoint-changed',
      explainCorrect:
        'Oui ! Les étoiles sont restées à leur place. Notre point de vue a changé : nous les avons regardées depuis un autre endroit.',
      explainWrong:
        'Souviens-toi du film : les étoiles sont restées immobiles. C’est le vaisseau qui a voyagé et changé notre point de vue.',
    },
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
