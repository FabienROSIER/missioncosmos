import {
  Constants,
  MeshBuilder,
  ShaderMaterial,
  type Scene,
  type Vector3,
  type TransformNode,
} from '@babylonjs/core';

/** Diffuse 3D disk, analytic bulge/bar and bounded integration of the spiral arms. */
export function createMilkyWayGlow(
  scene: Scene,
  armSamples: 12 | 20 = 20,
  parent?: TransformNode,
  options: { barred?: boolean; intensity?: number; softEdge?: boolean } = {},
) {
  const barred = options.barred === true;
  const mesh = MeshBuilder.CreateBox(
    'galactic-diffuse-light',
    { width: 40, height: 8, depth: 40 },
    scene,
  );
  mesh.isPickable = false;
  if (parent) mesh.parent = parent;
  const material = new ShaderMaterial(
    'galactic-volume-light',
    scene,
    {
      vertexSource: `precision highp float;
      attribute vec3 position; uniform mat4 worldViewProjection;
      varying vec3 surface;
      void main() { surface = position; gl_Position = worldViewProjection * vec4(position, 1.0); }`,
      fragmentSource: `precision highp float;
      varying vec3 surface; uniform vec3 eye; uniform float opacity;
      float erfApprox(float x) {
        float x2 = x*x;
        return sign(x) * sqrt(max(0.0, 1.0-exp(-x2*(1.27323954+0.147*x2)/(1.0+0.147*x2))));
      }
      float integratedGlow(vec3 origin, vec3 ray, vec3 extent, float nearT, float farT) {
        vec3 q = origin / extent, v = ray / extent;
        float a = dot(v,v), b = dot(q,v), root = sqrt(a);
        float perpendicular = max(0.0, dot(q,q)-b*b/a);
        return 0.886226925/root * exp(-perpendicular) *
          (erfApprox((farT+b/a)*root)-erfApprox((nearT+b/a)*root));
      }
      float spiralLight(vec3 p) {
        float radius = length(p.xz);
        float phase = atan(p.z,p.x)-2.6*log(max(radius,${barred ? '5.2' : '0.6'})/${barred ? '5.2' : '2.4'});
        float arms = exp(2.5*(cos(${barred ? '2.0' : '4.0'}*phase)-1.0));
        float filaments = 0.82+0.18*sin(radius*1.9+sin(4.0*phase)*1.7);
        float dust = 1.0-0.35*exp(9.0*(cos(4.0*phase+0.8)-1.0));
        float height = 0.2+0.08*radius/16.0;
        return 0.68*arms*filaments*dust*exp(-radius/9.0-p.y*p.y/(height*height)) *
          smoothstep(${barred ? '4.8,5.6' : '1.3,2.5'},radius)*(1.0-smoothstep(12.5,16.0,radius));
      }
      void main() {
        vec3 ray = normalize(surface-eye);
        vec3 safeRay = vec3(ray.x < 0.0 ? -max(abs(ray.x),0.00001) : max(abs(ray.x),0.00001),
          ray.y < 0.0 ? -max(abs(ray.y),0.00001) : max(abs(ray.y),0.00001),
          ray.z < 0.0 ? -max(abs(ray.z),0.00001) : max(abs(ray.z),0.00001));
        vec3 first = (-vec3(20.0,4.0,20.0)-eye)/safeRay;
        vec3 last = (vec3(20.0,4.0,20.0)-eye)/safeRay;
        vec3 low = min(first,last), high = max(first,last);
        float nearT = max(0.0,max(max(low.x,low.y),low.z));
        float farT = min(min(high.x,high.y),high.z);
        if (farT <= nearT) discard;
        // A continuous luminous disk connects the arms instead of leaving black gaps.
        // Its oblate Gaussian volume also stays thin when viewed edge-on.
        float disk = 0.13 * integratedGlow(eye,ray,vec3(10.5,0.42,10.5),nearT,farT);
        float slabA = (-0.85-eye.y)/safeRay.y, slabB = (0.85-eye.y)/safeRay.y;
        float armNear = max(nearT,min(slabA,slabB)), armFar = min(farT,max(slabA,slabB));
        float stride = max(0.0,armFar-armNear)/${armSamples.toFixed(1)};
        for (int i=0;i<${armSamples};i++) {
          vec3 p = eye+ray*(armNear+(float(i)+0.5)*stride);
          disk += spiralLight(p)*stride;
        }
        float bulge = ${barred ? '0.14' : '0.18'} * integratedGlow(eye,ray,vec3(${barred ? '1.5,0.8,1.3' : '2.6,1.05,1.9'}),nearT,farT);
        float bar = ${options.barred === false ? '0.0' : barred ? '0.34' : '0.12'} * integratedGlow(eye,ray,vec3(${barred ? '5.0,0.42,0.7' : '4.8,0.6,1.6'}),nearT,farT);
        float density = disk+bulge+bar;
        vec3 light = (disk*vec3(0.48,0.63,0.85)+(bulge+bar)*vec3(1.0,0.83,0.65))/max(density,0.00001);
        ${options.softEdge ? 'float planeT = abs(ray.y)>0.0001 ? -eye.y/ray.y : 0.0; vec3 intercept = eye+ray*planeT; density *= 1.0-smoothstep(12.0,19.0,length(intercept.xz));' : ''}
        gl_FragColor = vec4(light, opacity*(1.0-exp(-density)));
      }`,
    },
    {
      attributes: ['position'],
      uniforms: ['worldViewProjection', 'eye', 'opacity'],
      needAlphaBlending: true,
    },
  );
  material.backFaceCulling = true;
  material.cullBackFaces = false;
  material.disableDepthWrite = true;
  material.alphaMode = Constants.ALPHA_ADD;
  mesh.material = material;
  material.setFloat('opacity', 0);
  mesh.setEnabled(false);
  return {
    update(eye: Vector3, opacity: number) {
      mesh.setEnabled(opacity > 0);
      material.setVector3('eye', eye);
      material.setFloat('opacity', opacity * (options.intensity ?? 1));
    },
    dispose() {
      mesh.dispose();
      material.dispose();
    },
  };
}
