'use client';

import type { ReactNode } from 'react';
import { MusicProvider } from '@/features/audio/MusicProvider';

/** Providers client (musique, etc.) montés depuis le layout racine. */
export function AppProviders({ children }: { children: ReactNode }) {
  return <MusicProvider>{children}</MusicProvider>;
}
