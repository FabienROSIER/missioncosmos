import { REWARD_EARTH_EXPLORER } from '@/content/missions/mission-01';
import { REWARD_DAY_NIGHT } from '@/content/missions/mission-02';
import { REWARD_MOON_PHASES } from '@/content/missions/mission-03';
import { REWARD_ECLIPSES } from '@/content/missions/mission-04';
import { REWARD_SOLAR_SYSTEM } from '@/content/missions/mission-05';
import { REWARD_ORBITS } from '@/content/missions/mission-06';
import { REWARD_SEASONS } from '@/content/missions/mission-07';
import { REWARD_STARS } from '@/content/missions/mission-08';
import { REWARD_STELLAR_LIGHT } from '@/content/missions/mission-09';
import { REWARD_CONSTELLATIONS } from '@/content/missions/mission-constellations';
import { REWARD_MILKY_WAY } from '@/content/missions/mission-10';
import { REWARD_GALAXIES } from '@/content/missions/mission-11';
import { REWARD_DISTANCES } from '@/content/missions/mission-12';
import { REWARD_BLACK_HOLE_DETECTIVE } from '@/content/missions/mission-13';
import type { Reward } from '@/types/progress';

/** Registre des récompenses (badges de connaissance). */
export const REWARD_CATALOG: Reward[] = [
  REWARD_EARTH_EXPLORER,
  REWARD_DAY_NIGHT,
  REWARD_MOON_PHASES,
  REWARD_ECLIPSES,
  REWARD_SOLAR_SYSTEM,
  REWARD_ORBITS,
  REWARD_SEASONS,
  REWARD_STARS,
  REWARD_STELLAR_LIGHT,
  REWARD_CONSTELLATIONS,
  REWARD_MILKY_WAY,
  REWARD_GALAXIES,
  REWARD_DISTANCES,
  REWARD_BLACK_HOLE_DETECTIVE,
];

export function getRewardById(id: string): Reward | undefined {
  return REWARD_CATALOG.find((r) => r.id === id);
}

export function getRewardsByIds(ids: string[]): Reward[] {
  return ids.map((id) => getRewardById(id)).filter((r): r is Reward => Boolean(r));
}
