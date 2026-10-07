import { describe, expect, it } from 'vitest';
import { classifyEclipse, isEclipseMatch } from '@/3d/utils/eclipseAlignment';

describe('eclipseAlignment', () => {
  const earth = { x: 0, y: 0, z: 0 };
  const sun = { x: 5, y: 0, z: 0 };

  it('éclipse solaire si Lune entre Terre et Soleil', () => {
    const moon = { x: 2.5, y: 0, z: 0 };
    expect(classifyEclipse(earth, sun, moon)).toBe('solar');
    expect(isEclipseMatch(earth, sun, moon, 'solar')).toBe(true);
  });

  it('éclipse lunaire si Lune à l’opposé du Soleil', () => {
    const moon = { x: -2.5, y: 0, z: 0 };
    expect(classifyEclipse(earth, sun, moon)).toBe('lunar');
  });

  it('pas d’éclipse hors alignement', () => {
    const moon = { x: 0, y: 0, z: 2.5 };
    expect(classifyEclipse(earth, sun, moon)).toBe('none');
  });

  it('pas d’éclipse si Lune hors du plan', () => {
    const moon = { x: -2.5, y: 0.5, z: 0 };
    expect(classifyEclipse(earth, sun, moon)).toBe('none');
  });

  it('éclipse solaire sur l’axe X (maquette Mission 04)', () => {
    const moon = { x: 2.55, y: 0, z: 0 };
    const sunFar = { x: 6.4, y: 0, z: 0 };
    expect(classifyEclipse(earth, sunFar, moon)).toBe('solar');
  });

  it('refuse une éclipse solaire seulement partielle', () => {
    const sunFar = { x: 6.4, y: 0, z: 0 };
    const moon = {
      x: 2.55 * Math.cos(0.12),
      y: 0,
      z: 2.55 * Math.sin(0.12),
    };
    expect(classifyEclipse(earth, sunFar, moon)).toBe('none');
    expect(isEclipseMatch(earth, sunFar, moon, 'solar')).toBe(false);
  });

  it('accepte une éclipse solaire quasi totale', () => {
    const sunFar = { x: 6.4, y: 0, z: 0 };
    const moon = {
      x: 2.55 * Math.cos(0.03),
      y: 0,
      z: 2.55 * Math.sin(0.03),
    };
    expect(classifyEclipse(earth, sunFar, moon)).toBe('solar');
    expect(isEclipseMatch(earth, sunFar, moon, 'solar')).toBe(true);
  });
});
