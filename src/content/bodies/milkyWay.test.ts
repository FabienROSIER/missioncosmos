import { describe, expect, it } from 'vitest';
import {
  GALAXY_RADIUS,
  GALAXY_LOCATIONS,
  SUN_NEIGHBOURHOOD,
  SOLAR_NEIGHBOUR_STARS,
  galaxyPoints,
  galaxyJourney,
  galaxyTransition,
  galacticRoutePosition,
} from './milkyWay';
import { MISSION_11 } from '@/content/missions/mission-11';
import { getMissionById } from '@/content/missions';
import { getQuizById } from '@/content/quizzes';
import { getRewardById } from '@/content/rewards/catalog';
import { getGlossaryEntry } from '@/content/glossary';
import { validateMission } from '@/content/missions/validateMission';

describe('mission Notre galaxie', () => {
  it('propose un tour galactique complet, distinct du petit cercle et de la chute vers le centre', () => {
    const radius = Math.hypot(SUN_NEIGHBOURHOOD.x, SUN_NEIGHBOURHOOD.z);
    for (let i = 0; i <= 100; i++) {
      const point = galacticRoutePosition('b', i / 100);
      expect(Math.hypot(point.x, point.z)).toBeCloseTo(radius);
      expect(point.y).toBe(SUN_NEIGHBOURHOOD.y);
    }
    const opposite = galacticRoutePosition('b', 0.5);
    expect(opposite.x).toBeCloseTo(-SUN_NEIGHBOURHOOD.x);
    expect(opposite.z).toBeCloseTo(-SUN_NEIGHBOURHOOD.z);
    expect(galacticRoutePosition('b', 1).x).toBeCloseTo(SUN_NEIGHBOURHOOD.x);
    expect(Math.hypot(galacticRoutePosition('c', 1).x, galacticRoutePosition('c', 1).z)).toBe(0);
    expect(galacticRoutePosition('a', 0.5).x).toBeGreaterThan(0);
    for (const id of ['a', 'b', 'c'] as const) {
      expect(galacticRoutePosition(id, 0).x).toBeCloseTo(SUN_NEIGHBOURHOOD.x);
      expect(galacticRoutePosition(id, -1)).toEqual(galacticRoutePosition(id, 0));
      expect(galacticRoutePosition(id, 2)).toEqual(galacticRoutePosition(id, 1));
    }
    const challenge = MISSION_11.steps.find((step) => step.id === 'm11-orbit');
    expect(challenge?.requiresSuccess).toBe(true);
    expect(MISSION_11.steps.findIndex((step) => step.id === 'm11-orbit')).toBeLessThan(
      MISSION_11.steps.findIndex((step) => step.kind === 'quiz'),
    );
  });
  it('préserve un contexte visible pendant tout le recul, sans intervalle vide', () => {
    for (let p = 0; p <= 1; p += 0.001) {
      const view = galaxyTransition(p);
      expect(
        view.solarScale > 0.01 || view.neighboursOpacity > 0.1 || view.galaxyOpacity > 0.1,
      ).toBe(true);
    }
    const early = galaxyTransition(0.025);
    expect(early.neighboursOpacity).toBe(1);
    expect(early.solarScale).toBeGreaterThan(0.1);
    expect(galaxyTransition(0.12).galaxyOpacity).toBeGreaterThan(0.1);
    // The galaxy is already perceptible when the local light cores become tiny.
    expect(galaxyTransition(0.08).galaxyOpacity).toBeGreaterThan(0.15);
  });
  it('conserve le Soleil en point et fond ses voisines dans la vue galactique', () => {
    for (const p of [0.04, 0.12, 0.5, 1]) expect(galaxyTransition(p).sunOpacity).toBe(1);
    expect(galaxyTransition(0).sunOpacity).toBe(0);
    expect(galaxyTransition(1).neighboursOpacity).toBe(0);
    expect(galaxyTransition(1).galaxyOpacity).toBe(1);
    expect(galaxyTransition(-1)).toEqual(galaxyTransition(0));
    expect(galaxyTransition(2)).toEqual(galaxyTransition(1));
  });
  it('rend le voisinage minuscule devant la galaxie avant de le fondre', () => {
    const diameter = Math.max(
      ...SOLAR_NEIGHBOUR_STARS.flatMap((a) =>
        SOLAR_NEIGHBOUR_STARS.map((b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)),
      ),
    );
    const local = galaxyTransition(0.025);
    const galactic = galaxyTransition(0.12);
    expect(local.neighboursScale).toBe(1);
    expect(galactic.neighboursOpacity).toBe(1);
    expect(galactic.galaxyOpacity).toBeGreaterThan(0.1);
    expect((diameter * galactic.neighboursScale) / (2 * GALAXY_RADIUS)).toBeLessThan(0.001);
    expect(galactic.neighboursPointSize).toBeLessThan(local.neighboursPointSize / 3);
    let previous = local.neighboursScale;
    for (let p = 0.025; p < 1; p += 0.001) {
      const view = galaxyTransition(p);
      expect(view.neighboursScale).toBeLessThanOrEqual(previous);
      previous = view.neighboursScale;
    }
  });
  it('garde un disque borné et un centre plus épais dans tous les niveaux graphiques', () => {
    for (const count of [1600, 3200, 5200]) {
      const points = galaxyPoints(count);
      expect(points).toHaveLength(count);
      expect(points).toEqual(galaxyPoints(count));
      expect(
        points.every(
          (p) => Number.isFinite(p.x + p.y + p.z) && Math.hypot(p.x, p.z) < GALAXY_RADIUS,
        ),
      ).toBe(true);
      const bulge = points.filter((p) => p.warm),
        disk = points.filter((p) => !p.warm);
      expect(Math.max(...bulge.map((p) => Math.abs(p.y)))).toBeGreaterThan(
        Math.max(...disk.map((p) => Math.abs(p.y))),
      );
    }
  });
  it('place le Soleil loin du centre, dans le disque, avec un seul repère correct', () => {
    const radius = Math.hypot(SUN_NEIGHBOURHOOD.x, SUN_NEIGHBOURHOOD.z);
    expect(radius).toBeGreaterThan(GALAXY_RADIUS * 0.4);
    expect(radius).toBeLessThan(GALAXY_RADIUS * 0.65);
    expect(GALAXY_LOCATIONS.filter((p) => p.correct)).toHaveLength(1);
    expect(GALAXY_LOCATIONS.filter((p) => !p.correct).every((p) => p.hint.length > 0)).toBe(true);
  });
  it('borne le voyage et avance sans revenir en arrière', () => {
    expect(galaxyJourney(-2)).toBe(0);
    expect(galaxyJourney(50)).toBe(1);
    let previous = 0;
    for (let t = 0; t <= 8; t += 0.1) {
      const progress = galaxyJourney(t);
      expect(progress).toBeGreaterThanOrEqual(previous);
      previous = progress;
    }
  });
  it('branche les contenus, le quiz, le badge et tous les mots du glossaire', () => {
    expect(validateMission(MISSION_11)).toEqual([]);
    expect(getMissionById(MISSION_11.id)).toEqual(MISSION_11);
    expect(getQuizById(MISSION_11.quizId!)?.questions.length).toBe(3);
    expect(MISSION_11.rewardIds.every((id) => Boolean(getRewardById(id)))).toBe(true);
    expect(MISSION_11.glossaryIds).toHaveLength(4);
    expect((MISSION_11.glossaryIds ?? []).every((id) => Boolean(getGlossaryEntry(id)))).toBe(true);
  });
});
