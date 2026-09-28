/**
 * Sert le dossier `out/` à la racine (build local sans basePath Pages).
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out');
const port = Number(process.env.PORT || 3000);

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
  console.error('Dossier out/ introuvable. Lance d’abord : npm run build (ou build:pages)');
  process.exit(1);
}

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let rel = decoded.replace(/^\/+/, '');
  let filePath = path.join(outDir, rel);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!path.extname(filePath) && existsSync(`${filePath}.html`)) {
    filePath = `${filePath}.html`;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    const fallback = path.join(outDir, '404.html');
    return existsSync(fallback) ? fallback : null;
  }
  return filePath;
}

createServer((req, res) => {
  const filePath = resolveFile(req.url || '/');
  if (!filePath) {
    res.writeHead(404).end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const status = filePath.endsWith(`${path.sep}404.html`) ? 404 : 200;
  res.writeHead(status, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
}).listen(port, '127.0.0.1', () => {
  console.log(`Accepting connections at http://127.0.0.1:${port}/`);
});
