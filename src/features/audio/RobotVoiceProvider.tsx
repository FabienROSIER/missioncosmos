'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { musicController } from '@/features/audio/musicPlayer';
import { robotVoiceController } from '@/features/audio/robotVoicePlayer';
import { unlockGameAudio } from '@/features/audio/unlockGameAudio';

type RobotVoiceContextValue = {
  enabled: boolean;
  playing: boolean;
  setEnabled: (enabled: boolean) => void;
  play: (messageId: string) => void;
  replay: (messageId?: string) => void;
  stop: () => void;
};

const RobotVoiceContext = createContext<RobotVoiceContextValue | null>(null);

export function RobotVoiceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => robotVoiceController.isEnabled());
  const [playing, setPlaying] = useState(() => robotVoiceController.isPlaying());

  useEffect(() => {
    // Si la musique est déjà débloquée (geste sur la carte), aligner la voix tout de suite.
    robotVoiceController.syncUnlockFromMusic();
    if (musicController.isUnlocked()) {
      robotVoiceController.unlock();
      return;
    }
    const unlock = () => unlockGameAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    return robotVoiceController.subscribe(() => {
      setEnabledState(robotVoiceController.isEnabled());
      setPlaying(robotVoiceController.isPlaying());
    });
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    robotVoiceController.setEnabled(value);
    setEnabledState(value);
  }, []);

  const play = useCallback((messageId: string) => {
    robotVoiceController.play(messageId);
  }, []);

  const replay = useCallback((messageId?: string) => {
    robotVoiceController.replay(messageId);
  }, []);

  const stop = useCallback(() => {
    robotVoiceController.stop();
  }, []);

  const value = useMemo(
    () => ({ enabled, playing, setEnabled, play, replay, stop }),
    [enabled, playing, setEnabled, play, replay, stop],
  );

  return <RobotVoiceContext.Provider value={value}>{children}</RobotVoiceContext.Provider>;
}

export function useRobotVoice(): RobotVoiceContextValue {
  const ctx = useContext(RobotVoiceContext);
  if (!ctx) {
    throw new Error('useRobotVoice doit être utilisé dans RobotVoiceProvider');
  }
  return ctx;
}
