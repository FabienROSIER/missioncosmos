import { Vector3 } from '@babylonjs/core';
import { describe, expect, it } from 'vitest';
import { surfaceOrientationQuaternion } from '@/3d/scenes/companionSurfaceMarker';

const rotate = (vector: Vector3, outward: Vector3, look: Vector3) => {
  const result = Vector3.Zero();
  vector.rotateByQuaternionToRef(surfaceOrientationQuaternion(outward, look), result);
  return result;
};

describe('surfaceOrientationQuaternion', () => {
  it.each([
    [new Vector3(1, 0, 0), new Vector3(0, 0, 1)],
    [new Vector3(0.4, 0.6, 0.7), new Vector3(1, 0, 0)],
    [new Vector3(-0.7, 0.2, -0.5), new Vector3(0, 1, 0)],
  ])('garde le compagnon debout sur toute la sphère', (outward, look) => {
    const expectedUp = outward.clone().normalize();
    const actualUp = rotate(Vector3.Up(), outward, look);

    expect(Vector3.Dot(actualUp, expectedUp)).toBeGreaterThan(0.9999);
    expect(actualUp.length()).toBeCloseTo(1, 6);
  });

  it('produit une rotation pure sans déformation des axes', () => {
    const outward = new Vector3(0.35, -0.42, 0.84);
    const look = new Vector3(-0.8, 0.1, 0.5);
    const x = rotate(Vector3.Right(), outward, look);
    const y = rotate(Vector3.Up(), outward, look);
    const z = rotate(Vector3.Forward(), outward, look);

    expect(x.length()).toBeCloseTo(1, 6);
    expect(y.length()).toBeCloseTo(1, 6);
    expect(z.length()).toBeCloseTo(1, 6);
    expect(Vector3.Dot(x, y)).toBeCloseTo(0, 6);
    expect(Vector3.Dot(y, z)).toBeCloseTo(0, 6);
    expect(Vector3.Dot(z, x)).toBeCloseTo(0, 6);
    expect(Vector3.Dot(Vector3.Cross(x, y), z)).toBeGreaterThan(0.9999);
  });
});
