import {
  PLANET_ORDER,
  SOLAR_SYSTEM_PLANETS,
  type PlanetId,
  type ComparisonGroup,
} from './solarSystem';
import { CELESTIAL_BODIES_BASE } from '@/lib/constants';
import { withBasePath } from '@/lib/basePath';
import { shuffleArray } from '@/lib/shuffle';

/** Portrait WebP du pack corps célestes (repères UI distances). */
export function celestialPortraitUrl(id: PlanetId | 'sun'): string {
  return withBasePath(`${CELESTIAL_BODIES_BASE}/${id}/${id}.webp`);
}

/** Planète la plus proche d’une distance en UA (repères du voyage de la sonde). */
export function nearestPlanetId(au: number): PlanetId {
  let best: PlanetId = PLANET_ORDER[0]!;
  let bestDist = Infinity;
  for (const id of PLANET_ORDER) {
    const d = Math.abs(SOLAR_SYSTEM_PLANETS[id].approxAu - au);
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}

/**
 * Types de questions (mix) — la bonne réponse n’est pas toujours le repère le plus loin.
 * La planète cible est toujours nommée (l’enfant place un repère, il ne devine pas le nom).
 * - farther : plus loin qu’un repère, avec un leurre encore plus loin
 * - closer : plus près du Soleil qu’un repère
 * - between : située entre deux planètes
 * - justAfter : juste après une planète (en s’éloignant du Soleil)
 */
export type DistanceFlightKind = 'farther' | 'closer' | 'between' | 'justAfter';

export type DistanceFlight = {
  kind: DistanceFlightKind;
  target: PlanetId;
  /** Positions UA des 3 repères (une seule = cible exacte). */
  choices: readonly number[];
  /** Planète repère affichée sur la frise. */
  reference: PlanetId;
  /** Second repère (questions « entre »). */
  referenceB?: PlanetId;
  hint: string;
  discovery: string;
};

/** Banque de manches — on en tire 3 au hasard par partie.
 * Les `choices` ne doivent pas coincider avec `reference` / `referenceB` (frise).
 */
export const DISTANCE_FLIGHT_POOL: readonly DistanceFlight[] = [
  {
    kind: 'farther',
    target: 'jupiter',
    // Terre · Jupiter · Neptune — la bonne n’est pas la plus loin
    choices: [1, 5.203, 30.07],
    reference: 'mars',
    hint: 'Jupiter est plus loin que Mars — mais Neptune est encore plus loin. Où est Jupiter ?',
    discovery: 'Bien joué ! Jupiter est loin, mais Neptune l’est encore plus.',
  },
  {
    kind: 'closer',
    target: 'mercury',
    choices: [0.387, 0.723, 1.524],
    reference: 'earth',
    hint: 'Mercure est plus près du Soleil que la Terre. Quel repère choisir ?',
    discovery: 'Oui ! Mercure est la plus proche du Soleil.',
  },
  {
    kind: 'between',
    target: 'mars',
    choices: [0.387, 1.524, 9.537],
    reference: 'earth',
    referenceB: 'jupiter',
    hint: 'Mars se trouve entre la Terre et Jupiter. Quel repère choisir ?',
    discovery: 'Exact : Mars est entre la Terre et Jupiter.',
  },
  {
    kind: 'justAfter',
    target: 'venus',
    choices: [0.723, 1, 1.524],
    reference: 'mercury',
    hint: 'Vénus est juste après Mercure, en s’éloignant du Soleil. Quel repère choisir ?',
    discovery: 'Oui ! Vénus est juste après Mercure.',
  },
  {
    kind: 'justAfter',
    target: 'mars',
    choices: [0.723, 1.524, 5.203],
    reference: 'earth',
    hint: 'Mars est juste après la Terre, en s’éloignant du Soleil. Quel repère choisir ?',
    discovery: 'Bravo ! Mars est juste après la Terre.',
  },
  {
    kind: 'farther',
    target: 'mars',
    // Vénus · Mars · Jupiter — la bonne n’est pas la plus loin
    choices: [0.723, 1.524, 5.203],
    reference: 'earth',
    hint: 'Mars est un peu plus loin que la Terre — sans aller jusqu’à Jupiter. Quel repère ?',
    discovery: 'Bravo ! Mars est juste après la Terre.',
  },
  {
    kind: 'closer',
    target: 'earth',
    choices: [1, 9.537, 30.07],
    reference: 'jupiter',
    hint: 'La Terre est plus près du Soleil que Jupiter. Quel repère ?',
    discovery: 'Oui ! La Terre est bien plus près du Soleil que Jupiter.',
  },
  {
    kind: 'between',
    target: 'venus',
    choices: [0.723, 1.524, 5.203],
    reference: 'mercury',
    referenceB: 'earth',
    hint: 'Vénus se trouve entre Mercure et la Terre. Quel repère choisir ?',
    discovery: 'Exact : Vénus est entre Mercure et la Terre.',
  },
];

/** Nombre de manches jouées par défi distances. */
export const DISTANCE_ROUND_COUNT = 3;

/** Tire `count` manches distinctes (kinds mélangés autant que possible). */
export function buildDistanceDeck(count = DISTANCE_ROUND_COUNT): DistanceFlight[] {
  const byKind = new Map<DistanceFlightKind, DistanceFlight[]>();
  for (const flight of DISTANCE_FLIGHT_POOL) {
    const list = byKind.get(flight.kind) ?? [];
    list.push(flight);
    byKind.set(flight.kind, list);
  }

  const kinds = shuffleArray([...byKind.keys()]);
  const deck: DistanceFlight[] = [];
  const used = new Set<DistanceFlight>();

  // D’abord une manche par type (diversité), dans un ordre de kinds aléatoire
  for (const kind of kinds) {
    if (deck.length >= count) break;
    const options = shuffleArray(byKind.get(kind) ?? []);
    const pick = options.find((f) => !used.has(f));
    if (pick) {
      deck.push(pick);
      used.add(pick);
    }
  }

  // Compléter si besoin
  const rest = shuffleArray(DISTANCE_FLIGHT_POOL.filter((f) => !used.has(f)));
  for (const flight of rest) {
    if (deck.length >= count) break;
    deck.push(flight);
  }

  return shuffleArray(deck);
}

/** @deprecated préférer buildDistanceDeck — conservé pour les imports existants. */
export const DISTANCE_FLIGHTS = DISTANCE_FLIGHT_POOL;

export function assessFlight(choice: number, flight: DistanceFlight) {
  const position = flight.choices[choice];
  const target = SOLAR_SYSTEM_PLANETS[flight.target].approxAu;
  return {
    target,
    success: position !== undefined && Math.abs(position - target) < 0.001,
  };
}

export const SIZE_RIDDLES: ReadonlyArray<{
  group: ComparisonGroup;
  question: string;
  choices: readonly string[];
  correct: number;
  explanation: string;
}> = [
  {
    group: 'jupiter',
    question: 'Qui est la plus grande : la Terre ou Jupiter ?',
    choices: ['La Terre', 'Jupiter', 'Même taille'],
    correct: 1,
    explanation: 'Jupiter est bien plus grande ! Regarde comme la Terre paraît petite à côté.',
  },
  {
    group: 'rocky',
    question: 'Vénus et la Terre : leurs tailles sont-elles proches ?',
    choices: ['Oui, presque pareilles', 'Non, très différentes'],
    correct: 0,
    explanation: 'Oui ! Vénus et la Terre ont presque le même diamètre.',
  },
  {
    group: 'planets',
    question: 'Parmi les 8 planètes, combien sont rocheuses et combien sont gazeuses ?',
    choices: [
      '4 rocheuses et 4 gazeuses',
      '5 rocheuses et 3 gazeuses',
      '3 rocheuses et 5 gazeuses',
    ],
    correct: 0,
    explanation:
      '4 et 4 ! Rocheuses : Mercure, Vénus, Terre, Mars. Gazeuses : Jupiter, Saturne, Uranus, Neptune. Les gazeuses sont bien plus grosses.',
  },
  {
    group: 'sun',
    question: 'À côté du Soleil, la Terre ressemble plutôt à…',
    choices: ['Une grosse balle', 'Un tout petit point', 'Un astre aussi grand'],
    correct: 1,
    explanation: 'Un minuscule point ! Le Soleil est beaucoup plus grand que notre planète.',
  },
];
