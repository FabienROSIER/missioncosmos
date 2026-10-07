import { musicController } from '@/features/audio/musicPlayer';
import { robotVoiceController } from '@/features/audio/robotVoicePlayer';

/** Débloque musique + voix robot après un geste utilisateur. */
export function unlockGameAudio(): void {
  musicController.unlock();
  robotVoiceController.unlock();
}
