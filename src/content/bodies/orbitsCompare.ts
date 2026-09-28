import type { PlanetId } from './solarSystem';
import { SOLAR_SYSTEM_PLANETS } from './solarSystem';

/**
 * Trio pédagogique Mission 06 — contrastes de période clairs (proche / Terre / loin).
 * Orbites maquette (pas à l’échelle AU) pour tout voir à l’écran.
 */
export const ORBIT_COMPARE_PLANETS = ['mercury', 'earth', 'jupiter'] as const satisfies readonly PlanetId[];

export type OrbitComparePlanetId = (typeof ORBIT_COMPARE_PLANETS)[number];

export const ORBIT_COMPARE_META: Record<
  OrbitComparePlanetId,
  {
    /** Rayon d’orbite maquette (unités scène). */
    orbitRadius: number;
    /** Rayon visuel un peu grossi pour le picking enfant. */
    visualRadius: number;
    /** Durée d’un tour, langage 6–12 ans. */
    yearLabel: string;
  }
> = {
  mercury: {
    orbitRadius: 3.4,
    visualRadius: 0.32,
    yearLabel: 'environ 88 jours (~3 mois)',
  },
  earth: {
    orbitRadius: 5.8,
    visualRadius: 0.42,
    yearLabel: 'environ 1 an',
  },
  jupiter: {
    orbitRadius: 9.6,
    visualRadius: 0.85,
    yearLabel: 'environ 12 ans',
  },
};

export function orbitYearLabel(id: OrbitComparePlanetId): string {
  return ORBIT_COMPARE_META[id].yearLabel;
}

export function orbitPeriodDays(id: OrbitComparePlanetId): number {
  return SOLAR_SYSTEM_PLANETS[id].orbitalPeriodDays;
}

/** La plus rapide (année la plus courte) = Mercure. */
export const ORBIT_RACE_WINNER: OrbitComparePlanetId = 'mercury';
