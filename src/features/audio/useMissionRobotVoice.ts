'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ROBOT_VOICE_COMMON,
  resolveRobotVoiceForStep,
} from '@/content/audio/robotVoiceCatalog';
import { useRobotVoice } from '@/features/audio/RobotVoiceProvider';
import type { CompanionFeedbackMood } from '@/features/companion';
import type { MissionStepKind } from '@/types/mission';

type UseMissionRobotVoiceInput = {
  missionId: string;
  stepId: string;
  stepKind: MissionStepKind;
  /** Feedback défi visible (null = aucun). */
  feedbackWrong: boolean | null;
  feedbackSuccess: boolean | null;
  quizMood: CompanionFeedbackMood;
  /** Ne pas parler pendant un film. */
  filmPlaying: boolean;
};

/**
 * Déclencheurs voix en mission : consigne à la 1re étape pertinente,
 * phrases communes quiz / erreur / réussite, arrêt au changement d'étape.
 */
export function useMissionRobotVoice(input: UseMissionRobotVoiceInput) {
  const { enabled, play, replay, stop } = useRobotVoice();
  const autoPlayedRef = useRef(new Set<string>());
  const challengeRetryPlayedRef = useRef(false);
  const challengeSuccessPlayedRef = useRef(false);
  const quizIntroPlayedRef = useRef(false);
  const prevQuizMoodRef = useRef<CompanionFeedbackMood>('none');
  const missionIdRef = useRef(input.missionId);

  // Reset des compteurs quand on change de mission.
  useEffect(() => {
    if (missionIdRef.current === input.missionId) return;
    missionIdRef.current = input.missionId;
    autoPlayedRef.current = new Set();
    challengeRetryPlayedRef.current = false;
    challengeSuccessPlayedRef.current = false;
    quizIntroPlayedRef.current = false;
    prevQuizMoodRef.current = 'none';
  }, [input.missionId]);

  // Arrêt + consigne d'étape (une fois par message id).
  useEffect(() => {
    stop();
    challengeRetryPlayedRef.current = false;
    challengeSuccessPlayedRef.current = false;
    prevQuizMoodRef.current = 'none';

    if (!enabled || input.filmPlaying) return;

    if (input.stepKind === 'quiz') {
      if (!quizIntroPlayedRef.current) {
        quizIntroPlayedRef.current = true;
        play(ROBOT_VOICE_COMMON.quiz);
      }
      return;
    }

    const message = resolveRobotVoiceForStep(input.stepId);
    if (!message) return;
    if (autoPlayedRef.current.has(message.id)) return;
    autoPlayedRef.current.add(message.id);
    play(message.id);
  }, [enabled, input.filmPlaying, input.stepId, input.stepKind, play, stop]);

  // Quiz : front montant wrong / success (pas à chaque re-render).
  useEffect(() => {
    if (!enabled || input.filmPlaying || input.stepKind !== 'quiz') {
      prevQuizMoodRef.current = input.quizMood;
      return;
    }

    const prev = prevQuizMoodRef.current;
    if (input.quizMood === 'wrong' && prev !== 'wrong') {
      play(ROBOT_VOICE_COMMON.retry);
    } else if (input.quizMood === 'success' && prev !== 'success') {
      play(ROBOT_VOICE_COMMON.success);
    }
    prevQuizMoodRef.current = input.quizMood;
  }, [enabled, input.filmPlaying, input.quizMood, input.stepKind, play]);

  // Défi : une erreur et une réussite max par étape (évite le spam clic).
  useEffect(() => {
    if (!enabled || input.filmPlaying || input.stepKind === 'quiz') return;

    if (input.feedbackWrong === true && !challengeRetryPlayedRef.current) {
      challengeRetryPlayedRef.current = true;
      play(ROBOT_VOICE_COMMON.retry);
      return;
    }

    if (input.feedbackSuccess === true && !challengeSuccessPlayedRef.current) {
      challengeSuccessPlayedRef.current = true;
      play(ROBOT_VOICE_COMMON.success);
    }
  }, [
    enabled,
    input.filmPlaying,
    input.feedbackWrong,
    input.feedbackSuccess,
    input.stepKind,
    play,
  ]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const replayCurrent = useCallback(() => {
    if (!enabled) return;
    if (input.stepKind === 'quiz') {
      replay(ROBOT_VOICE_COMMON.quiz);
      return;
    }
    const message = resolveRobotVoiceForStep(input.stepId);
    if (message) {
      replay(message.id);
      return;
    }
    replay();
  }, [enabled, input.stepId, input.stepKind, replay]);

  const playMaquetteHint = useCallback(() => {
    if (!enabled || input.filmPlaying) return;
    play(ROBOT_VOICE_COMMON.maquette);
  }, [enabled, input.filmPlaying, play]);

  const canReplay =
    enabled &&
    !input.filmPlaying &&
    (input.stepKind === 'quiz' || Boolean(resolveRobotVoiceForStep(input.stepId)));

  return { replayCurrent, playMaquetteHint, canReplay, voiceEnabled: enabled };
}
