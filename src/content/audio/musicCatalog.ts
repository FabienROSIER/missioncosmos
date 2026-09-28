import { ASSETS_PUBLIC_ROOT } from '@/lib/constants';
import { withBasePath } from '@/lib/basePath';
import { shuffleArray } from '@/lib/shuffle';

/**
 * Musiques runtime — provenance : Kerbal Space Program 1 (Squad / Take-Two).
 * Usage perso uniquement ; voir docs/ASSETS.md (AST-040 / AST-041). Non libre pour release publique.
 */

export type MusicTrack = {
  id: string;
  /** Nom de fichier sous public/assets/audio/music/ */
  file: string;
  title: string;
};

export const MUSIC_CREDIT =
  'Musique : Kerbal Space Program (Squad / Take-Two Interactive)' as const;

/** Musique d’ambiance des menus (accueil, carte, collection…). */
export const MENU_MUSIC: MusicTrack = {
  id: 'space-ambience-1',
  file: '23 Space Ambience 1.mp3',
  title: 'Space Ambience 1',
};

/** Pistes de jeu (missions) — lecture aléatoire + shuffle. */
export const GAME_MUSIC: readonly MusicTrack[] = [
  { id: 'arcadia', file: '17 Arcadia.mp3', title: 'Arcadia' },
  { id: 'dreamy-flashback', file: '18 Dreamy Flashback.mp3', title: 'Dreamy Flashback' },
  { id: 'bathed-in-the-light', file: '19 Bathed in the Light.mp3', title: 'Bathed in the Light' },
  { id: 'frozen-star', file: '22 Frozen Star.mp3', title: 'Frozen Star' },
  { id: 'impact-lento', file: '28 Impact Lento.mp3', title: 'Impact Lento' },
] as const;

export function musicPublicUrl(file: string): string {
  return withBasePath(`${ASSETS_PUBLIC_ROOT}/audio/music/${encodeURIComponent(file)}`);
}

/** Mélange Fisher–Yates (copie). */
export function shuffleTracks(tracks: readonly MusicTrack[]): MusicTrack[] {
  return shuffleArray(tracks);
}
