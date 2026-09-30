import { afterEach, describe, expect, it } from 'vitest';
import { Color3, NullEngine, Scene, Vector3 } from '@babylonjs/core';
import { createLightBeam } from './colourLight';

const engines: NullEngine[] = [];
afterEach(() => engines.splice(0).forEach((engine) => engine.dispose()));

function setup() {
  const engine = new NullEngine();
  engines.push(engine);
  return new Scene(engine);
}

describe('light-beam rendering safety', () => {
  it.each(['low', 'medium', 'high'] as const)(
    'keeps %s geometry bounded with no degenerate vertices',
    (quality) => {
      const scene = setup();
      const root = createLightBeam(
        scene,
        'beam',
        Vector3.Zero(),
        new Vector3(5, 1, 0),
        Color3.White(),
        undefined,
        quality,
      );
      const meshes = root.getChildMeshes();
      expect(meshes.length).toBeLessThanOrEqual(quality === 'high' ? 3 : 2);
      for (const mesh of meshes) {
        expect(mesh.getTotalVertices()).toBe(4);
        expect(mesh.getVerticesData('position')?.every(Number.isFinite)).toBe(true);
        expect(mesh.getVerticesData('normal')?.every(Number.isFinite)).toBe(true);
        expect(mesh.isPickable).toBe(false);
      }
      scene.dispose();
      expect(scene.meshes).toHaveLength(0);
      expect(scene.materials).toHaveLength(0);
    },
  );

  it('handles a vertical beam without a zero cross-product or NaN', () => {
    const scene = setup();
    const root = createLightBeam(
      scene,
      'vertical',
      Vector3.Zero(),
      Vector3.Up(),
      Color3.White(),
      undefined,
      'low',
    );
    expect(
      root
        .getChildMeshes()
        .every((mesh) => mesh.getVerticesData('position')!.every(Number.isFinite)),
    ).toBe(true);
  });

  it('ignores a zero-length beam instead of constructing invalid geometry', () => {
    const scene = setup();
    const root = createLightBeam(
      scene,
      'empty',
      Vector3.Zero(),
      Vector3.Zero(),
      Color3.White(),
      undefined,
      'high',
    );
    expect(root.getChildMeshes()).toHaveLength(0);
  });
});
