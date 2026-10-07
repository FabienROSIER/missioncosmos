'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ROBOT_VOICE_COMMON,
  resolveRobotVoiceForStep,
} from '@/content/audio/robotVoiceCatalog';
import { useRobotVoice } from '@/features/audio/RobotVoiceProvider';
import { robotVoiceController } from '@/features/audio/robotVoicePlayer';
import type { CompanionFeedbackMood } from '@/features/companion';
import type { MissionStepKind } from '@/types/mission';

type UseMissionRobotVoiceInput = {
  missionId: string;
  stepId: string;
  stepKind: MissionStepKind;
  feedbackWrong: boolean | null;
  quizMood: CompanionFeedbackMood;
  filmPlaying: boolean;
  isComplete: boolean;
};

function isMissionFinale(stepKind: MissionStepKind, isComplete: boolean): boolean {
  return isComplete || stepKind === 'reward' || stepKind === 'complete';
}

function resolveAutoMessage(
  stepId: string,
  stepKind: MissionStepKind,
  isComplete: boolean,
): string | null {
  if (isMissionFinale(stepKind, isComplete)) return ROBOT_VOICE_COMMON.success;
  if (stepKind === 'quiz') return ROBOT_VOICE_COMMON.quiz;
  return resolveRobotVoiceForStep(stepId)?.id ?? null;
}

/**
 * Déclencheurs voix en mission.
 * Strict Mode : le cleanup annule le marquage sans stop, pour pouvoir rejouer
 * si le double montage a coupé l’audio ; le lecteur empêche la relecture au clic.
 */
export function useMissionRobotVoice(input: UseMissionRobotVoiceInput) {
  const { enabled, play, replay, stop } = useRobotVoice();
  const scheduledRef = useRef(new Set<string>());
  const challengeRetryPlayedRef = useRef(false);
  const prevQuizMoodRef = useRef<CompanionFeedbackMood>('none');
  const missionIdRef = useRef(input.missionId);
  const currentAutoIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (missionIdRef.current === input.missionId) return;
    missionIdRef.current = input.missionId;
    scheduledRef.current = new Set();
    challengeRetryPlayedRef.current = false;
    prevQuizMoodRef.current = 'none';
    currentAutoIdRef.current = null;
    robotVoiceController.resetSessionMarks();
    stop();
  }, [input.missionId, stop]);

  useEffect(() => {
    let cancelled = false;
    challengeRetryPlayedRef.current = false;
    prevQuizMoodRef.current = 'none';

    if (!enabled || input.filmPlaying) {
      stop();
      currentAutoIdRef.current = null;
      return () => {
        cancelled = true;
      };
    }

    const messageId = resolveAutoMessage(input.stepId, input.stepKind, input.isComplete);
    if (!messageId) {
      return () => {
        cancelled = true;
      };
    }

    // Même consigne déjà planifiée pour cette mission (étapes partagées) : ne pas relancer.
    if (scheduledRef.current.has(messageId)) {
      currentAutoIdRef.current = messageId;
      return () => {
        cancelled = true;
      };
    }

    const previous = currentAutoIdRef.current;
    if (previous && previous !== messageId) {
      stop();
    }

    currentAutoIdRef.current = messageId;
    const result = robotVoiceController.play(messageId);
    if (result !== 'skipped') {
      // Marquage différé : si Strict Mode annule tout de suite, on ne bloque pas le 2e passage.
      queueMicrotask(() => {
        if (!cancelled) scheduledRef.current.add(messageId);
      });
    }

    return () => {
      cancelled = true;
      // Ne pas stop() ici (coupe le 1er dialogue).
    };
  }, [
    enabled,
    input.filmPlaying,
    input.isComplete,
    input.stepId,
    input.stepKind,
    stop,
  ]);

  useEffect(() => {
    if (!enabled || input.filmPlaying || input.stepKind !== 'quiz') {
      prevQuizMoodRef.current = input.quizMood;
      return;
    }
    const prev = prevQuizMoodRef.current;
    if (input.quizMood === 'wrong' && prev !== 'wrong') {
      play(ROBOT_VOICE_COMMON.retry);
    }
    prevQuizMoodRef.current = input.quizMood;
  }, [enabled, input.filmPlaying, input.quizMood, input.stepKind, play]);

  useEffect(() => {
    if (!enabled || input.filmPlaying || input.stepKind === 'quiz') return;
    if (input.feedbackWrong === true && !challengeRetryPlayedRef.current) {
      challengeRetryPlayedRef.current = true;
      play(ROBOT_VOICE_COMMON.retry);
    }
  }, [enabled, input.filmPlaying, input.feedbackWrong, input.stepKind, play]);

  // Stop uniquement au démontage réel du hook (sortie de MissionImmersive).
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const replayCurrent = useCallback(() => {
    if (!enabled) return;
    const messageId = resolveAutoMessage(input.stepId, input.stepKind, input.isComplete);
    if (messageId) {
      replay(messageId);
      return;
    }
    replay();
  }, [enabled, input.isComplete, input.stepId, input.stepKind, replay]);

  const playMaquetteHint = useCallback(() => {
    if (!enabled || input.filmPlaying) return;
    play(ROBOT_VOICE_COMMON.maquette);
  }, [enabled, input.filmPlaying, play]);

  const canReplay =
    enabled &&
    !input.filmPlaying &&
    Boolean(resolveAutoMessage(input.stepId, input.stepKind, input.isComplete));

  return { replayCurrent, playMaquetteHint, canReplay, voiceEnabled: enabled };
}
