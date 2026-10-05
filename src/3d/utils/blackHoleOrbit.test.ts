import { describe, expect, it } from 'vitest';
import { eccentricAnomaly, orbitPoint, orbitSpeedRatio } from './blackHoleOrbit';

describe('black-hole Keplerian teaching orbits', () => {
  const a = 5.5,
    e = 0.62;
  it('places the focus at the black hole, with the expected nearest and farthest distances', () => {
    expect(orbitPoint(a, e, 0, 0).x).toBeCloseTo(a * (1 - e), 10);
    expect(orbitPoint(a, e, Math.PI, 0).x).toBeCloseTo(-a * (1 + e), 10);
  });
  it('closes after a period and handles negative time', () => {
    for (const mean of [-18, -2, 0, 1, 9, 36]) {
      const one = orbitPoint(a, e, eccentricAnomaly(mean, e), 0.2);
      const two = orbitPoint(a, e, eccentricAnomaly(mean + 2 * Math.PI, e), 0.2);
      expect(one.x).toBeCloseTo(two.x, 9);
      expect(one.z).toBeCloseTo(two.z, 9);
    }
  });
  it('sweeps equal areas in equal times, rather than moving uniformly along the ellipse', () => {
    const dt = 1e-5;
    const momenta = [0, 0.6, 1.5, Math.PI].map((time) => {
      const p = orbitPoint(a, e, eccentricAnomaly(time, e), 0);
      const next = orbitPoint(a, e, eccentricAnomaly(time + dt, e), 0);
      return (p.x * next.z - p.z * next.x) / dt;
    });
    momenta.forEach((momentum) => expect(momentum).toBeCloseTo(a * a * Math.sqrt(1 - e * e), 5));
  });
  it('moves fastest at periapsis with the expected speed ratio', () => {
    expect(orbitSpeedRatio(e, Math.PI)).toBeCloseTo(1, 10);
    expect(orbitSpeedRatio(e, 0)).toBeCloseTo((1 + e) / (1 - e), 10);
    expect(orbitSpeedRatio(0, 2)).toBe(1);
  });
});
