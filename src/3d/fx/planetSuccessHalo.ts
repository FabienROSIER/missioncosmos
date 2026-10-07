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
import { getUiMotionSnapshot, type UiMotionLevel } from '@/lib/uiMotion';

/** Rayon UV du trou (bord planète) — le glow commence juste après. */
const HALO_HOLE_UV = 0.34;

/** Texture radiale partagée (une par scène via cache faible). */
const textureByScene = new WeakMap<Scene, DynamicTexture>();

type HaloMotionProfile = {
  tessellation: number;
  expandFactor: number;
  fps: number;
  frames: number;
  /** Si false : flash fixe (pas d’expand) pour reduced-motion. */
  animateScale: boolean;
};

const MOTION_PROFILE: Record<UiMotionLevel, HaloMotionProfile> = {
  // Accessibilité : confirmation visible, sans mouvement.
  none: { tessellation: 24, expandFactor: 1.6, fps: 60, frames: 10, animateScale: false },
  // Qualité basse / save-data : anneau court et léger.
  minimal: { tessellation: 24, expandFactor: 1.9, fps: 60, frames: 12, animateScale: true },
  // Qualité moyenne (souvent mobile auto) : halo lisible.
  standard: { tessellation: 36, expandFactor: 2.2, fps: 60, frames: 16, animateScale: true },
  // Qualité élevée : effet complet.
  full: { tessellation: 48, expandFactor: 2.4, fps: 60, frames: 18, animateScale: true },
};

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
 * Halo lumineux autour d’une planète (bonne sélection / défi réussi).
 * Adapté à chaque niveau de motion UI (qualité graphique + reduced-motion).
 * À utiliser systématiquement pour valider une planète touchée correctement.
 */
export function playPlanetSuccessHalo(scene: Scene, position: Vector3, planetRadius: number): void {
  const motion = getUiMotionSnapshot();
  const profile = MOTION_PROFILE[motion];

  const startScale = Math.max(planetRadius / HALO_HOLE_UV, 0.2);
  const endScale = Math.max(startScale * profile.expandFactor, planetRadius * (profile.expandFactor + 3.5));
  const holdScale = profile.animateScale ? startScale : endScale * 0.85;

  const mesh = MeshBuilder.CreateDisc(
    `planet-success-halo-${Date.now()}`,
    { radius: 1, tessellation: profile.tessellation },
    scene,
  );
  mesh.position.copyFrom(position);
  mesh.scaling.setAll(holdScale);
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

  const { fps, frames } = profile;
  const anims: Animation[] = [];

  if (profile.animateScale) {
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
    anims.push(scaleAnim);
  }

  const alphaAnim = new Animation(
    'planet-halo-alpha',
    'alpha',
    fps,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  alphaAnim.setKeys(
    profile.animateScale
      ? [
          { frame: 0, value: 1 },
          { frame: Math.max(4, Math.floor(frames * 0.45)), value: 0.55 },
          { frame: frames, value: 0 },
        ]
      : [
          { frame: 0, value: 1 },
          { frame: Math.floor(frames * 0.5), value: 1 },
          { frame: frames, value: 0 },
        ],
  );
  anims.push(alphaAnim);

  const disposeHalo = () => {
    mat.diffuseTexture = null;
    mat.emissiveTexture = null;
    mat.opacityTexture = null;
    mesh.dispose();
    mat.dispose();
  };

  if (profile.animateScale) {
    scene.beginDirectAnimation(mesh, [anims[0]!], 0, frames, false, 1);
  }
  scene.beginDirectAnimation(mat, [alphaAnim], 0, frames, false, 1, disposeHalo);
}
