/** J2000 positions from the IAU Catalogue of Star Names (degrees).
 * https://iauarchive.eso.org/public/themes/naming_stars/
 * Gamma Cas and unnamed Aquila / Ursa Major stars: CDS/SIMBAD J2000.
 * Distances in the film are a pedagogical model.
 */
export type SkyStar = { name: string; ra: number; dec: number };
export type ConstellationId = 'cassiopeia' | 'ursa-major' | 'cygnus' | 'orion' | 'aquila';
export type Constellation = {
  id: ConstellationId;
  title: string;
  figure: string;
  clue: string;
  reveal: string;
  stars: SkyStar[];
  edges: [number, number][];
  extraStars?: SkyStar[];
  extraEdges?: [number, number][];
  rotation?: number;
  skySpan?: number;
  /** Keep an established illustration frame when extending a drawing. */
  projectionAnchorCount?: number;
  art: { x: number; y: number; width: number; height: number; mirror?: boolean; asset?: string };
};
const star = (name: string, ra: number, dec: number): SkyStar => ({ name, ra, dec });

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'cassiopeia',
    title: 'Cassiopée',
    figure: 'une reine assise sur son trône',
    clue: 'Cherche cinq étoiles qui dessinent un W un peu penché.',
    reveal: 'Dans ce W, on a imaginé Cassiopée, une reine assise sur son trône.',
    stars: [
      star('Caph', 2.294522, 59.149781),
      star('Schedar', 10.126838, 56.537331),
      star('Gamma Cassiopeiae', 14.177, 60.716),
      star('Ruchbah', 21.453964, 60.235284),
      star('Segin', 28.598857, 63.670101),
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    rotation: -18,
    art: { x: 80, y: 60, width: 840, height: 880 },
  },
  {
    id: 'ursa-major',
    title: 'Grande Ourse',
    figure: 'une ourse céleste',
    clue: 'Cherche la casserole : quatre étoiles pour le récipient et trois pour le manche.',
    reveal:
      'La casserole est une partie de la Grande Ourse. Voici d’autres étoiles pour imaginer son corps et ses pattes !',
    stars: [
      star('Dubhe', 165.931965, 61.751035),
      star('Merak', 165.460319, 56.382426),
      star('Phecda', 178.457679, 53.694758),
      star('Megrez', 183.856503, 57.032615),
      star('Alioth', 193.50729, 55.959823),
      star('Mizar', 200.981429, 54.925362),
      star('Alkaid', 206.885157, 49.313267),
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
    extraStars: [
      star('Muscida', 127.566128, 60.71817),
      star('Upsilon Ursae Majoris', 147.747325, 59.038734),
      star('Theta Ursae Majoris', 143.214296, 51.677315),
      star('Talitha', 134.80189, 48.041826),
      star('Alkaphrah', 135.906365, 47.156525),
      star('Psi Ursae Majoris', 167.415868, 44.498488),
      star('Tania Borealis', 154.274095, 42.914356),
      star('Tania Australis', 155.58225, 41.499519),
      star('Chi Ursae Majoris', 176.512559, 47.779404),
      star('Alula Borealis', 169.619737, 33.094305),
      star('Alula Australis', 169.545423, 31.529161),
    ],
    extraEdges: [
      [0, 8],
      [8, 7],
      [7, 9],
      [8, 9],
      [9, 10],
      [10, 11],
      [1, 12],
      [12, 13],
      [13, 14],
      [2, 15],
      [15, 16],
      [16, 17],
    ],
    rotation: 70,
    skySpan: 780,
    art: { x: 0, y: 0, width: 1000, height: 1000, asset: 'ursa-major-upright' },
  },
  {
    id: 'cygnus',
    projectionAnchorCount: 5,
    title: 'Cygne',
    figure: 'un cygne aux ailes déployées',
    clue: 'Cherche une croix : une longue ligne et deux ailes de chaque côté.',
    reveal: 'Deneb marque la queue, Sadr le corps et Albireo la tête : voici notre cygne !',
    stars: [
      star('Deneb', 310.35798, 45.280339),
      star('Sadr', 305.557091, 40.256679),
      star('Albireo', 292.680351, 27.959692),
      star('Fawaris', 296.243658, 45.13081),
      star('Aljanah', 311.552843, 33.970257),
      star('Zêta Cygni', 318.234105, 30.226916),
      star('Iota² Cygni', 292.42647, 51.729779),
    ],
    edges: [
      [0, 1],
      [1, 2],
      [3, 1],
      [1, 4],
      [4, 5],
      [3, 6],
    ],
    art: { x: 17, y: 30, width: 1000, height: 940, asset: 'cygnus-aligned' },
  },
  {
    id: 'orion',
    title: 'Orion',
    figure: 'un chasseur avec une ceinture',
    clue: 'Repère les trois étoiles presque alignées de sa ceinture, ses épaules et ses pieds.',
    reveal:
      'Les trois étoiles alignées deviennent la ceinture d’Orion, un chasseur des récits anciens.',
    stars: [
      star('Alnitak', 85.189694, -1.942574),
      star('Alnilam', 84.053389, -1.201919),
      star('Mintaka', 83.001667, -0.299095),
      star('Bételgeuse', 88.792939, 7.407064),
      star('Bellatrix', 81.282764, 6.349703),
      star('Rigel', 78.634467, -8.201638),
      star('Saiph', 86.93912, -9.669605),
    ],
    edges: [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [4, 2],
      [2, 5],
      [5, 6],
      [6, 0],
    ],
    art: { x: 15, y: 0, width: 970, height: 980 },
  },
  {
    id: 'aquila',
    title: 'Aigle',
    figure: 'un aigle en vol',
    clue: 'Repère les trois étoiles de la tête autour d’Altaïr, le corps, les deux ailes et la queue.',
    reveal:
      'Autour d’Altaïr, on a imaginé un aigle en vol. C’est une autre façon de raconter le ciel !',
    stars: [
      star('Tarazed', 296.564915, 10.613262),
      star('Altaïr', 297.695827, 8.868321),
      star('Alshain', 298.828304, 6.406763),
      star('Okab', 286.352533, 13.863477),
      star('Delta Aquilae', 291.374589, 3.114779),
      star('Eta Aquilae', 298.118204, 1.005659),
      star('Theta Aquilae', 302.826195, -0.821464),
      star('Lambda Aquilae', 286.562244, -4.882563),
    ],
    edges: [
      [0, 1],
      [1, 2],
      [0, 4],
      [4, 3],
      [4, 5],
      [5, 6],
      [4, 7],
    ],
    rotation: 0,
    art: { x: 0, y: 0, width: 1000, height: 1000 },
  },
];

