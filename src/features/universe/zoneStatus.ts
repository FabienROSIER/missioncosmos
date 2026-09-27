import { UNIVERSE_ZONES, type UniverseZone, type UniverseZoneId } from '@/content/universe/zones';

export type ZoneMapStatus = 'locked' | 'available' | 'completed' | 'coming-soon';

export type ZoneStatusInput = {
  isMissionUnlocked: (missionId: string) => boolean;
  isMissionCompleted: (missionId: string) => boolean;
};

/** Statut d’une zone pour la carte. */
export function getZoneStatus(zone: UniverseZone, input: ZoneStatusInput): ZoneMapStatus {
  if (zone.missionIds.length === 0) {
    return isZoneUnlockedByProgression(zone.id, input) ? 'coming-soon' : 'locked';
  }

  const unlockedAny = zone.missionIds.some((id) => input.isMissionUnlocked(id));
  if (!unlockedAny) return 'locked';

  const hasPending = zone.missionIds.some(
    (id) => input.isMissionUnlocked(id) && !input.isMissionCompleted(id),
  );
  return hasPending ? 'available' : 'completed';
}

/**
 * Zone sans mission : visible « bientôt » si la zone précédente
 * est terminée (missions débloquées toutes complétées).
 */
export function isZoneUnlockedByProgression(
  zoneId: UniverseZoneId,
  input: ZoneStatusInput,
): boolean {
  const index = UNIVERSE_ZONES.findIndex((z) => z.id === zoneId);
  if (index <= 0) return true;

  const prev = UNIVERSE_ZONES[index - 1]!;
  if (prev.missionIds.length === 0) {
    return isZoneUnlockedByProgression(prev.id, input);
  }
  return getZoneStatus(prev, input) === 'completed';
}

/** Première zone utile à centrer (mission dispo non terminée, sinon première dispo). */
export function pickInitialZoneId(input: ZoneStatusInput): UniverseZoneId {
  for (const zone of UNIVERSE_ZONES) {
    for (const missionId of zone.missionIds) {
      if (input.isMissionUnlocked(missionId) && !input.isMissionCompleted(missionId)) {
        return zone.id;
      }
    }
  }
  for (const zone of UNIVERSE_ZONES) {
    if (zone.missionIds.some((id) => input.isMissionUnlocked(id))) {
      return zone.id;
    }
  }
  return 'earth';
}
