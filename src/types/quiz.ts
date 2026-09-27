/** Quiz pédagogique — textes FR séparés des scènes 3D. */

export type QuizChoice = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  /** Message si bonne réponse */
  explainCorrect: string;
  /** Indice doux si erreur — pas de punition */
  explainWrong: string;
};

export type Quiz = {
  id: string;
  title: string;
  /** V1 : souvent 1 question courte */
  questions: QuizQuestion[];
};
