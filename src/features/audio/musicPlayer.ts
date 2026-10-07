import {
  GAME_MUSIC,
  MENU_MUSIC,
  musicPublicUrl,
  shuffleTracks,
  type MusicTrack,
} from '@/content/audio/musicCatalog';

export type MusicMode = 'menu' | 'game' | 'off';

const STORAGE_MUTE = 'mc:music-muted';
const STORAGE_VOLUME = 'mc:music-volume';

/**
 * Lecteur musique singleton (HTMLAudioElement).
 * Menu = piste fixe en boucle ; jeu = file shuffle (reshuffle en fin de cycle).
 */
class MusicController {
  private audio: HTMLAudioElement | null = null;
  private mode: MusicMode = 'off';
  private unlocked = false;
  private muted = false;
  private volume = 0.45;
  /** Facteur temporaire pendant la voix du robot (1 = normal). */
  private duckFactor = 1;
  private gameQueue: MusicTrack[] = [];
  private gameIndex = 0;
  private current: MusicTrack | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      this.muted = window.localStorage.getItem(STORAGE_MUTE) === '1';
      const raw = window.localStorage.getItem(STORAGE_VOLUME);
      if (raw != null) {
        const v = Number(raw);
        if (Number.isFinite(v)) this.volume = Math.min(1, Math.max(0, v));
      }
    } catch {
      /* ignore */
    }
  }

  /** Débloque l’audio après un geste utilisateur (politique autoplay). */
  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    // Relance le mode courant avec une vraie source (évite play() sur src vide).
    this.applyMode(this.mode, true);
  }

  setMode(mode: MusicMode, options?: { reshuffle?: boolean }): void {
    // Navigation entre écrans menu : ne pas relancer la piste.
    if (mode === 'menu' && this.mode === 'menu' && !options?.reshuffle) return;

    const enteringGame = mode === 'game' && this.mode !== 'game';
    const forceRestart =
      Boolean(options?.reshuffle) || enteringGame || (mode !== this.mode && mode === 'menu');
    this.mode = mode;
    this.applyMode(mode, forceRestart);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      window.localStorage.setItem(STORAGE_MUTE, muted ? '1' : '0');
    } catch {
      /* ignore */
    }
    const el = this.audio;
    if (!el) return;
    el.muted = muted;
    if (!muted && this.unlocked && this.mode !== 'off') {
      void el.play().catch(() => undefined);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    try {
      window.localStorage.setItem(STORAGE_VOLUME, String(this.volume));
    } catch {
      /* ignore */
    }
    this.applyOutputVolume();
  }

  getVolume(): number {
    return this.volume;
  }

  /**
   * Baisse temporaire du volume pendant la voix du robot.
   * Respecte le mute ; ne change pas le volume enregistré.
   */
  setSpeechDuck(active: boolean): void {
    this.duckFactor = active ? 0.22 : 1;
    this.applyOutputVolume();
  }

  getMode(): MusicMode {
    return this.mode;
  }

  private applyOutputVolume(): void {
    if (this.audio) this.audio.volume = this.volume * this.duckFactor;
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const el = new Audio();
    el.preload = 'auto';
    el.volume = this.volume * this.duckFactor;
    el.muted = this.muted;
    el.addEventListener('ended', () => this.onEnded());
    this.audio = el;
    return el;
  }

  private applyMode(mode: MusicMode, forceRestart: boolean): void {
    if (typeof window === 'undefined') return;
    if (mode === 'off') {
      this.audio?.pause();
      return;
    }
    if (!this.unlocked) return;

    if (mode === 'menu') {
      this.playTrack(MENU_MUSIC, true, forceRestart || this.current?.id !== MENU_MUSIC.id);
      return;
    }

    // game
    if (forceRestart || this.gameQueue.length === 0) {
      this.gameQueue = shuffleTracks(GAME_MUSIC);
      this.gameIndex = 0;
    }
    const track = this.gameQueue[this.gameIndex] ?? this.gameQueue[0];
    if (!track) return;
    this.playTrack(track, false, forceRestart || this.current?.id !== track.id);
  }

  private playTrack(track: MusicTrack, loop: boolean, restart: boolean): void {
    const el = this.ensureAudio();
    const url = musicPublicUrl(track.file);
    const sameSrc =
      el.src.endsWith(encodeURIComponent(track.file)) ||
      el.src.includes(track.file.replace(/ /g, '%20'));
    if (!restart && sameSrc && !el.paused) {
      el.loop = loop;
      return;
    }
    this.current = track;
    // Important : assigner loop APRÈS src — certains navigateurs réinitialisent loop au changement de source.
    el.src = url;
    el.loop = loop;
    el.volume = this.volume * this.duckFactor;
    el.muted = this.muted;
    void el.play().catch(() => undefined);
  }

  private onEnded(): void {
    // Filet si loop n’a pas tenu (navigateur) : relancer la piste menu.
    if (this.mode === 'menu') {
      this.playTrack(MENU_MUSIC, true, true);
      return;
    }
    if (this.mode !== 'game') return;
    this.gameIndex += 1;
    if (this.gameIndex >= this.gameQueue.length) {
      const lastId = this.current?.id;
      this.gameQueue = shuffleTracks(GAME_MUSIC);
      // Évite de rejouer tout de suite la même piste en tête de nouveau cycle.
      if (this.gameQueue.length > 1 && this.gameQueue[0]?.id === lastId) {
        const swap = this.gameQueue[1]!;
        this.gameQueue[1] = this.gameQueue[0]!;
        this.gameQueue[0] = swap;
      }
      this.gameIndex = 0;
    }
    const next = this.gameQueue[this.gameIndex];
    if (next) this.playTrack(next, false, true);
  }
}

export const musicController = new MusicController();
