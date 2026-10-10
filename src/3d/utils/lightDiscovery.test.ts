import { describe, expect, it } from 'vitest';
import { nextLightDiscoveryPhase } from './lightDiscovery';

describe('light discovery progression', () => {
  it('keeps repeated color selections in the rainbow phase', () => {
    let phase = nextLightDiscoveryPhase('rainbow', 'select-color');
    for (let click = 0; click < 20; click++) {
      phase = nextLightDiscoveryPhase(phase, 'select-color');
      expect(phase).toBe('rainbow');
    }
    expect(nextLightDiscoveryPhase(phase, 'make-yellow')).toBe('rainbow');
  });

  it('starts mixing only on explicit request and completes after making yellow', () => {
    expect(nextLightDiscoveryPhase('off', 'start-mixing')).toBe('off');
    const phase = nextLightDiscoveryPhase('rainbow', 'start-mixing');
    expect(phase).toBe('lights');
    expect(nextLightDiscoveryPhase(phase, 'select-color')).toBe('lights');
    expect(nextLightDiscoveryPhase(phase, 'make-yellow')).toBe('done');
    expect(nextLightDiscoveryPhase('done', 'start-mixing')).toBe('done');
  });
});
