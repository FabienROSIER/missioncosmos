import type { NextConfig } from 'next';

/**
 * GitHub Pages project site : https://<user>.github.io/<repo>/
 * Repo : FabienROSIER/missioncosmos → basePath `/missioncosmos`.
 * Local / preview sans sous-chemin : laisser NEXT_PUBLIC_BASE_PATH vide.
 */
const REPO_NAME = 'missioncosmos';

function resolveBasePath(): string {
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined) {
    return process.env.NEXT_PUBLIC_BASE_PATH.replace(/\/$/, '');
  }
  if (process.env.GITHUB_PAGES === 'true') {
    return `/${REPO_NAME}`;
  }
  return '';
}

const basePath = resolveBasePath();

/**
 * Identifiant embarqué dans le client (sw.js?v=…).
 * build-production.ps1 en fournit un. Sans valeur, un horodatage local
 * évite de retomber sur 0.1.0 et de figer le Service Worker.
 */
function resolveBuildId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BUILD_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'dev';
  }
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

const buildId = resolveBuildId();

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages sert mieux des dossiers …/index.html
  trailingSlash: true,
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  // Pas d’optimiseur d’images Node sur hébergement statique
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
  // Expose le même préfixe au client (Babylon, audio, Image, SW)
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  // Babylon.js est consommé côté client uniquement (Phase 3).
  transpilePackages: ['@babylonjs/core', '@babylonjs/loaders'],
};

export default nextConfig;
