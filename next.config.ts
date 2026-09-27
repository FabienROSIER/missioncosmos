import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Babylon.js est consommé côté client uniquement (Phase 3).
  transpilePackages: ['@babylonjs/core', '@babylonjs/loaders'],
};

export default nextConfig;
