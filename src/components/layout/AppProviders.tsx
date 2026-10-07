'use client';

import type { ReactNode } from 'react';
import { MusicProvider } from '@/features/audio/MusicProvider';
import { RobotVoiceProvider } from '@/features/audio/RobotVoiceProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { UiMotionPreferences } from '@/components/layout/UiMotionPreferences';

/** Providers client (musique, voix, PWA, etc.) montés depuis le layout racine. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MusicProvider>
      <RobotVoiceProvider>
        <UiMotionPreferences />
        <ServiceWorkerRegister />
        {children}
        <InstallPrompt />
      </RobotVoiceProvider>
    </MusicProvider>
  );
}
