'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Companion } from '@/components/game/Companion';
import { SafeBackButton } from '@/components/layout/SafeBackButton';
import { SceneControlsTarget } from '@/components/layout/SceneControls';
import { RewardPanel } from '@/components/ui/RewardPanel';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
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
import type { StarsSceneApi } from '@/3d/scenes/StarsScene';
import { StarsScene } from '@/3d/scenes/StarsScene';
import type { StarLightSceneApi } from '@/3d/scenes/StarLightScene';
import { StarLightScene } from '@/3d/scenes/StarLightScene';
import { ConstellationsScene } from '@/3d/scenes/ConstellationsScene';
import { MilkyWayScene } from '@/3d/scenes/MilkyWayScene';
import { GalaxiesScene } from '@/3d/scenes/GalaxiesScene';
import { CosmicDistancesScene } from '@/3d/scenes/CosmicDistancesScene';
import { BlackHoleScene } from '@/3d/scenes/BlackHoleScene';
import { SolarDistancePanel } from '@/3d/scenes/SolarDistancePanel';
import { SolarSizeChallenge } from '@/3d/scenes/SolarSizeChallenge';
import type { SurfaceLighting } from '@/3d/scenes/dayNightMarkers';
import type { MoonPhaseId } from '@/3d/utils/moonPhase';
import type { StarsSceneMode } from '@/content/bodies/stars';
import type { StarLightSceneMode } from '@/content/bodies/stellarLight';
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
import { splitGuideText } from '@/features/missions/guideText';
import { isCelebratedChallenge } from '@/features/missions/challengeCelebration';
import { canInteractWithScene, isPlayGatedStep } from '@/features/missions/manipulationGate';
import { completeMission } from '@/features/progression/saveStore';
import { useLocalSave } from '@/features/progression/useLocalSave';
import type { Mission, MissionStep } from '@/types/mission';
import { getUiMotionSnapshot } from '@/lib/uiMotion';
import styles from './MissionImmersive.module.css';

type MissionImmersiveProps = {
  mission: Mission;
};

