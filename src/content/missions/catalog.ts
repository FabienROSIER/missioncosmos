/** Catalogue UI des missions (ordre de déblocage). */

export type MissionCatalogEntry = {
  id: string;
  title: string;
  objective: string;
  /** Mission débloquée à la réussite */
  unlocksNextId?: string;
};

export const MISSION_CATALOG: MissionCatalogEntry[] = [
  {
    id: 'mission-01',
    title: 'Notre Terre',
    objective: 'Découvrir la forme de la Terre, l’équateur et les pôles.',
    unlocksNextId: 'mission-02',
  },
  {
    id: 'mission-02',
    title: 'Jour et nuit',
    objective: 'Comprendre pourquoi il fait jour et nuit.',
    unlocksNextId: 'mission-03',
  },
  {
    id: 'mission-03',
    title: 'Phases de la Lune',
    objective: 'Observer comment la Lune change de forme.',
    unlocksNextId: 'mission-04',
  },
  {
    id: 'mission-04',
    title: 'Les éclipses',
    objective: 'Aligner Soleil, Terre et Lune pour comprendre les éclipses.',
    unlocksNextId: 'mission-05',
  },
  {
    id: 'mission-05',
    title: 'Le Système solaire',
    objective: 'Connaître les 8 planètes et leur ordre depuis le Soleil.',
    unlocksNextId: 'mission-06',
  },
  {
    id: 'mission-06',
    title: 'Les orbites',
    objective: 'Voir comment les planètes tournent et comparer leurs périodes.',
    unlocksNextId: 'mission-07',
  },
  {
    id: 'mission-07',
    title: 'Les saisons',
    objective: 'Comprendre l’inclinaison de la Terre et l’été / l’hiver.',
    unlocksNextId: 'mission-08',
  },
  {
    id: 'mission-08',
    title: 'Les étoiles',
    objective: 'Comparer des étoiles : tailles, couleurs, le Soleil comme étoile.',
    unlocksNextId: 'mission-09',
  },
  {
    id: 'mission-09',
    title: 'Le secret des couleurs',
    objective: 'Révéler l’arc-en-ciel et jouer avec les mélanges de lumières.',
    unlocksNextId: 'mission-constellations',
  },
  {
    id: 'mission-constellations',
    title: 'Les dessins du ciel',
    objective: 'Retrouver les constellations et découvrir leur profondeur en voyageant en 3D.',
    unlocksNextId: 'mission-10',
  },
  {
    id: 'mission-10',
    title: 'Notre galaxie',
    objective: 'Situer le Soleil dans la Voie lactée.',
    unlocksNextId: 'mission-11',
  },
  {
    id: 'mission-11',
    title: 'Les galaxies',
    objective: 'Découvrir d’autres galaxies, comme Andromède — des îles d’étoiles.',
    unlocksNextId: 'mission-12',
  },
  {
    id: 'mission-12',
    title: 'Les distances dans l’Univers',
    objective: 'Comparer les ordres de grandeur, de la Terre à l’Univers observable.',
    unlocksNextId: 'mission-13',
  },
  {
    id: 'mission-13',
    title: 'Les trous noirs',
    objective: 'Aborder gravité extrême et horizon des événements sans fausse analogie.',
  },
];

export function getCatalogEntry(id: string): MissionCatalogEntry | undefined {
  return MISSION_CATALOG.find((m) => m.id === id);
}
