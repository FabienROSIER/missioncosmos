import { describe, expect, it } from 'vitest';
import {
  LIGHT_TRAVEL_ANIMATION_SECONDS,
  LIGHT_TRAVEL_MAX_MILLION_YEARS,
  LIGHT_TRAVEL_SOURCES,
  allSignalsArrived,
  arrivalOrder,
  arrivedSourceIds,
  elapsedMillionYears,
  formatMillionYears,
  hasArrived,
  isOldestImageSource,
  lightTravelWorldPosition,
  LIGHT_TRAVEL_LAYOUT,
  pulseDurationSeconds,
  pulseProgress,
} from './lightTravel';

describe('Voyage de la lumière', () => {
  it('garde des distances proportionnelles 1:2:4 et le même rapport en scène', () => {
    expect(LIGHT_TRAVEL_SOURCES.map((s) => s.millionLightYears)).toEqual([1, 2, 4]);
    const base = LIGHT_TRAVEL_SOURCES[0]!.sceneDistance;
    expect(LIGHT_TRAVEL_SOURCES[1]!.sceneDistance / base).toBeCloseTo(2, 5);
    expect(LIGHT_TRAVEL_SOURCES[2]!.sceneDistance / base).toBeCloseTo(4, 5);
  });

  it('fait arriver les flashs du plus proche au plus lointain à vitesse constante', () => {
    expect(arrivalOrder()).toEqual(['near', 'mid', 'far']);
    expect(pulseDurationSeconds(1)).toBeCloseTo(LIGHT_TRAVEL_ANIMATION_SECONDS / 4, 5);
    expect(pulseDurationSeconds(2)).toBeCloseTo(LIGHT_TRAVEL_ANIMATION_SECONDS / 2, 5);
    expect(pulseDurationSeconds(4)).toBe(LIGHT_TRAVEL_ANIMATION_SECONDS);

    const midTime = pulseDurationSeconds(2);
    expect(hasArrived(midTime, 1)).toBe(true);
    expect(hasArrived(midTime, 2)).toBe(true);
    expect(hasArrived(midTime, 4)).toBe(false);
    expect(arrivedSourceIds(midTime)).toEqual(['near', 'mid']);
    expect(allSignalsArrived(midTime)).toBe(false);

    expect(pulseProgress(midTime / 2, 2)).toBeCloseTo(0.5, 5);
    expect(pulseProgress(midTime / 2, 4)).toBeCloseTo(0.25, 5);
    expect(allSignalsArrived(LIGHT_TRAVEL_ANIMATION_SECONDS)).toBe(true);
    expect(elapsedMillionYears(LIGHT_TRAVEL_ANIMATION_SECONDS)).toBe(
      LIGHT_TRAVEL_MAX_MILLION_YEARS,
    );
  });

  it('désigne la galaxie la plus lointaine comme image la plus ancienne', () => {
    expect(isOldestImageSource('far')).toBe(true);
    expect(isOldestImageSource('near')).toBe(false);
    expect(isOldestImageSource('mid')).toBe(false);
    expect(formatMillionYears(0)).toBe('0 million d’années');
    expect(formatMillionYears(1)).toBe('1 million d’années');
    expect(formatMillionYears(4)).toBe('4 millions d’années');
  });

  it('conserve la distance radiale malgré le décalage angulaire des galaxies', () => {
    for (const source of LIGHT_TRAVEL_SOURCES) {
      const layout = LIGHT_TRAVEL_LAYOUT.find((item) => item.id === source.id)!;
      const p = lightTravelWorldPosition(source.sceneDistance, layout.yaw, layout.pitch);
      expect(Math.hypot(p.x, p.y, p.z)).toBeCloseTo(source.sceneDistance, 5);
    }
    const near = lightTravelWorldPosition(8, -0.28, -0.12);
    const mid = lightTravelWorldPosition(16, 0.18, 0.16);
    expect(Math.abs(near.z)).toBeGreaterThan(1);
    expect(Math.abs(mid.y)).toBeGreaterThan(1);
  });
});
