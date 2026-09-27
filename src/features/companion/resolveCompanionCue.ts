import { COMPANION_LINES } from '@/content/companion/lines';
import type { CompanionPose } from '@/lib/assets/paths';
import type { MissionStepKind } from '@/types/mission';

export type CompanionFeedbackMood = 'none' | 'wrong' | 'success';

export type CompanionCueInput = {
  stepKind: MissionStepKind;
  challengeSolved: boolean;
  feedback: CompanionFeedbackMood;
  isComplete: boolean;
  /** Premier fun fact de mission, si on veut une curiosité sobre. */
  funFact?: string;
};

export type CompanionCue = {
  pose: CompanionPose;
  /** Ligne courte d’ambiance — jamais le seul support pédagogique. */
  line?: string;
};

/**
 * Pose + réplique selon l’étape et le feedback.
 * Contenu scientifique (indices, explications) reste dans la mission.
 */
export function resolveCompanionCue(input: CompanionCueInput): CompanionCue {
  const { stepKind, challengeSolved, feedback, isComplete, funFact } = input;

  if (feedback === 'wrong') {
    return { pose: 'hint', line: COMPANION_LINES.softRetry };
  }

  if (feedback === 'success') {
    return { pose: 'happy', line: COMPANION_LINES.softSuccess };
  }

  if (isComplete || stepKind === 'reward' || stepKind === 'complete') {
    return { pose: 'happy', line: COMPANION_LINES.missionDone };
  }

  if (challengeSolved && (stepKind === 'challenge' || stepKind === 'quiz')) {
    return { pose: 'happy', line: COMPANION_LINES.softSuccess };
  }

  switch (stepKind) {
    case 'intro':
      return { pose: 'welcome', line: COMPANION_LINES.welcome };
    case 'manipulate':
      return { pose: 'encouraging' };
    case 'observe':
      return { pose: 'surprised' };
    case 'challenge':
      return { pose: 'point-right', line: COMPANION_LINES.tryChallenge };
    case 'quiz':
      return { pose: 'thinking', line: COMPANION_LINES.quizThink };
    case 'explain':
      return {
        pose: 'thinking',
        line: funFact ? `${COMPANION_LINES.curiosity} ${funFact}` : undefined,
      };
    default:
      return { pose: 'neutral' };
  }
}
