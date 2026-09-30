import { describe, expect, it } from 'vitest';
import { splitGuideText } from './guideText';

describe('guide messages', () => {
  it('keeps short instructions together', () => {
    expect(splitGuideText('Allume le rouge. Puis le vert !')).toEqual([
      'Allume le rouge. Puis le vert !',
    ]);
  });
  it('splits at sentence boundaries without losing the lesson', () => {
    const text = 'Observe le Soleil. Il éclaire la Terre. Tourne le globe !';
    const pages = splitGuideText(text, 25);
    expect(pages).toEqual(['Observe le Soleil.', 'Il éclaire la Terre.', 'Tourne le globe !']);
    expect(pages.join(' ')).toBe(text);
  });
  it('keeps decimal numbers and a long sentence intact', () => {
    expect(splitGuideText('La Terre est inclinée de 23,5 degrés.', 10)).toEqual([
      'La Terre est inclinée de 23,5 degrés.',
    ]);
    expect(splitGuideText('')).toEqual([]);
  });
});
