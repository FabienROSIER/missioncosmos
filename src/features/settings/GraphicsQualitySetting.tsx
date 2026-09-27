'use client';

import { useSyncExternalStore } from 'react';
import {
  getStoredGraphicsQuality,
  setStoredGraphicsQuality,
  type GraphicsQualityLevel,
} from '@/3d/materials/graphicsQuality';
import styles from './GraphicsQualitySetting.module.css';

const OPTIONS: { value: GraphicsQualityLevel; label: string; help: string }[] = [
  { value: 'auto', label: 'Auto', help: 'Choisit selon l’appareil' },
  { value: 'low', label: 'Basse', help: 'Plus fluide sur mobile' },
  { value: 'high', label: 'Élevée', help: 'Meilleur rendu' },
];

const STORAGE_EVENT = 'mc:graphics-quality-change';

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => onStoreChange();
  window.addEventListener(STORAGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function getSnapshot(): GraphicsQualityLevel {
  return getStoredGraphicsQuality();
}

function getServerSnapshot(): GraphicsQualityLevel {
  return 'auto';
}

/** Réglage qualité 3D (appliqué au prochain chargement de mission). */
export function GraphicsQualitySetting() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>Qualité graphique</legend>
      <p className={styles.help}>Pris en compte au prochain lancement d&apos;une mission.</p>
      <div className={styles.row} role="radiogroup" aria-label="Qualité graphique">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.option} ${value === option.value ? styles.active : ''}`}
            aria-pressed={value === option.value}
            onClick={() => {
              setStoredGraphicsQuality(option.value);
              window.dispatchEvent(new Event(STORAGE_EVENT));
            }}
          >
            <span className={styles.optionLabel}>{option.label}</span>
            <span className={styles.optionHelp}>{option.help}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
