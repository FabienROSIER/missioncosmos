import type { Quiz } from '@/types/quiz';

/** Quiz Mission 02 — jour / nuit. */
export const QUIZ_MISSION_02: Quiz = {
  id: 'quiz-mission-02',
  title: 'Jour et nuit',
  questions: [
    {
      id: 'q1-sun-off',
      prompt: 'La nuit, que fait le Soleil ?',
      choices: [
        { id: 'off', label: 'Il s’éteint' },
        { id: 'on', label: 'Il continue de briller' },
        { id: 'hide', label: 'Il se cache sous la Terre' },
      ],
      correctChoiceId: 'on',
      explainCorrect: 'Oui : le Soleil brille toujours. On est juste de l’autre côté de la Terre.',
      explainWrong: 'Le Soleil ne s’éteint pas. C’est la Terre qui tourne.',
    },
    {
      id: 'q2-why-day',
      prompt: 'Il fait jour quand…',
      choices: [
        { id: 'facing', label: 'On est du côté éclairé par le Soleil' },
        { id: 'closer', label: 'La Terre se rapproche du Soleil' },
        { id: 'moon', label: 'La Lune allume la Terre' },
      ],
      correctChoiceId: 'facing',
      explainCorrect: 'Exact : le jour, ton endroit regarde le Soleil.',
      explainWrong: 'Ce n’est pas une question de distance ici : c’est le côté éclairé.',
    },
    {
      id: 'q3-24h',
      prompt: 'La Terre fait un tour sur elle-même en environ…',
      choices: [
        { id: '1h', label: '1 heure' },
        { id: '24h', label: '24 heures' },
        { id: '1y', label: '1 année' },
      ],
      correctChoiceId: '24h',
      explainCorrect: 'Oui : environ 24 heures — un jour et une nuit.',
      explainWrong: 'Un tour complet, c’est à peu près une journée : 24 heures.',
    },
  ],
};
