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
  /** Accès WebGL interne Babylon — fallback mobile si scissorClear est no-op. */
  _gl?: WebGLRenderingContext | WebGL2RenderingContext;
};

/**
 * Aligne le viewport Babylon sur le cadre HTML (coords CSS → normalisées 0–1).
 * Origin Babylon = bas-gauche.
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

function viewportToBufferRect(
  engine: PipEngine,
  viewport: { x: number; y: number; width: number; height: number },
): { x: number; y: number; w: number; h: number } | null {
  // Doit matcher le buffer utilisé par les viewports caméra (pas useScreen=true).
  const rw = engine.getRenderWidth();
  const rh = engine.getRenderHeight();
  if (rw < 1 || rh < 1) return null;

  const x = Math.max(0, Math.floor(viewport.x * rw));
  const y = Math.max(0, Math.floor(viewport.y * rh));
  const w = Math.max(1, Math.min(rw - x, Math.ceil(viewport.width * rw)));
  const h = Math.max(1, Math.min(rh - y, Math.ceil(viewport.height * rh)));
  return { x, y, w, h };
}

/**
 * Clear couleur + profondeur dans le rectangle PiP.
 * Sur beaucoup de GPU mobiles, le seul `scissorClear` Babylon est fragile /
 * no-op → le z-buffer de la vue principale bloque le ciel PiP et on voit
 * un fond « figé » (bleu atmosphère / rouge Soleil).
 */
export function scissorClearPipViewport(
  engine: PipEngine,
  viewport: { x: number; y: number; width: number; height: number },
  color: Color4,
): void {
  const rect = viewportToBufferRect(engine, viewport);
  if (!rect) return;

  if (typeof engine.scissorClear === 'function') {
    engine.scissorClear(rect.x, rect.y, rect.w, rect.h, color);
  }

  const gl = engine._gl;
  if (!gl) return;

  const prevScissor = gl.isEnabled(gl.SCISSOR_TEST);
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(rect.x, rect.y, rect.w, rect.h);
  gl.clearColor(color.r, color.g, color.b, color.a ?? 1);
  gl.depthMask(true);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  if (!prevScissor) {
    gl.disable(gl.SCISSOR_TEST);
  }
}

/** Couleur CSS du ciel — filet de sécurité UI (ne remplace pas le rendu 3D). */
export function skyCssColor(color: { r: number; g: number; b: number }): string {
  const r = Math.round(Math.min(255, Math.max(0, color.r * 255)));
  const g = Math.round(Math.min(255, Math.max(0, color.g * 255)));
  const b = Math.round(Math.min(255, Math.max(0, color.b * 255)));
  return `rgb(${r}, ${g}, ${b})`;
}
