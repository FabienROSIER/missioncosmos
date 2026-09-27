import { MISSION_CATALOG } from '@/content/missions/catalog';

/** Zones de la carte — élargissement progressif du champ de connaissance. */
export type UniverseZoneId =
  | 'earth'
  | 'moon'
  | 'earth-neighborhood'
  | 'solar-system'
  | 'stars'
  | 'milky-way'
  | 'galaxies'
  | 'deep-universe'
  | 'extremes';

export type UniverseZone = {
  id: UniverseZoneId;
  title: string;
  /** Phrase courte sous le nœud */
  blurb: string;
  /** Missions catalogue rattachées (ordre pédagogique) */
  missionIds: string[];
};

/**
 * Ordre de gauche à droite sur la carte.
 * Missions actuelles : Terre (01–02), Lune (03–04), Système solaire (05).
 */
export const UNIVERSE_ZONES: UniverseZone[] = [
  {
    id: 'earth',
    title: 'La Terre',
    blurb: 'Notre planète, point de départ.',
    missionIds: ['mission-01', 'mission-02'],
  },
  {
    id: 'moon',
    title: 'La Lune',
    blurb: 'Notre satellite, tout près.',
    missionIds: ['mission-03', 'mission-04'],
  },
  {
    id: 'earth-neighborhood',
    title: 'Voisinage',
    blurb: 'Autour de la Terre.',
    missionIds: [],
  },
  {
    id: 'solar-system',
    title: 'Système solaire',
    blurb: 'Planètes et Soleil.',
    missionIds: ['mission-05'],
  },
  {
    id: 'stars',
    title: 'Étoiles',
    blurb: 'Soleil et autres soleils.',
    missionIds: [],
  },
  {
    id: 'milky-way',
    title: 'Voie lactée',
    blurb: 'Notre galaxie.',
    missionIds: [],
  },
  {
    id: 'galaxies',
    title: 'Galaxies',
    blurb: 'D’autres îles d’étoiles.',
    missionIds: [],
  },
  {
    id: 'deep-universe',
    title: 'Univers profond',
    blurb: 'Très loin dans le temps.',
    missionIds: [],
  },
  {
    id: 'extremes',
    title: 'Extrêmes',
    blurb: 'Phénomènes hors du commun.',
    missionIds: [],
  },
];

export function getZoneById(id: UniverseZoneId): UniverseZone | undefined {
  return UNIVERSE_ZONES.find((z) => z.id === id);
}

export function getMissionsForZone(zone: UniverseZone) {
  return zone.missionIds
    .map((id) => MISSION_CATALOG.find((m) => m.id === id))
    .filter((m): m is (typeof MISSION_CATALOG)[number] => Boolean(m));
}
