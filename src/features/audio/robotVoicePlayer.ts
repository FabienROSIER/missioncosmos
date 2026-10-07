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

export type RobotVoicePlayResult = 'started' | 'queued' | 'skipped';

/**
 * Lecteur voix robot (HTMLAudioElement), distinct de la musique.
 * MP3 préenregistrés uniquement — pas de TTS de secours dans ce lot.
 */
class RobotVoiceController {
  private audio: HTMLAudioElement | null = null;
  private unlocked = false;
  private enabled = true;
  private lastMessageId: string | null = null;
  /** Message demandé avant que play() navigateur soit possible. */
  private pendingMessageId: string | null = null;
  /** Messages déjà démarrés avec succès (évite relecture au clic / unlock). */
  private startedMessageIds = new Set<string>();
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

  /** Aligne le déblocage sur la musique si elle est déjà autorisée. */
  syncUnlockFromMusic(): void {
    if (musicController.isUnlocked()) {
      this.unlocked = true;
    }
  }

  /** Débloque l’autoplay ; ne relance un pending que s’il n’a pas déjà été entendu. */
  unlock(): void {
    this.unlocked = true;
    this.flushPending();
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

  /** Oublie les messages « déjà joués » (changement de mission). */
  resetSessionMarks(): void {
    this.startedMessageIds.clear();
  }

  /** Joue un message par id catalogue. No-op si désactivé ou fichier inconnu. */
  play(messageId: string, options?: { force?: boolean }): RobotVoicePlayResult {
    if (!this.enabled) return 'skipped';

    this.syncUnlockFromMusic();

    const message = getRobotVoiceMessage(messageId);
    if (!message) return 'skipped';

    this.lastMessageId = messageId;
    this.notify();

    // Déjà démarré dans cette session : pas de relecture auto (clic / unlock).
    if (!options?.force && this.startedMessageIds.has(messageId)) {
      this.pendingMessageId = null;
      return 'skipped';
    }

    if (!this.unlocked) {
      this.pendingMessageId = messageId;
      // Baisse la musique dès la mise en file (lancement mission).
      musicController.setSpeechDuck(true);
      return 'queued';
    }

    this.pendingMessageId = null;
    void this.startPlayback(message, Boolean(options?.force));
    return 'started';
  }

  /** Relance le dernier message (ou un id fourni) — volontaire (bouton Écouter). */
  replay(messageId?: string): void {
    const id = messageId ?? this.lastMessageId;
    if (!id) return;
    this.play(id, { force: true });
  }

  stop(): void {
    this.pendingMessageId = null;
    const el = this.audio;
    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
    const wasPlaying = this.playing;
    this.playing = false;
    musicController.setSpeechDuck(false);
    if (wasPlaying) this.notify();
  }

  private flushPending(): void {
    if (!this.enabled || !this.pendingMessageId) return;
    const id = this.pendingMessageId;
    if (this.startedMessageIds.has(id)) {
      this.pendingMessageId = null;
      if (!this.playing) musicController.setSpeechDuck(false);
      return;
    }
    const message = getRobotVoiceMessage(id);
    if (!message) {
      this.pendingMessageId = null;
      musicController.setSpeechDuck(false);
      return;
    }
    this.pendingMessageId = null;
    this.lastMessageId = id;
    void this.startPlayback(message, false);
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

  private async startPlayback(message: RobotVoiceMessage, force: boolean): Promise<void> {
    if (!force && this.startedMessageIds.has(message.id) && this.playing) {
      return;
    }

    const el = this.ensureAudio();
    el.pause();
    el.src = robotVoicePublicUrl(message.relativePath);
    this.playing = true;
    musicController.setSpeechDuck(true);
    this.notify();
    try {
      await el.play();
      this.startedMessageIds.add(message.id);
      this.pendingMessageId = null;
    } catch {
      // Autoplay encore bloqué : garder le duck + file d’attente, sans relecture forcée ensuite.
      this.playing = false;
      if (!this.startedMessageIds.has(message.id)) {
        this.pendingMessageId = message.id;
        musicController.setSpeechDuck(true);
      } else {
        musicController.setSpeechDuck(false);
      }
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
