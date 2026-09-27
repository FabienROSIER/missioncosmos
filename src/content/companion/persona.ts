/**
 * Personnalité du compagnon Mission Cosmos.
 * Nom définitif à choisir avec le propriétaire — placeholder temporaire.
 */

/** Affiché dans les bulles UI. Remplacer quand le nom est validé. */
export const COMPANION_TEMP_NAME = 'Guide';

export const COMPANION_PERSONA = {
  /** Calme, curieux, jamais sarcastique ni punitif. */
  traits: ['curieux', 'calme', 'encourageant', 'clair'] as const,
  /**
   * Ton FR 6–12 ans : phrases courtes, pas d’infantilisation,
   * erreur = aide, réussite = félicitation sobre (pas d’exagération).
   */
  toneRules: [
    'Phrases courtes, une idée à la fois.',
    'Pas de punition ni de moquerie après une erreur.',
    'Félicitations sobres : « Bien vu », pas « Génialissime !!! ».',
    'Ne jamais cacher une consigne importante uniquement dans une pose.',
    'Rester discret : le globe et les boutons restent prioritaires.',
  ] as const,
} as const;
