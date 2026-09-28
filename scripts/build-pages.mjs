/**
 * Build d’export statique pour GitHub Pages (sous-chemin /missioncosmos).
 * Usage : node scripts/build-pages.mjs
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

process.env.GITHUB_PAGES = 'true';
process.env.NEXT_PUBLIC_BASE_PATH = '/missioncosmos';
process.env.NEXT_PUBLIC_BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ||
  process.env.GITHUB_SHA?.slice(0, 7) ||
  new Date().toISOString().slice(0, 10);

const result = spawnSync('npx', ['next', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
