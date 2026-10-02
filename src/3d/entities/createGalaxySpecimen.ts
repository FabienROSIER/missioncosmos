import {
  Constants,
  Matrix,
  Mesh,
  MeshBuilder,
  ShaderMaterial,
  TransformNode,
  Vector3,
  VertexData,
  type Scene,
} from '@babylonjs/core';
import { galaxyFamilyPoints, IRREGULAR_CLUMPS, type GalaxyFamily } from '@/content/bodies/galaxies';
import { createMilkyWayGlow } from './createMilkyWayGlow';

/** One point-cloud draw call per specimen; inactive specimens do not render. */
export function createGalaxySpecimen(
  scene: Scene,
  family: GalaxyFamily,
  count: number,
  low: boolean,
  softEdge = false,
) {
  const root = new TransformNode(`galaxy-root-${family}`, scene);
  const inverse = Matrix.Identity();
  const localEye = Vector3.Zero();
  const cloud = new Mesh(`galaxy-${family}`, scene);
  cloud.parent = root;
  const points = galaxyFamilyPoints(family, count);
  const data = new VertexData();
  data.positions = points.flatMap((p) => [p.x, p.y, p.z]);
  data.colors = points.flatMap((p, i) => {
    const warm = family === 'elliptical' ? 0.7 : p.warm ? 0.8 : 0;
    return [0.65 + 0.35 * warm, 0.8 + 0.07 * warm, 1 - 0.3 * warm, i % 3 ? 0.4 : 0.65];
  });
  data.indices = points.map((_, i) => i);
  data.applyToMesh(cloud);
  cloud.isPickable = false;
  const stars = new ShaderMaterial(
    `galaxy-stars-${family}`,
    scene,
    {
      vertexSource: `precision highp float; attribute vec3 position; attribute vec4 color;
      uniform mat4 worldViewProjection; uniform float opacity; uniform float pointSize; varying vec4 light;
      void main(){gl_Position=worldViewProjection*vec4(position,1.0);gl_PointSize=pointSize;light=vec4(color.rgb,color.a*opacity);}`,
      fragmentSource: `precision highp float; varying vec4 light;
      void main(){float r=length(gl_PointCoord-vec2(0.5));if(r>0.5)discard;
      gl_FragColor=vec4(mix(light.rgb,vec3(1.0),0.25*exp(-r*r*40.0)),light.a*exp(-r*r*18.0));}`,
    },
    {
      attributes: ['position', 'color'],
      uniforms: ['worldViewProjection', 'opacity', 'pointSize'],
      needAlphaBlending: true,
    },
  );
  stars.fillMode = Constants.MATERIAL_PointFillMode;
  stars.alphaMode = Constants.ALPHA_ADD;
  stars.disableDepthWrite = true;
  cloud.material = stars;
  const spiral =
    family === 'spiral' || family === 'barred-spiral'
      ? createMilkyWayGlow(scene, low ? 12 : 20, root, {
          barred: family === 'barred-spiral',
          intensity: 1.65,
          softEdge,
        })
      : null;
  const volume = spiral
    ? null
    : MeshBuilder.CreateBox(`galaxy-volume-${family}`, { size: 40 }, scene);
  const glow = volume
    ? new ShaderMaterial(
        `galaxy-glow-${family}`,
        scene,
        {
          vertexSource: `precision highp float; attribute vec3 position; uniform mat4 worldViewProjection;
      varying vec3 surface; void main(){surface=position;gl_Position=worldViewProjection*vec4(position,1.0);}`,
          fragmentSource: `precision highp float; varying vec3 surface; uniform vec3 eye; uniform float opacity;
      float glow(vec3 ray,vec3 centre,vec3 extent){vec3 q=(eye-centre)/extent,v=ray/extent;
      float a=dot(v,v),b=dot(q,v);return exp(-max(0.0,dot(q,q)-b*b/a))/sqrt(a);}
      void main(){vec3 ray=normalize(surface-eye);float density=0.0;
      ${
        family === 'elliptical'
          ? 'density=0.07*glow(ray,vec3(0.0),vec3(6.0,3.0,4.2))+0.1*glow(ray,vec3(0.0),vec3(2.4,1.2,1.7));'
          : IRREGULAR_CLUMPS.map(
              (c) =>
                `density+=0.09*glow(ray,vec3(${c.map((n) => n.toFixed(1)).join(',')}),vec3(2.5,1.4,2.5));`,
            ).join('\n')
      }
      gl_FragColor=vec4(${family === 'elliptical' ? 'vec3(1.0,0.83,0.65)' : 'vec3(0.5,0.68,0.9)'},opacity*(1.0-exp(-density)));}`,
        },
        {
          attributes: ['position'],
          uniforms: ['worldViewProjection', 'eye', 'opacity'],
          needAlphaBlending: true,
        },
      )
    : null;
  if (volume && glow) {
    volume.parent = root;
    volume.isPickable = false;
    volume.material = glow;
    glow.backFaceCulling = true;
    glow.cullBackFaces = false;
    glow.disableDepthWrite = true;
    glow.alphaMode = Constants.ALPHA_ADD;
  }
  return {
    root,
    update(eye: Vector3, opacity: number, andromeda = false) {
      // Two illustrative spiral maquettes, not identical sky projections or a real map.
      const tilted = (family === 'spiral' || family === 'barred-spiral') && andromeda;
      root.rotation.set(tilted ? 0.5 : 0, tilted ? 0.65 : 0, 0);
      root.scaling.set(tilted ? 1.08 : 1, 1, tilted ? 0.86 : 1);
      root.computeWorldMatrix(true).invertToRef(inverse);
      stars.setFloat(
        'pointSize',
        (low ? 2.4 : 3) *
          (softEdge ? Math.max(0.18, Math.sqrt(Math.min(1, Math.abs(root.absoluteScaling.x)))) : 1),
      );
      Vector3.TransformCoordinatesToRef(eye, inverse, localEye);
      cloud.setEnabled(opacity > 0);
      stars.setFloat('opacity', opacity);
      spiral?.update(localEye, opacity);
      if (volume && glow) {
        volume.setEnabled(opacity > 0);
        glow.setVector3('eye', localEye);
        glow.setFloat('opacity', opacity * 1.65);
      }
    },
    dispose() {
      cloud.dispose();
      stars.dispose();
      spiral?.dispose();
      volume?.dispose();
      glow?.dispose();
      root.dispose();
    },
  };
}
