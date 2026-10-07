import {
  getRobotVoiceMessage,
  ROBOT_VOICE_LOCALE,
  type RobotVoiceMessage,
} from '@/content/audio/robotVoiceCatalog';
import { ASSETS_PUBLIC_ROOT } from '@/lib/constants';
import { withBasePath } from '@/lib/basePath';
import { musicController } from '@/features/audio/musicPlayer';

const STORAGE_ENABLED = 'mc:robot-voice-enabled';

export function robotVoicePublicUrl(relativePath: string): string {
  return withBasePath(
    `${ASSETS_PUBLIC_ROOT}/audio/robot/${ROBOT_VOICE_LOCALE}/${relativePath}`,
  );
}

type VoiceListener = () => void;

/**
 * Lecteur voix robot (HTMLAudioElement), distinct de la musique.
 * MP3 préenregistrés uniquement — pas de TTS de secours dans ce lot.
 */
class RobotVoiceController {
  private audio: HTMLAudioElement | null = null;
  private unlocked = false;
  private enabled = true;
  private lastMessageId: string | null = null;
  private playing = false;
  private readonly listeners = new Set<VoiceListener>();

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_ENABLED);
      if (raw === '0') this.enabled = false;
      if (raw === '1') this.enabled = true;
    } catch {
      /* ignore */
    }
  }

  subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  unlock(): void {
    this.unlocked = true;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    try {
      window.localStorage.setItem(STORAGE_ENABLED, enabled ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (!enabled) this.stop();
    this.notify();
  }

  getLastMessageId(): string | null {
    return this.lastMessageId;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  /** Joue un message par id catalogue. No-op si désactivé ou fichier inconnu. */
  play(messageId: string): void {
    if (!this.enabled) return;

    const message = getRobotVoiceMessage(messageId);
    if (!message) return;

    this.lastMessageId = messageId;
    this.notify();

    if (!this.unlocked) return;
    void this.startPlayback(message);
  }

  /** Relance le dernier message (ou un id fourni). */
  replay(messageId?: string): void {
    const id = messageId ?? this.lastMessageId;
    if (!id) return;
    this.play(id);
  }

  stop(): void {
    const el = this.audio;
    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
    if (this.playing) {
      this.playing = false;
      musicController.setSpeechDuck(false);
      this.notify();
    }
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const el = new Audio();
    el.preload = 'auto';
    el.addEventListener('ended', () => this.onEnded());
    el.addEventListener('error', () => this.onEnded());
    this.audio = el;
    return el;
  }

  private async startPlayback(message: RobotVoiceMessage): Promise<void> {
    const el = this.ensureAudio();
    el.pause();
    el.src = robotVoicePublicUrl(message.relativePath);
    this.playing = true;
    musicController.setSpeechDuck(true);
    this.notify();
    try {
      await el.play();
    } catch {
      this.playing = false;
      musicController.setSpeechDuck(false);
      this.notify();
    }
  }

  private onEnded(): void {
    if (!this.playing) return;
    this.playing = false;
    musicController.setSpeechDuck(false);
    this.notify();
  }
}

export const robotVoiceController = new RobotVoiceController();
