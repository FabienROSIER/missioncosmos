/**
 * Filet de sécurité mobile : couleur de ciel PiP en CSS (DOM),
 * sans toucher au Engine / DPR / post-process Babylon.
 *
 * Sur GPU téléphone le clear scissor WebGL est parfois no-op → fond figé.
 * On peint alors le ciel en HTML au-dessus du canvas, avec une zone
 * transparente pour laisser voir l’horizon / Soleil / Lune WebGL.
 */

export function prefersCssPipSky(): boolean {
  if (typeof window === 'undefined') return false;
  // Vrai tactile : le simulateur responsive PC reste souvent pointer:fine.
  return window.matchMedia('(pointer: coarse)').matches;
}

export function color3ToCss(color: { r: number; g: number; b: number }): string {
  const r = Math.round(Math.min(255, Math.max(0, color.r * 255)));
  const g = Math.round(Math.min(255, Math.max(0, color.g * 255)));
  const b = Math.round(Math.min(255, Math.max(0, color.b * 255)));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Jour/nuit : ciel CSS en haut, bas transparent pour l’horizon WebGL. */
export function applyDayNightCssPipSky(
  skyEl: HTMLElement | null,
  color: { r: number; g: number; b: number },
): void {
  if (!skyEl || !prefersCssPipSky()) return;
  const css = color3ToCss(color);
  skyEl.style.background = `linear-gradient(to bottom, ${css} 0%, ${css} 52%, transparent 78%)`;
  skyEl.style.opacity = '1';
}

/**
 * Éclipse : ciel CSS sur les bords, centre masqué pour laisser
 * le Soleil / la Lune WebGL visibles.
 */
export function applyEclipseCssPipSky(
  skyEl: HTMLElement | null,
  color: { r: number; g: number; b: number },
): void {
  if (!skyEl || !prefersCssPipSky()) return;
  const css = color3ToCss(color);
  skyEl.style.background = css;
  skyEl.style.opacity = '1';
  const mask =
    'radial-gradient(circle at 50% 42%, transparent 0 20%, rgba(0,0,0,0.55) 38%, #000 58%)';
  skyEl.style.maskImage = mask;
  skyEl.style.webkitMaskImage = mask;
}

export function clearCssPipSky(skyEl: HTMLElement | null): void {
  if (!skyEl) return;
  skyEl.style.background = '';
  skyEl.style.opacity = '';
  skyEl.style.maskImage = '';
  skyEl.style.webkitMaskImage = '';
}
