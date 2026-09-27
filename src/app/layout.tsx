import type { Metadata, Viewport } from 'next';
import { Nunito, Space_Grotesk } from 'next/font/google';
import { AppProviders } from '@/components/layout/AppProviders';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mission Cosmos',
  description: "Aventure éducative d'astronomie pour les 6–12 ans",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mission Cosmos',
  },
  formatDetection: {
    telephone: false,
  },
};

/** Viewport type jeu : pas de pinch-zoom navigateur (conflit avec gestes 3D). */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0B1220',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${nunito.variable}`}>
      <body>
        <div className="app-root">
          <AppProviders>{children}</AppProviders>
        </div>
      </body>
    </html>
  );
}
