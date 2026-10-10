import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  clearMissionSession,
  loadMissionSession,
  saveMissionSession,
  resolveSessionStepIndex,
} from '@/features/missions/missionSession';
import { MISSION_08 } from '@/content/missions/mission-08';
import { MISSION_10 } from '@/content/missions/mission-10';

describe('missionSession', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sauve et recharge une session', () => {
    saveMissionSession('mission-01', 3);
    const session = loadMissionSession('mission-01');
    expect(session?.stepIndex).toBe(3);
    expect(session?.missionId).toBe('mission-01');
  });

  it('ignore une autre mission', () => {
    saveMissionSession('mission-01', 2);
    expect(loadMissionSession('mission-02')).toBeNull();
  });

  it('reprend la même activité après la séparation des découvertes de la mission 08', () => {
    const stepIds = MISSION_08.steps.map((step) => step.id);
    for (const [oldIndex, stepId] of [
      [1, 'm08-observe'],
      [2, 'm08-challenge'],
      [3, 'm08-explain'],
      [4, 'm08-quiz'],
      [5, 'm08-reward'],
    ] as const) {
      saveMissionSession('mission-08', oldIndex);
      const session = loadMissionSession('mission-08')!;
      expect(stepIds[resolveSessionStepIndex(session, stepIds)]).toBe(stepId);
    }
  });

  it('sauvegarde les nouvelles étapes par identifiant sans appliquer la migration ancienne', () => {
    saveMissionSession('mission-08', 2, 'm08-colors');
    const session = loadMissionSession('mission-08')!;
    expect(session.stepId).toBe('m08-colors');
    expect(
      resolveSessionStepIndex(
        session,
        MISSION_08.steps.map((step) => step.id),
      ),
    ).toBe(2);
    expect(resolveSessionStepIndex(session, ['m08-intro', 'm08-colors'])).toBe(1);
  });

  it('efface la session', () => {
    saveMissionSession('mission-01', 1);
    clearMissionSession('mission-01');
    expect(loadMissionSession('mission-01')).toBeNull();
  });

  it('reprend la question du voyage dans le quiz et conserve les activités suivantes', () => {
    const stepIds = MISSION_10.steps.map((step) => step.id);
    for (const [index, expectedId] of [
      [8, 'm10-quiz'],
      [9, 'm10-quiz'],
      [10, 'm10-reward'],
      [11, 'm10-complete'],
    ] as const) {
      saveMissionSession('mission-10', index);
      expect(stepIds[resolveSessionStepIndex(loadMissionSession('mission-10')!, stepIds)]).toBe(
        expectedId,
      );
    }
    saveMissionSession('mission-10', 8, 'm10-understand');
    expect(stepIds[resolveSessionStepIndex(loadMissionSession('mission-10')!, stepIds)]).toBe(
      'm10-quiz',
    );
    saveMissionSession('mission-10', 9, 'm10-reward');
    expect(stepIds[resolveSessionStepIndex(loadMissionSession('mission-10')!, stepIds)]).toBe(
      'm10-reward',
    );
  });

  it('reprend directement aux photos quand la sauvegarde vise l’étape de distance supprimée', () => {
    saveMissionSession('mission-08', 3, 'm08-apparent');
    const stepIds = MISSION_08.steps.map((step) => step.id);
    expect(stepIds[resolveSessionStepIndex(loadMissionSession('mission-08')!, stepIds)]).toBe(
      'm08-challenge',
    );
  });
});
