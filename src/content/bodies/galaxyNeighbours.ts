export type NeighbourPosition = readonly [number, number, number];
/** Artistic layouts: same apparent pairs face-on, different depths. */
export const NEIGHBOUR_LAYOUTS: readonly (readonly NeighbourPosition[])[] = [
  [
    [-7, 0, -1],
    [-3, 0, -0.5],
    [3, 0, -8],
    [7, 0, 8],
  ],
  [
    [-7, 0, -8],
    [-3, 0, 8],
    [3, 0, 1],
    [7, 0, 1.6],
  ],
  [
    [-7, 1, 6],
    [-3, 1.3, 6.6],
    [3, -1, -8],
    [7, -1, 8],
  ],
];
export function neighbourDistance(a: NeighbourPosition, b: NeighbourPosition) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
export function closestGalaxyPair(positions: readonly NeighbourPosition[]) {
  let pair = [0, 1],
    distance = Infinity;
  positions.forEach((a, i) =>
    positions.forEach((b, j) => {
      if (j <= i) return;
      const d = neighbourDistance(a, b);
      if (d < distance) {
        distance = d;
        pair = [i, j];
      }
    }),
  );
  return pair;
}
export function isClosestGalaxyPair(
  positions: readonly NeighbourPosition[],
  selected: readonly number[],
) {
  const expected = closestGalaxyPair(positions);
  return selected.length === 2 && expected.every((i) => selected.includes(i));
}
