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
 */
export function useMissionRobotVoice(input: UseMissionRobotVoiceInput) {
  const { enabled, play, replay, stop } = useRobotVoice();
  const autoPlayedRef = useRef(new Set<string>());
  const challengeRetryPlayedRef = useRef(false);
  const quizIntroPlayedRef = useRef(false);
  const missionBravoPlayedRef = useRef(false);
  const prevQuizMoodRef = useRef<CompanionFeedbackMood>('none');
  const missionIdRef = useRef(input.missionId);
  const lastMessageRef = useRef<string | null>(null);

  // Reset des compteurs quand on change de mission.
  useEffect(() => {
    if (missionIdRef.current === input.missionId) return;
    missionIdRef.current = input.missionId;
    autoPlayedRef.current = new Set();
    challengeRetryPlayedRef.current = false;
    quizIntroPlayedRef.current = false;
    missionBravoPlayedRef.current = false;
    prevQuizMoodRef.current = 'none';
    lastMessageRef.current = null;
    robotVoiceController.resetSessionMarks();
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
      lastMessageRef.current = null;
      return () => {
        cancelled = true;
      };
    }

    // Fin de mission : un seul bravo.
    if (isMissionFinale(input.stepKind, input.isComplete)) {
      const bravoId = ROBOT_VOICE_COMMON.success;
      if (!missionBravoPlayedRef.current && lastMessageRef.current !== bravoId) {
        stop();
        lastMessageRef.current = bravoId;
        const result = robotVoiceController.play(bravoId);
        if (result !== 'skipped') {
          queueMicrotask(() => {
            if (!cancelled) missionBravoPlayedRef.current = true;
          });
        }
      }
      return () => {
        cancelled = true;
        // Pas de stop : évite de couper le bravo (Strict Mode / re-render).
      };
    }

    if (input.stepKind === 'quiz') {
      const quizId = ROBOT_VOICE_COMMON.quiz;
      if (!quizIntroPlayedRef.current && lastMessageRef.current !== quizId) {
        stop();
        lastMessageRef.current = quizId;
        const result = robotVoiceController.play(quizId);
        if (result !== 'skipped') {
          queueMicrotask(() => {
            if (!cancelled) quizIntroPlayedRef.current = true;
          });
        }
      }
      return () => {
        cancelled = true;
      };
    }

    const message = resolveRobotVoiceForStep(input.stepId);
    if (!message) {
      return () => {
        cancelled = true;
      };
    }

    if (autoPlayedRef.current.has(message.id) || lastMessageRef.current === message.id) {
      return () => {
        cancelled = true;
      };
    }

    // Nouveau message uniquement : stop l’ancien, lance le nouveau.
    stop();
    lastMessageRef.current = message.id;
    const result = robotVoiceController.play(message.id);
    if (result !== 'skipped') markPlayed(message.id);

    return () => {
      cancelled = true;
      // Pas de stop ici : laisse finir le dialogue (Strict Mode / clic UI).
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

  // Défi : erreur une fois max par étape.
  useEffect(() => {
    if (!enabled || input.filmPlaying || input.stepKind === 'quiz') return;

    if (input.feedbackWrong === true && !challengeRetryPlayedRef.current) {
      challengeRetryPlayedRef.current = true;
      play(ROBOT_VOICE_COMMON.retry);
    }
  }, [enabled, input.filmPlaying, input.feedbackWrong, input.stepKind, play]);

  // Stop à la sortie réelle de la mission.
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
