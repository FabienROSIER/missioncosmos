/** Anciens identifiants, avant l’insertion des constellations comme mission 10. */
const LEGACY_MISSION_IDS: Record<string, string> = {
  'mission-13': 'mission-14',
  'mission-12': 'mission-13',
  'mission-11': 'mission-12',
  'mission-10': 'mission-11',
  'mission-constellations': 'mission-10',
};

export function remapLegacyMissionId(id: string): string {
  return LEGACY_MISSION_IDS[id] ?? id;
}
