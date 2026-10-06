import type { Quiz } from '@/types/quiz';

export const QUIZ_MISSION_13: Quiz = {
  id: 'quiz-mission-13',
  title: 'Enquête sur l’invisible',
  questions: [
    {
      id: 'q1-horizon',
      prompt: 'Que devient une lumière allumée à l’intérieur de l’horizon ?',
      choices: [
        { id: 'escape', label: 'Elle peut ressortir' },
        { id: 'trapped', label: 'Elle ne peut plus ressortir' },
        { id: 'faster', label: 'Elle va seulement plus vite' },
      ],
      correctChoiceId: 'trapped',
      explainCorrect:
        'Oui ! L’horizon est une limite : depuis l’intérieur, même la lumière ne peut plus ressortir.',
      explainWrong:
        'Repense aux deux signaux : celui lancé depuis l’intérieur ne pouvait pas franchir l’horizon vers l’extérieur.',
    },
    {
      id: 'q2-same-mass',
      prompt: 'Une étoile est remplacée par un trou noir de même masse. Que peut faire une planète éloignée ?',
      choices: [
        { id: 'orbit', label: 'Continuer sur la même orbite' },
        { id: 'swallowed', label: 'Être aussitôt avalée' },
        { id: 'stop', label: 'S’arrêter dans l’espace' },
      ],
      correctChoiceId: 'orbit',
      explainCorrect:
        'Exact ! À grande distance, la même masse produit la même attraction : la planète peut garder son orbite.',
      explainWrong:
        'Dans l’expérience, même masse au centre, même distance et même vitesse au départ : la planète garde son orbite.',
    },
    {
      id: 'q3-disk',
      prompt: 'Qu’est-ce qui brille autour de certains trous noirs ?',
      choices: [
        { id: 'inside', label: 'La lumière sortie de l’intérieur' },
        { id: 'gas', label: 'Du gaz très chaud autour' },
        { id: 'wall', label: 'Une paroi lumineuse' },
      ],
      correctChoiceId: 'gas',
      explainCorrect:
        'Oui ! Le disque lumineux est du gaz chaud autour du trou noir. Tous les trous noirs n’en ont pas.',
      explainWrong:
        'Ce qui brille vient des alentours : du gaz peut chauffer en tournant autour du trou noir.',
    },
    {
      id: 'q4-detection',
      prompt: 'Comment repérer un trou noir que nous ne voyons pas ?',
      choices: [
        { id: 'orbits', label: 'Observer les mouvements des étoiles proches' },
        { id: 'color', label: 'Chercher toujours une boule noire' },
        { id: 'sound', label: 'Écouter un bruit dans l’espace' },
      ],
      correctChoiceId: 'orbits',
      explainCorrect:
        'Bravo ! Plusieurs étoiles tournant autour d’un même point peuvent révéler un objet invisible.',
      explainWrong:
        'Le trou noir peut rester invisible. Les orbites des étoiles proches donnent un indice sur l’objet caché.',
    },
  ],
};
