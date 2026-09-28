import { MISSION_01 } from '@/content/missions/mission-01';
import { MISSION_02 } from '@/content/missions/mission-02';
import { MISSION_03 } from '@/content/missions/mission-03';
import { MISSION_04 } from '@/content/missions/mission-04';
import { MISSION_05 } from '@/content/missions/mission-05';
import { MISSION_06 } from '@/content/missions/mission-06';
import { MISSION_07 } from '@/content/missions/mission-07';
import type { Mission } from '@/types/mission';

const BY_ID: Record<string, Mission> = {
  [MISSION_01.id]: MISSION_01,
  [MISSION_02.id]: MISSION_02,
  [MISSION_03.id]: MISSION_03,
  [MISSION_04.id]: MISSION_04,
  [MISSION_05.id]: MISSION_05,
  [MISSION_06.id]: MISSION_06,
  [MISSION_07.id]: MISSION_07,
};

export function getMissionById(id: string): Mission | undefined {
  return BY_ID[id];
}

export function listMissions(): Mission[] {
  return Object.values(BY_ID);
}

export { MISSION_01, MISSION_02, MISSION_03, MISSION_04, MISSION_05, MISSION_06, MISSION_07 };
export { REWARD_EARTH_EXPLORER } from '@/content/missions/mission-01';
export { REWARD_DAY_NIGHT } from '@/content/missions/mission-02';
export { REWARD_MOON_PHASES } from '@/content/missions/mission-03';
export { REWARD_ECLIPSES } from '@/content/missions/mission-04';
export { REWARD_SOLAR_SYSTEM } from '@/content/missions/mission-05';
export { REWARD_ORBITS } from '@/content/missions/mission-06';
export { REWARD_SEASONS } from '@/content/missions/mission-07';
