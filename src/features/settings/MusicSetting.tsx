'use client';

import { useMusic } from '@/features/audio/MusicProvider';
import {
  GAME_MUSIC,
  MENU_MUSIC,
  MUSIC_CREDIT,
  MUSIC_LICENSE_URL,
} from '@/content/audio/musicCatalog';
import styles from './MusicSetting.module.css';

/** Mute / volume musique — paramètres. */
export function MusicSetting() {
  const { muted, volume, setMuted, setVolume } = useMusic();

  return (
    <div className={styles.block}>
      <h2 className={styles.heading}>Musique</h2>
      <p className={styles.copy}>Une musique dans les menus, plusieurs pendant les missions.</p>
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
      <details className={styles.credits}>
        <summary>Crédits des musiques</summary>
        <p>{MUSIC_CREDIT}</p>
        <ul>
          {[MENU_MUSIC, ...GAME_MUSIC].map((track) => (
            <li key={track.id}>
              <a href={track.sourceUrl} target="_blank" rel="noreferrer">
                {track.title}
              </a>
              {track.id === MENU_MUSIC.id ? ' — menus' : ' — missions'}
            </li>
          ))}
        </ul>
        <p>
          Sous licence{' '}
          <a href={MUSIC_LICENSE_URL} target="_blank" rel="noreferrer">
            Creative Commons Attribution 4.0 (CC BY 4.0)
          </a>
          . Fichiers originaux, sans modification.
        </p>
      </details>
    </div>
  );
}