export function getConstellation(id: string): Constellation {
  return CONSTELLATIONS.find((item) => item.id === id) ?? CONSTELLATIONS[0]!;
}

/** Tangent-plane projection, then a single rotation and uniform scale: never
 * move individual stars to make them fit the artistic illustration. */
export function skyPoints(constellation: Constellation, surrounding?: SkyStar[]) {
  const stars = [...constellation.stars, ...(constellation.extraStars ?? [])];
  const frameStars = stars.slice(0, constellation.projectionAnchorCount ?? stars.length);
  const radians = Math.PI / 180;
  const ra0 = (frameStars.reduce((sum, item) => sum + item.ra, 0) / frameStars.length) * radians;
  const dec0 = (frameStars.reduce((sum, item) => sum + item.dec, 0) / frameStars.length) * radians;
  const project = (items: SkyStar[]) =>
    items.map((item) => {
      const ra = item.ra * radians,
        dec = item.dec * radians;
      const denominator =
        Math.sin(dec0) * Math.sin(dec) + Math.cos(dec0) * Math.cos(dec) * Math.cos(ra - ra0);
      return {
        x: (-Math.cos(dec) * Math.sin(ra - ra0)) / denominator,
        y:
          -(Math.cos(dec0) * Math.sin(dec) - Math.sin(dec0) * Math.cos(dec) * Math.cos(ra - ra0)) /
          denominator,
      };
    });
  const raw = project(frameStars);
  let angle = (constellation.rotation ?? 0) * radians;
  if (constellation.id === 'cygnus') {
    const dx = raw[2]!.x - raw[0]!.x,
      dy = raw[2]!.y - raw[0]!.y;
    angle = Math.PI / 2 - Math.atan2(dy, dx);
  }
  const rotate = (items: { x: number; y: number }[]) =>
    items.map(({ x, y }) => ({
      x: x * Math.cos(angle) - y * Math.sin(angle),
      y: x * Math.sin(angle) + y * Math.cos(angle),
    }));
  const rotated = rotate(raw);
  const minX = Math.min(...rotated.map((p) => p.x)),
    maxX = Math.max(...rotated.map((p) => p.x));
  const minY = Math.min(...rotated.map((p) => p.y)),
    maxY = Math.max(...rotated.map((p) => p.y));
  const scale = (constellation.skySpan ?? 650) / Math.max(maxX - minX, maxY - minY);
  return rotate(project(surrounding ?? stars)).map((p) => ({
    // Ignore platform-specific last-bit trig differences in SSR SVG attributes.
    x: Number((500 + (p.x - (minX + maxX) / 2) * scale).toFixed(6)),
    y: Number((500 + (p.y - (minY + maxY) / 2) * scale).toFixed(6)),
  }));
}

