/**
 * Paramètres pédagogiques « chute perpétuelle » (Mission 06).
 * Curseur continu 0–100 ; la réussite se juge sur la trajectoire réelle (pas sur une zone secrète).
 */

/** Vitesse relative à l’orbite circulaire (1 = juste). */
export function speedFromSlider(slider01: number): number {
  const t = Math.min(1, Math.max(0, slider01));
  // De 0.55× à 1.45× la vitesse circulaire
  return 0.55 + t * 0.9;
}

export type FallOrbitOutcome = 'crash' | 'orbit' | 'escape';

/** Indice selon le résultat observé (+ curseur pour un « presque »). */
export function fallOrbitHint(
  outcome: FallOrbitOutcome,
  slider01: number,
  attempts: number,
): string {
  if (outcome === 'orbit') {
    return 'Bien ! Il avance assez vite sur le côté pour « rater » le sol.';
  }
  if (outcome === 'crash') {
    if (attempts >= 3 && slider01 > 0.35 && slider01 < 0.55) {
      return 'Presque ! Un tout petit peu plus vite.';
    }
    return 'Trop lent : il tombe vers la Terre. Donne un peu plus de vitesse.';
  }
  if (attempts >= 3 && slider01 > 0.55 && slider01 < 0.8) {
    return 'Presque ! Un tout petit peu moins vite.';
  }
  return 'Trop vite : il s’éloigne. Réduis un peu la vitesse.';
}
