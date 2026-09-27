import { describe, expect, it } from 'vitest';
import {
  getGlossaryEntries,
  getGlossaryEntry,
  getUnlockedEnrichedEntries,
  isGlossaryEnrichedUnlocked,
} from '@/content/glossary';

describe('glossary', () => {
  it('retrouve une entrée par id', () => {
    expect(getGlossaryEntry('equateur')?.term).toBe('Équateur');
  });

  it('filtre la liste demandée', () => {
    const list = getGlossaryEntries(['sphere', 'pole', 'inconnu']);
    expect(list).toHaveLength(2);
    expect(list.map((e) => e.id)).toEqual(['sphere', 'pole']);
  });

  it('verrouille le bonus sans récompense', () => {
    const entry = getGlossaryEntry('equateur')!;
    expect(isGlossaryEnrichedUnlocked(entry, [])).toBe(false);
    expect(getUnlockedEnrichedEntries([])).toHaveLength(0);
  });

  it('débloque le bonus avec reward-earth-explorer', () => {
    const entry = getGlossaryEntry('equateur')!;
    const earned = ['reward-earth-explorer'];
    expect(isGlossaryEnrichedUnlocked(entry, earned)).toBe(true);
    expect(getUnlockedEnrichedEntries(earned).length).toBeGreaterThan(0);
  });
});
