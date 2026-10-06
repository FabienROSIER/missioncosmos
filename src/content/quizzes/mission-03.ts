import type { Quiz } from '@/types/quiz';

/** Quiz Mission 03 — phases de la Lune. */
export const QUIZ_MISSION_03: Quiz = {
  id: 'quiz-mission-03',
  title: 'Phases de la Lune',
  questions: [
    {
      id: 'q1-what-phases',
      prompt: 'Pourquoi la Lune change-t-elle de forme dans le ciel ?',
      choices: [
        {
          id: 'shadow',
          label: 'Parce que l’ombre de la Terre la cache un peu',
        },
        {
          id: 'lit-part',
          label: 'Parce qu’on voit plus ou moins sa face éclairée par le Soleil',
        },
        {
          id: 'shrink',
          label: 'Parce que la Lune grossit et rétrécit',
        },
      ],
      correctChoiceId: 'lit-part',
      explainCorrect:
        'Oui : le Soleil éclaire toujours une moitié. Selon la position, on en voit plus ou moins.',
      explainWrong:
        'La Lune ne change pas de taille. Et l’ombre de la Terre, ce n’est pas ça : c’est pour les éclipses.',
    },
    {
      id: 'q2-full',
      prompt: 'On voit une pleine Lune quand…',
      choices: [
        {
          id: 'between',
          label: 'La Lune est entre la Terre et le Soleil',
        },
        {
          id: 'opposite',
          label: 'La Lune est à l’opposé du Soleil, vue depuis la Terre',
        },
        {
          id: 'closer',
          label: 'La Lune se rapproche de la Terre',
        },
      ],
      correctChoiceId: 'opposite',
      explainCorrect:
        'Exact : depuis la Terre, nous voyons presque toute la face éclairée.',
      explainWrong:
        'Entre Terre et Soleil, on voit plutôt une nouvelle Lune (presque invisible).',
    },
    {
      id: 'q3-not-earth-shadow',
      prompt: 'L’ombre de la Terre sur la Lune, c’est…',
      choices: [
        {
          id: 'phases',
          label: 'Ce qui crée les phases chaque nuit',
        },
        {
          id: 'eclipse',
          label: 'Ce qui arrive pendant une éclipse de Lune',
        },
        {
          id: 'always',
          label: 'Toujours collée à la Lune',
        },
      ],
      correctChoiceId: 'eclipse',
      explainCorrect:
        'Oui : l’ombre de la Terre touche la Lune seulement lors d’une éclipse — pas pour les phases ordinaires.',
      explainWrong:
        'Les phases, ce n’est pas l’ombre de la Terre. Cette ombre, c’est surtout pour les éclipses.',
    },
  ],
};
