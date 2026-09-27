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
  const [muted, setMutedState] = useState(() => musicController.isMuted());
  const [volume, setVolumeState] = useState(() => musicController.getVolume());
  const [mode, setModeState] = useState<MusicMode>('menu');

  // Débloque l’audio au premier geste (autoplay navigateur).
  useEffect(() => {
    const unlock = () => musicController.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const next = modeFromPath(pathname);
    // Chaque entrée / changement de mission : nouvelle file shuffle.
    musicController.setMode(next, { reshuffle: next === 'game' });
    setModeState(next);
  }, [pathname]);

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
