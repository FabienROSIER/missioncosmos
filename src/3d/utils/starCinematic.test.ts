import { describe, expect, it } from 'vitest';
import { sampleStarCinematic, STAR_FILM_DURATION, STAR_FILM_CHAPTERS } from './starCinematic';

describe('stellar perspective film', () => {
  it('keeps stellar radii fixed across every shot', () => {
    const radii = sampleStarCinematic(0).stars.map((star) => star.radius);
    for (let time = 0; time <= STAR_FILM_DURATION; time += 0.5) {
      expect(sampleStarCinematic(time).stars.map((star) => star.radius)).toEqual(radii);
    }
  });
  it('makes the three stars subtend the same angle after their depth translation', () => {
    const frame = sampleStarCinematic(STAR_FILM_CHAPTERS[1].tableau);
    const angles = frame.stars.map(
      (star) => star.radius / Math.hypot(...star.position.map((v, i) => v - frame.camera[i]!)),
    );
    expect(Math.max(...angles) / Math.min(...angles)).toBeLessThan(1.04);
  });
  it('reverses apparent size ordering when the observer approaches Proxima', () => {
    const frame = sampleStarCinematic(STAR_FILM_CHAPTERS[2].tableau);
    const apparent = frame.stars.map(
      (star) => star.radius / Math.hypot(...star.position.map((v, i) => v - frame.camera[i]!)),
    );
    expect(apparent[0]).toBeGreaterThan(apparent[1]!);
    expect(apparent[1]).toBeGreaterThan(apparent[2]!);
  });
});
