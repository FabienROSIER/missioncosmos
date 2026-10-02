import { galaxyPoints } from './milkyWay';

export const GALAXY_FAMILIES = ['spiral', 'elliptical', 'irregular'] as const;
export type GalaxyFamily = (typeof GALAXY_FAMILIES)[number];
export const GALAXY_FAMILY_LABELS: Record<GalaxyFamily, string> = {
  spiral: 'Spirale', elliptical: 'Elliptique', irregular: 'Irrégulière',
};
export const COSMIC_LEVELS = ['sun', 'system', 'galaxy'] as const;
export type CosmicLevel = (typeof COSMIC_LEVELS)[number];
export const COSMIC_LEVEL_LABELS: Record<CosmicLevel, string> = {
  sun: 'Le Soleil', system: 'Le Système solaire', galaxy: 'La Voie lactée',
};
export const IRREGULAR_CLUMPS = [
  [-6, 0, -2], [-2, 1.4, 1], [1, -0.5, 0], [5, 0, 4], [7, 1.1, -1], [-1, -1, -5],
] as const;

/** Authored educational shapes, not stellar catalogues. Seeded samples are stable across reloads. */
export function galaxyFamilyPoints(family: GalaxyFamily, count: number) {
  if (family === 'spiral') return galaxyPoints(count);
  let seed = family === 'elliptical' ? 113 : 197;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed + 0.5) / 4294967296; };
  const gaussian = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  return Array.from({ length: count }, () => {
    if (family === 'elliptical') {
      // Bounded ellipsoid with a smoothly concentrated centre, not a solid sphere.
      const radius = 11 * Math.pow(random(), 0.7);
      const height = random() * 2 - 1, angle = random() * Math.PI * 2;
      const ring = Math.sqrt(1 - height * height);
      return { x: radius * ring * Math.cos(angle), y: radius * height * 0.5,
        z: radius * ring * Math.sin(angle) * 0.7, warm: true };
    }
    const centre = IRREGULAR_CLUMPS[Math.floor(random() * IRREGULAR_CLUMPS.length)];
    const offset = () => Math.max(-3.5, Math.min(3.5, gaussian()));
    return { x: centre[0] + offset() * 1.5, y: centre[1] + offset() * 0.75,
      z: centre[2] + offset() * 1.5, warm: random() < 0.2 };
  });
}

export function acceptsCosmicLevel(placed: readonly CosmicLevel[], candidate: CosmicLevel) {
  return candidate === COSMIC_LEVELS[placed.length];
}
