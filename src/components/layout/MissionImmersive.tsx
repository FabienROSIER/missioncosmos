'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Companion } from '@/components/game/Companion';
import { SafeBackButton } from '@/components/layout/SafeBackButton';
import { RewardPanel } from '@/components/ui/RewardPanel';
import type { EarthMarkerId, EarthSceneApi } from '@/3d/scenes/EarthPreviewScene';
import { EarthPreviewScene } from '@/3d/scenes/EarthPreviewScene';
import type { DayNightSceneApi } from '@/3d/scenes/DayNightScene';
import { DayNightScene } from '@/3d/scenes/DayNightScene';
import type { MoonPhasesSceneApi } from '@/3d/scenes/MoonPhasesScene';
import { MoonPhasesScene } from '@/3d/scenes/MoonPhasesScene';
import type { EclipseTarget, EclipsesSceneApi } from '@/3d/scenes/EclipsesScene';
import { EclipsesScene } from '@/3d/scenes/EclipsesScene';
import type { SolarSystemSceneApi } from '@/3d/scenes/SolarSystemScene';
import { SolarSystemScene } from '@/3d/scenes/SolarSystemScene';
import type { OrbitsSceneApi } from '@/3d/scenes/OrbitsScene';
import { OrbitsScene } from '@/3d/scenes/OrbitsScene';
import type { OrbitFallSceneApi } from '@/3d/scenes/OrbitFallScene';
import { OrbitFallScene } from '@/3d/scenes/OrbitFallScene';
import type { SeasonsSceneApi } from '@/3d/scenes/SeasonsScene';
import { SeasonsScene } from '@/3d/scenes/SeasonsScene';
import { SolarDistancePanel } from '@/3d/scenes/SolarDistancePanel';
import { SolarSizeChallenge } from '@/3d/scenes/SolarSizeChallenge';
import type { SurfaceLighting } from '@/3d/scenes/dayNightMarkers';
import type { MoonPhaseId } from '@/3d/utils/moonPhase';
import type { PlanetId } from '@/content/bodies/solarSystem';
import { SOLAR_SYSTEM_PLANETS } from '@/content/bodies/solarSystem';
import { getQuizById } from '@/content/quizzes';
import { getGlossaryEntries } from '@/content/glossary';
import { getCatalogEntry } from '@/content/missions/catalog';
import { getRewardById } from '@/content/rewards/catalog';
import { GlossaryPanel } from '@/features/glossary/GlossaryPanel';
import { RichMissionText } from '@/features/glossary/RichMissionText';
import { resolveCompanionCue, type CompanionFeedbackMood } from '@/features/companion';
import { MissionQuiz } from '@/features/missions/MissionQuiz';
import { useMissionSequence } from '@/features/missions/useMissionSequence';
import { completeMission } from '@/features/progression/saveStore';
import { useLocalSave } from '@/features/progression/useLocalSave';
import type { Mission, MissionStep } from '@/types/mission';
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';
import styles from './MissionImmersive.module.css';

type MissionImmersiveProps = {
  mission: Mission;
};

type ChallengeContext = {
  stepKind: MissionStep['kind'];
  stepId: string;
  challengeSolved: boolean;
  targetMarkerId: EarthMarkerId | undefined;
  challengeOrbit: boolean;
  successFeedback: string;
  hint: string;
};

type StepFeedback = {
  stepId: string;
  text: string;
  wrong: boolean;
};

function challengeFromStep(step: MissionStep): {
  targetMarkerId: EarthMarkerId | undefined;
  targetLighting: SurfaceLighting | undefined;
  targetPhase: MoonPhaseId | undefined;
  targetEclipse: EclipseTarget | undefined;
  challengePlanetOrder: boolean;
  challengeOrbitRace: boolean;
  challengeOrbitFall: boolean;
  challengeNorthernSummer: boolean;
  challengeOrbit: boolean;
  successFeedback: string;
  hint: string;
} {
  return {
    targetMarkerId: step.targetMarkerId as EarthMarkerId | undefined,
    targetLighting: step.targetLighting,
    targetPhase: step.targetPhase,
    targetEclipse: step.targetEclipse,
    challengePlanetOrder: Boolean(step.challengePlanetOrder),
    challengeOrbitRace: Boolean(step.challengeOrbitRace),
    challengeOrbitFall: Boolean(step.challengeOrbitFall),
    challengeNorthernSummer: Boolean(step.challengeNorthernSummer),
    challengeOrbit: Boolean(step.challengeOrbit),
    successFeedback: step.successFeedback ?? 'Oui, c’est ça !',
    hint: step.hint ?? 'Pas tout à fait — réessaie sans te presser.',
  };
}

