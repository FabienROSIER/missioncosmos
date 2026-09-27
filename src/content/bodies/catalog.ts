import type { CelestialBodyDefinition } from '@/types/celestial';

/** Définitions séparées du rendu — extensibles mission par mission. */
export const EARTH_BODY: CelestialBodyDefinition = {
  id: 'earth',
  scientific: {
    nameFr: 'Terre',
    realRadiusKm: 6371,
    massKg: 5.972e24,
    rotationPeriodHours: 23.93,
    axialTiltDeg: 23.44,
    shortDescription: 'Notre planète bleue, inclinée, qui tourne sur elle-même.',
  },
  visual: {
    bodyId: 'earth',
    visualRadius: 1,
    spinSpeedFactor: 1,
  },
};

export const SUN_BODY: CelestialBodyDefinition = {
  id: 'sun',
  scientific: {
    nameFr: 'Soleil',
    realRadiusKm: 695700,
    massKg: 1.989e30,
    rotationPeriodHours: 609.12,
    axialTiltDeg: 7.25,
    shortDescription: 'Notre étoile : elle brille toujours, même quand on est dans la nuit.',
  },
  visual: {
    bodyId: 'sun',
    /** Maquette Mission 02 : un peu plus grand que la Terre, lisible en bord d’écran. */
    visualRadius: 1.85,
    spinSpeedFactor: 0.12,
  },
};

export const MOON_BODY: CelestialBodyDefinition = {
  id: 'moon',
  scientific: {
    nameFr: 'Lune',
    realRadiusKm: 1737,
    massKg: 7.342e22,
    rotationPeriodHours: 655.2,
    axialTiltDeg: 6.68,
    shortDescription: 'Le satellite naturel de la Terre : une face éclairée par le Soleil.',
  },
  visual: {
    bodyId: 'moon',
    /** Maquette Mission 03 : assez grande pour lire les phases. */
    visualRadius: 0.32,
    spinSpeedFactor: 0.35,
  },
};
