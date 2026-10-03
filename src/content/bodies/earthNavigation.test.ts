import { describe, expect, it } from 'vitest';
import { earthYearProgress, isEarthRecordComplete } from './earthNavigation';

describe('Earth navigation', () => {
  it('requires a complete revolution in either direction', () => {
    expect(earthYearProgress(Math.PI * 1.5)).toBe(0.75);
    expect(earthYearProgress(-Math.PI * 2)).toBe(1);
    expect(earthYearProgress(Math.PI * 3)).toBe(1);
  });
  it('does not count back-and-forth travel as a year', () => {
    let angle = 0;
    for (let i = 0; i < 10; i++) {
      angle += 0.8;
      angle -= 0.8;
    }
    expect(earthYearProgress(angle)).toBe(0);
  });
  it('restores the navigation card from the saved step, and clears it on replay', () => {
    expect(isEarthRecordComplete('m01-challenge-equator', 'm01-challenge-north', false)).toBe(true);
    expect(isEarthRecordComplete('m01-challenge-north', 'm01-challenge-north', false)).toBe(false);
    expect(isEarthRecordComplete('m01-challenge-north', 'm01-challenge-north', true)).toBe(true);
    expect(isEarthRecordComplete('m01-challenge-orbit', 'm01-explain', false)).toBe(true);
    expect(isEarthRecordComplete('m01-challenge-equator', 'm01-intro', false)).toBe(false);
  });
});
