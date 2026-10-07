import { MISSION_CATALOG } from '@/content/missions/catalog';

/** Zones de la carte — élargissement progressif du champ de connaissance. */
export type UniverseZoneId =
  | 'earth'
  | 'moon'
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
 * Aligné mix C : 8 zones, chacune ≥1 mission (01–14).
 * (Zone « Voisinage » retirée — orpheline.)
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
    blurb: 'La Lune tourne autour de la Terre.',
    missionIds: ['mission-03', 'mission-04'],
  },
  {
    id: 'solar-system',
    title: 'Système solaire',
    blurb: 'Planètes, orbites et saisons.',
    missionIds: ['mission-05', 'mission-06', 'mission-07'],
  },
  {
    id: 'stars',
    title: 'Étoiles',
    blurb: 'Soleil et autres soleils.',
    missionIds: ['mission-08', 'mission-09', 'mission-10'],
  },
  {
    id: 'milky-way',
    title: 'Voie lactée',
    blurb: 'Notre galaxie.',
    missionIds: ['mission-11'],
  },
  {
    id: 'galaxies',
    title: 'Galaxies',
    blurb: 'D’autres îles d’étoiles.',
    missionIds: ['mission-12'],
  },
  {
    id: 'deep-universe',
    title: 'Univers profond',
    blurb: 'Les distances immenses.',
    missionIds: ['mission-13'],
  },
  {
    id: 'extremes',
    title: 'Extrêmes',
    blurb: 'Phénomènes hors du commun.',
    missionIds: ['mission-14'],
  },
];

export function getZoneById(id: UniverseZoneId): UniverseZone | undefined {
  return UNIVERSE_ZONES.find((z) => z.id === id);
}

/** Zone de la carte qui contient cette mission. */
export function getZoneIdForMission(missionId: string): UniverseZoneId | undefined {
  return UNIVERSE_ZONES.find((zone) => zone.missionIds.includes(missionId))?.id;
}

export function getMissionsForZone(zone: UniverseZone) {
  return zone.missionIds
    .map((id) => MISSION_CATALOG.find((m) => m.id === id))
    .filter((m): m is (typeof MISSION_CATALOG)[number] => Boolean(m));
}
