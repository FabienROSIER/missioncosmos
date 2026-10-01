import { describe, expect, it } from 'vitest';
import { CONSTELLATIONS, skyPoints } from './constellations';
import { constellationField, nearestFieldStar, starAppearance } from './constellationStarFields';

describe('fixed real star fields', () => {
  it('keeps the painted anchors unchanged and includes exactly ten distinct catalogued neighbours', () => {
    for (const item of CONSTELLATIONS) {
      const field = constellationField(item);
      expect(field.neighbors).toHaveLength(10);
      const all = [...field.targets, ...field.extensions, ...field.neighbors];
      expect(new Set(all.map((star) => star.catalogId)).size).toBe(all.length);
      expect([...field.targets, ...field.extensions].map(({ x, y }) => ({ x, y }))).toEqual(
        skyPoints(item),
      );
      for (const star of all) {
        expect(star.catalogId).toMatch(/^(HIP|HR) \d+$/);
        expect(Number.isFinite(star.magnitude)).toBe(true);
      }
      for (const star of field.neighbors) {
        expect(star.targetIndex).toBeNull();
        expect(star.x).toBeGreaterThanOrEqual(65);
        expect(star.x).toBeLessThanOrEqual(935);
        expect(star.y).toBeGreaterThanOrEqual(65);
        expect(star.y).toBeLessThanOrEqual(935);
      }
    }
  });
  it('preserves relative brightness and caps the target assistance', () => {
    for (let magnitude = 0; magnitude <= 6; magnitude += 0.25) {
      const normal = starAppearance(magnitude),
        aided = starAppearance(magnitude, true);
      expect(normal.radius).toBeGreaterThan(starAppearance(magnitude + 0.1).radius);
      expect(normal.opacity).toBeGreaterThan(starAppearance(magnitude + 0.1).opacity);
      expect(aided.radius / normal.radius).toBeCloseTo(1.03, 3);
      expect(aided.opacity / normal.opacity).toBeLessThanOrEqual(1.0402);
      expect(aided.haloOpacity).toBe(normal.haloOpacity);
    }
  });
  it('resolves overlapping mobile touch areas by visible distance, including neighbours', () => {
    for (const item of CONSTELLATIONS) {
      const field = constellationField(item),
        candidates = [...field.targets, ...field.neighbors];
      for (const star of candidates) {
        expect(nearestFieldStar(candidates, star.x, star.y, 300)?.catalogId).toBe(star.catalogId);
        expect(nearestFieldStar([...candidates].reverse(), star.x, star.y, 300)?.catalogId).toBe(
          star.catalogId,
        );
      }
      expect(nearestFieldStar(candidates, -500, -500, 300)).toBeNull();
    }
  });
});
