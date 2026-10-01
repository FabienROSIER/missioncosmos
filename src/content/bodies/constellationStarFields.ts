import catalogue from './constellationStarFields.json';
import { skyPoints, type Constellation, type SkyStar } from './constellations';

/** HYG 4.1, Astronexus, CC BY-SA 4.0. See docs/pedagogy/constellation-star-fields.md.
 * Curated fixed neighbourhoods; catalogue magnitudes are nominal visual magnitudes. */
export type FieldStar = SkyStar & {
  catalogId: string;
  magnitude: number;
  x: number;
  y: number;
  targetIndex: number | null;
};

export function constellationField(item: Constellation) {
  const data = catalogue[item.id];
  const anchors = [...item.stars, ...(item.extraStars ?? [])];
  const points = skyPoints(item);
  const anchorStars: FieldStar[] = anchors.map((star, index) => ({
    ...star,
    ...data.photometry[index]!,
    ...points[index]!,
    targetIndex: index < item.stars.length ? index : null,
  }));
  const neighborPoints = skyPoints(item, data.neighbors);
  const neighbors: FieldStar[] = data.neighbors.map((star, index) => ({
    ...star,
    ...neighborPoints[index]!,
    targetIndex: null,
  }));
  return {
    targets: anchorStars.slice(0, item.stars.length),
    extensions: anchorStars.slice(item.stars.length),
    neighbors,
  };
}

/** Magnitude already measures brightness logarithmically. Below magnitude 2,
 * grow gently; dimmer cores follow compressed relative flux to separate sizes.
 * Targets get just +3% radius/+4% opacity, independently of their magnitude. */
export function starAppearance(magnitude: number, assisted = false) {
  const flux = 10 ** (-0.4 * magnitude);
  const tone = flux ** 0.16;
  const referenceFlux = 10 ** (-0.4 * 2);
  const radius =
    magnitude < 2 ? 5.35 + 0.4 * (2 - magnitude) : 1.25 + 4.1 * (flux / referenceFlux) ** 0.25;
  const stable = (n: number) => Number(n.toFixed(4));
  return {
    radius: stable(radius * (assisted ? 1.03 : 1)),
    opacity: stable(Math.min(1, (0.55 + 0.4 * tone) * (assisted ? 1.04 : 1))),
    haloOpacity: stable(0.35 + 0.45 * tone),
  };
}

/** Resolve overlapping 48px touch areas by distance to the actual visible star,
 * independently of catalogue order and whether it belongs to the drawing. */
export function nearestFieldStar(stars: FieldStar[], x: number, y: number, skySize: number) {
  let nearest: FieldStar | null = null;
  let distance = 24;
  for (const star of stars) {
    const candidateDistance = (Math.hypot(star.x - x, star.y - y) * skySize) / 1000;
    if (candidateDistance < distance) {
      nearest = star;
      distance = candidateDistance;
    }
  }
  return nearest;
}
