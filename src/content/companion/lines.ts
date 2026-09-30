/**
 * Répliques courtes du compagnon — hors contenu pédagogique de mission.
 * Les indices/explications scientifiques restent dans les steps.
 */

export const COMPANION_LINES = {
  welcome: 'On explore ensemble. Prends ton temps.',
  tryChallenge: 'À toi d’essayer. Prends ton temps !',
  quizThink: 'Observe bien, puis essaie.',
  softRetry: 'Pas grave — regarde encore une fois.',
  softSuccess: 'Bien vu !',
  missionDone: 'Tu as terminé cette mission.',
  curiosity: 'Petit détail intéressant…',
} as const;

export type CompanionLineId = keyof typeof COMPANION_LINES;
