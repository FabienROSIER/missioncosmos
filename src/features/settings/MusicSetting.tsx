'use client';

import { useMusic } from '@/features/audio/MusicProvider';
import styles from './MusicSetting.module.css';

/** Mute / volume musique — paramètres. */
export function MusicSetting() {
  const { muted, volume, setMuted, setVolume } = useMusic();

  return (
    <div className={styles.block}>
      <h2 className={styles.heading}>Musique</h2>
      <p className={styles.copy}>
        Une ambiance pour les menus, d’autres pistes mélangées pendant les missions.
      </p>
      <label className={styles.row}>
        <input
          type="checkbox"
          checked={muted}
          onChange={(event) => setMuted(event.target.checked)}
        />
        Couper la musique
      </label>
      <label className={styles.volume}>
        Volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          disabled={muted}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volume de la musique"
        />
      </label>
    </div>
  );
}
