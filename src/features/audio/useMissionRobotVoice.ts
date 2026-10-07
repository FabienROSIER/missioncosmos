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
  /** Feedback défi visible (null = aucun). */
  feedbackWrong: boolean | null;
  quizMood: CompanionFeedbackMood;
  /** Ne pas parler pendant un film. */
  filmPlaying: boolean;
  /** Mission terminée (écran récompense / complete). */
  isComplete: boolean;
};

function isMissionFinale(stepKind: MissionStepKind, isComplete: boolean): boolean {
  return isComplete || stepKind === 'reward' || stepKind === 'complete';
}

/**
 * Déclencheurs voix en mission : consigne à la 1re étape pertinente,
 * phrases communes quiz / erreur, bravo une seule fois en fin de mission.
 *
 * Le marquage « déjà joué » est différé pour survivre au double montage Strict Mode
 * (sinon le 1er dialogue est stoppé au cleanup puis jamais rejoué).
 */
export function useMissionRobotVoice(input: UseMissionRobotVoiceInput) {
  const { enabled, play, replay, stop } = useRobotVoice();
  const autoPlayedRef = useRef(new Set<string>());
  const challengeRetryPlayedRef = useRef(false);
  const quizIntroPlayedRef = useRef(false);
  const missionBravoPlayedRef = useRef(false);
  const prevQuizMoodRef = useRef<CompanionFeedbackMood>('none');
  const missionIdRef = useRef(input.missionId);

  // Reset des compteurs quand on change de mission.
  useEffect(() => {
    if (missionIdRef.current === input.missionId) return;
    missionIdRef.current = input.missionId;
    autoPlayedRef.current = new Set();
    challengeRetryPlayedRef.current = false;
    quizIntroPlayedRef.current = false;
    missionBravoPlayedRef.current = false;
    prevQuizMoodRef.current = 'none';
    stop();
  }, [input.missionId, stop]);

  // Consigne d'étape / bravo de fin (une fois).
  useEffect(() => {
    let cancelled = false;
    challengeRetryPlayedRef.current = false;
    prevQuizMoodRef.current = 'none';

    const markPlayed = (messageId: string) => {
      queueMicrotask(() => {
        if (!cancelled) autoPlayedRef.current.add(messageId);
      });
    };

    if (!enabled || input.filmPlaying) {
      stop();
      return () => {
        cancelled = true;
      };
    }

    // Fin de mission : un seul bravo.
    if (isMissionFinale(input.stepKind, input.isComplete)) {
      if (!missionBravoPlayedRef.current) {
        stop();
        const result = robotVoiceController.play(ROBOT_VOICE_COMMON.success);
        if (result !== 'skipped') {
          queueMicrotask(() => {
            if (!cancelled) missionBravoPlayedRef.current = true;
          });
        }
      }
      return () => {
        cancelled = true;
      };
    }

    stop();

    if (input.stepKind === 'quiz') {
      if (!quizIntroPlayedRef.current) {
        const result = robotVoiceController.play(ROBOT_VOICE_COMMON.quiz);
        if (result !== 'skipped') {
          queueMicrotask(() => {
            if (!cancelled) quizIntroPlayedRef.current = true;
          });
        }
      }
      return () => {
        cancelled = true;
        stop();
      };
    }

    const message = resolveRobotVoiceForStep(input.stepId);
    if (!message) {
      return () => {
        cancelled = true;
      };
    }

    if (autoPlayedRef.current.has(message.id)) {
      return () => {
        cancelled = true;
      };
    }

    const result = robotVoiceController.play(message.id);
    if (result !== 'skipped') markPlayed(message.id);

    return () => {
      cancelled = true;
      stop();
    };
  }, [
    enabled,
    input.filmPlaying,
    input.isComplete,
    input.stepId,
    input.stepKind,
    stop,
  ]);

  // Quiz : erreur uniquement (front montant).
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

  // Défi : erreur une fois max par étape (évite le spam clic).
  useEffect(() => {
    if (!enabled || input.filmPlaying || input.stepKind === 'quiz') return;

    if (input.feedbackWrong === true && !challengeRetryPlayedRef.current) {
      challengeRetryPlayedRef.current = true;
      play(ROBOT_VOICE_COMMON.retry);
    }
  }, [enabled, input.filmPlaying, input.feedbackWrong, input.stepKind, play]);

  // Stop propre à la sortie de mission (démontage réel).
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const replayCurrent = useCallback(() => {
    if (!enabled) return;
    if (input.stepKind === 'quiz') {
      replay(ROBOT_VOICE_COMMON.quiz);
      return;
    }
    if (isMissionFinale(input.stepKind, input.isComplete)) {
      replay(ROBOT_VOICE_COMMON.success);
      return;
    }
    const message = resolveRobotVoiceForStep(input.stepId);
    if (message) {
      replay(message.id);
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
    (input.stepKind === 'quiz' ||
      isMissionFinale(input.stepKind, input.isComplete) ||
      Boolean(resolveRobotVoiceForStep(input.stepId)));

  return { replayCurrent, playMaquetteHint, canReplay, voiceEnabled: enabled };
}
