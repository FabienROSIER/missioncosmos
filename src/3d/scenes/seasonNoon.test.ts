import { Quaternion, Vector3 } from '@babylonjs/core';
import { describe, expect, it } from 'vitest';
import { EARTH_AXIAL_TILT_DEG, NORTH_SUMMER_ANGLE } from '@/content/bodies/seasonsLearning';
import {
  earthNoonQuaternion,
  franceLocalDirection,
  franceSunElevationRad,
  noonSunBand,
  pipSunAngularRadius,
  pipSunDiscRadius,
  pipSunViewCenter,
  seasonPipFramesSunAndGround,
  sunFaceCameraFov,
} from './seasonNoon';

const TILT = (EARTH_AXIAL_TILT_DEG * Math.PI) / 180;

function toSunAt(orbitAngle: number): Vector3 {
  return new Vector3(-Math.cos(orbitAngle), 0, -Math.sin(orbitAngle));
}

function alignment(toSun: Vector3, tiltRad: number): number {
  const q = earthNoonQuaternion(toSun, tiltRad);
  const france = franceLocalDirection();
  france.rotateByQuaternionToRef(q, france);
  const north = Vector3.Up();
  north.rotateByQuaternionToRef(q, north);
  north.normalize();
  france.normalize();
  const sun = toSun.clone().normalize();
  const project = (v: Vector3) => v.subtract(north.scale(Vector3.Dot(v, north))).normalize();
  return Vector3.Dot(project(france), project(sun));
}

describe('midi en France', () => {
  it('aligne la France avec le Soleil autour de l’axe', () => {
    for (const angle of [NORTH_SUMMER_ANGLE, 0, Math.PI, NORTH_SUMMER_ANGLE + Math.PI]) {
      expect(alignment(toSunAt(angle), TILT)).toBeGreaterThan(0.999);
    }
  });

  it('met le Soleil plus haut en été qu’en hiver', () => {
    const summer = franceSunElevationRad(toSunAt(NORTH_SUMMER_ANGLE), TILT);
    const winter = franceSunElevationRad(toSunAt(NORTH_SUMMER_ANGLE + Math.PI), TILT);
    const equinox = franceSunElevationRad(toSunAt(0), TILT);
    expect(summer).toBeGreaterThan(equinox);
    expect(equinox).toBeGreaterThan(winter);
    expect(noonSunBand(summer)).toBe('haut');
    expect(noonSunBand(winter)).toBe('bas');
    expect(seasonPipFramesSunAndGround(summer)).toBe(true);
    expect(seasonPipFramesSunAndGround(winter)).toBe(true);
    const steep = (35 * Math.PI) / 180;
    expect(
      seasonPipFramesSunAndGround(franceSunElevationRad(toSunAt(NORTH_SUMMER_ANGLE), steep), 0.08),
    ).toBe(true);
    expect(
      seasonPipFramesSunAndGround(
        franceSunElevationRad(toSunAt(NORTH_SUMMER_ANGLE + Math.PI), steep),
        0.2,
      ),
    ).toBe(true);
  });

  it('garde la même hauteur de Soleil sans inclinaison', () => {
    const summer = franceSunElevationRad(toSunAt(NORTH_SUMMER_ANGLE), 0);
    const winter = franceSunElevationRad(toSunAt(NORTH_SUMMER_ANGLE + Math.PI), 0);
    expect(Math.abs(summer - winter)).toBeLessThan(0.02);
    expect(noonSunBand(summer)).toBe('moyen');
  });

  it('garde la même taille de disque, seule la hauteur change', () => {
    const angular = pipSunAngularRadius(1.35, 5.2);
    const radius = pipSunDiscRadius(8, angular);
    expect(radius).toBeGreaterThan(1);
    expect(sunFaceCameraFov()).toBeCloseTo(2 * Math.asin(0.25), 5);

    const forward = new Vector3(0, Math.sin(0.38), Math.cos(0.38));
    const high = pipSunViewCenter(forward, new Vector3(0, Math.sin(1.15), Math.cos(1.15)), 8);
    const low = pipSunViewCenter(forward, new Vector3(0, Math.sin(0.3), Math.cos(0.3)), 8);
    expect(high).not.toBeNull();
    expect(low).not.toBeNull();
    const camUp = new Vector3(0, Math.cos(0.38), -Math.sin(0.38));
    expect(Vector3.Dot(high!, camUp)).toBeGreaterThan(Vector3.Dot(low!, camUp));
    expect(pipSunDiscRadius(8, angular)).toBeCloseTo(radius, 6);
  });

  it('ne renverse pas l’axe nord', () => {
    const q = earthNoonQuaternion(toSunAt(NORTH_SUMMER_ANGLE), TILT);
    const north = Vector3.Up();
    north.rotateByQuaternionToRef(q, north);
    const tiltOnly = Quaternion.RotationAxis(Vector3.Right(), TILT);
    const expected = Vector3.Up();
    expected.rotateByQuaternionToRef(tiltOnly, expected);
    expect(Vector3.Dot(north.normalize(), expected.normalize())).toBeGreaterThan(0.999);
  });
});
