import {
  Color3,
  Matrix,
  MeshBuilder,
  Observable,
  PointerEventTypes,
  StandardMaterial,
  Vector3,
  type AbstractMesh,
  type Mesh,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';

export type EarthMarkerId = 'north-pole' | 'south-pole' | 'equator';

export type EarthMarkersHandle = {
  onPick: Observable<EarthMarkerId>;
  setVisible: (visible: boolean) => void;
  setHighlight: (id: EarthMarkerId | null) => void;
  /** Active le mode défi : clic sur la surface Terre près de la cible compte. */
  setSurfacePickEnabled: (enabled: boolean) => void;
  dispose: () => void;
};

/**
 * Repères pédagogiques : pôles + équateur (plan XZ local, axe Y = pôles).
 * Style discret / graphique — mis en avant seulement pendant les défis.
 */
export function createEarthMarkers(
  scene: Scene,
  parent: TransformNode,
  radius = 1,
  globeMeshes: AbstractMesh[] = [],
): EarthMarkersHandle {
  const onPick = new Observable<EarthMarkerId>();
  const meshes: AbstractMesh[] = [];
  let surfacePickEnabled = false;

  const north = MeshBuilder.CreateDisc(
    'marker-north-pole',
    { radius: radius * 0.048, tessellation: 28 },
    scene,
  );
  north.parent = parent;
  north.rotation.x = Math.PI / 2;
  north.position = new Vector3(0, radius * 1.018, 0);
  north.metadata = { markerId: 'north-pole' satisfies EarthMarkerId };

  const south = MeshBuilder.CreateDisc(
    'marker-south-pole',
    { radius: radius * 0.048, tessellation: 28 },
    scene,
  );
  south.parent = parent;
  south.rotation.x = -Math.PI / 2;
  south.position = new Vector3(0, -radius * 1.018, 0);
  south.metadata = { markerId: 'south-pole' satisfies EarthMarkerId };

  const equator = createEquatorRing(scene, parent, radius);

  const poleMat = makeEmissiveMat(scene, 'pole-mat', new Color3(1, 0.58, 0.28), 0.72);
  const equatorMat = makeEmissiveMat(scene, 'equator-mat', new Color3(1, 0.78, 0.32), 0.55);
  const highlightPoleMat = makeEmissiveMat(scene, 'pole-hl-mat', new Color3(1, 0.82, 0.4), 0.95);
  const highlightEquatorMat = makeEmissiveMat(scene, 'equator-hl-mat', new Color3(1, 0.9, 0.45), 0.9);

  north.material = poleMat;
  south.material = poleMat;
  equator.material = equatorMat;

  for (const mesh of [north, south, equator]) {
    mesh.isPickable = true;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.renderingGroupId = 1;
    meshes.push(mesh);
  }

  const pickObserver = scene.onPointerObservable.add((info) => {
    if (info.type !== PointerEventTypes.POINTERPICK) return;

    const directId = info.pickInfo?.pickedMesh?.metadata?.markerId as EarthMarkerId | undefined;
    if (directId) {
      onPick.notifyObservers(directId);
      return;
    }

    if (!surfacePickEnabled) return;

    const picked = info.pickInfo?.pickedMesh;
    const point = info.pickInfo?.pickedPoint;
    if (!picked || !point) return;

    const onGlobe = globeMeshes.some(
      (mesh) => mesh === picked || picked.isDescendantOf(parent),
    );
    if (!onGlobe || meshes.includes(picked)) return;

    const region = classifyGlobeHit(parent, point, radius);
    if (region) onPick.notifyObservers(region);
  });

  return {
    onPick,
    setVisible: (visible) => {
      for (const mesh of meshes) mesh.setEnabled(visible);
    },
    setHighlight: (id) => {
      north.material = id === 'north-pole' ? highlightPoleMat : poleMat;
      south.material = id === 'south-pole' ? highlightPoleMat : poleMat;
      equator.material = id === 'equator' ? highlightEquatorMat : equatorMat;
      scalePulse(north as Mesh, id === 'north-pole');
      scalePulse(south as Mesh, id === 'south-pole');
      equator.scaling.setAll(id === 'equator' ? 1.06 : 1);
    },
    setSurfacePickEnabled: (enabled) => {
      surfacePickEnabled = enabled;
    },
    dispose: () => {
      scene.onPointerObservable.remove(pickObserver);
      onPick.clear();
      for (const mesh of meshes) mesh.dispose(false, true);
      poleMat.dispose();
      equatorMat.dispose();
      highlightPoleMat.dispose();
      highlightEquatorMat.dispose();
    },
  };
}

/** Anneau équatorial fin, légèrement au-dessus de la surface. */
function createEquatorRing(scene: Scene, parent: TransformNode, radius: number): Mesh {
  const ringRadius = radius * 1.022;
  const path: Vector3[] = [];
  const segments = 96;
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    path.push(new Vector3(Math.cos(a) * ringRadius, 0, Math.sin(a) * ringRadius));
  }

  const tube = MeshBuilder.CreateTube(
    'marker-equator',
    {
      path,
      radius: radius * 0.014,
      tessellation: 8,
      cap: 0,
    },
    scene,
  );
  tube.parent = parent;
  tube.metadata = { markerId: 'equator' satisfies EarthMarkerId };
  return tube;
}

/**
 * Classe un point monde sur le globe (repère local du pivot : Y = pôles).
 * Bandes assez larges pour le doigt, sans se chevaucher.
 */
export function classifyGlobeHit(
  pivot: TransformNode,
  worldPoint: Vector3,
  radius: number,
): EarthMarkerId | null {
  const inv = Matrix.Invert(pivot.getWorldMatrix());
  const local = Vector3.TransformCoordinates(worldPoint, inv);
  const y = local.y / Math.max(radius, 1e-6);

  // Pôles d'abord (priorité sur la bande équateur)
  if (y > 0.72) return 'north-pole';
  if (y < -0.72) return 'south-pole';
  if (Math.abs(y) < 0.22) return 'equator';
  return null;
}

function makeEmissiveMat(
  scene: Scene,
  name: string,
  color: Color3,
  alpha = 1,
): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.disableLighting = true;
  mat.emissiveColor = color;
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.alpha = alpha;
  if (alpha < 1) {
    mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
    mat.backFaceCulling = false;
  }
  return mat;
}

function scalePulse(mesh: Mesh, active: boolean): void {
  mesh.scaling.setAll(active ? 1.35 : 1);
}
