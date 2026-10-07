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
import { usePathname } from 'next/navigation';
import { musicController, type MusicMode } from '@/features/audio/musicPlayer';
import { unlockGameAudio } from '@/features/audio/unlockGameAudio';

type MusicContextValue = {
  muted: boolean;
  volume: number;
  mode: MusicMode;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

function modeFromPath(pathname: string): MusicMode {
  if (pathname.startsWith('/mission/')) return 'game';
  return 'menu';
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const mode = modeFromPath(pathname);
  const [muted, setMutedState] = useState(() => musicController.isMuted());
  const [volume, setVolumeState] = useState(() => musicController.getVolume());

  // Débloque musique + voix au premier geste (autoplay navigateur).
  useEffect(() => {
    const unlock = () => unlockGameAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Lecteur externe uniquement — le mode React est dérivé du pathname.
  useEffect(() => {
    musicController.setMode(mode, { reshuffle: mode === 'game' });
  }, [mode]);

  const setMuted = useCallback((value: boolean) => {
    musicController.setMuted(value);
    setMutedState(value);
  }, []);

  const setVolume = useCallback((value: number) => {
    musicController.setVolume(value);
    setVolumeState(value);
  }, []);

  const value = useMemo(
    () => ({ muted, volume, mode, setMuted, setVolume }),
    [muted, volume, mode, setMuted, setVolume],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error('useMusic doit être utilisé dans MusicProvider');
  }
  return ctx;
}
