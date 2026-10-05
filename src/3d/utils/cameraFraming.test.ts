import { Vector3 } from '@babylonjs/core';
import { describe, expect, it } from 'vitest';
import {
  cameraPositionForAnchorView,
  cameraRadiusForSphere,
  clearanceShiftNdc,
  eclipseViewDirection,
  enclosingSphere,
  profileViewDirection,
  sunEarthFramingSpheres,
  sunEarthMoonFramingSpheres,
} from '@/3d/utils/cameraFraming';

function angularGap(
  camera: Vector3,
  near: Vector3,
  nearRadius: number,
  far: Vector3,
  farRadius: number,
): number {
  const toNear = near.subtract(camera);
  const toFar = far.subtract(camera);
  const separation = Math.asin(
    Math.min(1, Vector3.Cross(toNear, toFar).length() / (toNear.length() * toFar.length())),
  );
  const nearHalf = Math.asin(Math.min(1, nearRadius / toNear.length()));
  const farHalf = Math.asin(Math.min(1, farRadius / toFar.length()));
  return separation + farHalf - nearHalf;
}

describe('cadrage Soleil + Terre', () => {
  it('englobe deux sphères sans en couper une', () => {
    const enclosed = enclosingSphere([
      { center: new Vector3(0, 0, 0), radius: 1 },
      { center: new Vector3(8, 0, 0), radius: 2 },
    ]);
    expect(enclosed.radius).toBeCloseTo(5.5);
    expect(enclosed.center.x).toBeCloseTo(4.5);
    expect(Vector3.Distance(enclosed.center, Vector3.Zero()) + 1).toBeLessThanOrEqual(
      enclosed.radius + 1e-6,
    );
    expect(Vector3.Distance(enclosed.center, new Vector3(8, 0, 0)) + 2).toBeLessThanOrEqual(
      enclosed.radius + 1e-6,
    );
  });

  it('éloigne la caméra quand le cadre est étroit', () => {
    const wide = cameraRadiusForSphere(5, 0.8, 1.6, 0.14);
    const portrait = cameraRadiusForSphere(5, 0.8, 0.55, 0.14);
    expect(portrait).toBeGreaterThan(wide);
    expect(wide).toBeGreaterThan(5);
  });

  it('un fov plus ouvert rapproche la caméra', () => {
    const desktop = cameraRadiusForSphere(5, 0.8, 1.2, 0.14);
    const mobile = cameraRadiusForSphere(5, 1.15, 1.2, 0.14);
    expect(mobile).toBeLessThan(desktop);
  });

  it('place la caméra de profil à côté de la Terre, pas dans l’axe du Soleil', () => {
    const earth = Vector3.Zero();
    const sun = new Vector3(5.04, 2.52, 3.6);
    const toSun = sun.subtract(earth).normalize();
    const desired = profileViewDirection(toSun);
    const center = sun.scale(0.55);
    const camera = cameraPositionForAnchorView(earth, desired, center, 14.56);
    const fromEarth = camera.subtract(earth).normalize();
    const towardSun = Math.abs(Vector3.Dot(fromEarth, toSun));
    expect(towardSun).toBeLessThan(0.45);
    expect(fromEarth.y).toBeGreaterThan(0.15);
  });

  it('décale le cadrage vers la droite pour sortir du PiP bas-gauche', () => {
    const shift = clearanceShiftNdc(
      [{ x: -0.4, y: -0.2, rx: 0.13, ry: 0.18 }],
      { x0: -1, y0: -1, x1: -0.2, y1: 0.08 },
    );
    expect(shift.x).toBeGreaterThan(0.2);
    expect(shift.y).toBe(0);
  });

  it('met le jour/nuit de profil, un peu vers la face éclairée', () => {
    const toSun = new Vector3(1, 0, 0);
    const dir = profileViewDirection(toSun);
    expect(Math.abs(dir.z)).toBeGreaterThan(dir.x);
    expect(dir.x).toBeGreaterThan(0.08);
    expect(dir.y).toBeGreaterThan(0.2);
    expect(dir.y).toBeLessThan(0.45);
  });

  it('place l’éclipse derrière le Soleil et laisse dépasser la Lune', () => {
    const earth = Vector3.Zero();
    const sun = new Vector3(6.4, 0, 0);
    const toSun = sun.subtract(earth).normalize();
    const desired = eclipseViewDirection(toSun);
    const center = new Vector3(2.8, 0, 0);
    const camera = cameraPositionForAnchorView(earth, desired, center, 17);
    expect(camera.x).toBeGreaterThan(sun.x + 1.75);
    expect(camera.y).toBeGreaterThan(2);
    const moon = new Vector3(-2.55, 0, 0);
    expect(angularGap(camera, earth, 0.85, moon, 0.32)).toBeGreaterThan(0.02);
    expect(angularGap(camera, sun, 1.75, earth, 0.85)).toBeGreaterThan(0.02);
  });

  it('prévoit le halo du Soleil et l’orbite de la Lune', () => {
    const pair = sunEarthFramingSpheres(Vector3.Zero(), new Vector3(7, 0, 0), 1, 1.85);
    expect(pair[1]?.radius).toBeGreaterThan(1.85);
    const withMoon = sunEarthMoonFramingSpheres(
      Vector3.Zero(),
      new Vector3(6.4, 0, 0),
      2.55,
      0.85,
      1.75,
      0.32,
    );
    expect(withMoon[0]?.radius).toBeGreaterThanOrEqual(2.55 + 0.32);
  });
});
