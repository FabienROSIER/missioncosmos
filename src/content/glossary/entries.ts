import type { GlossaryEntry } from '@/types/glossary';

/**
 * Glossaire Mission Cosmos — ton clair, pas infantilisant.
 * Vérifié pédagogiquement (niveau scolaire 6–12 ans).
 */
export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'sphere',
    term: 'Sphère',
    definition:
      'Une forme ronde comme une boule. On peut tourner tout autour. La Terre a presque cette forme.',
    enrichedDefinition:
      'En vrai, la Terre n’est pas une sphère parfaite : elle est un peu aplatie aux pôles. Pour apprendre, on la montre souvent comme une boule.',
    unlockRewardId: 'reward-earth-explorer',
    aliases: ['sphère', 'boule'],
  },
  {
    id: 'equateur',
    term: 'Équateur',
    definition:
      'Le grand cercle imaginaire au milieu de la Terre. Il la sépare en deux moitiés : nord et sud.',
    enrichedDefinition:
      'Près de l’équateur, il fait souvent plus chaud. C’est aussi là que la Terre est « la plus large » : le tour est le plus long.',
    unlockRewardId: 'reward-earth-explorer',
    aliases: ['équateur', "l'équateur", 'l’équateur'],
  },
  {
    id: 'pole',
    term: 'Pôle',
    definition:
      'Une extrémité de l’axe autour duquel la Terre tourne. Il y a le pôle Nord (en haut) et le pôle Sud (en bas).',
    enrichedDefinition:
      'Aux pôles, il fait très froid. Selon la saison, on peut avoir de longues journées ou de longues nuits.',
    unlockRewardId: 'reward-earth-explorer',
    aliases: ['pôle', 'pôles', 'pole', 'poles'],
  },
  {
    id: 'axe-rotation',
    term: 'Axe de rotation',
    definition:
      'La ligne imaginaire qui traverse la Terre des pôles. La Terre tourne autour de cet axe : c’est ce qui donne le jour et la nuit.',
    enrichedDefinition:
      'La Terre tourne une fois en environ 24 heures. Ce n’est pas l’axe qu’on voit dans le ciel : c’est une ligne inventée pour expliquer le mouvement.',
    unlockRewardId: 'reward-earth-explorer',
    aliases: ['axe', 'axe de rotation', 'rotation'],
  },
  {
    id: 'orbite',
    term: 'Orbite',
    definition:
      'Le chemin que suit la Terre autour du Soleil, comme une piste en cercle. La Terre avance dessus sans s’arrêter.',
    enrichedDefinition:
      'Imagine une voiture sur une piste ronde : la voiture, c’est la Terre ; le milieu de la piste, c’est le Soleil. Un tour complet dure environ une année (365 jours). Tourner sur soi-même (jour/nuit), c’est autre chose. Ici, tailles et distances sont une maquette.',
    unlockRewardId: 'reward-earth-explorer',
    aliases: ['orbite', 'orbites', "l'orbite", 'l’orbite'],
  },
  {
    id: 'jour-nuit',
    term: 'Jour et nuit',
    definition:
      'Le jour, on est du côté de la Terre éclairé par le Soleil. La nuit, on est de l’autre côté, dans l’ombre.',
    enrichedDefinition:
      'Le Soleil ne s’éteint pas la nuit : il brille toujours. C’est la Terre qui tourne.',
    unlockRewardId: 'reward-day-night',
    aliases: ['jour', 'nuit', 'jour et nuit'],
  },
  {
    id: 'soleil',
    term: 'Soleil',
    definition:
      'Notre étoile. Elle envoie de la lumière et de la chaleur. Sans elle, pas de jour sur Terre.',
    enrichedDefinition:
      'Le Soleil est énorme et très loin. Dans les missions, on le montre plus petit et plus près pour apprendre.',
    unlockRewardId: 'reward-day-night',
    aliases: ['soleil', 'étoile'],
  },
  {
    id: 'lune',
    term: 'Lune',
    definition:
      'Le satellite naturel de la Terre. Elle n’émet pas de lumière : elle réfléchit celle du Soleil.',
    enrichedDefinition:
      'La Lune fait un tour autour de la Terre en environ un mois. C’est pour ça que les phases se répètent à peu près chaque mois.',
    unlockRewardId: 'reward-moon-phases',
    aliases: ['lune', 'satellite'],
  },
  {
    id: 'phase-lune',
    term: 'Phase de la Lune',
    definition:
      'La forme de la Lune qu’on voit depuis la Terre : nouvelle, croissant, quartier, gibbeuse, pleine.',
    enrichedDefinition:
      'Ce n’est pas la Lune qui change de taille. On voit plus ou moins la moitié éclairée par le Soleil, selon sa position.',
    unlockRewardId: 'reward-moon-phases',
    aliases: ['phase', 'phases', 'croissant', 'pleine lune', 'nouvelle lune'],
  },
  {
    id: 'eclipse',
    term: 'Éclipse',
    definition:
      'Quand l’ombre de la Terre passe sur la Lune, ou quand la Lune passe devant le Soleil. Ce n’est pas la même chose que les phases.',
    enrichedDefinition:
      'Les phases arrivent tous les mois. Les éclipses sont plus rares : il faut un alignement très précis, car l’orbite de la Lune est un peu penchée.',
    unlockRewardId: 'reward-eclipses',
    aliases: ['éclipse', 'eclipses', 'éclipses'],
  },
  {
    id: 'ombre',
    term: 'Ombre',
    definition:
      'La zone sans lumière derrière un objet éclairé. La Terre et la Lune ont chacune une ombre dans l’espace.',
    enrichedDefinition:
      'Dans les missions, on montre des cônes d’ombre simplifiés pour comprendre les éclipses — ce n’est pas une simulation exacte.',
    unlockRewardId: 'reward-eclipses',
    aliases: ['ombre', 'ombres', 'pénombre'],
  },
  {
    id: 'systeme-solaire',
    term: 'Système solaire',
    definition:
      'Le Soleil et tout ce qui tourne autour : planètes, lunes, astéroïdes, comètes…',
    enrichedDefinition:
      'Il y a 8 planètes. Les distances sont énormes : les maquettes de l’app ne sont pas à l’échelle.',
    unlockRewardId: 'reward-solar-system',
    aliases: ['système solaire', 'systeme solaire'],
  },
  {
    id: 'planete',
    term: 'Planète',
    definition:
      'Un gros corps qui tourne autour du Soleil (chez nous) et qui a « nettoyé » son voisinage.',
    enrichedDefinition:
      'Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune : voilà les 8.',
    unlockRewardId: 'reward-solar-system',
    aliases: ['planète', 'planètes', 'planetes'],
  },
  {
    id: 'planete-naine',
    term: 'Planète naine',
    definition:
      'Un corps rond qui tourne autour du Soleil, mais trop petit pour être une planète. Exemple : Pluton.',
    enrichedDefinition:
      'Pluton n’est plus comptée comme 9e planète depuis 2006. Il existe d’autres planètes naines plus loin.',
    unlockRewardId: 'reward-solar-system',
    aliases: ['planète naine', 'pluton', 'Pluton'],
  },
];

const BY_ID: Record<string, GlossaryEntry> = Object.fromEntries(
  GLOSSARY_ENTRIES.map((entry) => [entry.id, entry]),
);

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return BY_ID[id];
}

export function getGlossaryEntries(ids: string[]): GlossaryEntry[] {
  return ids.map((id) => BY_ID[id]).filter((entry): entry is GlossaryEntry => Boolean(entry));
}

/** Vrai si le bonus enrichi est débloqué pour cette entrée. */
export function isGlossaryEnrichedUnlocked(
  entry: GlossaryEntry,
  earnedRewardIds: string[],
): boolean {
  if (!entry.enrichedDefinition || !entry.unlockRewardId) return false;
  return earnedRewardIds.includes(entry.unlockRewardId);
}

/** Entrées qui ont un bonus et dont la récompense est gagnée. */
export function getUnlockedEnrichedEntries(earnedRewardIds: string[]): GlossaryEntry[] {
  return GLOSSARY_ENTRIES.filter((entry) => isGlossaryEnrichedUnlocked(entry, earnedRewardIds));
}
