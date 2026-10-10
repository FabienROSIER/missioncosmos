import { ASSETS_PUBLIC_ROOT } from '@/lib/constants';
import { withBasePath } from '@/lib/basePath';
import { shuffleArray } from '@/lib/shuffle';

/**
 * Fichiers originaux téléchargés auprès de Kevin MacLeod (Incompetech).
 * CC BY 4.0, crédits visibles dans les réglages ; voir docs/licenses/music/README.md.
 */

export type MusicTrack = {
  id: string;
  /** Nom de fichier sous public/assets/audio/music/ */
  file: string;
  title: string;
  sourceUrl: string;
};

export const MUSIC_CREDIT = 'Musique : Kevin MacLeod (incompetech.com)' as const;
export const MUSIC_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/' as const;

function track(id: string, title: string, isrc: string): MusicTrack {
  return {
    id,
    file: `${title}.mp3`,
    title,
    sourceUrl: `https://incompetech.com/music/royalty-free/index.html?isrc=${isrc}`,
  };
}

/** Musique d’ambiance des menus (accueil, carte, collection…). */
export const MENU_MUSIC = track('floating-cities', 'Floating Cities', 'USUAN1600018');

/** Pistes de jeu (missions) — lecture aléatoire + shuffle. */
export const GAME_MUSIC: readonly MusicTrack[] = [
  track('arcadia', 'Arcadia', 'USUAN1100326'),
  track('dreamy-flashback', 'Dreamy Flashback', 'USUAN1100532'),
  track('bathed-in-the-light', 'Bathed in the Light', 'USUAN1100308'),
  track('frozen-star', 'Frozen Star', 'USUAN1100356'),
  track('impact-lento', 'Impact Lento', 'USUAN1100619'),
] as const;

export function musicPublicUrl(file: string): string {
  return withBasePath(`${ASSETS_PUBLIC_ROOT}/audio/music/${encodeURIComponent(file)}`);
}

/** Mélange Fisher–Yates (copie). */
export function shuffleTracks(tracks: readonly MusicTrack[]): MusicTrack[] {
  return shuffleArray(tracks);
}
