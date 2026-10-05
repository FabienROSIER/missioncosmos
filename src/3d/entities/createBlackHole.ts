import { MeshBuilder, ShaderMaterial, Vector3, type Scene } from '@babylonjs/core';
import type { ResolvedGraphicsQuality } from '@/3d/materials/graphicsQuality';

const vertexSource = `
precision highp float;
attribute vec3 position;
uniform mat4 worldViewProjection;
uniform mat4 world;
varying vec3 surfacePosition;
void main() {
  surfacePosition = (world * vec4(position, 1.0)).xyz;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}`;

/** Artistic bent-ray integration, not a numerical general-relativity model.
 * The disk is sampled in world space, so its secondary image follows the view.
 * Only the disk and central shadow are drawn; the shared starfield remains behind.
 */
const fragmentSource = `
precision highp float;
varying vec3 surfacePosition;
uniform vec3 eye;
uniform float time;
uniform float visualScale;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x),
             mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0)), f.x), f.y);
}
void main() {
  // Integrate in the model's reference space so a reduced preview keeps
  // exactly the same proportions as the full-size opening view.
  vec3 localEye = eye / visualScale;
  vec3 localSurface = surfacePosition / visualScale;
  vec3 direction = normalize(localSurface - localEye);
  float b = dot(localEye, direction);
  float discriminant = b*b - dot(localEye, localEye) + 100.0;
  if (discriminant < 0.0) discard;
  vec3 p = localEye + direction * max(0.0, -b-sqrt(discriminant));
  vec3 light = vec3(0.0);
  float transmission = 1.0;
  float captured = 0.0;
  for (int i = 0; i < RAY_STEPS; i++) {
    float r = length(p);
    if (r < 1.05) { captured = 1.0; break; }
    if (r > 10.1) break;
    float dt = clamp(r * 0.055, 0.055, 0.46) * STEP_SCALE;
    vec3 inward = -p / r;
    direction = normalize(direction +
      (inward - direction * dot(inward, direction)) * (1.7 / (r*r)) * dt);
    vec3 nextPoint = p + direction * dt;
    // Integrate the thin disk at the closest point to its mid-plane per segment.
    float crossing = clamp(-p.y / (nextPoint.y-p.y + 0.000001), 0.0, 1.0);
    vec3 samplePoint = mix(p, nextPoint, crossing);
    float radius = length(samplePoint.xz);
    float thickness = 0.07 + radius * 0.012;
    float vertical = exp(-pow(abs(samplePoint.y)/thickness, 2.0)*2.0);
    float envelope = smoothstep(2.35, 2.8, radius) * (1.0-smoothstep(6.0,8.6,radius));
    if (vertical * envelope > 0.001) {
      float angle = atan(samplePoint.z, samplePoint.x);
      float orbit = time * 0.24 / sqrt(max(radius, 1.0));
      // Periodic angular coordinates avoid a seam at atan's branch cut.
      vec2 swirl = vec2(cos(angle-orbit), sin(angle-orbit));
      float clouds = noise(swirl * 4.0 + vec2(radius*3.7, radius*1.8));
      float fine = noise(swirl * 13.0 + vec2(radius*18.0, radius*8.0));
      float filaments = 0.58 + 0.22*sin(radius*35.0 + clouds*7.0) + 0.2*fine;
      float density = envelope * vertical * (0.35+clouds) * filaments;
      float opacity = 1.0-exp(-density*dt*9.0);
      float heat = exp(-(radius-2.5)*0.36);
      vec3 color = mix(vec3(0.75,0.16,0.025), vec3(1.0,0.84,0.5), heat);
      float brightness = (0.8+heat*1.5)*(0.75+clouds*0.7);
      light += transmission * opacity * color * brightness;
      transmission *= 1.0-opacity;
    }
    p = nextPoint;
    if (transmission < 0.015) break;
  }
  float alpha = 1.0-transmission*(1.0-captured);
  if (alpha < 0.002) discard;
  vec3 mapped = vec3(1.0)-exp(-light*1.5);
  gl_FragColor = vec4(mapped/max(alpha,0.001), alpha);
}`;

export function createBlackHole(scene: Scene, quality: ResolvedGraphicsQuality) {
  const shell = MeshBuilder.CreateSphere(
    'black-hole-ray-volume',
    { diameter: 20, segments: 48 },
    scene,
  );
  shell.isPickable = false;
  const steps = quality === 'low' ? 96 : quality === 'medium' ? 128 : 160;
  const material = new ShaderMaterial(
    'black-hole-bent-light',
    scene,
    { vertexSource, fragmentSource },
    {
      attributes: ['position'],
      uniforms: ['world', 'worldViewProjection', 'eye', 'time', 'visualScale'],
      defines: [`#define RAY_STEPS ${steps}`, `#define STEP_SCALE ${(160 / steps).toFixed(4)}`],
      needAlphaBlending: true,
    },
  );
  material.disableDepthWrite = true;
  material.setVector3('eye', new Vector3(0, 8, -24));
  material.setFloat('time', 0);
  material.setFloat('visualScale', 1);
  shell.material = material;
  return {
    mesh: shell,
    setEnabled: (enabled: boolean) => shell.setEnabled(enabled),
    setScale(scale: number) {
      shell.scaling.setAll(scale);
      material.setFloat('visualScale', scale);
    },
    update(eye: Vector3, time: number) {
      material.setVector3('eye', eye);
      material.setFloat('time', time);
    },
    dispose() {
      shell.dispose();
      material.dispose();
    },
  };
}
