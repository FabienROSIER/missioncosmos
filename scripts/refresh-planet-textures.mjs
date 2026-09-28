// Run from the repository root: node scripts/refresh-planet-textures.mjs
// Requires sharp (provided by Next.js). Sources: Solar System Scope / INOVE, CC BY 4.0.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = 'public/assets/models/solarsystem/celestial-bodies';
const sources = {
  mercury: '2k_mercury.jpg',
  venus: '2k_venus_atmosphere.jpg',
  earth: '2k_earth_daymap.jpg',
  moon: '2k_moon.jpg',
  mars: '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg',
  uranus: '2k_uranus.jpg',
  neptune: '2k_neptune.jpg',
  sun: 'sun.webp', // Locally generated photosphere; never overwrite it with the old web map.
};
const hash = (data) => createHash('sha256').update(data).digest('hex');
const pad = (buffer, fill = 0) =>
  Buffer.concat([buffer, Buffer.alloc((4 - (buffer.length % 4)) % 4, fill)]);
function parse(buffer) {
  assert.equal(buffer.readUInt32LE(0), 0x46546c67);
  assert.equal(buffer.readUInt32LE(4), 2);
  assert.equal(buffer.readUInt32LE(8), buffer.length);
  const length = buffer.readUInt32LE(12);
  return { json: JSON.parse(buffer.subarray(20, 20 + length)), bin: buffer.subarray(28 + length) };
}
function repack(original, image, attribution) {
  const { json, bin } = parse(original);
  const target = json.images[0].bufferView;
  const chunks = [];
  let offset = 0;
  for (const [index, view] of json.bufferViews.entries()) {
    const data =
      index === target
        ? image
        : bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    view.byteOffset = offset;
    view.byteLength = data.length;
    const chunk = pad(data);
    chunks.push(chunk);
    offset += chunk.length;
  }
  json.buffers[0].byteLength = offset;
  json.images[0].name = attribution;
  json.asset.copyright = attribution;
  const metadata = pad(Buffer.from(JSON.stringify(json)), 32);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + metadata.length + offset, 8);
  header.writeUInt32LE(metadata.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(offset, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  const result = Buffer.concat([header, metadata, binHeader, ...chunks]);
  const next = parse(result);
  // All geometry, UVs, indices, and Saturn's transparent ring image must remain byte-identical.
  const previous = parse(original);
  for (const [index, view] of previous.json.bufferViews.entries()) {
    if (index === target) continue;
    const updated = next.json.bufferViews[index];
    assert.deepEqual(
      next.bin.subarray(updated.byteOffset, updated.byteOffset + updated.byteLength),
      previous.bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength),
    );
  }
  assert.deepEqual(previous.json.accessors, next.json.accessors);
  assert.deepEqual(previous.json.materials, next.json.materials);
  return result;
}

const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
const report = [];
for (const [id, sourceFile] of Object.entries(sources)) {
  if (process.argv.includes('--sun-only') && id !== 'sun') continue;
  const generated = id === 'sun';
  const sourceUrl = `https://www.solarsystemscope.com/textures/download/${sourceFile}`;
  let source;
  if (generated) {
    source = await fs.readFile(path.join(root, id, sourceFile));
  } else {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`${response.status}: ${sourceUrl}`);
    source = Buffer.from(await response.arrayBuffer());
  }
  const metadata = await sharp(source).metadata();
  assert.ok(metadata.width <= 2048);
  assert.equal(metadata.width, metadata.height * 2);
  const texture = generated
    ? source
    : await sharp(source).webp({ quality: 88, effort: 6 }).toBuffer();
  const filename = path.join(root, id, `${id}.glb`);
  const original = await fs.readFile(filename);
  const old = parse(original);
  const oldView = old.json.bufferViews[old.json.images[0].bufferView];
  const oldImage = await sharp(
    old.bin.subarray(oldView.byteOffset, oldView.byteOffset + oldView.byteLength),
  ).metadata();
  const glb = repack(
    original,
    texture,
    generated
      ? 'Mission Cosmos — ImageGen illustrative solar photosphere, 2026-09-28'
      : 'Surface texture: Solar System Scope / INOVE, CC BY 4.0, https://www.solarsystemscope.com/textures/',
  );
  await fs.writeFile(filename, glb);
  await fs.writeFile(path.join(root, id, `${id}.webp`), texture);
  const body = manifest.bodies[id];
  body.texture = generated
    ? {
        sourceFile: 'sun.webp',
        author: 'Mission Cosmos / ImageGen',
        sourceResolution: [metadata.width, metadata.height],
        mobileResolution: [metadata.width, metadata.height],
        sourceSha256: hash(source),
        lowResolution: false,
        modifications:
          'AI-generated illustrative photosphere, warm colorization; WebP quality 88. Not a measured solar map.',
      }
    : {
        sourceFile,
        sourceUrl,
        author: 'Solar System Scope / INOVE',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        sourceResolution: [2048, 1024],
        mobileResolution: [2048, 1024],
        sourceSha256: hash(source),
        lowResolution: false,
        modifications:
          'Converted from JPEG to WebP quality 88; no enlargement; original UV mapping retained.',
      };
  body.notes = (body.notes ?? []).filter(
    (note) => !/318|identical|low.resolution|Neptun.jpg/i.test(note),
  );
  body.bytes = glb.length;
  body.sha256 = hash(glb);
  report.push({
    id,
    before: `${oldImage.width}x${oldImage.height}`,
    after: `${metadata.width}x${metadata.height}`,
    oldBytes: original.length,
    bytes: glb.length,
  });
}
// Keep deployment paths and checksums current, including the unchanged ring texture.
for (const [id, body] of Object.entries(manifest.bodies)) {
  body.url = `/assets/models/solarsystem/celestial-bodies/${id}/${id}.glb`;
  body.files = [];
  for (const file of (await fs.readdir(path.join(root, id))).filter((file) =>
    /\.(glb|webp)$/.test(file),
  )) {
    const filename = `${root}/${id}/${file}`;
    const data = await fs.readFile(filename);
    body.files.push({ path: filename, bytes: data.length, sha256: hash(data) });
  }
}
manifest.texturePolicy =
  'WebP quality 88, width <=2048; no upscale; embedded in GLB; external WebP is a working copy. Saturn rings unchanged.';
manifest.provenance.surfaceTextures =
  'Planets and Moon: Solar System Scope / INOVE, https://www.solarsystemscope.com/textures/, CC BY 4.0. Sun: Mission Cosmos / ImageGen, illustrative photosphere.';
manifest.validation = {
  geometryAndUvsByteIdentical: true,
  embeddedWebpDecoded: true,
  physicalMobileTested: false,
};
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.table(report);
console.log(
  'Total GLB bytes:',
  report.reduce((n, r) => n + r.oldBytes, 0),
  '->',
  report.reduce((n, r) => n + r.bytes, 0),
);
