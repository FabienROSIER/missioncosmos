import {
  PLANET_ORDER,
  SOLAR_SYSTEM_PLANETS,
  type PlanetId,
  type ComparisonGroup,
} from './solarSystem';
import { CELESTIAL_BODIES_BASE } from '@/lib/constants';

/** Portrait WebP du pack corps célestes (repères UI distances). */
export function celestialPortraitUrl(id: PlanetId | 'sun'): string {
  return `${CELESTIAL_BODIES_BASE}/${id}/${id}.webp`;
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

export const DISTANCE_FLIGHTS: ReadonlyArray<{
  target: PlanetId;
  span: number;
  choices: readonly number[];
  reference: PlanetId;
  hint: string;
  discovery: string;
}> = [
  {
    target: 'mars',
    span: 2,
    choices: [0.35, 1.524, 0.7],
    reference: 'earth',
    hint: 'Mars est un peu plus loin du Soleil que la Terre. Quel repère choisir ?',
    discovery:
      'Bravo ! Mars est juste après la Terre — et c’est déjà très loin.',
  },
  {
    target: 'jupiter',
    span: 5.5,
    // 1.0 = Terre (éviter ~1.8 qui se résolvait en 2e Mars = référence)
    choices: [5.203, 0.5, 1],
    reference: 'mars',
    hint: 'Jupiter est bien plus loin du Soleil que Mars. Envoie la sonde au bon repère.',
    discovery: 'Bien joué ! Jupiter est beaucoup plus loin que les petites planètes.',
  },
  {
    target: 'neptune',
    span: 32,
    choices: [2, 11, 30.07],
    reference: 'jupiter',
    hint: 'Neptune est la plus lointaine des huit planètes. Où doit aller la sonde ?',
    discovery: 'Tu as trouvé Neptune ! Entre les planètes : surtout du vide.',
  },
];
export function assessFlight(choice: number, round: number) {
  const flight = DISTANCE_FLIGHTS[round]!;
  const position = flight.choices[choice];
  const target = SOLAR_SYSTEM_PLANETS[flight.target].approxAu;
  return { target, success: position !== undefined && Math.abs(position - target) < 0.001 };
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
