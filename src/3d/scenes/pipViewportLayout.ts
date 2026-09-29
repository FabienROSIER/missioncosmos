import { Camera, type ArcRotateCamera } from '@babylonjs/core';
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';

export type CameraViewportSnapshot = {
  x: number;
  y: number;
  width: number;
  height: number;
  targetScreenOffsetX: number;
  targetScreenOffsetY: number;
};

export function captureViewport(camera: ArcRotateCamera): CameraViewportSnapshot {
  return {
    x: camera.viewport.x,
    y: camera.viewport.y,
    width: camera.viewport.width,
    height: camera.viewport.height,
    targetScreenOffsetX: camera.targetScreenOffset.x,
    targetScreenOffsetY: camera.targetScreenOffset.y,
  };
}

export function restoreViewport(
  camera: ArcRotateCamera,
  viewport: CameraViewportSnapshot,
): void {
  camera.viewport.x = viewport.x;
  camera.viewport.y = viewport.y;
  camera.viewport.width = viewport.width;
  camera.viewport.height = viewport.height;
  camera.targetScreenOffset.set(
    viewport.targetScreenOffsetX,
    viewport.targetScreenOffsetY,
  );
}

/**
 * Synchronise le cadre HTML avec la caméra PiP.
 *
 * En paysage mobile, le cadre est à droite et la caméra principale est limitée
 * à la zone située avant le PiP : les deux vues sont côte à côte, sans overlay.
 */
export function syncPipViewportLayout(
  mainCamera: ArcRotateCamera,
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

  const mobileLayout = window.matchMedia(MOBILE_GAME_QUERY).matches;
  const landscape = window.matchMedia('(orientation: landscape)').matches;
  const splitLandscape = mobileLayout && landscape;

  if (mobileLayout && !landscape) {
    pipCamera.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
    restoreViewport(mainCamera, defaultMainViewport);
    // Bandeau PiP en haut ; la caméra principale commence sous celui-ci.
    const gutterPx = 8;
    const availableHeight = canvasRect.bottom - frameRect.bottom - gutterPx;
    mainCamera.viewport.x = 0;
    mainCamera.viewport.y = 0;
    mainCamera.viewport.width = 1;
    mainCamera.viewport.height = Math.max(
      0.45,
      Math.min(1, availableHeight / canvasRect.height),
    );
    return;
  }

  if (!splitLandscape) {
    pipCamera.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
    restoreViewport(mainCamera, defaultMainViewport);
    return;
  }

  // Colonne haute et étroite : préserver le champ horizontal et révéler plus
  // de ciel verticalement. La perspective change, pas les proportions.
  pipCamera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;

  const gutterPx = 8;
  const availableWidth = frameRect.left - canvasRect.left - gutterPx;
  mainCamera.viewport.x = 0;
  mainCamera.viewport.y = 0;
  mainCamera.viewport.width = Math.max(0.35, Math.min(1, availableWidth / canvasRect.width));
  mainCamera.viewport.height = 1;
  mainCamera.targetScreenOffset.set(
    defaultMainViewport.targetScreenOffsetX,
    defaultMainViewport.targetScreenOffsetY,
  );
}
