import { assertValidMission } from '@/content/missions/validateMission';
import type { Mission } from '@/types/mission';
import type { Reward } from '@/types/progress';

/** Récompense Mission 01 — collection locale (pas de loot aléatoire). */
export const REWARD_EARTH_EXPLORER: Reward = {
  id: 'reward-earth-explorer',
  title: 'Explorateur de la Terre',
  description:
    'Tu connais la forme de la Terre, l’équateur, les pôles… et son orbite autour du Soleil.',
  kind: 'badge',
};

/**
 * Mission 01 — Notre Terre.
 * Phrases courtes, jargon expliqué via glossaire.
 */
export const MISSION_01: Mission = assertValidMission({
  id: 'mission-01',
  locale: 'fr',
  variantGroupId: 'mission-01',
  title: 'Notre Terre',
  difficulty: 'easy',
  prerequisites: [],
  learningObjectives: [
    'Comprendre que la Terre est une sphère (boule), pas un disque plat.',
    'Repérer l’équateur et les pôles Nord / Sud.',
    'Découvrir que la Terre tourne autour du Soleil sur une orbite.',
  ],
  introQuestion: 'Sauras-tu préparer notre carte de navigation avant le grand voyage ?',
  sceneId: 'earth-preview',
  allowedInteractions: ['rotate', 'zoom', 'pick'],
  activities: [
    {
      id: 'act-earth-spin',
      title: 'Tourner la Terre',
      description: 'Fais pivoter le globe pour voir tous ses côtés.',
      sceneId: 'earth-preview',
    },
  ],
  steps: [
    {
      id: 'm01-intro',
      kind: 'intro',
      title: 'Le départ de l’expédition',
      body: 'Avant de partir vers les étoiles, préparons notre carte de navigation ! Retrouve trois repères sur notre planète, puis accompagne-la pendant une année autour du Soleil. Commence par tourner autour du globe : que découvres-tu sur sa forme ?',
      ctaLabel: 'Préparer la carte',
    },
    {
      id: 'm01-challenge-equator',
      kind: 'challenge',
      title: 'Repère 1 · Les deux moitiés',
      body: 'Choisis le repère qui sépare les moitiés nord et sud. Touche-le sur le globe ou choisis sa description. Ce grand cercle imaginaire s’appelle l’équateur.',
      requiresSuccess: true,
      targetMarkerId: 'equator',
      guideReminder: 'Retrouve le cercle qui sépare les moitiés nord et sud.',
      successFeedback:
        'Première balise enregistrée ! L’équateur sépare deux moitiés, appelées hémisphères : nord et sud. Ce repère est imaginaire : il n’y a pas de trait jaune sur la vraie Terre.',
      hint: 'Cherche la bande jaune au milieu, pas les points orange.',
    },
    {
      id: 'm01-challenge-north',
      kind: 'challenge',
      title: 'Repère 2 · Cap au nord',
      body: 'Notre carte a maintenant un milieu. Retrouve son extrémité nord ! Les pointillés montrent l’axe imaginaire autour duquel la Terre tourne. Où placerais-tu la balise du pôle Nord ?',
      requiresSuccess: true,
      targetMarkerId: 'north-pole',
      guideReminder: 'Retrouve l’extrémité nord de l’axe.',
      successFeedback:
        'Deuxième balise enregistrée ! Le pôle Nord est un bout de l’axe autour duquel la Terre tourne.',
      hint: 'Regarde tout en haut du globe, le point orange.',
    },
    {
      id: 'm01-challenge-south',
      kind: 'challenge',
      title: 'Repère 3 · L’autre bout du monde',
      body: 'Dernière balise : retrouve le pôle opposé au pôle Nord, à l’autre bout de l’axe. Tourne autour de la Terre si tu ne le vois pas. Où est le pôle Sud ?',
      requiresSuccess: true,
      targetMarkerId: 'south-pole',
      guideReminder: 'Retrouve le pôle opposé au pôle Nord.',
      successFeedback:
        'Nos trois repères sont enregistrés ! Équateur, pôle Nord, pôle Sud : notre carte est prête. Passons maintenant au voyage autour du Soleil.',
      hint: 'Tourne un peu le globe si besoin. Vise le point orange en bas.',
    },
    {
      id: 'm01-challenge-orbit',
      kind: 'challenge',
      title: 'Le voyage d’une année',
      body: 'La Terre voyage autour du Soleil sur une orbite. Fais-lui accomplir un tour entier pour terminer notre carte ! Glisse sur la scène ou utilise le bouton Avancer. Observe le trajet vert et le compteur : combien de jours faut-il pour revenir au départ ?',
      requiresSuccess: true,
      challengeOrbit: true,
      guideReminder: 'Fais un tour entier du Soleil pour compléter la carte.',
      successFeedback:
        'Voyage accompli ! Un tour du Soleil dure environ 365 jours : une année. Notre carte de navigation est complète. Le cercle dessiné montre le trajet : ce n’est pas un rail dans l’espace.',
      hint: 'Continue dans le même sens jusqu’à retrouver le départ. Tu peux aussi utiliser Avancer sur l’orbite.',
    },
    {
      id: 'm01-explain',
      kind: 'explain',
      title: 'Deux mouvements',
      body: 'Ta carte raconte deux mouvements différents. La Terre tourne sur elle-même en environ 24 heures : c’est pour cela qu’il fait jour, puis nuit. Elle fait aussi le tour du Soleil en environ 365 jours : c’est une année. Le temps passe plus vite. Tailles et distances sont changées pour tout montrer.',
      ctaLabel: 'Petit quiz',
    },
    {
      id: 'm01-quiz',
      kind: 'quiz',
      title: 'Quiz',
      body: 'Quelques questions rapides pour vérifier ce que tu as retenu.',
      requiresSuccess: true,
      quizId: 'quiz-mission-01',
    },
    {
      id: 'm01-reward',
      kind: 'reward',
      title: 'Récompense',
      body: 'Trois repères retrouvés et une année parcourue : ta carte de navigation est prête ! Tu as gagné le badge Explorateur de la Terre. Retrouve-le dans ta collection.',
      ctaLabel: 'Terminer',
    },
    {
      id: 'm01-complete',
      kind: 'complete',
      title: 'Mission terminée',
      body: 'Bravo ! Tu peux enchaîner sur la mission suivante, ou rester explorer un peu.',
      ctaLabel: 'Explorer encore',
    },
  ],
  challenge: {
    id: 'm01-pick-equator',
    prompt: 'Touche l’équateur sur le globe.',
    successFeedback: 'Oui ! C’est l’équateur : le grand cercle au milieu.',
    hint: 'Cherche le cercle jaune au milieu, pas les points aux extrémités.',
    targetMarkerId: 'equator',
  },
  finalExplanation:
    'La Terre est presque ronde. L’équateur est le grand cercle au milieu ; les pôles sont les bouts de l’axe. Et la Terre avance aussi autour du Soleil sur une orbite — un grand tour dure environ une année. Les lignes de la maquette sont des repères imaginaires.',
  rewardIds: [REWARD_EARTH_EXPLORER.id],
  funFacts: [
    'Deux mouvements : tourner sur soi ≈ 24 h (jour/nuit) ; un tour d’orbite autour du Soleil ≈ 365 jours (une année).',
  ],
  glossaryIds: ['equateur', 'pole', 'sphere', 'axe-rotation', 'orbite'],
  quizId: 'quiz-mission-01',
  assets: [
    {
      id: 'AST-010',
      path: '/assets/models/solarsystem/celestial-bodies/earth/earth.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
    {
      id: 'AST-011',
      path: '/assets/models/solarsystem/celestial-bodies/sun/sun.glb',
      kind: 'model',
      credit: 'Pack système solaire (usage perso)',
    },
  ],
  notToScaleNotice:
    'Attention : les tailles et distances ne sont pas comme dans l’espace réel. C’est une maquette pour apprendre.',
});
