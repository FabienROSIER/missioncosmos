import { skyPoints, type Constellation, type ConstellationId } from './constellations';

import meshData from './constellationArtworkMesh.json';

type Point = { x: number; y: number };
type Pair = [number, number];
type Registration = {
  source: Pair[];
  support: [Pair, Pair][];
  grid: Pair[];
  triangles: [number, number, number][];
};

// Measured anatomical landmarks in the untrimmed bitmap, normalized to 1000².
// Only the illustration is fitted; astronomical star coordinates never change.
const REGISTRATIONS = meshData as Partial<Record<ConstellationId, Registration>>;

/** Serialize only useful SVG precision. Native Math implementations can differ
 * in their final floating-point bits between Node and the browser during SSR. */
export function artworkMatrix(matrix: number[]) {
  return matrix.map((value) => String(Number(value.toFixed(6)))).join(' ');
}

/** Overlap texture clips slightly to cover subpixel antialiasing gaps on phones.
 * Group opacity is applied after compositing, so overlaps never brighten the art. */
export function artworkClipPoints(points: [Point, Point, Point]) {
  const center = {
    x: points.reduce((sum, p) => sum + p.x, 0) / 3,
    y: points.reduce((sum, p) => sum + p.y, 0) / 3,
  };
  const normal = (a: Point, b: Point) => {
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const n = { x: (a.y - b.y) / length, y: (b.x - a.x) / length };
    const sign = n.x * (a.x - center.x) + n.y * (a.y - center.y) > 0 ? 1 : -1;
    return { x: n.x * sign, y: n.y * sign };
  };
  return points
    .map((p, i) => {
      const a = normal(points[(i + 2) % 3]!, p),
        b = normal(p, points[(i + 1) % 3]!);
      const factor = 3 / (1 + a.x * b.x + a.y * b.y);
      return `${(p.x + factor * (a.x + b.x)).toFixed(4)},${(p.y + factor * (a.y + b.y)).toFixed(4)}`;
    })
    .join(' ');
}

export function artworkMesh(item: Constellation) {
  const registration = REGISTRATIONS[item.id];
  if (!registration) return null;
  const controls = [...registration.source, ...registration.support.map(([from]) => from)].map(
    ([x, y]) => ({ x, y }),
  );
  const destinations = [
    ...skyPoints(item),
    ...registration.support.map(([, [x, y]]) => ({ x, y })),
  ];
  const interpolate = smoothRegistration(controls, destinations);
  const grid = registration.grid.map(([x, y]) => ({ x, y }));
  const source = [...controls, ...grid];
  const target = [...destinations, ...grid.map(interpolate)];
  return registration.triangles.map((indices) => {
    const from = indices.map((i) => source[i]!) as [Point, Point, Point];
    const to = indices.map((i) => target[i]!) as [Point, Point, Point];
    return { from, to, matrix: triangleTransform(from, to) };
  });
}

const radial = (a: Point, b: Point) => {
  const r = ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) / 1e6;
  return r === 0 ? 0 : r * Math.log(r);
};

/** Thin-plate spline: smooth the anatomy between exact painted landmarks. */
function smoothRegistration(source: Point[], target: Point[]) {
  const count = source.length;
  const rows = source.map((p, i) => [
    ...source.map((q) => radial(p, q)),
    1,
    p.x / 1000,
    p.y / 1000,
    target[i]!.x - p.x,
    target[i]!.y - p.y,
  ]);
  rows.push(
    [...source.map(() => 1), 0, 0, 0, 0, 0],
    [...source.map((p) => p.x / 1000), 0, 0, 0, 0, 0],
    [...source.map((p) => p.y / 1000), 0, 0, 0, 0, 0],
  );
  const n = count + 3;
  for (let column = 0; column < n; column++) {
    let pivot = column;
    for (let row = column + 1; row < n; row++)
      if (Math.abs(rows[row]![column]!) > Math.abs(rows[pivot]![column]!)) pivot = row;
    [rows[column], rows[pivot]] = [rows[pivot]!, rows[column]!];
    const divisor = rows[column]![column]!;
    for (let j = column; j < n + 2; j++) rows[column]![j]! /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const multiplier = rows[row]![column]!;
      for (let j = column; j < n + 2; j++) rows[row]![j]! -= multiplier * rows[column]![j]!;
    }
  }
  return (p: Point): Point => {
    const weights = [...source.map((q) => radial(p, q)), 1, p.x / 1000, p.y / 1000];
    return {
      x: p.x + weights.reduce((sum, w, i) => sum + w * rows[i]![n]!, 0),
      y: p.y + weights.reduce((sum, w, i) => sum + w * rows[i]![n + 1]!, 0),
    };
  };
}

/** SVG affine matrix taking three source landmarks to their three sky positions. */
export function triangleTransform(from: [Point, Point, Point], to: [Point, Point, Point]) {
  const [p, q, r] = from;
  const denominator = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
  const coefficients = (axis: 'x' | 'y'): [number, number, number] => {
    const u = to[1][axis] - to[0][axis],
      v = to[2][axis] - to[0][axis];
    const a = (u * (r.y - p.y) - v * (q.y - p.y)) / denominator;
    const b = (v * (q.x - p.x) - u * (r.x - p.x)) / denominator;
    return [a, b, to[0][axis] - a * p.x - b * p.y];
  };
  const [a, c, e] = coefficients('x'),
    [b, d, f] = coefficients('y');
  return [a, b, c, d, e, f];
}