/** Layout mission : 3D plein écran + séquence pédagogique. */
export function MissionImmersive({ mission }: MissionImmersiveProps) {
  const isDayNight = mission.sceneId === 'day-night';
  const isMoonPhases = mission.sceneId === 'moon-phases';
  const isEclipses = mission.sceneId === 'eclipses';
  const isSolarSystem = mission.sceneId === 'solar-system';
  const isOrbits = mission.sceneId === 'orbits';
  const isSeasons = mission.sceneId === 'seasons';
  const [tipOpen, setTipOpen] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<'mission' | 'controls'>('mission');
  const [earthApi, setEarthApi] = useState<EarthSceneApi | null>(null);
  const [dayNightApi, setDayNightApi] = useState<DayNightSceneApi | null>(null);
  const [moonPhasesApi, setMoonPhasesApi] = useState<MoonPhasesSceneApi | null>(null);
  const [eclipsesApi, setEclipsesApi] = useState<EclipsesSceneApi | null>(null);
  const [solarApi, setSolarApi] = useState<SolarSystemSceneApi | null>(null);
  const [orbitsApi, setOrbitsApi] = useState<OrbitsSceneApi | null>(null);
  const [orbitFallApi, setOrbitFallApi] = useState<OrbitFallSceneApi | null>(null);
  const [seasonsApi, setSeasonsApi] = useState<SeasonsSceneApi | null>(null);
  const [recentering, setRecentering] = useState(false);
  const [feedback, setFeedback] = useState<StepFeedback | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryFocusId, setGlossaryFocusId] = useState<string | null>(null);
  const [quizMood, setQuizMood] = useState<CompanionFeedbackMood>('none');
  const stageRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const tipCardRef = useRef<HTMLDivElement>(null);
  const completionSavedRef = useRef(false);

  const {
    step,
    stepIndex,
    challengeSolved,
    canAdvance,
    resumeAvailable,
    goNext,
    markChallengeSolved,
    restart,
    dismissResumeBanner,
    isComplete,
  } = useMissionSequence(mission);

  useEffect(() => {
    if (
      step.id === 'm05-scale' ||
      step.id === 'm05-distances' ||
      step.id === 'm06-fall' ||
      step.kind === 'quiz'
    ) {
      setTipOpen(true);
    }
  }, [step.id, step.kind]);

  useEffect(() => {
    if (!isSolarSystem) return;
    const measure = () => {
      const tipH = tipCardRef.current?.getBoundingClientRect().height;
      const barH = bottomBarRef.current?.getBoundingClientRect().height;
      // Hauteur utile du tip (pas la barre étirée), plafonnée pour le dock M05.
      const bottomClearance = Math.min(tipH ?? barH ?? 200, Math.round(window.innerHeight * 0.42));
      stageRef.current?.style.setProperty(
        '--mission-top-clearance',
        `${topBarRef.current?.getBoundingClientRect().height ?? 64}px`,
      );
      stageRef.current?.style.setProperty('--mission-bottom-clearance', `${bottomClearance}px`);
    };
    const observer = new ResizeObserver(measure);
    if (topBarRef.current) observer.observe(topBarRef.current);
    if (tipCardRef.current) observer.observe(tipCardRef.current);
    else if (bottomBarRef.current) observer.observe(bottomBarRef.current);
    measure();
    return () => observer.disconnect();
  }, [isSolarSystem, step.id, tipOpen]);

  useEffect(() => {
    if (window.matchMedia(MOBILE_GAME_QUERY).matches) {
      bottomBarRef.current?.scrollTo({ top: 0 });
    }
  }, [step.id]);

  const { earnedRewardIds, companionVariant } = useLocalSave();

  const showMarkers =
    step.kind === 'observe' ||
    step.kind === 'challenge' ||
    step.kind === 'explain' ||
    step.kind === 'quiz' ||
    step.kind === 'reward' ||
    step.kind === 'complete' ||
    step.kind === 'manipulate';

  const challengeActive = step.kind === 'challenge' && !challengeSolved;
  const {
    targetMarkerId,
    targetLighting,
    targetPhase,
    targetEclipse,
    challengePlanetOrder,
    challengeOrbitRace,
    challengeOrbitFall,
    challengeNorthernSummer,
    challengeOrbit,
    successFeedback,
    hint,
  } = challengeFromStep(step);
  const showOrbitFall = isOrbits && step.id === 'm06-fall';
  const hasSceneControls =
    isOrbits ||
    isSeasons ||
    (isSolarSystem && step.id !== 'm05-scale' && step.id !== 'm05-distances');
  const visibleFeedback = feedback?.stepId === step.id ? feedback : null;
  const quiz = step.quizId ? getQuizById(step.quizId) : undefined;
  const glossaryEntries = getGlossaryEntries(mission.glossaryIds ?? []);
  const nextMissionId = getCatalogEntry(mission.id)?.unlocksNextId;
  const nextMission = nextMissionId ? getCatalogEntry(nextMissionId) : undefined;
  const reward = getRewardById(mission.rewardIds[0] ?? '');

  const cameraApi = isSeasons
    ? seasonsApi?.camera
    : showOrbitFall
      ? orbitFallApi?.camera
      : isOrbits
        ? orbitsApi?.camera
        : isSolarSystem
          ? solarApi?.camera
          : isEclipses
            ? eclipsesApi?.camera
            : isMoonPhases
              ? moonPhasesApi?.camera
              : isDayNight
                ? dayNightApi?.camera
                : earthApi?.camera;

  const openGlossary = useCallback((focusId?: string) => {
    setGlossaryFocusId(focusId ?? null);
    setGlossaryOpen(true);
  }, []);

  const closeGlossary = useCallback(() => {
    setGlossaryOpen(false);
    setGlossaryFocusId(null);
  }, []);

  useEffect(() => {
    if (step.kind !== 'reward' && step.kind !== 'complete') return;
    if (completionSavedRef.current) return;
    completionSavedRef.current = true;
    const nextId = getCatalogEntry(mission.id)?.unlocksNextId;
    completeMission(mission.id, mission.rewardIds, nextId);
  }, [step.kind, mission.id, mission.rewardIds]);

  const pickCtxRef = useRef<ChallengeContext>({
    stepKind: step.kind,
    stepId: step.id,
    challengeSolved,
    targetMarkerId,
    challengeOrbit,
    successFeedback,
    hint,
  });

  useEffect(() => {
    pickCtxRef.current = {
      stepKind: step.kind,
      stepId: step.id,
      challengeSolved,
      targetMarkerId,
      challengeOrbit,
      successFeedback,
      hint,
    };
  }, [step.kind, step.id, challengeSolved, targetMarkerId, challengeOrbit, successFeedback, hint]);

  useEffect(() => {
    if (
      !earthApi ||
      isDayNight ||
      isMoonPhases ||
      isEclipses ||
      isSolarSystem ||
      isOrbits ||
      isSeasons
    )
      return;

    const orbitStepIndex = mission.steps.findIndex((s) => s.challengeOrbit);
    const earthOrbitView = orbitStepIndex >= 0 && stepIndex >= orbitStepIndex;

    earthApi.setOrbitViewEnabled(earthOrbitView);
    earthApi.setOrbitChallengeEnabled(challengeActive && challengeOrbit);
    earthApi.setMarkersVisible(showMarkers && !earthOrbitView);
    earthApi.setChallengePickEnabled(challengeActive && Boolean(targetMarkerId) && !earthOrbitView);
    // Intro / manip : avance dès qu’on tourne assez le globe
    earthApi.setOrbitDetectEnabled(
      !earthOrbitView && (step.kind === 'intro' || step.kind === 'manipulate'),
    );

    if (earthOrbitView) {
      earthApi.setMarkerHighlight(null);
    } else if (challengeActive || (step.kind === 'challenge' && challengeSolved)) {
      earthApi.setMarkerHighlight(targetMarkerId ?? null);
    } else if (step.id.includes('pole')) {
      earthApi.setMarkerHighlight('north-pole');
    } else if (step.kind === 'observe' || step.id.includes('equator')) {
      earthApi.setMarkerHighlight('equator');
    } else {
      earthApi.setMarkerHighlight(null);
    }
  }, [
    earthApi,
    isDayNight,
    isMoonPhases,
    isEclipses,
    isSolarSystem,
    isOrbits,
    isSeasons,
    mission.steps,
    stepIndex,
    showMarkers,
    challengeActive,
    challengeSolved,
    challengeOrbit,
    targetMarkerId,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!dayNightApi || !isDayNight) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    dayNightApi.setHouseVisible(showMarkers);
    dayNightApi.setCinematicMode(cinematic);
    dayNightApi.setEarthDragEnabled(!cinematic);
    dayNightApi.setLightingChallenge(
      !cinematic && challengeActive && targetLighting ? targetLighting : null,
    );
  }, [dayNightApi, isDayNight, showMarkers, challengeActive, targetLighting, step.kind, step.id]);

  useEffect(() => {
    if (!moonPhasesApi || !isMoonPhases) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    moonPhasesApi.setCinematicMode(cinematic);
    moonPhasesApi.setMoonDragEnabled(!cinematic && step.kind !== 'intro');
    moonPhasesApi.setPhaseChallenge(
      !cinematic && challengeActive && targetPhase ? targetPhase : null,
    );
  }, [moonPhasesApi, isMoonPhases, challengeActive, targetPhase, step.kind, step.id]);

  useEffect(() => {
    if (!eclipsesApi || !isEclipses) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    eclipsesApi.setCinematicMode(cinematic);
    eclipsesApi.setMoonDragEnabled(!cinematic && step.kind !== 'intro');
    eclipsesApi.setEclipseChallenge(
      !cinematic && challengeActive && targetEclipse ? targetEclipse : null,
    );
    // Orbite penchée à l’explication « pas chaque mois »
    eclipsesApi.setOrbitTilted(step.kind === 'explain' || step.id.includes('explain'));
  }, [eclipsesApi, isEclipses, challengeActive, targetEclipse, step.kind, step.id]);

  useEffect(() => {
    if (!solarApi || !isSolarSystem) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    solarApi.setCinematicMode(cinematic);
    solarApi.setPickEnabled(!cinematic && step.kind !== 'intro');
    solarApi.setOrderChallenge(!cinematic && challengeActive && challengePlanetOrder);
    if (step.id === 'm05-scale') {
      solarApi.setScaleMode('sizes');
      solarApi.focusBody(null);
    } else if (step.id === 'm05-distances') {
      solarApi.setScaleMode('distances');
    } else {
      solarApi.setScaleMode('readable');
    }
  }, [solarApi, isSolarSystem, challengeActive, challengePlanetOrder, step.kind, step.id]);

  useEffect(() => {
    if (!orbitsApi || !isOrbits || showOrbitFall) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';
    orbitsApi.setPickEnabled(!cinematic && step.kind !== 'intro');
    orbitsApi.setInfoEnabled(step.id === 'm06-compare' || step.id === 'm06-challenge');
    orbitsApi.setRaceChallenge(!cinematic && challengeActive && challengeOrbitRace);
    if (challengeActive && challengeOrbitRace) {
      orbitsApi.setSpeed(1);
    } else if (step.id === 'm06-speed') {
      orbitsApi.setSpeed(4);
    } else if (step.kind === 'intro') {
      orbitsApi.setSpeed(1);
    }
  }, [orbitsApi, isOrbits, showOrbitFall, challengeActive, challengeOrbitRace, step.kind, step.id]);

  useEffect(() => {
    if (!seasonsApi || !isSeasons) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';
    seasonsApi.setOrbitDragEnabled(!cinematic && step.kind !== 'intro');
    seasonsApi.setChallengeEnabled(!cinematic && challengeActive && challengeNorthernSummer);
    if (step.id === 'm07-tilt') {
      seasonsApi.setTiltDeg(0);
    } else if (
      step.id === 'm07-observe' ||
      step.id === 'm07-orbit' ||
      step.id === 'm07-challenge'
    ) {
      seasonsApi.setTiltDeg(23.5);
    }
  }, [seasonsApi, isSeasons, challengeActive, challengeNorthernSummer, step.kind, step.id]);

  const onEarthApi = useCallback((api: EarthSceneApi) => {
    setEarthApi(api);
  }, []);

  const onDayNightApi = useCallback((api: DayNightSceneApi) => {
    setDayNightApi(api);
  }, []);

  const onMoonPhasesApi = useCallback((api: MoonPhasesSceneApi) => {
    setMoonPhasesApi(api);
  }, []);

  const onEclipsesApi = useCallback((api: EclipsesSceneApi) => {
    setEclipsesApi(api);
  }, []);

  const onSolarApi = useCallback((api: SolarSystemSceneApi) => {
    setSolarApi(api);
  }, []);

  const onOrbitsApi = useCallback((api: OrbitsSceneApi) => {
    setOrbitsApi(api);
  }, []);

  const onOrbitFallApi = useCallback((api: OrbitFallSceneApi) => {
    setOrbitFallApi(api);
  }, []);

  const onSeasonsApi = useCallback((api: SeasonsSceneApi) => {
    setSeasonsApi(api);
  }, []);

  const onMarkerPick = useCallback(
    (id: EarthMarkerId) => {
      const ctx = pickCtxRef.current;
      if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
      if (!ctx.targetMarkerId) return;

      if (id === ctx.targetMarkerId) {
        setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
        markChallengeSolved();
        earthApi?.setMarkerHighlight(id);
        earthApi?.setChallengePickEnabled(false);
        return;
      }

      setFeedback({ stepId: ctx.stepId, text: ctx.hint, wrong: true });
    },
    [markChallengeSolved, earthApi],
  );

  const onSignificantOrbit = useCallback(() => {
    if (step.kind !== 'intro' && step.kind !== 'manipulate') return;
    setFeedback(null);
    goNext();
  }, [step.kind, goNext]);

  const onOrbitChallengeSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepKind !== 'challenge' || ctx.challengeSolved || !ctx.challengeOrbit) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onLightingSuccess = useCallback(
    (_lit: SurfaceLighting) => {
      void _lit;
      const ctx = pickCtxRef.current;
      if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
      setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
      markChallengeSolved();
      dayNightApi?.setLightingChallenge(null);
    },
    [markChallengeSolved, dayNightApi],
  );

  const onPhaseSuccess = useCallback(
    (_phase: MoonPhaseId) => {
      void _phase;
      const ctx = pickCtxRef.current;
      if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
      setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
      markChallengeSolved();
      moonPhasesApi?.setPhaseChallenge(null);
    },
    [markChallengeSolved, moonPhasesApi],
  );

  const onEclipseSuccess = useCallback(
    (_kind: EclipseTarget) => {
      void _kind;
      const ctx = pickCtxRef.current;
      if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
      setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
      markChallengeSolved();
      eclipsesApi?.setEclipseChallenge(null);
    },
    [markChallengeSolved, eclipsesApi],
  );

  const onOrderSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
    solarApi?.setOrderChallenge(false);
  }, [markChallengeSolved, solarApi]);

  const onRaceSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
    orbitsApi?.setRaceChallenge(false);
  }, [markChallengeSolved, orbitsApi]);

  const onRaceMiss = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.hint, wrong: true });
  }, []);

  const onFallSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onSummerSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
    seasonsApi?.setChallengeEnabled(false);
  }, [markChallengeSolved, seasonsApi]);

  const onSizeChallengeSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepId !== 'm05-scale' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onDistanceChallengeSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepId !== 'm05-distances' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onOrderMiss = useCallback((expected: PlanetId) => {
    const ctx = pickCtxRef.current;
    if (ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({
      stepId: ctx.stepId,
      text: `Pas encore — touche ${SOLAR_SYSTEM_PLANETS[expected].nameFr}.`,
      wrong: true,
    });
  }, []);

  const onRecenter = async () => {
    if (!cameraApi || recentering) return;
    setRecentering(true);
    try {
      await cameraApi.recenter();
    } finally {
      setRecentering(false);
    }
  };

  const selectMobilePanel = (panel: 'mission' | 'controls') => {
    setMobilePanel(panel);
    bottomBarRef.current?.scrollTo({ top: 0 });
  };

  const onContinue = () => {
    setMobilePanel('mission');
    if (window.matchMedia(MOBILE_GAME_QUERY).matches) setTipOpen(true);
    setFeedback(null);
    setQuizMood('none');
    goNext();
  };

  const onRestart = () => {
    setMobilePanel('mission');
    if (window.matchMedia(MOBILE_GAME_QUERY).matches) setTipOpen(true);
    setFeedback(null);
    setQuizMood('none');
    completionSavedRef.current = false;
    restart();
  };

  const companionFeedback: CompanionFeedbackMood = visibleFeedback
    ? visibleFeedback.wrong
      ? 'wrong'
      : 'success'
    : step.kind === 'quiz'
      ? quizMood
      : 'none';

  const companionCue = resolveCompanionCue({
    stepKind: step.kind,
    challengeSolved,
    feedback: companionFeedback,
    isComplete,
    funFact: step.kind === 'explain' && mission.funFacts?.[0] ? mission.funFacts[0] : undefined,
  });

  const challengeHint = challengeOrbit
    ? 'Glisse à gauche ou à droite pour faire avancer la Terre sur l’anneau autour du Soleil.'
    : challengeNorthernSummer
      ? 'Glisse la Terre (ou utilise Été N) pour que le nord soit penché vers le Soleil.'
      : challengeOrbitFall
        ? 'Règle le curseur, lance, observe, puis ajuste — sans zones colorées toutes faites.'
        : challengeOrbitRace
          ? 'Touche la planète qui finit un tour en premier (la plus rapide).'
          : challengePlanetOrder
            ? 'Touche Mercure, puis Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune.'
            : targetEclipse
              ? targetEclipse === 'solar'
                ? 'Glisse pour mettre la Lune entre la Terre et le Soleil (alignement).'
                : 'Glisse pour mettre la Lune derrière la Terre, dans son ombre.'
              : targetPhase
                ? targetPhase === 'full'
                  ? 'Glisse pour mettre la Lune à l’opposé du Soleil (pleine Lune dans la vue Terre).'
                  : targetPhase === 'crescent'
                    ? 'Glisse pour rapprocher la Lune du Soleil, sans la coller dessus (croissant).'
                    : targetPhase === 'new'
                      ? 'Glisse pour mettre la Lune presque entre la Terre et le Soleil.'
                      : targetPhase === 'quarter'
                        ? 'Glisse jusqu’à un quartier (Lune à angle droit avec le Soleil).'
                        : 'Glisse jusqu’à une Lune gibbeuse (presque pleine).'
                : targetLighting
                  ? targetLighting === 'day'
                    ? 'Glisse pour tourner la Terre jusqu’à ce que le Guide soit dans la lumière.'
                    : 'Glisse pour mettre le Guide dans l’ombre (côté sombre).'
                  : targetMarkerId === 'equator'
                    ? 'Clique sur la bande jaune au milieu du globe.'
                    : targetMarkerId === 'north-pole'
                      ? 'Clique sur le point orange en haut (pôle Nord).'
                      : targetMarkerId === 'south-pole'
                        ? 'Clique sur le point orange en bas (pôle Sud).'
                        : 'Touche la bonne zone sur le globe.';

  return (
    <div
      ref={stageRef}
      className={[
        styles.stage,
        isSolarSystem ? styles.solarStage : '',
        mobilePanel === 'controls' && hasSceneControls ? styles.showControls : '',
      ].join(' ')}
    >
      <div className={styles.sceneArea}>
        {isSeasons ? (
          <SeasonsScene
            className={styles.viewport}
            fill
            onSceneApi={onSeasonsApi}
            onSummerSuccess={onSummerSuccess}
          />
        ) : showOrbitFall ? (
          <OrbitFallScene
            className={styles.viewport}
            fill
            onSceneApi={onOrbitFallApi}
            onFallSuccess={onFallSuccess}
          />
        ) : isOrbits ? (
          <OrbitsScene
            className={styles.viewport}
            fill
            onSceneApi={onOrbitsApi}
            onRaceSuccess={onRaceSuccess}
            onRaceMiss={onRaceMiss}
          />
        ) : isSolarSystem ? (
          <SolarSystemScene
            className={styles.viewport}
            fill
            onSceneApi={onSolarApi}
            onOrderSuccess={onOrderSuccess}
            onOrderMiss={onOrderMiss}
          />
        ) : isEclipses ? (
          <EclipsesScene
            className={styles.viewport}
            fill
            onSceneApi={onEclipsesApi}
            onEclipseSuccess={onEclipseSuccess}
          />
        ) : isMoonPhases ? (
          <MoonPhasesScene
            className={styles.viewport}
            fill
            onSceneApi={onMoonPhasesApi}
            onPhaseSuccess={onPhaseSuccess}
          />
        ) : isDayNight ? (
          <DayNightScene
            className={styles.viewport}
            fill
            houseVisible={showMarkers}
            onSceneApi={onDayNightApi}
            onLightingSuccess={onLightingSuccess}
          />
        ) : (
          <EarthPreviewScene
            className={styles.viewport}
            fill
            markersVisible={showMarkers}
            onSceneApi={onEarthApi}
            onMarkerPick={onMarkerPick}
            onSignificantOrbit={onSignificantOrbit}
            onOrbitChallengeSuccess={onOrbitChallengeSuccess}
          />
        )}

        {/* Schéma 2D hors bulle (ex. défi distances) */}
        <div
          id="mission-schema-root"
          className={styles.schemaRoot}
          onPointerDown={(event) => event.stopPropagation()}
        />
      </div>

      <header ref={topBarRef} className={styles.topBar}>
        <SafeBackButton
          fallbackHref="/missions"
          label="Quitter"
          compact
          preferFallback
        />
        <h1 className={styles.title}>{mission.title}</h1>
        <button type="button" className={styles.ghostBtn} onClick={() => openGlossary()}>
          Mots
        </button>
        <button type="button" className={styles.ghostBtn} onClick={onRestart}>
          Recommencer
        </button>
        <button
          type="button"
          className={styles.recenter}
          onClick={() => void onRecenter()}
          disabled={!cameraApi || recentering}
        >
          Recentrer
        </button>
      </header>

      <div ref={bottomBarRef} className={styles.bottomBar}>
        {hasSceneControls ? (
          <div className={styles.mobilePanelNav} role="group" aria-label="Panneau de mission">
            <button
              type="button"
              aria-pressed={mobilePanel === 'mission'}
              onClick={() => selectMobilePanel('mission')}
            >
              Consigne {challengeSolved ? '✓' : ''}
            </button>
            <button
              type="button"
              aria-pressed={mobilePanel === 'controls'}
              onClick={() => selectMobilePanel('controls')}
            >
              Commandes
            </button>
          </div>
        ) : null}
        <div id="mission-controls-root" className={styles.controlsSlot} />
        {mission.notToScaleNotice ? (
          <p className={styles.notice} role="note">
            {mission.notToScaleNotice}
          </p>
        ) : null}

        {resumeAvailable ? (
          <div className={styles.resumeBanner} role="status">
            <p className={styles.resumeText}>Tu reprends là où tu t&apos;étais arrêté.</p>
            <button type="button" className={styles.resumeDismiss} onClick={dismissResumeBanner}>
              OK
            </button>
          </div>
        ) : null}

        {step.kind === 'reward' && reward ? (
          <div ref={tipCardRef} className={styles.tipCard}>
            <RewardPanel title={reward.title} description={reward.description} celebrate />
            <button type="button" className={styles.cta} onClick={onContinue}>
              {step.ctaLabel ?? 'Continuer'}
            </button>
          </div>
        ) : (
          <div
            ref={tipCardRef}
            className={styles.tipCard}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            <div className={styles.tipHeader}>
              <Companion pose={companionCue.pose} size="sm" priority variant={companionVariant} />
              <button
                type="button"
                className={styles.tipToggle}
                aria-expanded={tipOpen}
                onClick={() => setTipOpen((open) => !open)}
              >
                {step.title} {tipOpen ? '▾' : '▸'}
              </button>
            </div>
            {companionCue.line && companionFeedback === 'none' && !challengeSolved ? (
              <p className={styles.companionLine}>{companionCue.line}</p>
            ) : null}
            {tipOpen ? (
              <>
                {step.id !== 'm05-scale' && step.id !== 'm05-distances' ? (
                  <p className={styles.tipBody}>
                    <RichMissionText
                      text={step.body}
                      entries={glossaryEntries}
                      onOpenTerm={(id) => openGlossary(id)}
                    />
                  </p>
                ) : null}
                {challengeActive ? <p className={styles.hint}>{challengeHint}</p> : null}
                {step.kind === 'quiz' && quiz ? (
                  <MissionQuiz
                    quiz={quiz}
                    onSolved={markChallengeSolved}
                    onMoodChange={setQuizMood}
                    compact={isSolarSystem || isOrbits || isSeasons}
                  />
                ) : null}
                {step.id === 'm05-scale' ? (
                  <SolarSizeChallenge
                    onChange={(group, hidden) => {
                      if (group) solarApi?.setComparisonGroup(group);
                      solarApi?.setHideComparison(hidden);
                    }}
                    onComplete={onSizeChallengeSuccess}
                  />
                ) : null}
                {step.id === 'm05-distances' ? (
                  <SolarDistancePanel
                    onComplete={onDistanceChallengeSuccess}
                    schemaPortalId="mission-schema-root"
                  />
                ) : null}
                {visibleFeedback ? (
                  <p className={visibleFeedback.wrong ? styles.hint : styles.success} role="status">
                    {visibleFeedback.text}
                  </p>
                ) : null}
                {canAdvance &&
                !isComplete &&
                step.kind !== 'quiz' &&
                step.id !== 'm05-scale' &&
                step.id !== 'm05-distances' ? (
                  <button type="button" className={styles.cta} onClick={onContinue}>
                    {step.ctaLabel ?? 'Continuer'}
                  </button>
                ) : null}
                {canAdvance &&
                !isComplete &&
                (step.kind === 'quiz' || step.id === 'm05-scale' || step.id === 'm05-distances') &&
                challengeSolved ? (
                  <button type="button" className={styles.cta} onClick={onContinue}>
                    Continuer
                  </button>
                ) : null}
                {isComplete ? (
                  <>
                    {nextMission ? (
                      <Link
                        href={`/mission/${nextMission.id}`}
                        replace
                        className={styles.cta}
                      >
                        Mission suivante : {nextMission.title}
                      </Link>
                    ) : (
                      <Link href="/missions" className={styles.cta}>
                        Retour à la carte
                      </Link>
                    )}
                    <button type="button" className={styles.ghostBtnWide} onClick={onRestart}>
                      Rejouer la mission
                    </button>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        )}
      </div>

      <GlossaryPanel
        open={glossaryOpen}
        entries={glossaryEntries}
        focusId={glossaryFocusId}
        earnedRewardIds={earnedRewardIds}
        onClose={closeGlossary}
      />
    </div>
  );
}
