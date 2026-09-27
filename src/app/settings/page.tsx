'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GraphicsQualitySetting } from '@/features/settings/GraphicsQualitySetting';
import { MusicSetting } from '@/features/settings/MusicSetting';
import {
  ParentalResetGate,
  createParentMathChallenge,
} from '@/features/progression/ParentalResetGate';
import { clearMissionSession } from '@/features/missions/missionSession';
import { resetAllProgress } from '@/features/progression/saveStore';
import { useLocalSave } from '@/features/progression/useLocalSave';
import styles from '../collection/screen.module.css';

export default function SettingsPage() {
  const { hasProfile, progressPercent } = useLocalSave();
  const [resetOpen, setResetOpen] = useState(false);
  const [math, setMath] = useState({ a: 3, b: 4 });

  return (
    <AppShell title="Paramètres" sky="starfield">
      <div className={styles.screen}>
        <div className={styles.fill}>
          <MusicSetting />
          <GraphicsQualitySetting />

          <div className={styles.block}>
            <h2 className={styles.heading}>Progression</h2>
            <p className={styles.copy}>
              {hasProfile
                ? `Progression actuelle : ${progressPercent}%.`
                : 'Aucun profil sur cet appareil.'}
            </p>
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => {
                setMath(createParentMathChallenge());
                setResetOpen(true);
              }}
            >
              Effacer profils et progression
            </button>
            <p className={styles.copy}>
              Protection parent : une petite question avant d&apos;effacer.
            </p>
          </div>
        </div>
      </div>

      <ParentalResetGate
        open={resetOpen}
        a={math.a}
        b={math.b}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetAllProgress();
          clearMissionSession();
        }}
      />
    </AppShell>
  );
}
