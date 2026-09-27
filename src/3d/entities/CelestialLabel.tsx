'use client';

import { useEffect, useRef } from 'react';
import { Matrix, Vector3, type Camera, type Scene } from '@babylonjs/core';
import styles from './CelestialLabel.module.css';

type CelestialLabelProps = {
  scene: Scene | null;
  camera: Camera | null;
  worldPosition: Vector3 | null;
  text: string;
  visible?: boolean;
};

/** Label HTML 2D accroché à une position 3D (projection chaque frame). */
export function CelestialLabel({
  scene,
  camera,
  worldPosition,
  text,
  visible = true,
}: CelestialLabelProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!scene || !camera || !worldPosition || !visible) {
      el.style.opacity = '0';
      return;
    }

    const engine = scene.getEngine();
    const observer = scene.onBeforeRenderObservable.add(() => {
      const node = ref.current;
      if (!node) return;

      const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
      const projected = Vector3.Project(
        worldPosition,
        Matrix.Identity(),
        scene.getTransformMatrix(),
        viewport,
      );

      const w = engine.getRenderWidth();
      const h = engine.getRenderHeight();
      const inView =
        projected.z > 0 &&
        projected.z < 1 &&
        projected.x >= 0 &&
        projected.x <= w &&
        projected.y >= 0 &&
        projected.y <= h;

      node.style.opacity = inView ? '1' : '0';
      if (inView) {
        node.style.transform = `translate(-50%, -120%) translate(${projected.x}px, ${projected.y}px)`;
      }
    });

    return () => {
      scene.onBeforeRenderObservable.remove(observer);
    };
  }, [scene, camera, worldPosition, visible]);

  if (!visible) return null;

  return (
    <div ref={ref} className={styles.label} aria-hidden>
      {text}
    </div>
  );
}
