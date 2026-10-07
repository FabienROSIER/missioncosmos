import { describe, expect, it } from 'vitest';
import {
  getRobotVoiceMessage,
  resolveRobotVoiceForStep,
  ROBOT_VOICE_COMMON,
  ROBOT_VOICE_MESSAGES,
} from './robotVoiceCatalog';
import { robotVoicePublicUrl } from '@/features/audio/robotVoicePlayer';

describe('catalogue voix robot', () => {
  it('contient les 47 messages essentiels', () => {
    expect(ROBOT_VOICE_MESSAGES).toHaveLength(47);
    expect(getRobotVoiceMessage(ROBOT_VOICE_COMMON.quiz)?.relativePath).toBe(
      'common/common.quiz.mp3',
    );
  });

  it('associe les étapes aux consignes et priorise la sécurité éclipses', () => {
    expect(resolveRobotVoiceForStep('m01-challenge-equator')?.id).toBe('mission-01.reperes');
    expect(resolveRobotVoiceForStep('m04-challenge-solar')?.id).toBe('mission-04.securite');
    expect(resolveRobotVoiceForStep('m04-intro')?.id).toBe('mission-04.aligner');
    expect(resolveRobotVoiceForStep('etape-inconnue')).toBeUndefined();
  });

  it('construit une URL publique avec basePath', () => {
    expect(robotVoicePublicUrl('mission-12/mission-12.voisines.mp3')).toBe(
      '/assets/audio/robot/fr/mission-12/mission-12.voisines.mp3',
    );
  });
});
