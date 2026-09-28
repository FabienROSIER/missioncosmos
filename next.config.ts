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
  },
  // Babylon.js est consommé côté client uniquement (Phase 3).
  transpilePackages: ['@babylonjs/core', '@babylonjs/loaders'],
};

export default nextConfig;