type ChallengeContext = {
  stepKind: MissionStep['kind'];
  stepId: string;
  challengeSolved: boolean;
  sceneInteractionAllowed: boolean;
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
  challengeObservatory: boolean;
  challengePrism: boolean;
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
    challengeObservatory: Boolean(step.challengeObservatory),
    challengePrism: Boolean(step.challengePrism),
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
  const isStars = mission.sceneId === 'stars';
  const isStellarLight = mission.sceneId === 'stellar-light';
  const isConstellations = mission.sceneId === 'constellations';
  const isMilkyWay = mission.sceneId === 'milky-way';
  const isGalaxies = mission.sceneId === 'galaxies';
  const isCosmicDistances = mission.sceneId === 'cosmic-distances';
  const isBlackHoles = mission.sceneId === 'black-holes';
  const [guideOverride, setGuideOverride] = useState<{
    stepId: string;
    expanded: boolean;
    challengeSolved: boolean;
  } | null>(null);
  const [guidePage, setGuidePage] = useState<{ stepId: string; index: number } | null>(null);
  const [playStartedStepId, setPlayStartedStepId] = useState<string | null>(null);
  const [guideLeaving, setGuideLeaving] = useState(false);
  const [controlsTarget, setControlsTarget] = useState<HTMLDivElement | null>(null);
  const continueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [earthApi, setEarthApi] = useState<EarthSceneApi | null>(null);
  const [dayNightApi, setDayNightApi] = useState<DayNightSceneApi | null>(null);
  const [moonPhasesApi, setMoonPhasesApi] = useState<MoonPhasesSceneApi | null>(null);
  const [eclipsesApi, setEclipsesApi] = useState<EclipsesSceneApi | null>(null);
  const [solarApi, setSolarApi] = useState<SolarSystemSceneApi | null>(null);
  const [orbitsApi, setOrbitsApi] = useState<OrbitsSceneApi | null>(null);
  const [orbitFallApi, setOrbitFallApi] = useState<OrbitFallSceneApi | null>(null);
  const [seasonsApi, setSeasonsApi] = useState<SeasonsSceneApi | null>(null);
  const [starFilmPlaying, setStarFilmPlaying] = useState(false);
  const [starsApi, setStarsApi] = useState<StarsSceneApi | null>(null);
  const [starLightApi, setStarLightApi] = useState<StarLightSceneApi | null>(null);
  const [recentering, setRecentering] = useState(false);
  const [feedback, setFeedback] = useState<StepFeedback | null>(null);
  const [sceneInstruction, setSceneInstruction] = useState<{
    stepId: string;
    text: string;
  } | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryFocusId, setGlossaryFocusId] = useState<string | null>(null);
  const [quizMood, setQuizMood] = useState<CompanionFeedbackMood>('none');
  const topBarRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const companionButtonRef = useRef<HTMLButtonElement>(null);
  const guideTitleRef = useRef<HTMLButtonElement>(null);
  const guidePanelRef = useRef<HTMLDivElement>(null);
  const quizPanelRef = useRef<HTMLElement>(null);
  const continueFocusRef = useRef(false);
  const completionSavedRef = useRef(false);

  const {
    step,
    stepIndex,
    challengeSolved,
    canAdvance,
    resumeAvailable,
    goNext,
    markChallengeSolved,
    resetChallengeSolved,
    restart,
    dismissResumeBanner,
    isComplete,
  } = useMissionSequence(mission);

  useEffect(() => {
    return () => {
      if (continueTimerRef.current !== null) clearTimeout(continueTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!headerMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setHeaderMenuOpen(false);
      menuToggleRef.current?.focus();
    };
    const onOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !topBarRef.current?.contains(event.target)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutsidePointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutsidePointer);
    };
  }, [headerMenuOpen]);

  useEffect(() => {
    bottomBarRef.current?.scrollTo({ top: 0 });
    if (continueFocusRef.current) {
      (step.kind === 'quiz'
        ? quizPanelRef.current
        : (guideTitleRef.current ?? guidePanelRef.current)
      )?.focus({ preventScroll: true });
      continueFocusRef.current = false;
    }
  }, [step.id, step.kind]);

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
    challengeObservatory,
    challengePrism,
    challengeOrbit,
    successFeedback,
    hint,
  } = challengeFromStep(step);
  const showOrbitFall = isOrbits && step.id === 'm06-fall';
  const hasSceneControls =
    mission.sceneId === 'earth-preview' ||
    isCosmicDistances ||
    isBlackHoles ||
    isGalaxies ||
    isMilkyWay ||
    (isConstellations && !['mc-intro', 'mc-reward', 'mc-understand'].includes(step.id)) ||
    isOrbits ||
    isSeasons ||
    isStars ||
    (isStellarLight && !['m09-intro', 'm09-explain', 'm09-reward'].includes(step.id)) ||
    (isSolarSystem && step.id !== 'm05-scale' && step.id !== 'm05-distances');
  const visibleFeedback = feedback?.stepId === step.id ? feedback : null;
  const celebratedChallenge = isCelebratedChallenge(step);
  const interactivePanel =
    step.kind === 'quiz' || step.id === 'm05-scale' || step.id === 'm05-distances';
  const guideCanFold = !interactivePanel && step.kind !== 'reward' && step.kind !== 'complete';
  const guideExpanded =
    !guideCanFold ||
    (guideOverride?.stepId === step.id && guideOverride.challengeSolved === challengeSolved
      ? guideOverride.expanded
      : true);
  const guideMessages = splitGuideText(step.body);
  const guideMessageIndex = guidePage?.stepId === step.id ? guidePage.index : 0;
  const hasMoreGuideText = !challengeSolved && guideMessageIndex < guideMessages.length - 1;
  const playGatedStep = isPlayGatedStep(step);
  const playStarted = playStartedStepId === step.id;
  const sceneInteractionAllowed = canInteractWithScene({
    step,
    guideExpanded,
    playStarted,
    challengeSolved,
  });
  const showPlayButton =
    guideExpanded && !hasMoreGuideText && guideCanFold && !challengeSolved && playGatedStep;
  const showSceneControls =
    hasSceneControls &&
    (sceneInteractionAllowed || (isConstellations && step.id === 'mc-film' && challengeSolved));
  const quiz = step.quizId ? getQuizById(step.quizId) : undefined;
  const glossaryEntries = getGlossaryEntries(mission.glossaryIds ?? []);
  const nextMissionId = getCatalogEntry(mission.id)?.unlocksNextId;
  const nextMission = nextMissionId ? getCatalogEntry(nextMissionId) : undefined;
  const reward = getRewardById(mission.rewardIds[0] ?? '');

  const cameraApi = isStellarLight
    ? starLightApi?.camera
    : isStars
      ? starsApi?.camera
      : isSeasons
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
    sceneInteractionAllowed,
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
      sceneInteractionAllowed,
      targetMarkerId,
      challengeOrbit,
      successFeedback,
      hint,
    };
  }, [
    step.kind,
    step.id,
    challengeSolved,
    sceneInteractionAllowed,
    targetMarkerId,
    challengeOrbit,
    successFeedback,
    hint,
  ]);

  useEffect(() => {
    if (
      !earthApi ||
      isDayNight ||
      isMoonPhases ||
      isEclipses ||
      isSolarSystem ||
      isOrbits ||
      isSeasons ||
      isStars ||
      isStellarLight
    )
      return;

    const orbitStepIndex = mission.steps.findIndex((s) => s.challengeOrbit);
    const earthOrbitView = orbitStepIndex >= 0 && stepIndex >= orbitStepIndex;

    earthApi.setOrbitViewEnabled(earthOrbitView);
    earthApi.setOrbitChallengeEnabled(sceneInteractionAllowed && challengeActive && challengeOrbit);
    earthApi.setMarkersVisible(showMarkers && !earthOrbitView);
    earthApi.setChallengePickEnabled(
      sceneInteractionAllowed && challengeActive && Boolean(targetMarkerId) && !earthOrbitView,
    );
    // Intro / manip : avance dès qu’on tourne assez le globe
    earthApi.setOrbitDetectEnabled(
      sceneInteractionAllowed &&
        !earthOrbitView &&
        (step.kind === 'intro' || step.kind === 'manipulate'),
    );

    if (earthOrbitView) {
      earthApi.setMarkerHighlight(null);
    } else if (challengeActive || (step.kind === 'challenge' && challengeSolved)) {
      earthApi.setMarkerHighlight(challengeSolved ? targetMarkerId ?? null : null);
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
    isStars,
    isStellarLight,
    mission.steps,
    stepIndex,
    showMarkers,
    challengeActive,
    challengeSolved,
    challengeOrbit,
    targetMarkerId,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!dayNightApi || !isDayNight) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    const playing = !cinematic && sceneInteractionAllowed;
    dayNightApi.setHouseVisible(showMarkers);
    dayNightApi.setCinematicMode(cinematic);
    dayNightApi.setEarthDragEnabled(playing);
    dayNightApi.setLightingChallenge(
      playing && challengeActive && targetLighting ? targetLighting : null,
    );
    dayNightApi.setSideChangeDiscovery(playing && challengeActive && step.id === 'm02-observe');
  }, [
    dayNightApi,
    isDayNight,
    showMarkers,
    challengeActive,
    targetLighting,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!moonPhasesApi || !isMoonPhases) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    const playing = !cinematic && sceneInteractionAllowed;
    moonPhasesApi.setCinematicMode(cinematic);
    moonPhasesApi.setMoonDragEnabled(playing && step.kind !== 'intro');
    moonPhasesApi.setPhaseChallenge(
      playing && challengeActive && targetPhase ? targetPhase : null,
    );
    moonPhasesApi.setPhaseChangeDiscovery(playing && challengeActive && step.id === 'm03-observe');
  }, [
    moonPhasesApi,
    isMoonPhases,
    challengeActive,
    targetPhase,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!eclipsesApi || !isEclipses) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    const playing = !cinematic && sceneInteractionAllowed;
    eclipsesApi.setCinematicMode(cinematic);
    eclipsesApi.setMoonDragEnabled(playing && step.kind !== 'intro');
    eclipsesApi.setEclipseChallenge(
      playing && challengeActive && targetEclipse ? targetEclipse : null,
    );
    eclipsesApi.setMoonMoveDiscovery(playing && challengeActive && step.id === 'm04-observe');
    // Orbite penchée à l’explication « pas chaque mois »
    eclipsesApi.setOrbitTilted(step.kind === 'explain' || step.id.includes('explain'));
  }, [
    eclipsesApi,
    isEclipses,
    challengeActive,
    targetEclipse,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!solarApi || !isSolarSystem) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';

    solarApi.setCinematicMode(cinematic);
    solarApi.setPickEnabled(!cinematic && sceneInteractionAllowed && step.kind !== 'intro');
    solarApi.setOrderChallenge(
      !cinematic && sceneInteractionAllowed && challengeActive && challengePlanetOrder,
    );
    if (step.id === 'm05-scale') {
      solarApi.setScaleMode('sizes');
      solarApi.focusBody(null);
    } else if (step.id === 'm05-distances') {
      solarApi.setScaleMode('distances');
    } else {
      solarApi.setScaleMode('readable');
    }
  }, [
    solarApi,
    isSolarSystem,
    challengeActive,
    challengePlanetOrder,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!orbitsApi || !isOrbits || showOrbitFall) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';
    orbitsApi.setPickEnabled(!cinematic && sceneInteractionAllowed && step.kind !== 'intro');
    orbitsApi.setInfoEnabled(step.id === 'm06-observe' || step.id === 'm06-challenge');
    orbitsApi.setRaceChallenge(
      !cinematic && sceneInteractionAllowed && challengeActive && challengeOrbitRace,
    );
    if (
      (sceneInteractionAllowed && challengeActive && challengeOrbitRace) ||
      step.kind === 'intro'
    ) {
      orbitsApi.setSpeed(1);
    }
  }, [
    orbitsApi,
    isOrbits,
    showOrbitFall,
    challengeActive,
    challengeOrbitRace,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!seasonsApi || !isSeasons) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';
    seasonsApi.setOrbitDragEnabled(!cinematic && sceneInteractionAllowed && step.kind !== 'intro');
    // Conserver le cadrage global après la réussite, jusqu’au clic sur « Continuer ».
    // Sinon la caméra revenait immédiatement à son ancienne vue et recoupait l’orbite.
    const northernSummerStep =
      !cinematic && sceneInteractionAllowed && step.kind === 'challenge' && challengeNorthernSummer;
    seasonsApi.setChallengeEnabled(northernSummerStep);
    if (step.id === 'm07-observe' || step.id === 'm07-challenge') {
      seasonsApi.setTiltDeg(23.5);
    }
  }, [
    seasonsApi,
    isSeasons,
    challengeActive,
    challengeNorthernSummer,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!starsApi || !isStars) return;
    const cinematic = step.kind === 'quiz' || step.kind === 'reward' || step.kind === 'complete';
    starsApi.setPickEnabled(!cinematic && sceneInteractionAllowed && step.kind !== 'intro');
    const observatoryStep =
      !cinematic && sceneInteractionAllowed && step.kind === 'challenge' && challengeObservatory;
    starsApi.setChallengeEnabled(observatoryStep);

    if (step.id === 'm08-observe') {
      starsApi.setDiscovery(!cinematic && sceneInteractionAllowed && challengeActive);
      return;
    }
    starsApi.setDiscovery(false);
    let mode: StarsSceneMode = 'explore';
    if (step.id === 'm08-intro') mode = 'sun';
    else if (step.id === 'm08-challenge') mode = 'challenge';
    if (!observatoryStep) starsApi.setMode(mode);
  }, [
    starsApi,
    isStars,
    challengeActive,
    challengeObservatory,
    sceneInteractionAllowed,
    step.kind,
    step.id,
  ]);

  useEffect(() => {
    if (!starLightApi || !isStellarLight) return;
    if (step.id === 'm09-spectrum') {
      if (sceneInteractionAllowed && challengeActive) {
        starLightApi.setDiscovery(true);
      } else {
        starLightApi.setDiscovery(false);
        starLightApi.setMode('rainbow');
      }
      return;
    }
    starLightApi.setDiscovery(false);
    let mode: StarLightSceneMode = 'explore';
    if (step.id === 'm09-intro') mode = 'intro';
    else if (step.id === 'm09-color') mode = 'place';
    else if (step.id === 'm09-challenge') mode = 'challenge';
    else if (step.id === 'm09-explain' || step.id === 'm09-reward') mode = 'review';
    starLightApi.setMode(mode);
  }, [starLightApi, isStellarLight, step.id, sceneInteractionAllowed, challengeActive]);

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

  const onStarsApi = useCallback((api: StarsSceneApi) => {
    setStarsApi(api);
  }, []);

  const onStarLightApi = useCallback((api: StarLightSceneApi) => {
    setStarLightApi(api);
  }, []);

  const onMarkerPick = useCallback(
    (id: EarthMarkerId) => {
      const ctx = pickCtxRef.current;
      if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved)
        return;
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
    if (!sceneInteractionAllowed || (step.kind !== 'intro' && step.kind !== 'manipulate')) return;
    setFeedback(null);
    goNext();
  }, [sceneInteractionAllowed, step.kind, goNext]);

  const onOrbitChallengeSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (
      !ctx.sceneInteractionAllowed ||
      ctx.stepKind !== 'challenge' ||
      ctx.challengeSolved ||
      !ctx.challengeOrbit
    )
      return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onLightingSuccess = useCallback(
    (_lit: SurfaceLighting) => {
      void _lit;
      const ctx = pickCtxRef.current;
      if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved)
        return;
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
      if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved)
        return;
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
      if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved)
        return;
      setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
      markChallengeSolved();
      eclipsesApi?.setEclipseChallenge(null);
    },
    [markChallengeSolved, eclipsesApi],
  );

  const onOrderSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
    solarApi?.setOrderChallenge(false);
  }, [markChallengeSolved, solarApi]);

  const onSolarPlanetSelect = useCallback(
    (id: PlanetId | 'sun') => {
      const ctx = pickCtxRef.current;
      if (id === 'sun' || ctx.stepId !== 'm05-observe') return;
      if (!ctx.sceneInteractionAllowed || ctx.challengeSolved) return;
      setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
      markChallengeSolved();
    },
    [markChallengeSolved],
  );

  const onRaceSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
    orbitsApi?.setRaceChallenge(false);
  }, [markChallengeSolved, orbitsApi]);

  const onRaceMiss = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.hint, wrong: true });
  }, []);

  const onOrbitsExplore = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepId !== 'm06-observe' || !ctx.sceneInteractionAllowed || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onFallSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onSummerSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onSummerExit = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepId === 'm07-observe') return;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge') return;
    setFeedback((current) => (current?.stepId === ctx.stepId ? null : current));
    resetChallengeSolved();
  }, [resetChallengeSolved]);

  const seasonsExploreRef = useRef({ orbit: false, tilt: false, stepId: '' });
  const onSeasonsExplore = useCallback(
    (kind: 'orbit' | 'tilt') => {
      const ctx = pickCtxRef.current;
      if (ctx.stepId !== 'm07-observe' || !ctx.sceneInteractionAllowed || ctx.challengeSolved) return;
      const seen = seasonsExploreRef.current;
      if (seen.stepId !== ctx.stepId) {
        seen.stepId = ctx.stepId;
        seen.orbit = false;
        seen.tilt = false;
      }
      seen[kind] = true;
      if (!seen.orbit || !seen.tilt) return;
      setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
      markChallengeSolved();
    },
    [markChallengeSolved],
  );

  const onStarsDiscoveryDone = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepId !== 'm08-observe' || !ctx.sceneInteractionAllowed || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onObservatorySuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onObservatoryMiss = useCallback((hintText: string) => {
    const ctx = pickCtxRef.current;
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: hintText || ctx.hint, wrong: true });
  }, []);

  const onClearObservatoryFeedback = useCallback(() => {
    const stepId = pickCtxRef.current.stepId;
    setFeedback((current) => (current?.stepId === stepId ? null : current));
  }, []);

  const onSceneInstruction = useCallback((text: string) => {
    setSceneInstruction({
      stepId: pickCtxRef.current.stepId,
      text,
    });
  }, []);

  const onLightDiscoveryDone = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (ctx.stepId !== 'm09-spectrum' || !ctx.sceneInteractionAllowed || ctx.challengeSolved) return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onPrismSuccess = useCallback(() => {
    const ctx = pickCtxRef.current;
    if (
      !ctx.sceneInteractionAllowed ||
      !['m09-color', 'm09-challenge'].includes(ctx.stepId) ||
      ctx.challengeSolved
    )
      return;
    setFeedback({ stepId: ctx.stepId, text: ctx.successFeedback, wrong: false });
    markChallengeSolved();
  }, [markChallengeSolved]);

  const onPrismMiss = useCallback((hintText: string | null) => {
    const ctx = pickCtxRef.current;
    if (
      !ctx.sceneInteractionAllowed ||
      !['m09-color', 'm09-challenge'].includes(ctx.stepId) ||
      ctx.challengeSolved
    )
      return;
    if (hintText === null) {
      setFeedback(null);
      return;
    }
    setFeedback({ stepId: ctx.stepId, text: hintText || ctx.hint, wrong: true });
  }, []);

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
    if (!ctx.sceneInteractionAllowed || ctx.stepKind !== 'challenge' || ctx.challengeSolved) return;
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

  const toggleGuide = () => {
    if (!guideCanFold) return;
    setGuideOverride({ stepId: step.id, expanded: !guideExpanded, challengeSolved });
  };

  const onContinue = () => {
    if (!canAdvance || continueTimerRef.current !== null) return;
    const advance = () => {
      continueFocusRef.current = true;
      continueTimerRef.current = null;
      setGuideLeaving(false);
      setGuideOverride(null);
      setGuidePage(null);
      setPlayStartedStepId(null);
      setFeedback(null);
      setSceneInstruction(null);
      setQuizMood('none');
      goNext();
    };
    const duration = { none: 0, minimal: 80, standard: 120, full: 140 }[getUiMotionSnapshot()];
    if (!duration) {
      advance();
      return;
    }
    setGuideLeaving(true);
    continueTimerRef.current = setTimeout(advance, duration);
  };

  const onRestart = () => {
    if (continueTimerRef.current !== null) clearTimeout(continueTimerRef.current);
    continueTimerRef.current = null;
    setGuideLeaving(false);
    setGuideOverride(null);
    setGuidePage(null);
    setPlayStartedStepId(null);
    setFeedback(null);
    setSceneInstruction(null);
    setQuizMood('none');
    completionSavedRef.current = false;
    restart();
  };

  const companionFeedback: CompanionFeedbackMood = visibleFeedback
    ? visibleFeedback.wrong
      ? 'wrong'
      : celebratedChallenge
        ? 'success'
        : 'none'
    : step.kind === 'quiz'
      ? quizMood
      : 'none';

  const companionCue = resolveCompanionCue({
    stepKind: step.completionMode === 'discovery' ? 'observe' : step.kind,
    challengeSolved: challengeSolved && (celebratedChallenge || step.kind === 'quiz'),
    feedback: companionFeedback,
    isComplete,
    funFact: step.kind === 'explain' && mission.funFacts?.[0] ? mission.funFacts[0] : undefined,
  });

  const challengeHint = challengeOrbit
    ? 'Glisse à gauche ou à droite pour faire avancer la Terre sur l’anneau autour du Soleil.'
    : challengePrism
      ? (step.hint ?? 'Allume ou éteins les lumières, observe l’écran, puis valide ton mélange.')
      : challengeObservatory
        ? 'Cadre chaque étoile : si elle déborde, éloigne le télescope ; si elle paraît trop petite, rapproche-le.'
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
    <SceneControlsTarget.Provider value={controlsTarget}>
      <div
        className={[
          styles.stage,
          step.kind === 'quiz' ? styles.quizStage : '',
          starFilmPlaying ? styles.starFilmStage : '',
          guideLeaving ? styles.guideLeaving : '',
        ].join(' ')}
        data-guide-expanded={guideExpanded}
      >
        <div className={styles.sceneArea}>
          <div
            className={styles.sceneInteractionLayer}
            inert={!sceneInteractionAllowed}
            data-scene-interaction={sceneInteractionAllowed ? 'enabled' : 'locked'}
          >
            {isBlackHoles ? (
              <BlackHoleScene
                key={step.id}
                className={styles.viewport}
                stepId={step.id}
                onSuccess={onObservatorySuccess}
                onMiss={onObservatoryMiss}
                onClearFeedback={onClearObservatoryFeedback}
                onInstruction={onSceneInstruction}
              />
            ) : isCosmicDistances ? (
              <CosmicDistancesScene
                className={styles.viewport}
                stepId={step.id}
                onSuccess={onObservatorySuccess}
                onMiss={onObservatoryMiss}
                onClearFeedback={onClearObservatoryFeedback}
              />
            ) : isGalaxies ? (
              <GalaxiesScene
                className={styles.viewport}
                stepId={step.id}
                onSuccess={onObservatorySuccess}
                onMiss={onObservatoryMiss}
                onClearFeedback={onClearObservatoryFeedback}
              />
            ) : isMilkyWay ? (
              <MilkyWayScene
                className={styles.viewport}
                stepId={step.id}
                onSuccess={onObservatorySuccess}
                onMiss={onObservatoryMiss}
              />
            ) : isConstellations ? (
              <ConstellationsScene
                key={step.id}
                className={styles.viewport}
                stepId={step.id}
                onSuccess={onObservatorySuccess}
                onSkipBonus={onContinue}
                interactive={sceneInteractionAllowed}
              />
            ) : isStellarLight ? (
              <StarLightScene
                className={styles.viewport}
                fill
                onSceneApi={onStarLightApi}
                onPrismSuccess={onPrismSuccess}
                onPrismMiss={onPrismMiss}
                onDiscoveryDone={onLightDiscoveryDone}
              />
            ) : isStars ? (
              <StarsScene
                className={styles.viewport}
                fill
                onSceneApi={onStarsApi}
                onCinematicPlaying={setStarFilmPlaying}
                onObservatorySuccess={onObservatorySuccess}
                onObservatoryMiss={onObservatoryMiss}
                onDiscoveryDone={onStarsDiscoveryDone}
              />
            ) : isSeasons ? (
              <SeasonsScene
                className={styles.viewport}
                fill
                onSceneApi={onSeasonsApi}
                onSummerSuccess={onSummerSuccess}
                onSummerExit={onSummerExit}
                onExplore={onSeasonsExplore}
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
                onExplore={onOrbitsExplore}
              />
            ) : isSolarSystem ? (
              <SolarSystemScene
                className={styles.viewport}
                fill
                onSceneApi={onSolarApi}
                onOrderSuccess={onOrderSuccess}
                onOrderMiss={onOrderMiss}
                onPlanetSelect={onSolarPlanetSelect}
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
                stepId={step.id}
                interactionAllowed={sceneInteractionAllowed}
                challengeSolved={challengeSolved}
                className={styles.viewport}
                fill
                markersVisible={showMarkers}
                onSceneApi={onEarthApi}
                onMarkerPick={onMarkerPick}
                onSignificantOrbit={onSignificantOrbit}
                onOrbitChallengeSuccess={onOrbitChallengeSuccess}
              />
            )}
          </div>

          {/* Schéma 2D hors bulle (ex. défi distances) */}
          <div
            id="mission-schema-root"
            className={styles.schemaRoot}
            onPointerDown={(event) => event.stopPropagation()}
          />
          {challengeSolved && celebratedChallenge ? (
            <SuccessCelebration key={step.id} message={successFeedback} />
          ) : null}
        </div>

        <header ref={topBarRef} className={styles.topBar}>
          <SafeBackButton fallbackHref="/missions" label="Quitter" compact preferFallback />
          <h1 className={styles.title}>{mission.title}</h1>
          <button
            type="button"
            ref={menuToggleRef}
            className={styles.menuToggle}
            aria-label={
              headerMenuOpen
                ? 'Fermer les actions de la mission'
                : 'Ouvrir les actions de la mission'
            }
            aria-expanded={headerMenuOpen}
            aria-controls="mission-header-actions"
            onClick={() => setHeaderMenuOpen((open) => !open)}
          >
            {headerMenuOpen ? '×' : '☰'}
          </button>
          <div
            id="mission-header-actions"
            className={`${styles.topActions} ${headerMenuOpen ? styles.topActionsOpen : ''}`}
          >
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => {
                setHeaderMenuOpen(false);
                openGlossary();
              }}
            >
              Mots
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => {
                setHeaderMenuOpen(false);
                onRestart();
              }}
            >
              Recommencer
            </button>
            <button
              type="button"
              className={styles.recenter}
              onClick={() => {
                setHeaderMenuOpen(false);
                void onRecenter();
              }}
              disabled={!cameraApi || recentering}
            >
              Recentrer
            </button>
            {mission.notToScaleNotice ? (
              <details className={styles.sceneNotice}>
                <summary>La maquette</summary>
                <p role="note">{mission.notToScaleNotice}</p>
              </details>
            ) : null}
          </div>
        </header>

        {step.kind === 'quiz' && quiz ? (
          <section
            ref={quizPanelRef}
            tabIndex={-1}
            aria-label={quiz.title}
            className={styles.quizArea}
            data-mission-quiz
          >
            <MissionQuiz
              key={step.id}
              quiz={quiz}
              onSolved={markChallengeSolved}
              onMoodChange={setQuizMood}
              immersive
              companionVariant={companionVariant}
              onContinue={onContinue}
            />
          </section>
        ) : null}
        <div
          ref={bottomBarRef}
          className={styles.bottomBar}
          hidden={step.kind === 'quiz'}
          inert={step.kind === 'quiz'}
        >
          {resumeAvailable ? (
            <div className={styles.resumeBanner} role="status">
              <p className={styles.resumeText}>Tu reprends là où tu t&apos;étais arrêté.</p>
              <button type="button" className={styles.resumeDismiss} onClick={dismissResumeBanner}>
                OK
              </button>
            </div>
          ) : null}

          <div
            className={styles.guideRow}
            data-interactive={
              step.kind === 'quiz' || step.id === 'm05-scale' || step.id === 'm05-distances'
            }
            inert={guideLeaving || starFilmPlaying}
          >
            <button
              ref={companionButtonRef}
              type="button"
              className={styles.companionButton}
              data-motion="stationary"
              disabled={!guideCanFold}
              aria-label={
                !guideCanFold
                  ? 'Compagnon guide'
                  : guideExpanded
                    ? 'Réduire la consigne'
                    : 'Relire la consigne'
              }
              aria-expanded={guideExpanded}
              aria-controls={guideCanFold ? 'mission-guide-details' : undefined}
              onClick={toggleGuide}
            >
              <Companion
                pose={companionCue.pose}
                size="md"
                priority
                variant={companionVariant}
                className={styles.tipCompanion}
              />
              <span>{guideCanFold ? (guideExpanded ? 'Réduire' : 'Relire') : 'Guide'}</span>
            </button>
            {step.kind === 'reward' && reward ? (
              <div
                key={step.id}
                ref={guidePanelRef}
                tabIndex={-1}
                role="region"
                aria-label={step.title}
                className={styles.tipCard}
              >
                <RewardPanel title={reward.title} description={reward.description} celebrate />
                <button type="button" className={styles.cta} onClick={onContinue}>
                  {step.ctaLabel ?? 'Continuer'}
                </button>
              </div>
            ) : (
              <div
                key={step.id}
                ref={guidePanelRef}
                tabIndex={-1}
                role="region"
                aria-label={`Consigne : ${step.title}`}
                className={styles.tipCard}
                onPointerDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
              >
                <div className={styles.tipHeader}>
                  {guideCanFold ? (
                    <button
                      ref={guideTitleRef}
                      type="button"
                      className={styles.tipToggle}
                      data-motion="stationary"
                      aria-expanded={guideExpanded}
                      aria-controls="mission-guide-details"
                      onClick={toggleGuide}
                    >
                      <span>
                        {guideExpanded
                          ? step.title
                          : (sceneInstruction?.stepId === step.id
                              ? sceneInstruction.text
                              : (step.guideReminder ??
                                (challengeActive ? challengeHint : step.title)))}
                      </span>
                      <span className={styles.toggleLabel}>{guideExpanded ? '−' : '+'}</span>
                    </button>
                  ) : (
                    <h2 className={styles.tipTitle}>{step.title}</h2>
                  )}
                </div>
                <div
                  id="mission-guide-details"
                  className={styles.guideDetails}
                  hidden={!guideExpanded}
                  inert={!guideExpanded}
                >
                  {step.id !== 'm05-scale' &&
                  step.id !== 'm05-distances' &&
                  !(step.kind === 'challenge' && challengeSolved) ? (
                    <p
                      key={`${step.id}-${guideMessageIndex}`}
                      className={styles.tipBody}
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <RichMissionText
                        text={guideMessages[guideMessageIndex] ?? step.body}
                        entries={glossaryEntries}
                        onOpenTerm={(id) => openGlossary(id)}
                      />
                    </p>
                  ) : null}
                  {guideMessages.length > 1 && !challengeSolved ? (
                    <div className={styles.messageNav}>
                      <button
                        type="button"
                        className={styles.readBack}
                        disabled={guideMessageIndex === 0}
                        onClick={() =>
                          setGuidePage({ stepId: step.id, index: guideMessageIndex - 1 })
                        }
                      >
                        ← Précédent
                      </button>
                      <span>
                        Message {guideMessageIndex + 1}/{guideMessages.length}
                      </span>
                    </div>
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
                </div>
                {visibleFeedback ? (
                  <p
                    key={visibleFeedback.text}
                    className={
                      visibleFeedback.wrong
                        ? styles.hint
                        : celebratedChallenge
                          ? styles.success
                          : styles.tipBody
                    }
                    role="status"
                  >
                    {visibleFeedback.text}
                  </p>
                ) : null}
                {hasMoreGuideText ? (
                  <button
                    type="button"
                    className={styles.cta}
                    onClick={() => {
                      setGuidePage({ stepId: step.id, index: guideMessageIndex + 1 });
                      setGuideOverride({ stepId: step.id, expanded: true, challengeSolved });
                    }}
                  >
                    Suivant →
                  </button>
                ) : showPlayButton ? (
                  <button
                    type="button"
                    className={styles.cta}
                    onClick={() => {
                      setPlayStartedStepId(step.id);
                      setGuideOverride({
                        stepId: step.id,
                        expanded: false,
                        challengeSolved,
                      });
                      companionButtonRef.current?.focus({ preventScroll: true });
                    }}
                  >
                    {playStarted
                      ? 'Reprendre'
                      : step.id === 'mc-film'
                        ? 'Lancer le voyage'
                        : 'À toi de jouer'}
                  </button>
                ) : null}
                {!hasMoreGuideText &&
                !showPlayButton &&
                canAdvance &&
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
                      <Link href={`/mission/${nextMission.id}`} replace className={styles.cta}>
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
              </div>
            )}
          </div>
          <section
            className={styles.commandDock}
            aria-label="Commandes de la scène"
            hidden={!showSceneControls || starFilmPlaying}
            inert={!showSceneControls || starFilmPlaying || guideLeaving}
          >
            <div
              id="mission-controls-root"
              ref={setControlsTarget}
              className={styles.controlsSlot}
            />
          </section>
        </div>

        <GlossaryPanel
          open={glossaryOpen}
          entries={glossaryEntries}
          focusId={glossaryFocusId}
          earnedRewardIds={earnedRewardIds}
          onClose={closeGlossary}
        />
      </div>
    </SceneControlsTarget.Provider>
  );
}
