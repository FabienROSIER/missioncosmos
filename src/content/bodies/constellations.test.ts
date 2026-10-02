import { describe, expect, it } from 'vitest';
import {
  CONSTELLATIONS,
  cygnusModel,
  filmView,
  getConstellation,
  perspectiveSolved,
  perspectiveOffset,
  CONSTELLATION_OBSERVER_POSITION,
  skyPoints,
} from './constellations';
import { MISSION_CONSTELLATIONS } from '@/content/missions/mission-constellations';
import { validateMission } from '@/content/missions/validateMission';
import { getCatalogEntry } from '@/content/missions/catalog';
import { artworkClipPoints, artworkMatrix, artworkMesh } from './constellationArtwork';
import meshData from './constellationArtworkMesh.json';

describe('constellations and perspective', () => {
  it('extends both swan wings without shifting the established illustration anchors', () => {
    const swan = getConstellation('cygnus');
    const original = { ...swan, stars: swan.stars.slice(0, 5), projectionAnchorCount: undefined };
    const points = skyPoints(swan);
    expect(swan.stars).toHaveLength(7);
    expect(points.slice(0, 5)).toEqual(skyPoints(original));
    expect(swan.edges).toContainEqual([4, 5]);
    expect(swan.edges).toContainEqual([3, 6]);
    expect(points[5]!.x).toBeLessThan(points[4]!.x);
    expect(points[6]!.x).toBeGreaterThan(points[3]!.x);
  });
  it('serializes SVG geometry consistently despite native Math rounding differences', () => {
    expect(artworkMatrix([1, 0, 0, 1, -1e-13, 1e-13])).toBe(artworkMatrix([1, 0, 0, 1, 0, 0]));
    for (const id of ['cassiopeia', 'ursa-major', 'aquila'] as const) {
      for (const triangle of artworkMesh(getConstellation(id))!) {
        expect(artworkMatrix(triangle.matrix.map((value) => value + 1e-13))).toBe(
          artworkMatrix(triangle.matrix),
        );
        const perturbed = triangle.to.map((p) => ({
          x: p.x + 1e-10,
          y: p.y - 1e-10,
        })) as typeof triangle.to;
        expect(artworkClipPoints(perturbed)).toBe(artworkClipPoints(triangle.to));
        const rendered = artworkMatrix(triangle.matrix).split(' ').map(Number);
        // Six-decimal transform coefficients retain far better than pixel accuracy.
        triangle.from.forEach((p, i) => {
          expect(
            Math.abs(rendered[0]! * p.x + rendered[2]! * p.y + rendered[4]! - triangle.to[i]!.x),
          ).toBeLessThan(0.002);
          expect(
            Math.abs(rendered[1]! * p.x + rendered[3]! * p.y + rendered[5]! - triangle.to[i]!.y),
          ).toBeLessThan(0.002);
        });
      }
    }
  });
  it('fits every painted landmark without reversing or tearing the texture', () => {
    for (const id of ['cassiopeia', 'ursa-major', 'aquila'] as const) {
      const item = getConstellation(id),
        points = skyPoints(item),
        mesh = artworkMesh(item)!;
      expect(mesh.length).toBeGreaterThan(0);
      for (const triangle of mesh) {
        const [a, b, c, d, e, f] = triangle.matrix as [
          number,
          number,
          number,
          number,
          number,
          number,
        ];
        expect(a * d - b * c).toBeGreaterThan(0);
        expect(triangle.matrix.every(Number.isFinite)).toBe(true);
        for (const point of triangle.to)
          expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true);
        meshData[id].source.forEach(([x, y], i) => {
          if (!triangle.from.some((p) => p.x === x && p.y === y)) return;
          expect(a * x! + c * y! + e).toBeCloseTo(points[i]!.x, 6);
          expect(b * x! + d * y! + f).toBeCloseTo(points[i]!.y, 6);
        });
      }
    }
    expect(artworkMesh(getConstellation('cygnus'))).toBeNull();
    expect(artworkMesh(getConstellation('orion'))).toBeNull();
  });
  it('gives the eagle a connected head, body, two wings and tail', () => {
    const eagle = getConstellation('aquila');
    expect(eagle.stars).toHaveLength(8);
    expect(eagle.edges).toContainEqual([4, 3]);
    expect(eagle.edges).toContainEqual([4, 5]);
    expect(eagle.edges).toContainEqual([5, 6]);
    expect(eagle.edges).toContainEqual([4, 7]);
    expect(new Set(eagle.edges.flat()).size).toBe(eagle.stars.length);
  });
  it('projects every target and all bear extensions inside the playable sky', () => {
    for (const item of CONSTELLATIONS) {
      const points = skyPoints(item);
      for (const p of points) {
        expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
        const margin = item.id === 'ursa-major' ? 110 : item.id === 'cygnus' ? 65 : 175;
        expect(p.x).toBeGreaterThanOrEqual(margin);
        expect(p.x).toBeLessThanOrEqual(1000 - margin);
        expect(p.y).toBeGreaterThanOrEqual(margin);
        expect(p.y).toBeLessThanOrEqual(1000 - margin);
      }
      for (const [a, b] of [...item.edges, ...(item.extraEdges ?? [])]) {
        expect(points[a]).toBeDefined();
        expect(points[b]).toBeDefined();
      }
    }
  });
  it('keeps the enlarged bear upright with separate head and paw branches', () => {
    const bear = getConstellation('ursa-major'),
      points = skyPoints(bear);
    expect(bear.stars).toHaveLength(7);
    expect(bear.extraStars).toHaveLength(11);
    expect(points[6]!.x).toBeLessThan(points[3]!.x);
    expect(points[6]!.y).toBeLessThan(points[3]!.y);
    expect(points[7]!.x).toBeGreaterThan(points[0]!.x);
    expect(points[10]!.y).toBeGreaterThan(points[7]!.y);
    expect(
      Math.max(...points.slice(0, 7).map((p) => p.y)) -
        Math.min(...points.slice(0, 7).map((p) => p.y)),
    ).toBeGreaterThan(400);
    for (const chain of [
      [0, 8],
      [8, 7],
      [9, 10],
      [10, 11],
      [1, 12],
      [12, 13],
      [13, 14],
      [2, 15],
      [15, 16],
      [16, 17],
    ])
      expect(bear.extraEdges).toContainEqual(chain);
    expect(bear.extraEdges).not.toContainEqual([0, 7]);
    expect(bear.extraEdges).not.toContainEqual([1, 8]);
  });
  it('uses different fixed depths that reproduce the sky exactly from the observer origin', () => {
    const sky = skyPoints(getConstellation('cygnus'));
    const model = cygnusModel();
    expect(new Set(model.map((p) => p.z)).size).toBe(7);
    model.forEach((p, i) => {
      expect(500 + (p.x / p.z) * 900).toBeCloseTo(sky[i]!.x);
      expect(500 - (p.y / p.z) * 900).toBeCloseTo(sky[i]!.y);
    });
    const side = model.map((p) => 500 + ((p.x - 40) / p.z) * 900);
    expect(Math.abs(side[0]! - sky[0]!.x)).not.toBeCloseTo(Math.abs(side[2]! - sky[2]!.x));
  });
  it('returns the camera to the origin, without moving the stars', () => {
    expect(filmView(0).offset).toBe(0);
    expect(filmView(9).offset).toBe(1);
    expect(filmView(16.5).offset).toBe(0);
    expect(filmView(9).artVisible).toBe(false);
    expect(filmView(16.5).artVisible).toBe(true);
    expect(perspectiveSolved(CONSTELLATION_OBSERVER_POSITION)).toBe(true);
    expect(perspectiveSolved(CONSTELLATION_OBSERVER_POSITION + 3)).toBe(true);
    expect(perspectiveSolved(CONSTELLATION_OBSERVER_POSITION - 3)).toBe(true);
    expect(perspectiveSolved(CONSTELLATION_OBSERVER_POSITION + 4)).toBe(false);
    expect(perspectiveSolved(0)).toBe(false);
    expect(perspectiveSolved(100)).toBe(false);
    expect(perspectiveOffset(0)).toBeLessThan(0);
    expect(perspectiveOffset(100)).toBeGreaterThan(0);
    expect(perspectiveOffset(CONSTELLATION_OBSERVER_POSITION)).toBe(0);
    expect(perspectiveSolved(68)).toBe(false);
  });
  it('registers the mission and requires the main drawings, viewpoint, film and explanation', () => {
    expect(validateMission(MISSION_CONSTELLATIONS)).toEqual([]);
    expect(getCatalogEntry('mission-09')?.unlocksNextId).toBe(MISSION_CONSTELLATIONS.id);
    expect(getCatalogEntry(MISSION_CONSTELLATIONS.id)?.unlocksNextId).toBe('mission-10');
    for (const id of [
      'mc-cassiopeia',
      'mc-ursa-major',
      'mc-cygnus',
      'mc-orion',
      'mc-perspective',
      'mc-film',
      'mc-understand',
      'mc-quiz',
    ]) {
      expect(MISSION_CONSTELLATIONS.steps.find((s) => s.id === id)?.requiresSuccess).toBe(true);
    }
    expect(
      MISSION_CONSTELLATIONS.steps.find((s) => s.id === 'mc-aquila')?.requiresSuccess,
    ).not.toBe(true);
  });
});
