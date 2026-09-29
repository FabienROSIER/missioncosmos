import type { Camera } from '@babylonjs/core';
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';

export type CameraViewportSnapshot = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function captureViewport(camera: Camera): CameraViewportSnapshot {
  return {
    x: camera.viewport.x,
    y: camera.viewport.y,
    width: camera.viewport.width,
    height: camera.viewport.height,
  };
}

export function restoreViewport(camera: Camera, viewport: CameraViewportSnapshot): void {
  camera.viewport.x = viewport.x;
  camera.viewport.y = viewport.y;
  camera.viewport.width = viewport.width;
  camera.viewport.height = viewport.height;
}

/**
 * Synchronise le cadre HTML avec la caméra PiP.
 *
 * En paysage mobile, le cadre est à droite et la caméra principale est limitée
 * à la zone située avant le PiP : les deux vues sont côte à côte, sans overlay.
 */
export function syncPipViewportLayout(
  mainCamera: Camera,
  pipCamera: Camera,
  frameEl: HTMLElement,
  canvasEl: HTMLElement,
  defaultMainViewport: CameraViewportSnapshot,
): void {
  const canvasRect = canvasEl.getBoundingClientRect();
  const frameRect = frameEl.getBoundingClientRect();
  if (canvasRect.width < 1 || canvasRect.height < 1) return;
  if (frameRect.width < 1 || frameRect.height < 1) return;

  const x = (frameRect.left - canvasRect.left) / canvasRect.width;
  const y = (canvasRect.bottom - frameRect.bottom) / canvasRect.height;
  const w = frameRect.width / canvasRect.width;
  const h = frameRect.height / canvasRect.height;
  pipCamera.viewport.x = Math.max(0, Math.min(1, x));
  pipCamera.viewport.y = Math.max(0, Math.min(1, y));
  pipCamera.viewport.width = Math.max(0.05, Math.min(1 - pipCamera.viewport.x, w));
  pipCamera.viewport.height = Math.max(0.05, Math.min(1 - pipCamera.viewport.y, h));

  const splitLandscape =
    window.matchMedia(MOBILE_GAME_QUERY).matches &&
    window.matchMedia('(orientation: landscape)').matches;

  if (!splitLandscape) {
    restoreViewport(mainCamera, defaultMainViewport);
    return;
  }

  const gutterPx = 8;
  const availableWidth = frameRect.left - canvasRect.left - gutterPx;
  mainCamera.viewport.x = 0;
  mainCamera.viewport.y = 0;
  mainCamera.viewport.width = Math.max(0.35, Math.min(1, availableWidth / canvasRect.width));
  mainCamera.viewport.height = 1;
}
