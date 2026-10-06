'use client';

import { useSyncExternalStore } from 'react';
import {
  getStoredGraphicsQuality,
  setStoredGraphicsQuality,
  subscribeGraphicsQuality,
  resolveGraphicsQuality,
  type GraphicsQualityLevel,
  type ResolvedGraphicsQuality,
} from '@/3d/materials/graphicsQuality';
import { getUiMotionSnapshot, subscribeUiMotion, type UiMotionLevel } from '@/lib/uiMotion';
import styles from './GraphicsQualitySetting.module.css';

const OPTIONS: { value: GraphicsQualityLevel; label: string; help: string }[] = [
  { value: 'auto', label: 'Auto', help: 'Le jeu choisit' },
  { value: 'low', label: 'Basse', help: 'Moins de détails, moins de ralentissements' },
  { value: 'medium', label: 'Moyenne', help: 'Détails et vitesse équilibrés' },
  { value: 'high', label: 'Élevée', help: 'Plus de détails' },
];

const MOTION_HELP: Record<UiMotionLevel, string> = {
  none: 'Animations arrêtées selon les réglages de ton appareil.',
  minimal: 'Les boutons réagissent. Peu d’animations, sans décor animé ni flou.',
  standard: 'Les images changent doucement, sans décor animé ni flou.',
  full: 'Les images apparaissent doucement. Le Guide bouge un peu.',
};

function getSnapshot(): GraphicsQualityLevel {
  return getStoredGraphicsQuality();
}

function getServerSnapshot(): GraphicsQualityLevel {
  return 'auto';
}

/** UI updates immediately; 3D rendering adopts the choice on the next mission load. */
export function GraphicsQualitySetting() {
  const value = useSyncExternalStore(subscribeGraphicsQuality, getSnapshot, getServerSnapshot);
  const motion = useSyncExternalStore<UiMotionLevel>(
    subscribeUiMotion,
    getUiMotionSnapshot,
    () => 'minimal',
  );
  const resolved = useSyncExternalStore<ResolvedGraphicsQuality>(
    subscribeUiMotion,
    resolveGraphicsQuality,
    () => 'low',
  );
  const resolvedLabel = OPTIONS.find((option) => option.value === resolved)?.label;

  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Qualité graphique</legend>
      <p className={styles.help}>
        Menus : tout de suite. Images 3D : à la prochaine mission.
      </p>
      <div className={styles.row} role="group" aria-label="Qualité graphique">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.option} ${value === option.value ? styles.active : ''}`}
            aria-pressed={value === option.value}
            onClick={() => {
              setStoredGraphicsQuality(option.value);
            }}
          >
            <span className={styles.optionLabel}>{option.label}</span>
            <span className={styles.optionHelp}>{option.help}</span>
          </button>
        ))}
      </div>
      <p className={styles.motionHelp} role="status">
        {value === 'auto' ? `Qualité automatique : ${resolvedLabel?.toLowerCase()}. ` : ''}
        {MOTION_HELP[motion]}
      </p>
    </fieldset>
  );
}
