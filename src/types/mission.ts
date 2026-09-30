import type { AssetReference } from '@/types/assets';

export type DifficultyBand = 'easy' | 'medium' | 'challenge';

/** Interactions 3D autorisées pour la mission (le moteur scène les lit). */
export type MissionInteraction = 'rotate' | 'zoom' | 'pan' | 'pick';

export type MissionStepKind =
  'intro' | 'observe' | 'manipulate' | 'challenge' | 'explain' | 'quiz' | 'reward' | 'complete';

export interface MissionStep {
  id: string;
  kind: MissionStepKind;
  /** Titre court (UI). Clé stable `id` pour futures traductions. */
  title: string;
  body: string;
  /** Short, authored reminder shown while the full guide is folded. */
  guideReminder?: string;
  /** Label du bouton continuer (défaut : Continuer). */
  ctaLabel?: string;
  /** Si true, le joueur doit réussir une action (pick/quiz) avant de continuer. */
  requiresSuccess?: boolean;
  /** Cible 3D pour un défi de picking (ex. equator, north-pole). */
  targetMarkerId?: string;
  /** Défi jour/nuit : le repère doit être côté jour ou nuit. */
  targetLighting?: 'day' | 'night';
  /** Défi phases lunaires (Mission 03). */
  targetPhase?: 'new' | 'crescent' | 'quarter' | 'gibbous' | 'full';
  /** Défi éclipses (Mission 04). */
  targetEclipse?: 'solar' | 'lunar';
  /** Défi ordre des planètes (Mission 05). */
  challengePlanetOrder?: boolean;
  /** Défi course orbitale : toucher la planète la plus rapide (Mission 06). */
  challengeOrbitRace?: boolean;
  /** Défi chute perpétuelle : régler la vitesse pour orbiter (Mission 06). */
  challengeOrbitFall?: boolean;
  /** Défi été dans l’hémisphère nord (Mission 07). */
  challengeNorthernSummer?: boolean;
  /** Défi observatoire : album de photos à cadrage constant (Mission 08). */
  challengeObservatory?: boolean;
  /** Expérience guidée du laboratoire : prisme ou mélange de lumières (Mission 09). */
  challengePrism?: boolean;
  /** Défi orbite Terre autour du Soleil (Mission 01). */
  challengeOrbit?: boolean;
  successFeedback?: string;
  hint?: string;
  /** Quiz lié à une étape `kind: 'quiz'`. */
  quizId?: string;
}

export interface Challenge {
  id: string;
  prompt: string;
  successFeedback: string;
  /** Indice doux en cas d'erreur — pas de punition */
  hint?: string;
  /** Cible 3D attendue pour un défi de picking, ex. equator */
  targetMarkerId?: string;
}

/** Activité liée à une scène 3D par id (pas d'import Babylon ici). */
export interface Activity {
  id: string;
  title: string;
  description: string;
  sceneId: string;
}

/**
 * Contenu pédagogique d'une mission — découplé de Babylon.
 * Langue : champs texte en français pour v1 ; `locale` prépare i18n.
 */
export interface Mission {
  id: string;
  /** Code langue BCP 47 des textes (v1 = fr). */
  locale: 'fr';
  title: string;
  difficulty: DifficultyBand;
  /**
   * Groupe pour variantes de difficulté futures (même arc pédagogique).
   * Ex. mission-01-easy / mission-01-challenge partagent variantGroupId: 'mission-01'.
   */
  variantGroupId?: string;
  prerequisites: string[];
  learningObjectives: string[];
  introQuestion: string;
  /** Référence scène Babylon — découplée du contenu texte */
  sceneId: string;
  allowedInteractions: MissionInteraction[];
  activities: Activity[];
  steps: MissionStep[];
  challenge: Challenge;
  finalExplanation: string;
  quizId?: string;
  rewardIds: string[];
  funFacts?: string[];
  glossaryIds?: string[];
  assets: AssetReference[];
  /** Affiché si tailles/distances ne sont pas réalistes */
  notToScaleNotice?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  missionIds: string[];
  order: number;
}
