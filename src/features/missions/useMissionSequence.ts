'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  clearMissionSession,
  loadMissionSession,
  saveMissionSession,
} from '@/features/missions/missionSession';
import type { Mission, MissionStep } from '@/types/mission';

const SESSION_EVENT = 'mc:mission-session-change';

function subscribeSession(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => onStoreChange();
  window.addEventListener(SESSION_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(SESSION_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function emitSessionChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

function getSavedStepIndex(missionId: string, stepCount: number): number {
  const session = loadMissionSession(missionId);
  if (!session) return 0;
  if (session.stepIndex <= 0 || session.stepIndex >= stepCount) return 0;
  return session.stepIndex;
}

export function useMissionSequence(mission: Mission) {
  const savedIndex = useSyncExternalStore(
    subscribeSession,
    () => getSavedStepIndex(mission.id, mission.steps.length),
    () => 0,
  );

  /** null = suivre la session sauvegardée ; sinon navigation en cours */
  const [liveIndex, setLiveIndex] = useState<number | null>(null);
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const stepIndex = liveIndex ?? savedIndex;
  const step: MissionStep = mission.steps[stepIndex] ?? mission.steps[0]!;
  const isComplete = step.kind === 'complete';
  const needsSuccess = Boolean(step.requiresSuccess);
  const canAdvance = !needsSuccess || challengeSolved;
  const resumeAvailable = !bannerDismissed && savedIndex > 0 && liveIndex === null;

  useEffect(() => {
    if (step.kind === 'complete') {
      clearMissionSession(mission.id);
      emitSessionChange();
      return;
    }
    saveMissionSession(mission.id, stepIndex);
    emitSessionChange();
  }, [mission.id, step.kind, stepIndex]);

  const markChallengeSolved = useCallback(() => {
    setChallengeSolved(true);
  }, []);

  const goNext = useCallback(() => {
    const current = mission.steps[stepIndex];
    if (current?.requiresSuccess && !challengeSolved) return;
    const next = Math.min(stepIndex + 1, mission.steps.length - 1);
    if (next === stepIndex) return;
    setLiveIndex(next);
    setChallengeSolved(false);
    setBannerDismissed(true);
  }, [challengeSolved, mission.steps, stepIndex]);

  const restart = useCallback(() => {
    clearMissionSession(mission.id);
    saveMissionSession(mission.id, 0);
    emitSessionChange();
    setLiveIndex(0);
    setChallengeSolved(false);
    setBannerDismissed(true);
  }, [mission.id]);

  const dismissResumeBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  return {
    stepIndex,
    step,
    challengeSolved,
    isComplete,
    canAdvance,
    resumeAvailable,
    goNext,
    markChallengeSolved,
    restart,
    dismissResumeBanner,
  };
}
