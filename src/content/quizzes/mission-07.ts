import type { Quiz } from '@/types/quiz';

export const QUIZ_MISSION_07: Quiz = {
  id: 'quiz-mission-07',
  title: 'Les saisons',
  questions: [
    {
      id: 'q1-cause',
      prompt: 'Pourquoi y a-t-il des saisons ?',
      choices: [
        { id: 'near', label: 'Parce que la Terre se rapproche du Soleil en été' },
        { id: 'tilt', label: 'Parce que la Terre est inclinée' },
        { id: 'spin', label: 'Parce que la Terre tourne sur elle-même en 24 h' },
      ],
      correctChoiceId: 'tilt',
      explainCorrect:
        'Oui : l’inclinaison fait qu’un hémisphère reçoit des rayons plus directs selon le moment de l’année.',
      explainWrong: 'La rotation fait le jour et la nuit. Les saisons viennent surtout de l’inclinaison.',
    },
    {
      id: 'q2-distance',
      prompt: 'En été dans l’hémisphère nord, la Terre est…',
      choices: [
        { id: 'much-closer', label: 'Beaucoup plus près du Soleil' },
        { id: 'same', label: 'À peu près à la même distance (orbite presque ronde)' },
        { id: 'farther', label: 'Beaucoup plus loin du Soleil' },
      ],
      correctChoiceId: 'same',
      explainCorrect:
        'Exact : l’orbite est presque un cercle. En janvier on est même un peu plus près… et c’est l’hiver au nord !',
      explainWrong: 'Ce n’est pas la distance qui fait l’été : c’est l’inclinaison.',
    },
    {
      id: 'q3-opposite',
      prompt: 'Quand c’est l’été au nord…',
      choices: [
        { id: 'summer-south', label: 'C’est aussi l’été au sud' },
        { id: 'winter-south', label: 'C’est l’hiver au sud' },
        { id: 'same', label: 'Il n’y a pas de saison au sud' },
      ],
      correctChoiceId: 'winter-south',
      explainCorrect: 'Oui : les hémisphères sont à l’envers pour les saisons.',
      explainWrong: 'Nord et sud ont des saisons opposées.',
    },
    {
      id: 'q4-zero',
      prompt: 'Si la Terre n’était pas inclinée…',
      choices: [
        { id: 'no-season', label: 'Il n’y aurait presque plus de saisons' },
        { id: 'hotter', label: 'Il ferait toujours très chaud partout' },
        { id: 'same', label: 'Rien ne changerait' },
      ],
      correctChoiceId: 'no-season',
      explainCorrect: 'Oui : sans inclinaison, pas de vrai été / hiver liés à la position sur l’orbite.',
      explainWrong: 'L’inclinaison est la clé des saisons telles qu’on les vit.',
    },
  ],
};
