import type { Metadata, Viewport } from 'next';
import { Nunito, Space_Grotesk } from 'next/font/google';
import { AppProviders } from '@/components/layout/AppProviders';
import { withBasePath } from '@/lib/basePath';
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
  applicationName: 'Mission Cosmos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mission Cosmos',
  },
  icons: {
    icon: [
      {
        url: withBasePath('/assets/icons/icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: withBasePath('/assets/icons/icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: withBasePath('/assets/icons/apple-touch-icon.png'),
        sizes: '180x180',
        type: 'image/png',
      },
    ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
