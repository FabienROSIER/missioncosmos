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

/**
 * Maquette : lisible (tailles + distances compressées)
 * ou à l’échelle (tailles ≈ réelles + distances ≈ UA).
 */
export type SolarSystemScaleMode = 'readable' | 'toScale';

/** @deprecated alias — préférer SolarSystemScaleMode */
export type SolarSystemSizeMode = SolarSystemScaleMode;

/** Rayon Terre en scène — mode à l’échelle. */
export const TO_SCALE_EARTH_RADIUS = 0.2;

/**
 * Soleil en mode à l’échelle : à vraie taille + vraies distances ce serait un point.
 * On le grossit pour qu’il reste identifiable.
 */
export const TO_SCALE_SUN_VISIBLE_RADIUS = 1.55;

export const SUN_RADIUS_READABLE = 1.55;

/** 1 UA en unités scène (mode à l’échelle) — linéaire. Neptune ≈ 30 × ça. */
export const AU_SCENE_UNIT = 2.5;

export type SolarSystemBodyVisual = {
  bodyId: CelestialBodyId;
  readableRadius: number;
  toScaleRadius: number;
  compactOrbit: number;
  spinSpeedFactor: number;
  fact: string;
};

export const SOLAR_SYSTEM_SUN: CelestialBodyDefinition = {
  id: 'sun',
  scientific: {
    nameFr: 'Soleil',
    realRadiusKm: 695700,
    shortDescription: 'Notre étoile au centre du système solaire.',
  },
  visual: { bodyId: 'sun', visualRadius: 1.6, spinSpeedFactor: 0.1 },
};

function toScaleRadiusFromEarth(realRadiusKm: number): number {
  return TO_SCALE_EARTH_RADIUS * (realRadiusKm / 6371);
}

export const SOLAR_SYSTEM_PLANETS: Record<
  PlanetId,
  SolarSystemBodyVisual & { nameFr: string; realRadiusKm: number; approxAu: number }
> = {
  mercury: {
    bodyId: 'mercury',
    nameFr: 'Mercure',
    realRadiusKm: 2439.7,
    approxAu: 0.387,
    readableRadius: 0.22,
    toScaleRadius: toScaleRadiusFromEarth(2439.7),
    compactOrbit: 3.2,
    spinSpeedFactor: 0.4,
    fact: 'La plus proche du Soleil. Petite et très chaude le jour.',
  },
  venus: {
    bodyId: 'venus',
    nameFr: 'Vénus',
    realRadiusKm: 6051.8,
    approxAu: 0.723,
    readableRadius: 0.38,
    toScaleRadius: toScaleRadiusFromEarth(6051.8),
    compactOrbit: 4.1,
    spinSpeedFactor: 0.25,
    fact: 'Presque aussi grosse que la Terre. Couverte de nuages épais.',
  },
  earth: {
    bodyId: 'earth',
    nameFr: 'Terre',
    realRadiusKm: 6371,
    approxAu: 1,
    readableRadius: 0.4,
    toScaleRadius: TO_SCALE_EARTH_RADIUS,
    compactOrbit: 5.1,
    spinSpeedFactor: 0.9,
    fact: 'Notre maison. De l’eau liquide et une atmosphère respirable.',
  },
  mars: {
    bodyId: 'mars',
    nameFr: 'Mars',
    realRadiusKm: 3389.5,
    approxAu: 1.524,
    readableRadius: 0.28,
    toScaleRadius: toScaleRadiusFromEarth(3389.5),
    compactOrbit: 6.2,
    spinSpeedFactor: 0.85,
    fact: 'La planète rouge. Plus petite que la Terre, avec des déserts.',
  },
  jupiter: {
    bodyId: 'jupiter',
    nameFr: 'Jupiter',
    realRadiusKm: 69911,
    approxAu: 5.203,
    readableRadius: 0.95,
    toScaleRadius: toScaleRadiusFromEarth(69911),
    compactOrbit: 8.0,
    spinSpeedFactor: 1.4,
    fact: 'La plus grande. Une géante gazeuse avec une Grande Tache rouge.',
  },
  saturn: {
    bodyId: 'saturn',
    nameFr: 'Saturne',
    realRadiusKm: 58232,
    approxAu: 9.537,
    readableRadius: 0.85,
    toScaleRadius: toScaleRadiusFromEarth(58232),
    compactOrbit: 10.0,
    spinSpeedFactor: 1.2,
    fact: 'Célèbre pour ses anneaux. Aussi une géante gazeuse.',
  },
  uranus: {
    bodyId: 'uranus',
    nameFr: 'Uranus',
    realRadiusKm: 25362,
    approxAu: 19.191,
    readableRadius: 0.55,
    toScaleRadius: toScaleRadiusFromEarth(25362),
    compactOrbit: 11.8,
    spinSpeedFactor: 0.7,
    fact: 'Géante de glace, penchée sur le côté. Couleur bleu-vert.',
  },
  neptune: {
    bodyId: 'neptune',
    nameFr: 'Neptune',
    realRadiusKm: 24622,
    approxAu: 30.07,
    readableRadius: 0.52,
    toScaleRadius: toScaleRadiusFromEarth(24622),
    compactOrbit: 13.5,
    spinSpeedFactor: 0.75,
    fact: 'La plus loin des 8. Bleue, avec des vents très forts.',
  },
};

export function isPlanetId(id: string): id is PlanetId {
  return (PLANET_ORDER as readonly string[]).includes(id);
}

export function planetDefinition(id: PlanetId, mode: SolarSystemScaleMode): CelestialBodyDefinition {
  const p = SOLAR_SYSTEM_PLANETS[id];
  return {
    id,
    scientific: {
      nameFr: p.nameFr,
      realRadiusKm: p.realRadiusKm,
      shortDescription: p.fact,
    },
    visual: {
      bodyId: p.bodyId,
      visualRadius: mode === 'readable' ? p.readableRadius : p.toScaleRadius,
      spinSpeedFactor: p.spinSpeedFactor,
    },
  };
}

export function resolveSunRadius(mode: SolarSystemScaleMode): number {
  return mode === 'readable' ? SUN_RADIUS_READABLE : TO_SCALE_SUN_VISIBLE_RADIUS;
}

/** Orbite : compact si lisible, UA linéaires si à l’échelle. */
export function resolveOrbit(id: PlanetId, mode: SolarSystemScaleMode): number {
  const p = SOLAR_SYSTEM_PLANETS[id];
  if (mode === 'toScale') return p.approxAu * AU_SCENE_UNIT;
  return p.compactOrbit;
}
