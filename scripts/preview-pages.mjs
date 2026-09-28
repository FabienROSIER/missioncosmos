/**
 * Sert `.pages-preview/` (sous-chemin /missioncosmos) sans dépendance npm.
 * Usage : après `npm run build:pages`, puis `node scripts/preview-pages.mjs`
 */
import { createServer } from 'node:http';
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out');
const serveRoot = path.join(root, '.pages-preview');
const siteDir = path.join(serveRoot, 'missioncosmos');
const port = Number(process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

if (!existsSync(outDir)) {
  console.error('Dossier out/ introuvable. Lance d’abord : npm run build:pages');
  process.exit(1);
}

rmSync(serveRoot, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });
cpSync(outDir, siteDir, { recursive: true });

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let rel = decoded.replace(/^\/+/, '');
  let filePath = path.join(serveRoot, rel);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!path.extname(filePath) && existsSync(`${filePath}.html`)) {
    filePath = `${filePath}.html`;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    const fallback = path.join(serveRoot, 'missioncosmos', '404.html');
    return existsSync(fallback) ? fallback : null;
  }
  return filePath;
}

const server = createServer((req, res) => {
  const filePath = resolveFile(req.url || '/');
  if (!filePath) {
    res.writeHead(404).end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const status = filePath.endsWith(`${path.sep}404.html`) ? 404 : 200;
  res.writeHead(status, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Accepting connections at http://127.0.0.1:${port}/missioncosmos/`);
});
