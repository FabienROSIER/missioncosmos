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
  { value: 'auto', label: 'Auto', help: 'Choisit selon l’appareil' },
  { value: 'low', label: 'Basse', help: 'Plus fluide sur mobile' },
  { value: 'medium', label: 'Moyenne', help: 'Équilibrée pour mobile' },
  { value: 'high', label: 'Élevée', help: 'Meilleur rendu' },
];

const MOTION_HELP: Record<UiMotionLevel, string> = {
  none: 'Animations désactivées selon ta préférence système.',
  minimal: 'Retours au clic et fondus courts. Effets décoratifs et flous désactivés.',
  standard: 'Transitions douces et retours au clic. Effets décoratifs et flous désactivés.',
  full: 'Transitions douces, apparitions progressives et légère animation du guide.',
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
        Interface : effet immédiat. Rendu 3D : au prochain lancement d&apos;une mission.
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
