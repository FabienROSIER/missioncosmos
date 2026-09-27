import {
  Color3,
  MeshBuilder,
  Quaternion,
  StandardMaterial,
  Vector3,
  type Mesh,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import type { EclipseKind } from '@/3d/utils/eclipseAlignment';

export type EclipseSurfaceEffectsHandle = {
  sync: (input: {
    kind: EclipseKind;
    earth: TransformNode;
    moon: TransformNode;
    sun: TransformNode;
    earthRadius: number;
    lunarAmount: number;
    solarAmount: number;
  }) => void;
  dispose: () => void;
};

/**
 * Ombre projetée sur la Terre = disque à l’intersection du rayon Soleil→Lune
 * avec la sphère terrestre (même axe que le cône d’ombre lunaire).
 */
export function createEclipseSurfaceEffects(scene: Scene): EclipseSurfaceEffectsHandle {
  const earthSpot = MeshBuilder.CreateDisc(
    'earth-solar-umbra-disc',
    { radius: 1, tessellation: 48 },
    scene,
  );
  earthSpot.isPickable = false;
  earthSpot.setEnabled(false);

  const earthSpotMat = new StandardMaterial('earth-solar-umbra-mat', scene);
  earthSpotMat.disableLighting = true;
  earthSpotMat.diffuseColor = Color3.Black();
  earthSpotMat.emissiveColor = new Color3(0.015, 0.02, 0.04);
  earthSpotMat.alpha = 0.75;
  earthSpotMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  earthSpotMat.backFaceCulling = false;
  earthSpot.material = earthSpotMat;

  const orientDisc = (mesh: Mesh, outward: Vector3) => {
    let xAxis = Vector3.Cross(Vector3.Up(), outward);
    if (xAxis.lengthSquared() < 1e-8) {
      xAxis = Vector3.Cross(new Vector3(1, 0, 0), outward);
    }
    xAxis.normalize();
    const yAxis = Vector3.Cross(outward, xAxis).normalize();
    mesh.rotationQuaternion = Quaternion.RotationQuaternionFromAxis(xAxis, yAxis, outward);
  };

  return {
    sync: ({ earth, moon, sun, earthRadius, solarAmount }) => {
      const e = earth.getAbsolutePosition();
      const m = moon.getAbsolutePosition();
      const s = sun.getAbsolutePosition();

      // Même axe que le cône : sens des rayons Soleil → Lune → …
      const axis = m.subtract(s);
      if (axis.lengthSquared() < 1e-8) {
        earthSpot.setEnabled(false);
        return;
      }
      axis.normalize();

      // La Terre doit être « en aval » de la Lune sur cet axe
      if (Vector3.Dot(e.subtract(m), axis) < 0.05) {
        earthSpot.setEnabled(false);
        return;
      }

      const hit = raySphereHit(m, axis, e, earthRadius);
      if (!hit || solarAmount <= 0.02) {
        earthSpot.setEnabled(false);
        return;
      }

      const outward = hit.subtract(e);
      if (outward.lengthSquared() < 1e-8) {
        earthSpot.setEnabled(false);
        return;
      }
      outward.normalize();

      earthSpot.setEnabled(true);
      earthSpot.position.copyFrom(e.add(outward.scale(earthRadius * 1.012)));
      earthSpot.scaling.setAll(0.16 + 0.14 * solarAmount);
      orientDisc(earthSpot, outward);
      earthSpotMat.alpha = 0.5 + 0.35 * solarAmount;
    },
    dispose: () => {
      earthSpot.dispose();
      earthSpotMat.dispose();
    },
  };
}

/**
 * Intersection rayon (origine + t*dir, t>0) / sphère (centre, rayon).
 * Retourne le premier point d’impact ou null.
 */
function raySphereHit(
  origin: Vector3,
  dir: Vector3,
  center: Vector3,
  radius: number,
): Vector3 | null {
  const oc = origin.subtract(center);
  const b = Vector3.Dot(oc, dir);
  const c = Vector3.Dot(oc, oc) - radius * radius;
  const delta = b * b - c;
  if (delta < 0) return null;
  const sqrtD = Math.sqrt(delta);
  const t1 = -b - sqrtD;
  const t2 = -b + sqrtD;
  const t = t1 > 0.02 ? t1 : t2 > 0.02 ? t2 : -1;
  if (t < 0) return null;
  return origin.add(dir.scale(t));
}

/** Intensité 0–1 selon la profondeur d’alignement. */
export function eclipseAmount(
  kind: EclipseKind,
  earth: { x: number; y: number; z: number },
  sun: { x: number; y: number; z: number },
  moon: { x: number; y: number; z: number },
): { solar: number; lunar: number } {
  const e2s = norm(sub(sun, earth));
  const e2m = norm(sub(moon, earth));
  const dot = Math.min(1, Math.max(-1, e2s.x * e2m.x + e2s.y * e2m.y + e2s.z * e2m.z));
  const elong = Math.acos(dot);

  if (kind === 'solar') {
    return { solar: Math.min(1, Math.max(0, (0.28 - elong) / 0.28)), lunar: 0 };
  }
  if (kind === 'lunar') {
    const depth = Math.PI - elong;
    return { solar: 0, lunar: Math.min(1, Math.max(0, (0.28 - depth) / 0.28)) };
  }
  return { solar: 0, lunar: 0 };
}

function sub(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function norm(v: { x: number; y: number; z: number }) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}
