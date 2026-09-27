import { Matrix, type Mesh } from '@babylonjs/core';

/**
 * Thin instances pour répétitions (astéroïdes, étoiles procédurales, débris).
 * Une seule planète n'en a pas besoin — utilitaire pour missions futures.
 */
export function setThinInstancesFromMatrices(mesh: Mesh, matrices: Matrix[]): void {
  mesh.thinInstanceSetBuffer(
    'matrix',
    Float32Array.from(matrices.flatMap((m) => Array.from(m.m))),
    16,
  );
}

/** Place N instances autour d'un rayon (anneau / ceinture simple). */
export function buildRingInstanceMatrices(
  count: number,
  radius: number,
  yJitter = 0.05,
): Matrix[] {
  const matrices: Matrix[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const r = radius * (0.92 + Math.random() * 0.16);
    const y = (Math.random() - 0.5) * 2 * yJitter * radius;
    const m = Matrix.Translation(Math.cos(angle) * r, y, Math.sin(angle) * r);
    matrices.push(m);
  }
  return matrices;
}
