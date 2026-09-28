import {
  Animation,
  Color3,
  Constants,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  type Scene,
} from '@babylonjs/core';
import { prefersReducedMotion } from '@/lib/motion';

/** Rayon UV du trou (bord planète) — le glow commence juste après. */
const HALO_HOLE_UV = 0.34;

/** Texture radiale partagée (une par scène via cache faible). */
const textureByScene = new WeakMap<Scene, DynamicTexture>();

function getSoftHaloTexture(scene: Scene): DynamicTexture {
  const cached = textureByScene.get(scene);
  if (cached) return cached;

  const size = 128;
  const tex = new DynamicTexture('planet-success-halo-tex', size, scene, false);
  const ctx = tex.getContext();
  const cx = size / 2;
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  g.addColorStop(0, 'rgba(255, 255, 255, 0)');
  g.addColorStop(HALO_HOLE_UV, 'rgba(255, 255, 255, 0)');
  g.addColorStop(HALO_HOLE_UV + 0.04, 'rgba(255, 255, 255, 0.9)');
  g.addColorStop(0.48, 'rgba(255, 250, 240, 0.55)');
  g.addColorStop(0.62, 'rgba(255, 230, 200, 0.28)');
  g.addColorStop(0.8, 'rgba(190, 225, 255, 0.12)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  tex.hasAlpha = true;
  tex.update();
  textureByScene.set(scene, tex);
  return tex;
}

/**
 * Halo lumineux court autour d’une planète (bonne sélection / défi réussi).
 * Anneau billboard hors globe, expand + fade — respect reduced-motion.
 * À utiliser systématiquement pour valider une planète touchée correctement.
 */
export function playPlanetSuccessHalo(
  scene: Scene,
  position: Vector3,
  planetRadius: number,
): void {
  if (prefersReducedMotion()) return;

  const startScale = Math.max(planetRadius / HALO_HOLE_UV, 0.2);
  const endScale = Math.max(startScale * 2.4, planetRadius * 6);
  const mesh = MeshBuilder.CreateDisc(
    `planet-success-halo-${Date.now()}`,
    { radius: 1, tessellation: 48 },
    scene,
  );
  mesh.position.copyFrom(position);
  mesh.scaling.setAll(startScale);
  mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
  mesh.isPickable = false;
  mesh.renderingGroupId = 1;

  const tex = getSoftHaloTexture(scene);
  const mat = new StandardMaterial(`planet-success-halo-mat-${Date.now()}`, scene);
  mat.disableLighting = true;
  mat.diffuseTexture = tex;
  mat.emissiveTexture = tex;
  mat.opacityTexture = tex;
  mat.useAlphaFromDiffuseTexture = true;
  mat.emissiveColor = new Color3(1, 1, 1);
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.alpha = 1;
  mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  mat.alphaMode = Constants.ALPHA_ADD;
  mat.backFaceCulling = false;
  mesh.material = mat;

  const fps = 60;
  const frames = 18;

  const scaleAnim = new Animation(
    'planet-halo-scale',
    'scaling',
    fps,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  scaleAnim.setKeys([
    { frame: 0, value: new Vector3(startScale, startScale, startScale) },
    { frame: frames, value: new Vector3(endScale, endScale, endScale) },
  ]);

  const alphaAnim = new Animation(
    'planet-halo-alpha',
    'alpha',
    fps,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  alphaAnim.setKeys([
    { frame: 0, value: 1 },
    { frame: 8, value: 0.55 },
    { frame: frames, value: 0 },
  ]);

  scene.beginDirectAnimation(mesh, [scaleAnim], 0, frames, false, 1);
  scene.beginDirectAnimation(mat, [alphaAnim], 0, frames, false, 1, () => {
    mat.diffuseTexture = null;
    mat.emissiveTexture = null;
    mat.opacityTexture = null;
    mesh.dispose();
    mat.dispose();
  });
}
