/** Catalogue runtime des voix essentielles du robot (lot 47). */

export type RobotVoiceMessage = {
  id: string;
  /** Chemin relatif sous public/assets/audio/robot/fr/ */
  relativePath: string;
  stepIds: readonly string[];
};

export const ROBOT_VOICE_LOCALE = 'fr' as const;

export const ROBOT_VOICE_COMMON = {
  quiz: 'common.quiz',
  retry: 'common.reessayer',
  success: 'common.bravo',
  maquette: 'common.maquette',
} as const;

export const ROBOT_VOICE_MESSAGES: readonly RobotVoiceMessage[] = [
  {
    id: "common.quiz",
    relativePath: "common/common.quiz.mp3",
    stepIds: [],
  },
  {
    id: "common.reessayer",
    relativePath: "common/common.reessayer.mp3",
    stepIds: [],
  },
  {
    id: "common.bravo",
    relativePath: "common/common.bravo.mp3",
    stepIds: [],
  },
  {
    id: "common.maquette",
    relativePath: "common/common.maquette.mp3",
    stepIds: [],
  },
  {
    id: "mission-01.reperes",
    relativePath: "mission-01/mission-01.reperes.mp3",
    stepIds: ["m01-intro","m01-challenge-equator","m01-challenge-north","m01-challenge-south"],
  },
  {
    id: "mission-01.orbite",
    relativePath: "mission-01/mission-01.orbite.mp3",
    stepIds: ["m01-challenge-orbit"],
  },
  {
    id: "mission-01.mouvements",
    relativePath: "mission-01/mission-01.mouvements.mp3",
    stepIds: ["m01-explain"],
  },
  {
    id: "mission-02.jour-nuit",
    relativePath: "mission-02/mission-02.jour-nuit.mp3",
    stepIds: ["m02-intro","m02-observe","m02-challenge-day","m02-explain"],
  },
  {
    id: "mission-03.observer",
    relativePath: "mission-03/mission-03.observer.mp3",
    stepIds: ["m03-intro","m03-challenge-full","m03-challenge-crescent"],
  },
  {
    id: "mission-03.phases",
    relativePath: "mission-03/mission-03.phases.mp3",
    stepIds: ["m03-explain"],
  },
  {
    id: "mission-04.securite",
    relativePath: "mission-04/mission-04.securite.mp3",
    stepIds: ["m04-challenge-solar"],
  },
  {
    id: "mission-04.aligner",
    relativePath: "mission-04/mission-04.aligner.mp3",
    stepIds: ["m04-intro","m04-challenge-lunar"],
  },
  {
    id: "mission-04.orbite-penchee",
    relativePath: "mission-04/mission-04.orbite-penchee.mp3",
    stepIds: ["m04-explain"],
  },
  {
    id: "mission-05.planetes",
    relativePath: "mission-05/mission-05.planetes.mp3",
    stepIds: ["m05-intro","m05-observe","m05-challenge-order","m05-explain"],
  },
  {
    id: "mission-05.tailles",
    relativePath: "mission-05/mission-05.tailles.mp3",
    stepIds: ["m05-scale"],
  },
  {
    id: "mission-05.distances",
    relativePath: "mission-05/mission-05.distances.mp3",
    stepIds: ["m05-distances"],
  },
  {
    id: "mission-06.comparer",
    relativePath: "mission-06/mission-06.comparer.mp3",
    stepIds: ["m06-intro","m06-observe","m06-challenge"],
  },
  {
    id: "mission-06.lancer",
    relativePath: "mission-06/mission-06.lancer.mp3",
    stepIds: ["m06-fall"],
  },
  {
    id: "mission-06.gravite",
    relativePath: "mission-06/mission-06.gravite.mp3",
    stepIds: ["m06-explain"],
  },
  {
    id: "mission-07.experimenter",
    relativePath: "mission-07/mission-07.experimenter.mp3",
    stepIds: ["m07-intro","m07-observe","m07-challenge"],
  },
  {
    id: "mission-07.saisons",
    relativePath: "mission-07/mission-07.saisons.mp3",
    stepIds: ["m07-explain"],
  },
  {
    id: "mission-08.etoiles",
    relativePath: "mission-08/mission-08.etoiles.mp3",
    stepIds: ["m08-intro","m08-observe"],
  },
  {
    id: "mission-08.photos",
    relativePath: "mission-08/mission-08.photos.mp3",
    stepIds: ["m08-challenge"],
  },
  {
    id: "mission-08.taille-apparente",
    relativePath: "mission-08/mission-08.taille-apparente.mp3",
    stepIds: ["m08-explain"],
  },
  {
    id: "mission-09.prisme",
    relativePath: "mission-09/mission-09.prisme.mp3",
    stepIds: ["m09-intro","m09-color"],
  },
  {
    id: "mission-09.melanger",
    relativePath: "mission-09/mission-09.melanger.mp3",
    stepIds: ["m09-spectrum","m09-challenge"],
  },
  {
    id: "mission-09.lumiere-blanche",
    relativePath: "mission-09/mission-09.lumiere-blanche.mp3",
    stepIds: ["m09-explain"],
  },
  {
    id: "mission-10.atlas",
    relativePath: "mission-10/mission-10.atlas.mp3",
    stepIds: ["m10-intro"],
  },
  {
    id: "mission-10.cassiopee",
    relativePath: "mission-10/mission-10.cassiopee.mp3",
    stepIds: ["m10-cassiopeia"],
  },
  {
    id: "mission-10.grande-ourse",
    relativePath: "mission-10/mission-10.grande-ourse.mp3",
    stepIds: ["m10-ursa-major"],
  },
  {
    id: "mission-10.cygne",
    relativePath: "mission-10/mission-10.cygne.mp3",
    stepIds: ["m10-cygnus"],
  },
  {
    id: "mission-10.orion",
    relativePath: "mission-10/mission-10.orion.mp3",
    stepIds: ["m10-orion"],
  },
  {
    id: "mission-10.point-de-vue",
    relativePath: "mission-10/mission-10.point-de-vue.mp3",
    stepIds: ["m10-perspective"],
  },
  {
    id: "mission-11.galaxie",
    relativePath: "mission-11/mission-11.galaxie.mp3",
    stepIds: ["m11-intro","m11-journey","m11-explain"],
  },
  {
    id: "mission-11.quartier",
    relativePath: "mission-11/mission-11.quartier.mp3",
    stepIds: ["m11-explore","m11-locate"],
  },
  {
    id: "mission-11.trajet",
    relativePath: "mission-11/mission-11.trajet.mp3",
    stepIds: ["m11-orbit"],
  },
  {
    id: "mission-12.voisines",
    relativePath: "mission-12/mission-12.voisines.mp3",
    stepIds: ["m12-intro","m12-neighbour","m12-explain"],
  },
  {
    id: "mission-12.formes",
    relativePath: "mission-12/mission-12.formes.mp3",
    stepIds: ["m12-families","m12-album"],
  },
  {
    id: "mission-12.classer",
    relativePath: "mission-12/mission-12.classer.mp3",
    stepIds: ["m12-scale"],
  },
  {
    id: "mission-13.voyage",
    relativePath: "mission-13/mission-13.voyage.mp3",
    stepIds: ["m13-intro","m13-journey"],
  },
  {
    id: "mission-13.destinations",
    relativePath: "mission-13/mission-13.destinations.mp3",
    stepIds: ["m13-order"],
  },
  {
    id: "mission-13.signaux",
    relativePath: "mission-13/mission-13.signaux.mp3",
    stepIds: ["m13-signals"],
  },
  {
    id: "mission-13.annee-lumiere",
    relativePath: "mission-13/mission-13.annee-lumiere.mp3",
    stepIds: ["m13-explain"],
  },
  {
    id: "mission-14.indices",
    relativePath: "mission-14/mission-14.indices.mp3",
    stepIds: ["m14-intro","m14-observe","m14-detect"],
  },
  {
    id: "mission-14.disque",
    relativePath: "mission-14/mission-14.disque.mp3",
    stepIds: ["m14-surroundings"],
  },
  {
    id: "mission-14.limite",
    relativePath: "mission-14/mission-14.limite.mp3",
    stepIds: ["m14-signals","m14-explain"],
  },
  {
    id: "mission-14.meme-masse",
    relativePath: "mission-14/mission-14.meme-masse.mp3",
    stepIds: ["m14-orbit"],
  },
] as const;

const BY_ID = new Map(ROBOT_VOICE_MESSAGES.map((m) => [m.id, m]));

/** Priorité sécurité éclipses si plusieurs messages ciblent la même étape. */
const STEP_PRIORITY_SUFFIX = '.securite';

const STEP_TO_ID = (() => {
  const map = new Map<string, string>();
  for (const message of ROBOT_VOICE_MESSAGES) {
    for (const stepId of message.stepIds) {
      const current = map.get(stepId);
      if (!current) {
        map.set(stepId, message.id);
        continue;
      }
      if (message.id.endsWith(STEP_PRIORITY_SUFFIX)) map.set(stepId, message.id);
    }
  }
  return map;
})();

export function getRobotVoiceMessage(id: string): RobotVoiceMessage | undefined {
  return BY_ID.get(id);
}

/** Message d'étape (consigne / explication), hors phrases communes. */
export function resolveRobotVoiceForStep(stepId: string): RobotVoiceMessage | undefined {
  const id = STEP_TO_ID.get(stepId);
  return id ? BY_ID.get(id) : undefined;
}

