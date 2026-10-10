import { describe, expect, it } from 'vitest';
import { GAME_MUSIC, MENU_MUSIC, musicPublicUrl, shuffleTracks } from './musicCatalog';
import { shuffleArray, shuffledIndices } from '@/lib/shuffle';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

describe('catalogue musique', () => {
  it('sépare menu et jeu sans doublon de fichier', () => {
    expect(GAME_MUSIC.some((t) => t.file === MENU_MUSIC.file)).toBe(false);
    expect(GAME_MUSIC.length).toBeGreaterThanOrEqual(2);
  });

  it('encode correctement les espaces dans l’URL', () => {
    expect(musicPublicUrl(MENU_MUSIC.file)).toBe('/assets/audio/music/Floating%20Cities.mp3');
  });

  it('shuffle conserve les pistes', () => {
    const shuffled = shuffleTracks(GAME_MUSIC);
    expect(shuffled).toHaveLength(GAME_MUSIC.length);
    expect(new Set(shuffled.map((t) => t.id))).toEqual(new Set(GAME_MUSIC.map((t) => t.id)));
  });

  it('publie uniquement les originaux dont la licence et la provenance sont documentées', () => {
    const evidence = JSON.parse(
      readFileSync(new URL('../../../docs/licenses/music/tracks.json', import.meta.url), 'utf8'),
    ) as { filename: string; sourceUrl: string; license: string; sha256: string }[];
    for (const track of [MENU_MUSIC, ...GAME_MUSIC]) {
      const record = evidence.find((item) => item.filename === track.file);
      expect(record?.license, track.title).toBe('CC BY 4.0');
      expect(record?.sourceUrl, track.title).toBe(track.sourceUrl);
      const audio = readFileSync(
        new URL(`../../../public/assets/audio/music/${track.file}`, import.meta.url),
      );
      expect(createHash('sha256').update(audio).digest('hex'), track.title).toBe(record?.sha256);
    }
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
