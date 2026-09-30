import {
  Color3,
  Constants,
  DynamicTexture,
  Mesh,
  StandardMaterial,
  TransformNode,
  Vector3,
  VertexData,
  type Scene,
} from '@babylonjs/core';
import type { ResolvedGraphicsQuality } from '@/3d/materials/graphicsQuality';

/** Small shared masks instead of bloom, particles or volumetric ray marching. */
export function createLightMasks(scene: Scene, quality: ResolvedGraphicsQuality) {
  const size = quality === 'high' ? 128 : 64;
  const beam = new DynamicTexture('colour-beam-mask', size, scene, false);
  const ctx = beam.getContext();
  const gradient = ctx.createLinearGradient(0, 0, size, 0);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.08)');
  gradient.addColorStop(0.43, 'rgba(255,255,255,0.48)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.57, 'rgba(255,255,255,0.48)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.08)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  beam.hasAlpha = true;
  beam.update();
  const spot = new DynamicTexture('colour-spot-mask', size, scene, false);
  const spotCtx = spot.getContext();
  const radial = spotCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  radial.addColorStop(0, 'rgba(255,255,255,1)');
  radial.addColorStop(0.35, 'rgba(255,255,255,0.95)');
  radial.addColorStop(0.6, 'rgba(255,255,255,0.45)');
  radial.addColorStop(1, 'rgba(255,255,255,0)');
  spotCtx.fillStyle = radial;
  spotCtx.fillRect(0, 0, size, size);
  spot.hasAlpha = true;
  spot.update();
  return {
    beam,
    spot,
    dispose: () => {
      beam.dispose();
      spot.dispose();
    },
  };
}

export function luminousMaterial(
  scene: Scene,
  name: string,
  colour: Color3,
  mask?: DynamicTexture,
) {
  const mat = new StandardMaterial(name, scene);
  mat.disableLighting = true;
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.emissiveColor = colour;
  mat.opacityTexture = mask ?? null;
  mat.alphaMode = Constants.ALPHA_ADD;
  mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  mat.disableDepthWrite = true;
  mat.backFaceCulling = false;
  return mat;
}

/** Low/medium performance freezes materials: refresh changed uniforms only on interaction. */
export function updateLightMaterial(
  material: StandardMaterial,
  state: { alpha?: number; colour?: Color3 },
) {
  let changed = false;
  if (state.alpha !== undefined && state.alpha !== material.alpha) {
    material.alpha = state.alpha;
    changed = true;
  }
  if (state.colour && !material.emissiveColor.equals(state.colour)) {
    material.emissiveColor.copyFrom(state.colour);
    changed = true;
  }
  // Force the next bind to upload uniforms even if Babylon has frozen the material.
  // Shader variants stay the same and are reused; no per-frame invalidation is needed.
  if (changed) material.markDirty(true);
}

/** Two crossed soft ribbons stay visible when the camera moves. Geometry is built once. */
export function createLightBeam(
  scene: Scene,
  name: string,
  from: Vector3,
  to: Vector3,
  colour: Color3,
  mask: DynamicTexture | undefined,
  quality: ResolvedGraphicsQuality,
  startWidth = 0.18,
  endWidth = 0.34,
) {
  const root = new TransformNode(name, scene);
  const direction = to.subtract(from);
  if (direction.lengthSquared() < 0.000001) return root;
  direction.normalize();
  const basis =
    Math.abs(Vector3.Dot(direction, Vector3.Up())) > 0.95 ? Vector3.Right() : Vector3.Up();
  const side = Vector3.Cross(direction, basis).normalize();
  const second = Vector3.Cross(direction, side).normalize();
  const mat = luminousMaterial(scene, `${name}-soft`, colour, mask);
  mat.alpha = quality === 'low' ? 0.65 : 0.55;
  const ribbon = (
    axis: Vector3,
    widthScale: number,
    material: StandardMaterial,
    suffix: string,
  ) => {
    const corners = [
      from.subtract(axis.scale((startWidth * widthScale) / 2)),
      from.add(axis.scale((startWidth * widthScale) / 2)),
      to.add(axis.scale((endWidth * widthScale) / 2)),
      to.subtract(axis.scale((endWidth * widthScale) / 2)),
    ];
    const mesh = new Mesh(`${name}-${suffix}`, scene);
    const data = new VertexData();
    data.positions = corners.flatMap((point) => point.asArray());
    data.indices = [0, 1, 2, 0, 2, 3];
    data.uvs = [0, 0, 1, 0, 1, 1, 0, 1];
    const normals: number[] = [];
    VertexData.ComputeNormals(data.positions, data.indices, normals);
    data.normals = normals;
    data.applyToMesh(mesh);
    mesh.material = material;
    mesh.isPickable = false;
    mesh.parent = root;
  };
  ribbon(side, 1, mat, 'ribbon-a');
  ribbon(second, 1, mat, 'ribbon-b');
  if (quality === 'high') {
    const core = luminousMaterial(scene, `${name}-core`, colour, mask);
    core.alpha = 0.8;
    ribbon(side, 0.2, core, 'core');
  }
  return root;
}
