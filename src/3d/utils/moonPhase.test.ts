import { describe, expect, it } from 'vitest';
import {
  elongationBetween,
  isPhaseMatch,
  phaseFromElongation,
} from '@/3d/utils/moonPhase';

describe('moonPhase', () => {
  it('nouvelle Lune près de 0', () => {
    expect(phaseFromElongation(0)).toBe('new');
    expect(phaseFromElongation(0.1)).toBe('new');
  });

  it('pleine Lune près de π', () => {
    expect(phaseFromElongation(Math.PI)).toBe('full');
    expect(phaseFromElongation(Math.PI - 0.05)).toBe('full');
  });

  it('quartier vers π/2', () => {
    expect(phaseFromElongation(Math.PI / 2)).toBe('quarter');
  });

  it('isPhaseMatch tolère une bande', () => {
    expect(isPhaseMatch(Math.PI, 'full')).toBe(true);
    expect(isPhaseMatch(0.7, 'crescent')).toBe(true);
    expect(isPhaseMatch(0, 'full')).toBe(false);
  });

  it('élongation Soleil / Lune alignés', () => {
    const e = elongationBetween({ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
    expect(e).toBeCloseTo(0, 5);
    const opposite = elongationBetween({ x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 });
    expect(opposite).toBeCloseTo(Math.PI, 5);
  });
});