export type ConstellationPoint3D = { x: number; y: number; z: number };
/** Deliberately different MODEL depths, not claimed stellar distances. */
export function cygnusModel(): ConstellationPoint3D[] {
  const depths = [110, 80, 28, 18, 22, 36, 95];
  return skyPoints(getConstellation('cygnus')).map((p, index) => {
    const z = depths[index]!;
    return { x: ((p.x - 500) / 900) * z, y: ((500 - p.y) / 900) * z, z };
  });
}

/** The observation point lies inside the route, away from either endpoint. */
export const CONSTELLATION_OBSERVER_POSITION = 43;

export function perspectiveOffset(position: number): number {
  return (position - CONSTELLATION_OBSERVER_POSITION) / (100 - CONSTELLATION_OBSERVER_POSITION);
}

export function perspectiveSolved(position: number): boolean {
  return Math.abs(position - CONSTELLATION_OBSERVER_POSITION) <= 3;
}

export const CONSTELLATION_FILM_DURATION = 16.5;
export const CONSTELLATION_FILM_CHAPTERS = [
  {
    at: 0,
    tableau: 0,
    title: 'Un cygne dans notre ciel',
    text: 'Depuis la Terre, ces étoiles nous rappellent un cygne.',
  },
  {
    at: 2,
    tableau: 6.5,
    title: 'Partons sur le côté',
    text: 'Notre vaisseau voyage très loin. Les étoiles restent à leur place, mais le dessin change.',
  },
  {
    at: 7.3,
    tableau: 9.6,
    title: 'Le ciel a de la profondeur',
    text: 'Ces étoiles sont à des distances différentes. Le cygne était un dessin vu depuis notre point de départ.',
  },
  {
    at: 10.4,
    tableau: 15,
    title: 'Le dessin revient',
    text: 'En revenant au même endroit, nous retrouvons les mêmes étoiles… et notre cygne !',
  },
] as const;

export function filmView(seconds: number) {
  const smooth = (t: number) => {
    const v = Math.max(0, Math.min(1, t));
    return v * v * v * (v * (v * 6 - 15) + 10);
  };
  const offset =
    seconds < 7.3
      ? smooth((seconds - 2) / 4.5)
      : seconds < 10.4
        ? 1
        : 1 - smooth((seconds - 10.4) / 4.6);
  return {
    offset,
    chapter: seconds < 2 ? 0 : seconds < 7.3 ? 1 : seconds < 10.4 ? 2 : 3,
    artVisible: seconds < 1.6 || seconds >= 15,
  };
}
