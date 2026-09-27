import {
  Color3,
  MeshBuilder,
  Quaternion,
  StandardMaterial,
  Vector3,
  type AbstractMesh,
  type Mesh,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import { EARTH_MAIN_LAYER } from '@/3d/scenes/houseViewPip';

export type EclipseShadowsHandle = {
  /** Met à jour les cônes selon positions Soleil / Terre / Lune. */
  sync: (sun: TransformNode, earth: TransformNode, moon: TransformNode) => void;
  setVisible: (visible: boolean) => void;
  /** Met en avant le cône utile (solaire / lunaire) ou les deux. */
  setHighlight: (kind: 'none' | 'solar' | 'lunar' | 'both') => void;
  dispose: () => void;
};

const EARTH_CONE_HEIGHT = 3.2;
const MOON_CONE_HEIGHT = 2.6;

/**
 * Ombres / pénombres très simplifiées (cônes translucides).
 * Direction = sens des rayons (loin du Soleil), pas « vers un autre corps ».
 */
export function createEclipseShadows(scene: Scene): EclipseShadowsHandle {
  const earthUmbra = MeshBuilder.CreateCylinder(
    'earth-umbra',
    {
      height: EARTH_CONE_HEIGHT,
      diameterTop: 0.06,
      diameterBottom: 1.4,
      tessellation: 24,
    },
    scene,
  );
  earthUmbra.isPickable = false;
  earthUmbra.layerMask = EARTH_MAIN_LAYER;

  const moonUmbra = MeshBuilder.CreateCylinder(
    'moon-umbra',
    {
      height: MOON_CONE_HEIGHT,
      diameterTop: 0.04,
      diameterBottom: 0.58,
      tessellation: 20,
    },
    scene,
  );
  moonUmbra.isPickable = false;
  moonUmbra.layerMask = EARTH_MAIN_LAYER;

  const earthMat = new StandardMaterial('earth-umbra-mat', scene);
  earthMat.diffuseColor = Color3.Black();
  earthMat.emissiveColor = new Color3(0.15, 0.2, 0.45);
  earthMat.alpha = 0.28;
  earthMat.disableLighting = true;
  earthMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  earthMat.backFaceCulling = false;
  earthUmbra.material = earthMat;

  const moonMat = new StandardMaterial('moon-umbra-mat', scene);
  moonMat.diffuseColor = Color3.Black();
  moonMat.emissiveColor = new Color3(0.45, 0.25, 0.1);
  moonMat.alpha = 0.3;
  moonMat.disableLighting = true;
  moonMat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  moonMat.backFaceCulling = false;
  moonUmbra.material = moonMat;

  /**
   * Place un cône : base large près du corps, pointe loin du Soleil (+Y local = away).
   */
  const syncCone = (
    mesh: Mesh,
    bodyPos: Vector3,
    awayFromSun: Vector3,
    length: number,
    bodyRadius: number,
    unitHeight: number,
  ) => {
    if (awayFromSun.lengthSquared() < 1e-8) return;
    const dir = awayFromSun.clone().normalize();

    const start = bodyPos.add(dir.scale(bodyRadius * 0.92));
    mesh.position.copyFrom(start.add(dir.scale(length * 0.5)));
    mesh.scaling.set(1, length / unitHeight, 1);

    // Base orthonormée : Y = axe du cylindre = direction de l’ombre
    let xAxis = Vector3.Cross(Vector3.Up(), dir);
    if (xAxis.lengthSquared() < 1e-8) {
      xAxis = Vector3.Cross(new Vector3(1, 0, 0), dir);
    }
    xAxis.normalize();
    const zAxis = Vector3.Cross(xAxis, dir).normalize();
    mesh.rotationQuaternion = Quaternion.RotationQuaternionFromAxis(xAxis, dir, zAxis);
  };

  return {
    sync: (sun, earth, moon) => {
      const s = sun.getAbsolutePosition();
      const e = earth.getAbsolutePosition();
      const m = moon.getAbsolutePosition();

      // Ombre = derrière le corps, dans le sens des rayons (loin du Soleil)
      const earthAway = e.subtract(s);
      if (earthAway.lengthSquared() > 1e-8) {
        syncCone(earthUmbra, e, earthAway, 3.5, 0.85, EARTH_CONE_HEIGHT);
      }

      const moonAway = m.subtract(s);
      if (moonAway.lengthSquared() > 1e-8) {
        const reach = Math.max(1.6, Vector3.Distance(m, e) * 0.95);
        syncCone(moonUmbra, m, moonAway, reach, 0.32, MOON_CONE_HEIGHT);
      }
    },
    setVisible: (visible) => {
      earthUmbra.setEnabled(visible);
      moonUmbra.setEnabled(visible);
    },
    setHighlight: (kind) => {
      if (kind === 'both' || kind === 'none') {
        earthMat.alpha = 0.3;
        moonMat.alpha = 0.32;
        return;
      }
      if (kind === 'solar') {
        moonMat.alpha = 0.45;
        earthMat.alpha = 0.14;
        return;
      }
      earthMat.alpha = 0.45;
      moonMat.alpha = 0.14;
    },
    dispose: () => {
      earthUmbra.dispose();
      moonUmbra.dispose();
      earthMat.dispose();
      moonMat.dispose();
    },
  };
}

/** Masque un mesh hors PiP (vue principale seulement). */
export function hideFromPip(mesh: AbstractMesh): void {
  mesh.layerMask = EARTH_MAIN_LAYER;
}
