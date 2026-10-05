/** Keplerian teaching model, far-field approximation; distances are display units.
 * Focus at the origin. E is eccentric anomaly, M advances uniformly in time.
 */
export function eccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
  const mean =
    ((((meanAnomaly + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
  let eccentric = mean;
  for (let iteration = 0; iteration < 12; iteration++) {
    const correction =
      (eccentric - eccentricity * Math.sin(eccentric) - mean) /
      (1 - eccentricity * Math.cos(eccentric));
    eccentric -= correction;
    if (Math.abs(correction) < 1e-12) break;
  }
  return eccentric;
}

export function orbitPoint(a: number, e: number, eccentric: number, inclination: number) {
  const across = a * Math.sqrt(1 - e * e) * Math.sin(eccentric);
  return {
    x: a * (Math.cos(eccentric) - e),
    y: across * Math.sin(inclination),
    z: across * Math.cos(inclination),
  };
}

export function orbitSpeedRatio(e: number, eccentric: number) {
  // Vis-viva speed relative to apocentre; independent of chosen display units.
  const radiusOverA = 1 - e * Math.cos(eccentric);
  return Math.sqrt(((2 / radiusOverA - 1) * (1 + e)) / (1 - e));
}
