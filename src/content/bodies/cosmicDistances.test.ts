import { describe, expect, it } from 'vitest';
import { AU_KM, LIGHT_YEAR_KM, DELIVERY_TARGETS } from './cosmicDistances';
import { MISSION_12 } from '@/content/missions/mission-12';
import { getMissionById } from '@/content/missions';
import { getQuizById } from '@/content/quizzes';
import { getRewardById } from '@/content/rewards/catalog';
import { getGlossaryEntry } from '@/content/glossary';
import { isCelebratedChallenge } from '@/features/missions/challengeCelebration';
import { cosmicScaleFrame } from './cosmicScale';
import {
  NEIGHBOUR_LAYOUTS,
  closestGalaxyPair,
  isClosestGalaxyPair,
  neighbourDistance,
} from './galaxyNeighbours';
describe('Navigation cosmique', () => {
  it('classe les quatre destinations par distances croissantes depuis notre voisinage', () => {
    expect(
      DELIVERY_TARGETS.every((target, i) => i === 0 || target.km > DELIVERY_TARGETS[i - 1]!.km),
    ).toBe(true);
    expect(AU_KM / 384400).toBeGreaterThan(380);
    expect(LIGHT_YEAR_KM / AU_KM).toBeGreaterThan(63000);
  });
  it('retrouve la paire proche en 3D après permutation et rejette les faux voisins de face', () => {
    for (const layout of NEIGHBOUR_LAYOUTS) {
      for (const positions of [
        layout,
        [...layout].reverse(),
        [layout[2]!, layout[0]!, layout[3]!, layout[1]!],
      ]) {
        const pair = closestGalaxyPair(positions);
        expect(neighbourDistance(positions[pair[0]!]!, positions[pair[1]!]!)).toBeLessThan(5);
        expect(isClosestGalaxyPair(positions, pair)).toBe(true);
        expect(isClosestGalaxyPair(positions, [pair[0]!])).toBe(false);
        expect(
          isClosestGalaxyPair(
            positions,
            positions.map((_, i) => i).filter((i) => !pair.includes(i)),
          ),
        ).toBe(false);
      }
    }
  });
  it('réduit les ensembles sortants sans vide entre les échelles', () => {
    expect(cosmicScaleFrame(0).sunModelOpacity).toBe(0);
    expect(cosmicScaleFrame(0).planetModelOpacity).toBe(0);
    expect(cosmicScaleFrame(0).moonModelOpacity).toBe(1);
    expect(cosmicScaleFrame(1).sunModelOpacity).toBe(1);
    expect(cosmicScaleFrame(1).planetModelOpacity).toBe(0);
    expect(cosmicScaleFrame(1).moonModelOpacity).toBe(0);
    expect(cosmicScaleFrame(2).planetModelOpacity).toBe(1);
    expect(cosmicScaleFrame(3).galaxyOpacity).toBe(0);
    expect(cosmicScaleFrame(3).otherOpacity).toBe(0);
    expect(cosmicScaleFrame(3).remoteOpacity).toBe(0);
    expect(cosmicScaleFrame(3).neighbourOpacity).toBe(1);
    expect(cosmicScaleFrame(4).galaxyOpacity).toBe(1);
    expect(cosmicScaleFrame(5).otherOpacity).toBe(1);
    let previous = cosmicScaleFrame(0);
    for (let p = 0.01; p <= 6; p += 0.01) {
      const f = cosmicScaleFrame(p);
      expect(f.solarScale).toBeLessThanOrEqual(previous.solarScale);
      expect(f.galaxyScale).toBeLessThanOrEqual(previous.galaxyScale);
      if (p > 2.65 && p < 4) expect(f.neighbourOpacity + f.galaxyOpacity).toBeGreaterThan(0.05);
      if (p > 5.65) expect(f.remoteOpacity).toBe(1);
      previous = f;
    }
    expect(cosmicScaleFrame(3.5).neighbourScale).toBeLessThan(0.01);
    expect(cosmicScaleFrame(5.5).galaxyScale).toBeLessThan(0.002);
  });
  it('enregistre mission, quiz, badge et glossaire sans célébrer le film', () => {
    expect(getMissionById(MISSION_12.id)).toBe(MISSION_12);
    expect(getQuizById(MISSION_12.quizId!)).toBeDefined();
    MISSION_12.rewardIds.forEach((id) => expect(getRewardById(id)).toBeDefined());
    MISSION_12.glossaryIds?.forEach((id) => expect(getGlossaryEntry(id)).toBeDefined());
    expect(MISSION_12.steps.filter(isCelebratedChallenge).map((s) => s.id)).toEqual([
      'm12-order',
      'm12-signals',
    ]);
  });
});
