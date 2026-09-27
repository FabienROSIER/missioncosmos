'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcRotateCamera, Vector3, type Camera, type Scene } from '@babylonjs/core';
import type { BabylonSceneContext } from '@/3d/core/BabylonCanvas';
import { BabylonCanvas } from '@/3d/core/BabylonCanvas';
import type { MissionCameraApi } from '@/3d/controls/missionCamera';
import { setupPlanetMissionCamera } from '@/3d/controls/missionCamera';
import { CelestialBodyEntity } from '@/3d/entities/CelestialBodyEntity';
import { CelestialLabel } from '@/3d/entities/CelestialLabel';
import {
  applyPlanetaryMaterials,
  createSimpleAtmosphere,
  resolveGraphicsQuality,
  setupSceneLighting,
} from '@/3d/materials';
import { MISSION_SUN_DIRECTION } from '@/3d/materials/sceneLighting';
import {
  applyScenePerformancePriority,
  optimizeCelestialMeshes,
  startPerfMonitor,
} from '@/3d/performance';
import {
  createEarthMarkers,
  type EarthMarkerId,
  type EarthMarkersHandle,
} from '@/3d/scenes/earthMarkers';
import { createSpaceBackground } from '@/3d/utils/imageSpaceBackground';
import { EARTH_BODY } from '@/content/bodies/catalog';
import { MISSION_STARFIELD_SRC } from '@/lib/assets/paths';
import { logger } from '@/lib/logger';
import styles from './EarthPreviewScene.module.css';

export type { EarthMarkerId };

export type EarthSceneApi = {
  camera: MissionCameraApi;
  setMarkersVisible: (visible: boolean) => void;
  setMarkerHighlight: (id: EarthMarkerId | null) => void;
  setChallengePickEnabled: (enabled: boolean) => void;
};

type EarthPreviewSceneProps = {
  className?: string;
  fill?: boolean;
  onSceneApi?: (api: EarthSceneApi) => void;
  onMarkerPick?: (id: EarthMarkerId) => void;
  /** Affiche les repères pôles/équateur dès le départ. */
  markersVisible?: boolean;
};

type LabelState = {
  scene: Scene;
  camera: Camera;
  position: Vector3;
  text: string;
  visible: boolean;
};

/** Scène Mission 01 — Terre + marqueurs pédagogiques. */
export function EarthPreviewScene({
  className,
  fill = false,
  onSceneApi,
  onMarkerPick,
  markersVisible = false,
}: EarthPreviewSceneProps) {
  const [label, setLabel] = useState<LabelState | null>(null);
  const markersRef = useRef<EarthMarkersHandle | null>(null);
  const onMarkerPickRef = useRef(onMarkerPick);
  const onSceneApiRef = useRef(onSceneApi);
  const markersVisibleRef = useRef(markersVisible);

  useEffect(() => {
    onMarkerPickRef.current = onMarkerPick;
  }, [onMarkerPick]);

  useEffect(() => {
    onSceneApiRef.current = onSceneApi;
  }, [onSceneApi]);

  useEffect(() => {
    markersVisibleRef.current = markersVisible;
    markersRef.current?.setVisible(markersVisible);
  }, [markersVisible]);

  const onSceneReady = useCallback(async ({ engine, scene }: BabylonSceneContext) => {
    const quality = resolveGraphicsQuality();
    const dprCap = quality === 'low' ? 1.5 : 2;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, dprCap) : 1;
    engine.setHardwareScalingLevel(1 / dpr);
    applyScenePerformancePriority(scene, quality);

    const lighting = setupSceneLighting(scene, quality);
    const background = createSpaceBackground(scene, MISSION_STARFIELD_SRC, {
      level: quality === 'low' ? 0.7 : 0.8,
      segments: quality === 'low' ? 24 : 48,
    });

    const earth = await CelestialBodyEntity.create(scene, {
      definition: EARTH_BODY,
      spin: true,
    });
    applyPlanetaryMaterials(scene, earth.meshes, quality);
    optimizeCelestialMeshes(earth.meshes, quality, 'planet');

    const atmosphere = createSimpleAtmosphere(scene, earth.pivot, {
      quality,
      scale: 1.04,
    });

    const markers = createEarthMarkers(
      scene,
      earth.pivot,
      EARTH_BODY.visual.visualRadius,
      earth.meshes,
    );
    markers.setVisible(markersVisibleRef.current);
    markersRef.current = markers;
    const markerObs = markers.onPick.add((id) => {
      onMarkerPickRef.current?.(id);
    });

    // Appear après démarrage de la render loop (BabylonCanvas) — safe à await.
    await earth.playAppear();

    const camera = scene.activeCamera;
    if (camera instanceof ArcRotateCamera) {
      const cameraApi = setupPlanetMissionCamera(camera, earth.pivot, earth.meshes, {
        margin: 1.55,
        startFactor: 2.8,
        sunDirection: MISSION_SUN_DIRECTION,
      });
      camera.upperRadiusLimit = Math.min(camera.upperRadiusLimit ?? 20, 50);
      onSceneApiRef.current?.({
        camera: cameraApi,
        setMarkersVisible: (visible) => markers.setVisible(visible),
        setMarkerHighlight: (id) => markers.setHighlight(id),
        setChallengePickEnabled: (enabled) => {
          markers.setSurfacePickEnabled(enabled);
        },
      });
    }

    const showLabel = (visible: boolean) => {
      if (!(camera instanceof ArcRotateCamera)) return;
      setLabel({
        scene,
        camera,
        position: earth.pivot.getAbsolutePosition().add(new Vector3(0, 1.15, 0)),
        text: EARTH_BODY.scientific.nameFr,
        visible,
      });
    };

    // Pas de HighlightLayer sur la Terre : garde la texture intacte
    earth.onPick.add(() => {
      showLabel(true);
    });

    showLabel(true);
    earth.setHighlighted(false);

    const perf = startPerfMonitor(scene, { label: 'mission-01-earth' });
    logger.info('Mission 01 rendu prêt', { quality, perf: perf.getSnapshot() });

    return () => {
      setLabel(null);
      markers.onPick.remove(markerObs);
      markers.dispose();
      markersRef.current = null;
      perf.dispose();
      atmosphere?.dispose();
      earth.dispose();
      background.dispose();
      lighting.dispose();
    };
  }, []);

  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      <BabylonCanvas
        className={styles.canvas}
        fill={fill}
        onSceneReady={onSceneReady}
        loadingMessage="Approche de la Terre…"
      />
      {label ? (
        <CelestialLabel
          scene={label.scene}
          camera={label.camera}
          worldPosition={label.position}
          text={label.text}
          visible={label.visible}
        />
      ) : null}
    </div>
  );
}
