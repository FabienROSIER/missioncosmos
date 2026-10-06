import type { CelestialBodyId } from '@/lib/constants';
import type { CelestialBodyDefinition } from '@/types/celestial';

/** Les 8 planètes dans l’ordre depuis le Soleil (pas de planète naine ici). */
export const PLANET_ORDER = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
] as const;

export type PlanetId = (typeof PLANET_ORDER)[number];

/** Chaque vue annonce précisément la grandeur représentée. */
export type SolarSystemScaleMode = 'readable' | 'sizes' | 'distances';
export type ComparisonGroup = 'rocky' | 'planets' | 'jupiter' | 'sun';
export type ComparisonBodyId = PlanetId | 'sun';
export const AU_KM = 149_597_870.7;
export const SUN_RADIUS_READABLE = 1.55;
export const SIZE_GROUPS: Record<ComparisonGroup, readonly ComparisonBodyId[]> = {
  rocky: ['mercury', 'venus', 'earth', 'mars'],
  planets: PLANET_ORDER,
  jupiter: ['earth', 'jupiter'],
  sun: ['earth', 'sun'],
};

export type SolarSystemBodyVisual = {
  bodyId: CelestialBodyId;
  readableRadius: number;
  compactOrbit: number;
  /** Facteur décoratif hors mode ciné (quiz). */
  spinSpeedFactor: number;
  /** Période de révolution sidérale autour du Soleil (jours terrestres). */
  orbitalPeriodDays: number;
  /**
   * Période de rotation sidérale (jours terrestres).
   * Signe + avec obliquité > 90° (Vénus, Uranus) = convention pôle droitier.
   */
  siderealRotationDays: number;
  /** Obliquité (°) : angle entre axe de spin et normale au plan orbital. */
  axialTiltDeg: number;
  fact: string;
};

export const SOLAR_SYSTEM_SUN: CelestialBodyDefinition = {
  id: 'sun',
  scientific: {
    nameFr: 'Soleil',
    realRadiusKm: 695700,
    axialTiltDeg: 7.25,
    shortDescription: 'Notre étoile au centre du système solaire.',
  },
  visual: { bodyId: 'sun', visualRadius: 1.6, spinSpeedFactor: 0.1 },
};

/** Rotation sidérale Soleil (équateur, jours terrestres). */
export const SUN_SIDEREAL_ROTATION_DAYS = 25.05;

/** Année terrestre de référence (jours) — horloge unique orbites + spins. */
export const EARTH_ORBIT_PERIOD_DAYS = 365.256;

/**
 * Durée visuelle d’une révolution terrestre (secondes).
 * Une seule échelle de temps : Mercure rapide, Neptune très lente ;
 * les spins restent proportionnels (Jupiter tourne vite, Vénus presque pas).
 */
export const EARTH_YEAR_VISUAL_SEC = 120;

/** ω orbital (rad/s) — cohérent entre planètes via les périodes réelles. */
export function orbitalAngularSpeed(orbitalPeriodDays: number): number {
  return (
    (2 * Math.PI * EARTH_ORBIT_PERIOD_DAYS) /
    (Math.max(orbitalPeriodDays, 1e-6) * EARTH_YEAR_VISUAL_SEC)
  );
}

/** ω de spin (rad/s), signe inclus pour rétrograde. */
export function spinAngularSpeed(siderealRotationDays: number): number {
  const sign = Math.sign(siderealRotationDays) || 1;
  return (
    (sign * 2 * Math.PI * EARTH_ORBIT_PERIOD_DAYS) /
    (Math.abs(siderealRotationDays) * EARTH_YEAR_VISUAL_SEC)
  );
}

export const SOLAR_SYSTEM_PLANETS: Record<
  PlanetId,
  SolarSystemBodyVisual & { nameFr: string; realRadiusKm: number; approxAu: number }
