import { describe, expect, it } from 'vitest';
import { GAME_MUSIC, MENU_MUSIC, musicPublicUrl, shuffleTracks } from './musicCatalog';
import { shuffleArray, shuffledIndices } from '@/lib/shuffle';

describe('catalogue musique', () => {
  it('sépare menu et jeu sans doublon de fichier', () => {
    expect(GAME_MUSIC.some((t) => t.file === MENU_MUSIC.file)).toBe(false);
    expect(GAME_MUSIC.length).toBeGreaterThanOrEqual(2);
  });

  it('encode correctement les espaces dans l’URL', () => {
    expect(musicPublicUrl(MENU_MUSIC.file)).toBe(
      '/assets/audio/music/23%20Space%20Ambience%201.mp3',
    );
  });

  it('shuffle conserve les pistes', () => {
    const shuffled = shuffleTracks(GAME_MUSIC);
    expect(shuffled).toHaveLength(GAME_MUSIC.length);
    expect(new Set(shuffled.map((t) => t.id))).toEqual(new Set(GAME_MUSIC.map((t) => t.id)));
  });
});

describe('shuffleArray / shuffledIndices', () => {
  it('conserve les éléments', () => {
    const input = [1, 2, 3, 4];
    expect(new Set(shuffleArray(input))).toEqual(new Set(input));
  });

  it('produit une permutation complète des indices', () => {
    const idx = shuffledIndices(3);
    expect(idx.sort()).toEqual([0, 1, 2]);
  });
});
