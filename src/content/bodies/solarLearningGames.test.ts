import { describe, expect, it } from 'vitest';
import {
  DISTANCE_FLIGHT_POOL,
  DISTANCE_ROUND_COUNT,
  SIZE_RIDDLES,
  assessFlight,
  buildDistanceDeck,
  nearestPlanetId,
} from './solarLearningGames';
import { SIZE_GROUPS, SOLAR_SYSTEM_PLANETS } from './solarSystem';

describe('mini-jeux simples de la mission 05', () => {
  it('chaque manche du pool a une seule bonne réponse, pas toujours la plus lointaine', () => {
    let alwaysFarthest = 0;
    DISTANCE_FLIGHT_POOL.forEach((flight) => {
      expect(new Set(flight.choices).size).toBe(3);
      expect(
        flight.choices.filter((_, choice) => assessFlight(choice, flight).success),
      ).toHaveLength(1);
      flight.choices.forEach((position) => {
        expect(position).toBeGreaterThan(0);
        // Pas de chevauchement avec les repères de frise
        expect(Math.abs(position - SOLAR_SYSTEM_PLANETS[flight.reference].approxAu)).toBeGreaterThan(
          0.01,
        );
        if (flight.referenceB) {
          expect(
            Math.abs(position - SOLAR_SYSTEM_PLANETS[flight.referenceB].approxAu),
          ).toBeGreaterThan(0.01);
        }
      });
      expect(assessFlight(-1, flight).success).toBe(false);
      expect(assessFlight(3, flight).success).toBe(false);

      const maxAu = Math.max(...flight.choices);
      const correctAu = SOLAR_SYSTEM_PLANETS[flight.target].approxAu;
      if (Math.abs(correctAu - maxAu) < 0.001) alwaysFarthest += 1;
    });
    // Le mix doit casser le biais « toujours le plus loin »
    expect(alwaysFarthest).toBeLessThan(DISTANCE_FLIGHT_POOL.length);
  });

  it('compose un deck de 3 manches aux types variés', () => {
    const deck = buildDistanceDeck(DISTANCE_ROUND_COUNT);
    expect(deck).toHaveLength(DISTANCE_ROUND_COUNT);
    const kinds = new Set(deck.map((f) => f.kind));
    expect(kinds.size).toBeGreaterThanOrEqual(2);
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
    DISTANCE_FLIGHT_POOL.forEach((flight) => {
      expect(nearestPlanetId(SOLAR_SYSTEM_PLANETS[flight.target].approxAu)).toBe(flight.target);
    });
  });
});