> = {
  mercury: {
    bodyId: 'mercury',
    nameFr: 'Mercure',
    realRadiusKm: 2439.4,
    approxAu: 0.387,
    readableRadius: 0.22,
    compactOrbit: 3.2,
    spinSpeedFactor: 0.4,
    orbitalPeriodDays: 87.969,
    siderealRotationDays: 58.646,
    axialTiltDeg: 0.03,
    fact: 'La plus proche du Soleil. Petite et très chaude le jour.',
  },
  venus: {
    bodyId: 'venus',
    nameFr: 'Vénus',
    realRadiusKm: 6051.8,
    approxAu: 0.723,
    readableRadius: 0.38,
    compactOrbit: 4.1,
    spinSpeedFactor: 0.25,
    orbitalPeriodDays: 224.701,
    // Obliquité ~177° : presque « à l’envers » (équivalent rétrograde)
    siderealRotationDays: 243.025,
    axialTiltDeg: 177.36,
    fact: 'Presque aussi grosse que la Terre. Couverte de nuages épais.',
  },
  earth: {
    bodyId: 'earth',
    nameFr: 'Terre',
    realRadiusKm: 6371,
    approxAu: 1,
    readableRadius: 0.4,
    compactOrbit: 5.1,
    spinSpeedFactor: 0.9,
    orbitalPeriodDays: EARTH_ORBIT_PERIOD_DAYS,
    siderealRotationDays: 0.997269,
    axialTiltDeg: 23.44,
    fact: 'Notre maison : de l’eau liquide et de l’air à respirer.',
  },
  mars: {
    bodyId: 'mars',
    nameFr: 'Mars',
    realRadiusKm: 3389.5,
    approxAu: 1.524,
    readableRadius: 0.28,
    compactOrbit: 6.2,
    spinSpeedFactor: 0.85,
    orbitalPeriodDays: 686.98,
    siderealRotationDays: 1.025957,
    axialTiltDeg: 25.19,
    fact: 'La planète rouge. Plus petite que la Terre, avec des déserts.',
  },
  jupiter: {
    bodyId: 'jupiter',
    nameFr: 'Jupiter',
    realRadiusKm: 69911,
    approxAu: 5.203,
    readableRadius: 0.95,
    compactOrbit: 8.0,
    spinSpeedFactor: 1.4,
    orbitalPeriodDays: 4332.589,
    siderealRotationDays: 0.41354,
    axialTiltDeg: 3.13,
    fact: 'La plus grande. Une géante faite surtout de gaz, avec une Grande Tache rouge.',
  },
  saturn: {
    bodyId: 'saturn',
    nameFr: 'Saturne',
    realRadiusKm: 58232,
    approxAu: 9.537,
    readableRadius: 0.85,
    compactOrbit: 10.0,
    spinSpeedFactor: 1.2,
    orbitalPeriodDays: 10759.22,
    siderealRotationDays: 0.44401,
    axialTiltDeg: 26.73,
    fact: 'Célèbre pour ses anneaux. Aussi une géante faite surtout de gaz.',
  },
  uranus: {
    bodyId: 'uranus',
    nameFr: 'Uranus',
    realRadiusKm: 25362,
    approxAu: 19.191,
    readableRadius: 0.55,
    compactOrbit: 11.8,
    spinSpeedFactor: 0.7,
    orbitalPeriodDays: 30688.5,
    siderealRotationDays: 0.71833,
    // ~98° : elle « roule » presque sur son orbite
    axialTiltDeg: 97.77,
    fact: 'Géante de glace penchée à 98° : elle tourne presque couchée.',
  },
  neptune: {
    bodyId: 'neptune',
    nameFr: 'Neptune',
    realRadiusKm: 24622,
    approxAu: 30.07,
    readableRadius: 0.52,
    compactOrbit: 13.5,
    spinSpeedFactor: 0.75,
    orbitalPeriodDays: 60182,
    siderealRotationDays: 0.67125,
    axialTiltDeg: 28.32,
    fact: 'La plus loin des 8. Bleue, avec des vents très forts.',
  },
};

export function isPlanetId(id: string): id is PlanetId {
  return (PLANET_ORDER as readonly string[]).includes(id);
}

export function planetDefinition(id: PlanetId): CelestialBodyDefinition {
  const p = SOLAR_SYSTEM_PLANETS[id];
  return {
    id,
    scientific: {
      nameFr: p.nameFr,
      realRadiusKm: p.realRadiusKm,
      axialTiltDeg: p.axialTiltDeg,
      shortDescription: p.fact,
    },
    visual: {
      bodyId: p.bodyId,
      visualRadius: p.readableRadius,
      spinSpeedFactor: p.spinSpeedFactor,
    },
  };
}

export function resolveSunRadius(): number {
  return SUN_RADIUS_READABLE;
}

/** Orbites de la maquette uniquement. */
export function resolveOrbit(id: PlanetId): number {
  const p = SOLAR_SYSTEM_PLANETS[id];
  return p.compactOrbit;
}

export function realRadiusKm(id: ComparisonBodyId): number {
  return id === 'sun' ? 695700 : SOLAR_SYSTEM_PLANETS[id].realRadiusKm;
}

/** Même facteur pour tous les rayons ; les espaces ne représentent aucune distance. */
export function sizeComparisonLayout(group: ComparisonGroup) {
  const ids = SIZE_GROUPS[group];
  const largest = Math.max(...ids.map(realRadiusKm));
  let cursor = 0;
  const bodies = ids.map((id) => {
    const radius = (realRadiusKm(id) / largest) * 2;
    const extent = radius * (id === 'saturn' ? 2.5 : 1);
    const x = cursor + extent;
    cursor += 2 * extent + 0.65;
    return { id, radius, extent, x };
  });
  const width = cursor - 0.65;
  return { width, bodies: bodies.map((body) => ({ ...body, x: body.x - width / 2 })) };
}

/** Projection linéaire en unités SVG, identique pour les distances et les rayons. */
export function distancePosition(au: number, spanAu: number, width: number): number {
  return (au / spanAu) * width;
}
export function commonScaleRadius(id: ComparisonBodyId, spanAu: number, width: number): number {
  return distancePosition(realRadiusKm(id) / AU_KM, spanAu, width);
}
