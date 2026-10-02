/** Artistically sampled barred disk, not a star catalogue or a map of individual stars. */
export const GALAXY_RADIUS = 16;
export const SUN_NEIGHBOURHOOD = { x: 7.7, y: 0.12, z: 3.1 };
export const GALAXY_JOURNEY_DURATION = 8;
export const GALACTIC_ORBIT_DURATION = 5;
export const GALACTIC_ROUTES = [
  {
    id: 'a',
    hint: 'Ce petit cercle tourne autour d’un autre point. Cherche un chemin autour du centre de la galaxie.',
  },
  { id: 'b', hint: '' },
  {
    id: 'c',
    hint: 'Ce chemin plonge vers le centre. Le Soleil tourne autour du centre, il ne tombe pas dedans.',
  },
] as const;
export type GalacticRouteId = (typeof GALACTIC_ROUTES)[number]['id'];
/** Three illustrative paths, all beginning at the Sun; B is a circular galactic orbit. */
export function galacticRoutePosition(id: GalacticRouteId, progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const { x, y, z } = SUN_NEIGHBOURHOOD;
  const radius = Math.hypot(x, z);
  const start = Math.atan2(z, x);
  const angle = start - p * Math.PI * 2;
  if (id === 'a') {
    return { x: x - 2 + 2 * Math.cos(p * Math.PI * 2), y, z: z + 2 * Math.sin(p * Math.PI * 2) };
  }
  const r = id === 'c' ? radius * (1 - p) : radius;
  return { x: r * Math.cos(angle), y, z: r * Math.sin(angle) };
}
/** Unnamed illustrative neighbouring stars, not a positional catalogue of nearby stars. */
export const SOLAR_NEIGHBOUR_STARS = [
  { x: -1.8, y: 0.6, z: -1.1, color: [1, 0.58, 0.42, 0.9] },
  { x: 2.1, y: -0.5, z: 1.4, color: [0.82, 0.9, 1, 0.85] },
  { x: -3.2, y: -1.1, z: 2.3, color: [1, 0.85, 0.67, 0.8] },
  { x: 0.7, y: 1.8, z: -3.4, color: [0.8, 0.9, 1, 0.9] },
  { x: 3.7, y: 0.8, z: -2.1, color: [1, 0.75, 0.57, 0.8] },
  { x: -4.3, y: 1.2, z: -2.9, color: [0.82, 0.9, 1, 0.8] },
  { x: 2.9, y: -1.6, z: 3.8, color: [1, 0.87, 0.7, 0.8] },
  { x: -0.8, y: 2.1, z: 4.4, color: [0.82, 0.9, 1, 0.85] },
] as const;

const fade = (progress: number, from: number, to: number) => {
  const t = Math.max(0, Math.min(1, (progress - from) / (to - from)));
  return t * t * (3 - 2 * t);
};
/** Overlapping views preserve context while the enlarged planets become invisible. */
export function galaxyTransition(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  // Cross several orders of magnitude before the galactic view takes over:
  // by p=0.12 the local neighbourhood spans under 0.1% of the galactic diameter.
  // This is a compressed scale transition, not a physical distance calibration.
  const neighboursScale = Math.exp((Math.log(0.003) * Math.max(0, p - 0.025)) / 0.095);
  return {
    solarScale: Math.exp(-60 * p),
    sunOpacity: fade(p, 0.012, 0.04),
    neighboursOpacity: fade(p, 0.003, 0.025) * (1 - fade(p, 0.12, 0.24)),
    neighboursScale,
    // Reduce the light cores too, so eight fixed-size sprites do not pile up on the Sun.
    neighboursPointSize: Math.max(1, 5 * Math.sqrt(neighboursScale)),
    galaxyOpacity: fade(p, 0.025, 0.22),
    glowOpacity: fade(p, 0.04, 0.6),
  };
}
export const GALAXY_LOCATIONS = [
  {
    id: 'a',
    title: 'Repère A',
    x: 18.5,
    y: 0.12,
    z: -4,
    correct: false,
    hint: 'Ce repère est hors du disque. Notre Système solaire fait partie de la galaxie.',
  },
  {
    id: 'b',
    title: 'Repère B',
    x: 0,
    y: 0.6,
    z: 0,
    correct: false,
    hint: 'C’est le centre. Le Soleil est bien plus loin, dans un petit bras du disque.',
  },
  { id: 'c', title: 'Repère C', ...SUN_NEIGHBOURHOOD, correct: true, hint: '' },
] as const;

// Independent fixed integer hashes avoid visible bands in the educational point cloud.
const sample = (index: number, seed: number) => {
  let value = Math.imul(index + 1, seed);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
};
export function galaxyPoints(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const u = sample(index, 73);
    const v = sample(index, 137);
    const w = sample(index, 271);
    if (index % 5 === 0) {
      const r = Math.min(2.8, Math.sqrt(-2 * Math.log(Math.max(u, 0.001)))),
        angle = v * Math.PI * 2;
      const vertical =
        Math.min(2.8, Math.sqrt(-2 * Math.log(Math.max(w, 0.001)))) *
        Math.sin(sample(index, 397) * Math.PI * 2);
      return {
        x: r * Math.cos(angle) * 2.2,
        y: vertical * 0.55,
        z: r * Math.sin(angle) * 1.35,
        warm: true,
      };
    }
    const r = 1.2 + 14.4 * Math.pow(u, 0.65);
    const arm = index % 4;
    const angle =
      (arm * Math.PI) / 2 + Math.log(r / 2.4) * 2.6 + (v - 0.5) * (index % 7 === 0 ? 6.28 : 0.65);
    return {
      x: r * Math.cos(angle),
      y: (w - 0.5) * (0.35 + 0.025 * r),
      z: r * Math.sin(angle),
      warm: false,
    };
  });
}
export function galaxyJourney(seconds: number) {
  const t = Math.max(0, Math.min(1, seconds / GALAXY_JOURNEY_DURATION));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
