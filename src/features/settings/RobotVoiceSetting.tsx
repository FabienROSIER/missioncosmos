'use client';

import { useRobotVoice } from '@/features/audio/RobotVoiceProvider';
import styles from './MusicSetting.module.css';

/** Activation / coupure de la voix du robot — paramètres. */
export function RobotVoiceSetting() {
  const { enabled, setEnabled, stop } = useRobotVoice();

  return (
    <div className={styles.block}>
      <h2 className={styles.heading}>Voix du robot</h2>
      <p className={styles.copy}>
        Le Guide peut lire les consignes importantes à voix haute. Le jeu reste jouable sans son.
      </p>
      <label className={styles.row}>
        <input
          type="checkbox"
          checked={!enabled}
          onChange={(event) => {
            const muted = event.target.checked;
            setEnabled(!muted);
            if (muted) stop();
          }}
        />
        Couper la voix du robot
      </label>
    </div>
  );
}
