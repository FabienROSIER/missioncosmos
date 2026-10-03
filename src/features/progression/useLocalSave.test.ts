import { describe, expect, it } from 'vitest';
import { MISSION_CATALOG } from '@/content/missions/catalog';
import { computeProgressPercent } from '@/features/progression/useLocalSave';

describe('computeProgressPercent', () => {
  it('utilise le catalogue actuel et plafonne à 100%', () => {
    expect(computeProgressPercent([])).toBe(0);
    expect(computeProgressPercent([MISSION_CATALOG[0]!.id])).toBe(
      Math.round((1 / MISSION_CATALOG.length) * 100),
    );
    expect(computeProgressPercent(MISSION_CATALOG.map((m) => m.id))).toBe(100);
    expect(
      computeProgressPercent([
        ...MISSION_CATALOG.map((m) => m.id),
        ...MISSION_CATALOG.map((m) => m.id),
      ]),
    ).toBe(100);
  });

  it('ignore les ids hors catalogue (ne recompte pas un total fictif de 3)', () => {
    const almostAll = MISSION_CATALOG.slice(0, 13).map((m) => m.id);
    expect(computeProgressPercent(almostAll)).toBeLessThanOrEqual(100);
    expect(computeProgressPercent(almostAll)).not.toBe(433);
  });
});
