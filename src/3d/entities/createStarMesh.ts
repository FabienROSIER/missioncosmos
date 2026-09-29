import {
  Color3,
  Constants,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector3,
  type Scene,
} from '@babylonjs/core';
import { STARS, type StarId } from '@/content/bodies/stars';
import { withBasePath } from '@/lib/basePath';

const SURFACES: Partial<Record<StarId, string>> = {
  sun: '/assets/models/solarsystem/celestial-bodies/sun/sun.webp',
  proxima: '/assets/textures/stars/proxima.webp',
  betelgeuse: '/assets/textures/stars/betelgeuse.webp',
  sirius: '/assets/textures/stars/sirius.webp',
};

export type StarMesh = ReturnType<typeof createStarMesh>;

/** Emissive photosphere, diffuse corona and camera-facing name. */
export function createStarMesh(scene: Scene, id: StarId, quality: 'low' | 'medium' | 'high') {
  const def = STARS[id];
  const color = new Color3(def.color.r, def.color.g, def.color.b);
  const root = MeshBuilder.CreateSphere(
    `star-${id}`,
    { diameter: 2, segments: quality === 'low' ? 24 : 48 },
    scene,
  );
  const mat = new StandardMaterial(`star-mat-${id}`, scene);
  mat.disableLighting = true;
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.emissiveColor = color;
  const path = SURFACES[id];
  const surface = path ? new Texture(withBasePath(path), scene) : null;
  if (surface) {
    surface.wrapU = Texture.WRAP_ADDRESSMODE;
    surface.wrapV = Texture.CLAMP_ADDRESSMODE;
    mat.emissiveTexture = surface;
    // The image already carries its colour; tinting it again erases detail.
    // StandardMaterial adds emissiveColor to the texture (it does not multiply).
    mat.emissiveColor = Color3.Black();
  }
  root.material = mat;

  const haloTexture = new DynamicTexture(`star-corona-${id}`, 256, scene, false);
  const ctx = haloTexture.getContext();
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  // The opaque photosphere depth-occludes the centre of this billboard.
  const glowStop = (offset: number, brightness: number, alpha: number) => {
    gradient.addColorStop(
      offset,
      `rgba(${Math.round(color.r * brightness * 255)},${Math.round(color.g * brightness * 255)},${Math.round(color.b * brightness * 255)},${alpha})`,
    );
  };
  glowStop(0, 1, 0.7);
  glowStop(0.44, 1, 0.65);
  glowStop(0.49, 0.8, 0.35);
  glowStop(0.6, 0.4, 0.13);
  glowStop(0.78, 0.08, 0.035);
  glowStop(1, 0, 0);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  haloTexture.hasAlpha = true;
  haloTexture.getAlphaFromRGB = false;
  haloTexture.update();

  const glow = MeshBuilder.CreatePlane(`star-glow-${id}`, { size: 4.4 }, scene);
  glow.parent = root;
  glow.billboardMode = Mesh.BILLBOARDMODE_ALL;
  glow.isPickable = false;
  const glowMat = new StandardMaterial(`star-glow-mat-${id}`, scene);
  glowMat.disableLighting = true;
  glowMat.emissiveColor = Color3.Black();
  glowMat.emissiveTexture = haloTexture;
  glowMat.diffuseColor = Color3.Black();
  glowMat.specularColor = Color3.Black();
  glowMat.opacityTexture = haloTexture;
  glowMat.alpha = 0.7;
  glowMat.alphaMode = Constants.ALPHA_ADD;
  glowMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  glowMat.disableDepthWrite = true;
  glowMat.backFaceCulling = false;
  glow.material = glowMat;

  const labelTexture = new DynamicTexture(
    `star-name-${id}`,
    { width: 512, height: 80 },
    scene,
    true,
  );
  labelTexture.hasAlpha = true;
  labelTexture.drawText(
    id === 'proxima' ? 'Proxima' : def.nameFr,
    null,
    55,
    '36px sans-serif',
    '#e5e8f0',
    'transparent',
    true,
  );
  const label = MeshBuilder.CreatePlane(`star-label-${id}`, { width: 1.6, height: 0.25 }, scene);
  label.parent = glow;
  label.isPickable = false;
  const labelMat = new StandardMaterial(`star-label-mat-${id}`, scene);
  labelMat.disableLighting = true;
  labelMat.emissiveColor = Color3.Black();
  labelMat.diffuseColor = Color3.Black();
  labelMat.specularColor = Color3.Black();
  labelMat.emissiveTexture = labelTexture;
  labelMat.opacityTexture = labelTexture;
  labelMat.backFaceCulling = false;
  labelMat.alpha = 0.82;
  label.material = labelMat;

  const labelObserver = scene.onBeforeRenderObservable.add(() => {
    if (!root.isEnabled() || !scene.activeCamera) return;
    const camera = scene.activeCamera;
    const height = scene.getEngine().getRenderingCanvas()?.clientHeight ?? 600;
    const distance = Vector3.Distance(camera.globalPosition, root.position);
    const pixelSize = (2 * distance * Math.tan(camera.fov / 2)) / Math.max(1, height);
    const radius = root.scaling.x;
    label.scaling.setAll((pixelSize * 28) / (0.25 * radius));
    label.position.y = -1.12 - (pixelSize * 18) / radius;
  });

  return {
    id,
    root,
    glow,
    glowMat,
    setRadius(radius: number) {
      const r = Math.max(0.05, radius);
      root.scaling.setAll(r);
      // Keep text readable when star sizes change, without enlarging giant labels.
      label.scaling.setAll(1 / r);
      label.position.y = -1.12 - 0.2 / r;
    },
    dispose() {
      scene.onBeforeRenderObservable.remove(labelObserver);
      root.dispose();
      mat.dispose();
      glowMat.dispose();
      labelMat.dispose();
      surface?.dispose();
      haloTexture.dispose();
      labelTexture.dispose();
    },
  };
}
