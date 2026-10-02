import { describe, expect, it } from 'vitest';
import { acceptsCosmicLevel, galaxyFamilyPoints, GALAXY_FAMILIES, COSMIC_LEVELS } from './galaxies';
import { MISSION_11 } from '@/content/missions/mission-11';
import { getMissionById } from '@/content/missions';
import { getQuizById } from '@/content/quizzes';
import { getRewardById } from '@/content/rewards/catalog';
import { getGlossaryEntry } from '@/content/glossary';
import { validateMission } from '@/content/missions/validateMission';
import { isCelebratedChallenge } from '@/features/missions/challengeCelebration';

describe('Les galaxies', () => {
  it('relie la mission, son quiz, son badge et ses mots sans célébrer les observations', () => {
    expect(validateMission(MISSION_11)).toEqual([]);
    expect(getMissionById(MISSION_11.id)).toBe(MISSION_11);
    expect(getQuizById(MISSION_11.quizId!)).toBeDefined();
    MISSION_11.rewardIds.forEach((id) => expect(getRewardById(id)).toBeDefined());
    MISSION_11.glossaryIds?.forEach((id) => expect(getGlossaryEntry(id)).toBeDefined());
    expect(MISSION_11.steps.filter(isCelebratedChallenge).map((step) => step.id)).toEqual([
      'm11-album',
      'm11-scale',
    ]);
  });
  it('ne valide que le prochain niveau d’inclusion et rejette les doublons et les sauts', () => {
    for (let i = 0; i <= COSMIC_LEVELS.length; i++) {
      for (const candidate of COSMIC_LEVELS) {
        expect(acceptsCosmicLevel(COSMIC_LEVELS.slice(0, i), candidate)).toBe(
          candidate === COSMIC_LEVELS[i],
        );
      }
    }
  });
  it('génère quatre volumes finis, stables, dans un budget de points explicite', () => {
    for (const family of GALAXY_FAMILIES) {
      const points = galaxyFamilyPoints(family, 2400);
      expect(points).toHaveLength(2400);
      expect(points).toEqual(galaxyFamilyPoints(family, 2400));
      expect(points.every((p) => [p.x, p.y, p.z].every(Number.isFinite))).toBe(true);
      expect(points.every((p) => Math.hypot(p.x, p.y, p.z) < 25)).toBe(true);
    }
  });
  it('dessine une barre centrale allongée avec des bras partant de ses extrémités', () => {
    const points = galaxyFamilyPoints('barred-spiral', 8000);
    const centre = points.filter((p) => p.warm);
    const varianceX = centre.reduce((sum, p) => sum + p.x * p.x, 0);
    const varianceZ = centre.reduce((sum, p) => sum + p.z * p.z, 0);
    expect(varianceX).toBeGreaterThan(varianceZ * 6);
    expect(points.some((p) => !p.warm && p.x > 5 && Math.abs(p.z) < 1)).toBe(true);
    expect(points.some((p) => !p.warm && p.x < -5 && Math.abs(p.z) < 1)).toBe(true);
  });
  it('distingue un disque aplati d’un volume elliptique et d’une distribution asymétrique', () => {
    const spiral = galaxyFamilyPoints('spiral', 3000);
    const ellipse = galaxyFamilyPoints('elliptical', 3000);
    const irregular = galaxyFamilyPoints('irregular', 3000);
    const height = (points: typeof spiral) =>
      points.reduce((sum, p) => sum + p.y * p.y, 0) / points.length;
    expect(height(ellipse)).toBeGreaterThan(height(spiral) * 4);
    expect(irregular.filter((p) => p.x > 4).length).toBeGreaterThan(300);
    expect(irregular.filter((p) => p.x < -4).length).toBeGreaterThan(300);
  });
});
