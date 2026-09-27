/** Entrée de glossaire — définitions FR pour 6–12 ans. */

export type GlossaryEntry = {
  id: string;
  /** Mot affiché */
  term: string;
  /** Définition courte, phrases simples */
  definition: string;
  /**
   * Complément pédagogique débloqué après une récompense
   * (pas affiché tant que `unlockRewardId` n’est pas gagné).
   */
  enrichedDefinition?: string;
  /** Id de récompense requis pour afficher `enrichedDefinition`. */
  unlockRewardId?: string;
  /** Variantes pour détection dans un texte (minuscules) */
  aliases?: string[];
};
