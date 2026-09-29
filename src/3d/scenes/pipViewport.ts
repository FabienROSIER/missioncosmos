import type { Color4, FreeCamera, IColor4Like } from '@babylonjs/core';

type PipEngine = {
  getRenderWidth: () => number;
  getRenderHeight: () => number;
  scissorClear?: (
    x: number,
    y: number,
    width: number,
    height: number,
    clearColor: IColor4Like,
  ) => void;
};

/**
 * Aligne le viewport Babylon sur le cadre HTML (coords CSS → normalisées 0–1).
 * Origin Babylon = bas-gauche.
 *
 * Important : numerateur ET denominateur doivent venir du même espace
 * (`getBoundingClientRect`) — mélanger avec `clientWidth` casse le sync
 * (zoom navigateur / layout responsive) et le PiP affiche alors un coin
 * figé de la vue principale (bleu atmosphère, rouge Soleil…).
 */
export function syncPipCameraToFrame(
  pipCam: FreeCamera,
  frameEl: HTMLElement,
  canvasEl: HTMLElement,
): void {
  const canvasRect = canvasEl.getBoundingClientRect();
  const frameRect = frameEl.getBoundingClientRect();
  if (canvasRect.width < 1 || canvasRect.height < 1) return;
  if (frameRect.width < 1 || frameRect.height < 1) return;

  const x = (frameRect.left - canvasRect.left) / canvasRect.width;
  const y = (canvasRect.bottom - frameRect.bottom) / canvasRect.height;
  const w = frameRect.width / canvasRect.width;
  const h = frameRect.height / canvasRect.height;

  pipCam.viewport.x = Math.max(0, Math.min(1, x));
  pipCam.viewport.y = Math.max(0, Math.min(1, y));
  pipCam.viewport.width = Math.max(0.04, Math.min(1 - pipCam.viewport.x, w));
  pipCam.viewport.height = Math.max(0.04, Math.min(1 - pipCam.viewport.y, h));
}

/**
 * Clear scissor du PiP en pixels buffer (entiers) — plus robuste que
 * `viewport.toGlobal` + `instanceof Engine` (fragile avec le bundling / mobile).
 */
export function scissorClearPipViewport(
  engine: PipEngine,
  viewport: { x: number; y: number; width: number; height: number },
  color: Color4,
): void {
  if (typeof engine.scissorClear !== 'function') return;

  const rw = engine.getRenderWidth();
  const rh = engine.getRenderHeight();
  if (rw < 1 || rh < 1) return;

  const x = Math.max(0, Math.floor(viewport.x * rw));
  const y = Math.max(0, Math.floor(viewport.y * rh));
  const w = Math.max(1, Math.min(rw - x, Math.ceil(viewport.width * rw)));
  const h = Math.max(1, Math.min(rh - y, Math.ceil(viewport.height * rh)));
  engine.scissorClear(x, y, w, h, color);
}
