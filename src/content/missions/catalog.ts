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
    objective: 'Préparer ta carte de la Terre et accomplir le voyage d’une année.',
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
    objective: 'Compare le temps d’un tour du Soleil pour chaque planète.',
    unlocksNextId: 'mission-07',
  },
  {
    id: 'mission-07',
    title: 'Les saisons',
    objective: 'Pourquoi la Terre penchée nous donne-t-elle des saisons ?',
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
    unlocksNextId: 'mission-10',
  },
  {
    id: 'mission-10',
    title: 'Les dessins du ciel',
    objective: 'Retrouve les constellations et compare la distance de leurs étoiles.',
    unlocksNextId: 'mission-11',
  },
  {
    id: 'mission-11',
    title: 'Notre galaxie',
    objective: 'Situer le Soleil dans la Voie lactée.',
    unlocksNextId: 'mission-12',
  },
  {
    id: 'mission-12',
    title: 'Les galaxies',
    objective: 'Découvrir d’autres galaxies, comme Andromède — des îles d’étoiles.',
    unlocksNextId: 'mission-13',
  },
  {
    id: 'mission-13',
    title: 'Les distances dans l’Univers',
    objective: 'Compare les distances, de la Terre aux galaxies les plus lointaines.',
    unlocksNextId: 'mission-14',
  },
  {
    id: 'mission-14',
    title: 'Les trous noirs',
    objective: 'Découvre les trous noirs et leur limite de non-retour.',
  },
];

export function getCatalogEntry(id: string): MissionCatalogEntry | undefined {
  return MISSION_CATALOG.find((m) => m.id === id);
}
