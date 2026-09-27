import {
  Color3,
  Effect,
  PBRMaterial,
  RawTexture,
  ShaderMaterial,
  StandardMaterial,
  Texture,
  Vector3,
  type AbstractMesh,
  type Material,
  type Scene,
} from '@babylonjs/core';

const SHADER_NAME = 'hardTerminatorV4';
const SHADER_VERSION = 4;
let registeredVersion = 0;

function ensureHardTerminatorShaders(): void {
  if (registeredVersion === SHADER_VERSION) return;
  registeredVersion = SHADER_VERSION;

  Effect.ShadersStore[`${SHADER_NAME}VertexShader`] = `
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 world;
uniform mat4 worldViewProjection;
varying vec3 vNormalW;
varying vec3 vPositionW;
varying vec2 vUV;
void main(void) {
  vec4 worldPos = world * vec4(position, 1.0);
  vPositionW = worldPos.xyz;
  gl_Position = worldViewProjection * vec4(position, 1.0);
  vNormalW = normalize((world * vec4(normal, 0.0)).xyz);
  vUV = uv;
}
`;

  Effect.ShadersStore[`${SHADER_NAME}FragmentShader`] = `
precision highp float;
varying vec3 vNormalW;
varying vec3 vPositionW;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform vec3 sunDir;
uniform vec3 dayBoost;
uniform float nightLevel;
uniform vec3 albedoTint;
uniform float useTexture;
uniform float softEdge;
uniform vec3 earthPos;
uniform float earthRadius;
uniform float umbraSoft;
uniform vec3 bloodTint;
void main(void) {
  vec3 n = normalize(vNormalW);
  vec3 lightTravel = normalize(sunDir);
  float ndl = dot(n, -lightTravel);
  float edge = max(softEdge, 0.001);
  float day = smoothstep(-edge, edge, ndl);

  vec3 albedo = albedoTint;
  if (useTexture > 0.5) {
    albedo = texture2D(textureSampler, vUV).rgb * albedoTint;
  }

  // Éclairement Soleil (hors ombre Terre)
  vec3 lit = mix(albedo * nightLevel, albedo * dayBoost, day);

  // Ombre de la Terre (cylindre / cône simplifié le long des rayons)
  // → croissant pendant l’entrée / sortie d’éclipse lunaire
  vec3 rel = vPositionW - earthPos;
  float along = dot(rel, lightTravel);
  vec3 perp = rel - lightTravel * along;
  float distAxis = length(perp);
  float rInner = max(earthRadius * 0.72, 0.01);
  float rOuter = earthRadius * (1.0 + max(umbraSoft, 0.02));
  // Derrière la Terre (côté nuit), dans le tube d’ombre
  float behind = smoothstep(-earthRadius * 0.15, earthRadius * 0.35, along);
  float inUmbra = behind * (1.0 - smoothstep(rInner, rOuter, distAxis));

  // Un peu plus lumineuse en ombre (PiP) tout en gardant la teinte rougeâtre
  vec3 eclipsed = albedo * bloodTint * (0.3 + 0.24 * day);
  vec3 color = mix(lit, eclipsed, clamp(inUmbra, 0.0, 1.0));
  gl_FragColor = vec4(color, 1.0);
}
`;
}

export type HardTerminatorHandle = {
  setSunDirection: (direction: Vector3) => void;
  /** Occludeur Terre pour l’ombre projetée (éclipse lunaire / croissant). */
  setEarthOccluder: (earthPos: Vector3, earthRadius: number) => void;
  /**
   * @deprecated Préférer setEarthOccluder — conservé no-op pour compat.
   */
  setLunarEclipse: (amount: number) => void;
  dispose: () => void;
};

export type HardTerminatorOptions = {
  softEdge?: number;
  dayBoost?: Color3;
  nightLevel?: number;
};

/**
 * Matériau Lune : terminateur + ombre circulaire de la Terre (croissant).
 */
export function applyHardTerminatorMaterials(
  scene: Scene,
  meshes: AbstractMesh[],
  sunDirection: Vector3,
  options: HardTerminatorOptions = {},
): HardTerminatorHandle {
  ensureHardTerminatorShaders();

  const softEdge = options.softEdge ?? 0.11;
  const dayBoost = options.dayBoost ?? new Color3(1.65, 1.58, 1.5);
  const nightLevel = options.nightLevel ?? 0.02;

  const materials: ShaderMaterial[] = [];
  const ownedFallback: RawTexture[] = [];
  const dir = sunDirection.clone().normalize();

  for (const mesh of meshes) {
    if (!mesh.material) continue;
    const albedo = extractAlbedo(mesh.material);

    const mat = new ShaderMaterial(
      `${mesh.name}-hard-term-v4`,
      scene,
      { vertex: SHADER_NAME, fragment: SHADER_NAME },
      {
        attributes: ['position', 'normal', 'uv'],
        uniforms: [
          'world',
          'worldViewProjection',
          'sunDir',
          'dayBoost',
          'nightLevel',
          'albedoTint',
          'useTexture',
          'softEdge',
          'earthPos',
          'earthRadius',
          'umbraSoft',
          'bloodTint',
        ],
        samplers: ['textureSampler'],
      },
    );

    if (albedo.texture) {
      mat.setTexture('textureSampler', albedo.texture);
      mat.setFloat('useTexture', 1);
      mat.setColor3('albedoTint', new Color3(1.2, 1.16, 1.1));
    } else {
      const fallback = RawTexture.CreateRGBATexture(
        new Uint8Array([210, 205, 195, 255]),
        1,
        1,
        scene,
        false,
        false,
      );
      ownedFallback.push(fallback);
      mat.setTexture('textureSampler', fallback);
      mat.setFloat('useTexture', 0);
      mat.setColor3('albedoTint', albedo.color);
    }

    mat.setColor3('dayBoost', dayBoost);
    mat.setFloat('nightLevel', nightLevel);
    mat.setFloat('softEdge', softEdge);
    mat.setVector3('sunDir', dir);
    mat.setVector3('earthPos', new Vector3(0, -999, 0));
    mat.setFloat('earthRadius', 0.01);
    mat.setFloat('umbraSoft', 0.12);
    mat.setColor3('bloodTint', new Color3(0.95, 0.28, 0.1));
    mat.backFaceCulling = true;

    mesh.material = mat;
    materials.push(mat);
  }

  return {
    setSunDirection: (direction) => {
      const d = direction.clone().normalize();
      for (const mat of materials) mat.setVector3('sunDir', d);
    },
    setEarthOccluder: (earthPos, earthRadius) => {
      for (const mat of materials) {
        mat.setVector3('earthPos', earthPos);
        mat.setFloat('earthRadius', earthRadius);
      }
    },
    setLunarEclipse: (_amount) => {
      void _amount;
    },
    dispose: () => {
      for (const mat of materials) mat.dispose(true, false);
      for (const tex of ownedFallback) tex.dispose();
    },
  };
}

function extractAlbedo(source: Material): { texture: Texture | null; color: Color3 } {
  if (source instanceof StandardMaterial) {
    return {
      texture: source.diffuseTexture instanceof Texture ? source.diffuseTexture : null,
      color: source.diffuseColor?.clone() ?? new Color3(0.55, 0.55, 0.55),
    };
  }
  if (source instanceof PBRMaterial) {
    return {
      texture: source.albedoTexture instanceof Texture ? source.albedoTexture : null,
      color: source.albedoColor?.clone() ?? new Color3(0.55, 0.55, 0.55),
    };
  }
  return { texture: null, color: new Color3(0.55, 0.55, 0.55) };
}
