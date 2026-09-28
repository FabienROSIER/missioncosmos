'use client';

import type { ReactNode } from 'react';
import { MusicProvider } from '@/features/audio/MusicProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

/** Providers client (musique, PWA, etc.) montés depuis le layout racine. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MusicProvider>
      <ServiceWorkerRegister />
      {children}
      <InstallPrompt />
    </MusicProvider>
  );
}
