import { describe, expect, it } from 'vitest';
import { isFreeStarComparison, starDiscoveryPhase } from './starDiscovery';
import { MISSION_08 } from '@/content/missions/mission-08';

describe('star discovery', () => {
  it('offers free comparison for sizes and colors only', () => {
    expect(starDiscoveryPhase('m08-observe')).toBe('sizes');
    expect(starDiscoveryPhase('m08-colors')).toBe('colors');
    expect(isFreeStarComparison('m08-observe')).toBe(true);
    expect(isFreeStarComparison('m08-colors')).toBe(true);
    expect(starDiscoveryPhase('m08-challenge')).toBeUndefined();
    expect(isFreeStarComparison('m08-challenge')).toBe(false);
  });

  it('goes directly from colors to photos without a separate distance activity', () => {
    const steps = MISSION_08.steps;
    const colorsIndex = steps.findIndex((step) => step.id === 'm08-colors');
    expect(colorsIndex).toBeGreaterThanOrEqual(0);
    expect(steps[colorsIndex]!.requiresSuccess).not.toBe(true);
    expect(steps[colorsIndex]!.ctaLabel).toBe('Photographier les étoiles');
    expect(steps[colorsIndex + 1]!.id).toBe('m08-challenge');
    expect(steps.some((step) => step.id === 'm08-apparent')).toBe(false);
    expect(starDiscoveryPhase('m08-apparent')).toBeUndefined();
  });
});
