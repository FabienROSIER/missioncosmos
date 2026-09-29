'use client';

import { useEffect, useRef, useState } from 'react';
import { ArcRotateCamera, Color4, Engine, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';
import { syncResponsiveCameraZoom } from '@/3d/controls/missionCamera';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';
import { logger } from '@/lib/logger';
import styles from './BabylonCanvas.module.css';

export type BabylonSceneContext = {
  engine: Engine;
  scene: Scene;
  canvas: HTMLCanvasElement;
};

type SceneReadyHandler = (
  ctx: BabylonSceneContext,
) => void | (() => void) | Promise<void | (() => void)>;

type BabylonCanvasProps = {
  className?: string;
  /** Construit le contenu de scène ; peut retourner un cleanup dédié. */
  onSceneReady?: SceneReadyHandler;
  loadingMessage?: string;
  /** Remplit le parent sans min-height forcée (missions immersives). */
  fill?: boolean;
  /** Phone framing margin; leaves the desktop projection unchanged. */
  mobileFovScale?: number;
};

/**
 * Canvas Babylon réutilisable — un Engine/Scene par montage.
 * Boot différé (setTimeout 0) pour survivre au double-mount React Strict Mode :
 * le premier effet est annulé avant création WebGL / chargement GLB.
 */
export function BabylonCanvas({
  className,
  onSceneReady,
  loadingMessage = 'Chargement de la scène…',
  fill = false,
  mobileFovScale = 1.4,
}: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onSceneReadyRef = useRef<SceneReadyHandler | undefined>(onSceneReady);
  const mobileFovScaleRef = useRef(mobileFovScale);
  const resizeRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onSceneReadyRef.current = onSceneReady;
  }, [onSceneReady]);

  useEffect(() => {
    mobileFovScaleRef.current = mobileFovScale;
    resizeRef.current?.();
  }, [mobileFovScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let engine: Engine | undefined;
    let scene: Scene | undefined;
    let userCleanup: (() => void) | undefined;
    let contextLostHandler: ((event: Event) => void) | undefined;
    let contextRestoredHandler: (() => void) | undefined;
    let booting = false;

    let mainCamera: ArcRotateCamera | undefined;
    const mobileLayout = window.matchMedia(MOBILE_GAME_QUERY);
    const onResize = () => {
      engine?.resize();
      if (!mainCamera) return;
      // Fit the smaller game area without changing camera targets, zoom gestures or PiP cameras.
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      mainCamera.fov = mobileLayout.matches
        ? 2 *
          Math.atan(
            Math.tan(0.8 / 2) *
              Math.max(mobileFovScaleRef.current, mobileFovScaleRef.current / aspect),
          )
        : 0.8;
    };
    const onResponsiveLayoutChange = () => {
      onResize();
      if (mainCamera) syncResponsiveCameraZoom(mainCamera);
    };

    resizeRef.current = onResize;
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);

    const tearDown = () => {
      try {
        userCleanup?.();
      } catch (error) {
        logger.error('Erreur cleanup scène', error);
      }
      userCleanup = undefined;
      engine?.stopRenderLoop();
      scene?.dispose();
      engine?.dispose();
      scene = undefined;
      engine = undefined;
    };

    const boot = async () => {
      if (disposed) return;
      booting = true;
      try {
        engine = new Engine(canvas, true, {
          adaptToDeviceRatio: true,
          preserveDrawingBuffer: true,
          stencil: true,
        });
        scene = new Scene(engine);
        scene.clearColor = new Color4(0.03, 0.05, 0.09, 1);
        scene.useRightHandedSystem = true;

        const camera = new ArcRotateCamera(
          'defaultCamera',
          -Math.PI / 2,
          Math.PI / 2.4,
          2.6,
          Vector3.Zero(),
          scene,
        );
        mainCamera = camera;
        onResize();
        camera.attachControl(canvas, true);
        // Molette = translation (typings attachControl ≤ 3 args)
        camera._panningMouseButton = 1;
        camera.lowerRadiusLimit = 2.2;
        camera.upperRadiusLimit = 10;
        camera.wheelPrecision = 40;
        camera.pinchPrecision = 40;
        camera.wheelDeltaPercentage = 0.02;
        camera.pinchDeltaPercentage = 0.02;
        new HemisphericLight('defaultLight', new Vector3(0, 1, 0), scene);

        mobileLayout.addEventListener('change', onResponsiveLayoutChange);
        window.addEventListener('resize', onResponsiveLayoutChange);
        window.addEventListener('orientationchange', onResponsiveLayoutChange);

        contextLostHandler = (event: Event) => {
          event.preventDefault();
          logger.warn('Contexte WebGL perdu');
        };
        contextRestoredHandler = () => {
          logger.info('Contexte WebGL restauré');
          engine?.resize();
        };
        canvas.addEventListener('webglcontextlost', contextLostHandler, false);
        canvas.addEventListener('webglcontextrestored', contextRestoredHandler, false);

        // Render loop avant onSceneReady (animations / appear).
        engine.runRenderLoop(() => {
          if (!disposed) scene?.render();
        });
        engine.resize();

        if (disposed) {
          tearDown();
          return;
        }

        const handler = onSceneReadyRef.current;
        if (handler) {
          const result = await handler({ engine, scene, canvas });
          if (typeof result === 'function') {
            userCleanup = result;
          }
        }

        if (disposed) {
          tearDown();
          return;
        }

        window.setTimeout(() => {
          if (!disposed) setReady(true);
        }, 0);
      } catch (error) {
        logger.error('Échec initialisation Babylon', error);
        tearDown();
        window.setTimeout(() => {
          if (!disposed) setFailed(true);
        }, 0);
      } finally {
        booting = false;
        // Cleanup demandé pendant un await (GLB) : tout libérer maintenant
        if (disposed) {
          tearDown();
        }
      }
    };

    // Laisse passer le unmount Strict Mode avant toute alloc WebGL
    const startId = window.setTimeout(() => {
      void boot();
    }, 0);

    return () => {
      disposed = true;
      window.clearTimeout(startId);
      resizeObserver.disconnect();
      resizeRef.current = null;
      mobileLayout.removeEventListener('change', onResponsiveLayoutChange);
      window.removeEventListener('resize', onResponsiveLayoutChange);
      window.removeEventListener('orientationchange', onResponsiveLayoutChange);
      if (contextLostHandler) {
        canvas.removeEventListener('webglcontextlost', contextLostHandler);
      }
      if (contextRestoredHandler) {
        canvas.removeEventListener('webglcontextrestored', contextRestoredHandler);
      }
      if (!booting) {
        tearDown();
        logger.debug('BabylonCanvas disposé');
      }
      // si booting : le finally de boot() appellera tearDown
    };
  }, []);

  return (
    <div className={`${styles.root} ${fill ? styles.fill : ''} ${className ?? ''}`}>
      {!ready && !failed ? (
        <div className={styles.overlay}>
          <LoadingScreen message={loadingMessage} />
        </div>
      ) : null}
      {failed ? (
        <div className={styles.overlay}>
          <p className={styles.fail}>La scène 3D n&apos;a pas pu démarrer sur cet appareil.</p>
        </div>
      ) : null}
      <canvas ref={canvasRef} className={styles.canvas} aria-label="Scène 3D Mission Cosmos" />
    </div>
  );
}
