import {
  SceneInstrumentation,
  type AbstractMesh,
  type Scene,
} from '@babylonjs/core';
import { logger } from '@/lib/logger';

export type PerfSnapshot = {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  activeMeshes: number;
  /** Estimation heap JS (Chrome) — Mo. */
  jsHeapMb: number | null;
};

export type PerfMonitorHandle = {
  getSnapshot: () => PerfSnapshot;
  dispose: () => void;
};

/**
 * Instrumentation FPS / draw calls.
 * En dev : log périodique. Sur appareil réel : relire getSnapshot() ou console.
 */
export function startPerfMonitor(
  scene: Scene,
  options?: { logIntervalMs?: number; label?: string },
): PerfMonitorHandle {
  const instrumentation = new SceneInstrumentation(scene);
  instrumentation.captureFrameTime = true;
  instrumentation.captureRenderTime = true;

  const label = options?.label ?? scene.metadata?.missionId ?? 'scene';
  const intervalMs = options?.logIntervalMs ?? 4000;
  let timer: ReturnType<typeof setInterval> | undefined;

  const getSnapshot = (): PerfSnapshot => {
    const engine = scene.getEngine();
    const fps = engine.getFps();
    const frameTimeMs = instrumentation.frameTimeCounter.lastSecAverage;
    const perf = typeof performance !== 'undefined' ? performance : undefined;
    const memory = (
      perf as Performance & { memory?: { usedJSHeapSize: number } } | undefined
    )?.memory;

    return {
      fps: Math.round(fps * 10) / 10,
      frameTimeMs: Math.round(frameTimeMs * 100) / 100,
      drawCalls: instrumentation.drawCallsCounter.current,
      activeMeshes: scene.getActiveMeshes().length,
      jsHeapMb: memory ? Math.round((memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10 : null,
    };
  };

  if (process.env.NODE_ENV === 'development' && intervalMs > 0) {
    timer = setInterval(() => {
      const snap = getSnapshot();
      logger.debug(`Perf[${label}]`, snap);
    }, intervalMs);
  }

  return {
    getSnapshot,
    dispose: () => {
      if (timer) clearInterval(timer);
      instrumentation.dispose();
    },
  };
}

/** Compte approximatif de draw calls potentiels (meshes visibles + matériaux). */
export function estimateMeshDrawCost(meshes: AbstractMesh[]): number {
  let count = 0;
  for (const mesh of meshes) {
    if (!mesh.isEnabled() || !mesh.isVisible) continue;
    count += 1;
  }
  return count;
}
