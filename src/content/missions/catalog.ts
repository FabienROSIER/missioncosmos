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
];

export function getCatalogEntry(id: string): MissionCatalogEntry | undefined {
  return MISSION_CATALOG.find((m) => m.id === id);
}
