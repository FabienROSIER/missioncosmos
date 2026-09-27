import { describe, expect, it } from 'vitest';
import {
  DISTANCE_FLIGHTS,
  SIZE_RIDDLES,
  assessFlight,
  nearestPlanetId,
} from './solarLearningGames';
import { SIZE_GROUPS, SOLAR_SYSTEM_PLANETS } from './solarSystem';

describe('mini-jeux simples de la mission 05', () => {
  it('propose exactement une destination correcte parmi trois repères distincts', () => {
    DISTANCE_FLIGHTS.forEach((flight, round) => {
      expect(new Set(flight.choices).size).toBe(3);
      expect(
        flight.choices.filter((_, choice) => assessFlight(choice, round).success),
      ).toHaveLength(1);
      flight.choices.forEach((position) => {
        expect(position).toBeGreaterThan(0);
        expect(position).toBeLessThan(flight.span);
      });
      expect(assessFlight(-1, round).success).toBe(false);
      expect(assessFlight(3, round).success).toBe(false);
    });
  });
  it('révèle le groupe correspondant à chaque question, avec une réponse valide', () => {
    expect(SIZE_RIDDLES).toHaveLength(4);
    expect(SIZE_RIDDLES.some((r) => r.group === 'planets')).toBe(true);
    SIZE_RIDDLES.forEach((riddle) => {
      expect(SIZE_GROUPS[riddle.group].length).toBeGreaterThanOrEqual(2);
      expect(riddle.choices[riddle.correct]).toBeTruthy();
    });
  });
  it('associe chaque repère de distance à une planète proche', () => {
    expect(nearestPlanetId(1.524)).toBe('mars');
    expect(nearestPlanetId(5.203)).toBe('jupiter');
    expect(nearestPlanetId(30.07)).toBe('neptune');
    DISTANCE_FLIGHTS.forEach((flight) => {
      expect(nearestPlanetId(SOLAR_SYSTEM_PLANETS[flight.target].approxAu)).toBe(flight.target);
    });
  });
});
