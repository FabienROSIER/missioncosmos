import { describe, expect, it } from 'vitest';
import { fallOrbitHint, speedFromSlider } from './orbitFallChallenge';

describe('orbitFallChallenge', () => {
  it('mappe le curseur sur une plage de vitesses autour de 1', () => {
    expect(speedFromSlider(0)).toBeCloseTo(0.55, 2);
    expect(speedFromSlider(1)).toBeCloseTo(1.45, 2);
    expect(speedFromSlider(0.5)).toBeCloseTo(1.0, 2);
  });

  it('donne un indice selon le résultat réel', () => {
    expect(fallOrbitHint('crash', 0.2, 1)).toMatch(/lent|tombe/i);
    expect(fallOrbitHint('escape', 0.95, 1)).toMatch(/vite|éloigne/i);
    expect(fallOrbitHint('orbit', 0.5, 1)).toMatch(/Bien|côté|sol/i);
  });
});
