import { describe, expect, it } from 'vitest';
import { AU_KM, LIGHT_YEAR_KM, DELIVERY_TARGETS } from './cosmicDistances';
import { MISSION_12 } from '@/content/missions/mission-12';
import { getMissionById } from '@/content/missions';
import { getQuizById } from '@/content/quizzes';
import { getRewardById } from '@/content/rewards/catalog';
import { getGlossaryEntry } from '@/content/glossary';
import { isCelebratedChallenge } from '@/features/missions/challengeCelebration';
import {
  cosmicScaleFrame,
  deepFieldGalaxies,
  easedScaleProgress,
  isDeepFieldFeatured,
  moonBesideEarth,
  scaleLevelAlongJump,
} from './cosmicScale';
describe('Navigation cosmique', () => {
  it('classe les quatre destinations par distances croissantes depuis notre voisinage', () => {
    expect(
      DELIVERY_TARGETS.every((target, i) => i === 0 || target.km > DELIVERY_TARGETS[i - 1]!.km),
    ).toBe(true);
    expect(AU_KM / 384400).toBeGreaterThan(380);
    expect(LIGHT_YEAR_KM / AU_KM).toBeGreaterThan(63000);
  });

  it('garde la Lune plus proche de la Terre que du Soleil pendant le dézoom', () => {
    for (const angle of [0, 1.2, 2.4, 3.4, 4.8, 5.9]) {
      const earthX = 5.1 * Math.cos(angle);
      const earthZ = 5.1 * Math.sin(angle);
      const moon = moonBesideEarth(earthX, 0, earthZ);
      const distEarth = Math.hypot(moon.x - earthX, moon.y, moon.z - earthZ);
      const distSun = Math.hypot(moon.x, moon.y, moon.z);
      expect(distEarth).toBeLessThan(1.2);
      expect(distEarth).toBeLessThan(distSun * 0.35);
    }
  });

  it('lisse un zoom rapide (ease) sans dépasser la durée', () => {
    expect(easedScaleProgress(0)).toBe(0);
    expect(easedScaleProgress(1)).toBe(1);
    expect(easedScaleProgress(0.5)).toBeCloseTo(0.5, 5);
    // Mid slope steeper than the ends → less stutter than linear speed.
    expect(easedScaleProgress(0.5) - easedScaleProgress(0.25)).toBeGreaterThan(
      easedScaleProgress(0.25) - easedScaleProgress(0),
    );
    expect(scaleLevelAlongJump(6, 0, 0, 2)).toBe(6);
    expect(scaleLevelAlongJump(6, 0, 2, 2)).toBe(0);
    expect(scaleLevelAlongJump(6, 0, 1, 2)).toBeCloseTo(3, 5);
  });
  it('répartit l’Univers observable comme un champ profond, pas une grille', () => {
    const field = deepFieldGalaxies(160);
    expect(field).toHaveLength(160);
    expect(field.filter(isDeepFieldFeatured).length).toBeGreaterThan(8);
    expect(field.filter(isDeepFieldFeatured).length).toBeLessThan(field.length * 0.45);
    const xs = field.map((g) => g.x).sort((a, b) => a - b);
    const gaps = xs.slice(1).map((x, i) => x - xs[i]!);
    const mean = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + (gap - mean) ** 2, 0) / gaps.length;
    expect(variance).toBeGreaterThan(mean * mean * 0.12);
    const scales = field.map((g) => g.scale);
    expect(Math.max(...scales) / Math.min(...scales)).toBeGreaterThan(2.5);
    const zs = field.map((g) => g.z);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(30);
    expect(Math.max(...field.map((g) => Math.hypot(g.x, g.y)))).toBeGreaterThan(28);
    expect(new Set(field.map((g) => g.family)).size).toBeGreaterThan(1);
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
    // Étoile voisine → Voie lactée : recul de caméra + galaxie qui s’ouvre autour du groupe.
    expect(cosmicScaleFrame(3).cameraRadius).toBe(43);
    expect(cosmicScaleFrame(3.3).cameraTargetMix).toBe(0);
    expect(cosmicScaleFrame(3.3).cameraRadius).toBeGreaterThan(43);
    expect(cosmicScaleFrame(3.3).galaxyOpacity).toBeGreaterThan(0.15);
    expect(cosmicScaleFrame(3.3).neighbourOpacity).toBeGreaterThan(0.85);
    expect(cosmicScaleFrame(4).cameraTargetMix).toBe(1);
    expect(cosmicScaleFrame(4).cameraRadius).toBe(64);
    expect(cosmicScaleFrame(6).cameraRadius).toBe(34);
    expect(cosmicScaleFrame(5).otherOpacity).toBe(1);
    // Planètes → étoile voisine : les voisines arrivent depuis hors-cadre (dézoom), pas depuis le centre.
    expect(cosmicScaleFrame(2.1).neighbourOpacity).toBeGreaterThan(0.85);
    expect(cosmicScaleFrame(2).neighbourScale).toBeGreaterThan(10);
    expect(cosmicScaleFrame(2.5).neighbourScale).toBeLessThan(cosmicScaleFrame(2.1).neighbourScale);
    expect(cosmicScaleFrame(3).neighbourScale).toBeCloseTo(1, 5);
    // Voie lactée → Univers observable : le champ profond arrive hors-cadre (dézoom), pas depuis le centre.
    expect(cosmicScaleFrame(5).remoteArrive).toBeCloseTo(12, 5);
    expect(cosmicScaleFrame(5.4).remoteOpacity).toBeGreaterThan(0.2);
    expect(cosmicScaleFrame(5.4).remoteArrive).toBeGreaterThan(2);
    expect(cosmicScaleFrame(5.4).remoteArrive).toBeLessThan(cosmicScaleFrame(5).remoteArrive);
    expect(cosmicScaleFrame(6).remoteArrive).toBeCloseTo(1, 5);
    let previous = cosmicScaleFrame(0);
    for (let p = 0.01; p <= 6; p += 0.01) {
      const f = cosmicScaleFrame(p);
      expect(f.solarScale).toBeLessThanOrEqual(previous.solarScale);
      expect(f.galaxyScale).toBeLessThanOrEqual(previous.galaxyScale);
      if (p > 2.65 && p < 4.1) expect(f.neighbourOpacity + f.galaxyOpacity).toBeGreaterThan(0.05);
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
