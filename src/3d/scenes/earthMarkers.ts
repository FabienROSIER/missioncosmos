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
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';

export type EarthMarkerId = 'north-pole' | 'south-pole' | 'equator';

export type EarthMarkersHandle = {
  onPick: Observable<EarthMarkerId>;
  setVisible: (visible: boolean) => void;
  setHighlight: (id: EarthMarkerId | null) => void;
  setRecorded: (ids: EarthMarkerId[]) => void;
  /** Active le mode défi : clic sur la surface Terre près de la cible compte. */
  setSurfacePickEnabled: (enabled: boolean) => void;
  dispose: () => void;
};

function isTouchGameLayout(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_GAME_QUERY).matches;
}

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
  const touchLayout = isTouchGameLayout();
  // Doigts : marqueurs et bandes surface plus larges (desktop inchangé).
  const poleDiameter = radius * (touchLayout ? 0.28 : 0.12);
  const generousHits = touchLayout;

  const north = MeshBuilder.CreateSphere(
    'marker-north-pole',
    { diameter: poleDiameter, segments: 16 },
    scene,
  );
  north.parent = parent;
  north.rotation.x = Math.PI / 2;
  north.position = new Vector3(0, radius * 1.018, 0);
  north.metadata = { markerId: 'north-pole' satisfies EarthMarkerId };

  const south = MeshBuilder.CreateSphere(
    'marker-south-pole',
    { diameter: poleDiameter, segments: 16 },
    scene,
  );
  south.parent = parent;
  south.rotation.x = -Math.PI / 2;
  south.position = new Vector3(0, -radius * 1.018, 0);
  south.metadata = { markerId: 'south-pole' satisfies EarthMarkerId };

  const equator = createEquatorRing(scene, parent, radius, touchLayout);

  // A fine cartographic grid makes the globe's volume readable from every side.
  const gridPaths: Vector3[][] = [];
  for (const latitude of [-Math.PI / 6, Math.PI / 6]) {
    gridPaths.push(
      Array.from({ length: 73 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2;
        return new Vector3(
          Math.cos(a) * Math.cos(latitude),
          Math.sin(latitude),
          Math.sin(a) * Math.cos(latitude),
        ).scale(radius * 1.008);
      }),
    );
  }
  for (let meridian = 0; meridian < 6; meridian++) {
    const longitude = (meridian / 6) * Math.PI;
    gridPaths.push(
      Array.from({ length: 73 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2;
        return new Vector3(
          Math.cos(a) * Math.cos(longitude),
          Math.sin(a),
          Math.cos(a) * Math.sin(longitude),
        ).scale(radius * 1.008);
      }),
    );
  }
  const grid = MeshBuilder.CreateLineSystem('earth-survey-grid', { lines: gridPaths }, scene);
  grid.parent = parent;
  grid.color = new Color3(0.4, 0.8, 0.95);
  grid.alpha = 0.22;
  grid.isPickable = false;
  const axis = MeshBuilder.CreateDashedLines(
    'earth-rotation-axis',
    {
      points: [new Vector3(0, -radius * 1.4, 0), new Vector3(0, radius * 1.4, 0)],
      dashNb: 28,
      dashSize: 2,
      gapSize: 1,
    },
    scene,
  );
  axis.parent = parent;
  axis.color = new Color3(0.6, 0.85, 1);
  axis.isPickable = false;

  const poleMat = makeEmissiveMat(scene, 'pole-mat', new Color3(1, 0.58, 0.28), 0.72);
  const equatorMat = makeEmissiveMat(scene, 'equator-mat', new Color3(1, 0.78, 0.32), 0.55);
  const highlightPoleMat = makeEmissiveMat(scene, 'pole-hl-mat', new Color3(1, 0.82, 0.4), 0.95);
  const highlightEquatorMat = makeEmissiveMat(
    scene,
    'equator-hl-mat',
    new Color3(1, 0.9, 0.45),
    0.9,
  );

  const recordedMat = makeEmissiveMat(scene, 'earth-recorded-mat', new Color3(0.3, 1, 0.78), 0.85);
  let highlighted: EarthMarkerId | null = null;
  let recorded = new Set<EarthMarkerId>();
  const refreshMaterials = () => {
    north.material = recorded.has('north-pole')
      ? recordedMat
      : highlighted === 'north-pole'
        ? highlightPoleMat
        : poleMat;
    south.material = recorded.has('south-pole')
      ? recordedMat
      : highlighted === 'south-pole'
        ? highlightPoleMat
        : poleMat;
    equator.material = recorded.has('equator')
      ? recordedMat
      : highlighted === 'equator'
        ? highlightEquatorMat
        : equatorMat;
  };
  north.material = poleMat;
  south.material = poleMat;
  equator.material = equatorMat;

  for (const mesh of [north, south, equator]) {
    mesh.isPickable = true;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.renderingGroupId = 1;
    meshes.push(mesh);
  }

  let lastPickAt = 0;
  const emitPick = (id: EarthMarkerId) => {
    const now = performance.now();
    if (now - lastPickAt < 280) return;
    lastPickAt = now;
    onPick.notifyObservers(id);
  };

  const pickObserver = scene.onPointerObservable.add((info) => {
    const isPick =
      info.type === PointerEventTypes.POINTERPICK || info.type === PointerEventTypes.POINTERTAP;
    if (!isPick) return;
    if (!surfacePickEnabled) return;

    let picked = info.pickInfo?.pickedMesh ?? null;
    let point = info.pickInfo?.pickedPoint ?? null;
    if ((!picked || !point) && info.type === PointerEventTypes.POINTERTAP) {
      const retry = scene.pick(scene.pointerX, scene.pointerY);
      picked = retry?.pickedMesh ?? null;
      point = retry?.pickedPoint ?? null;
    }

    const directId = picked?.metadata?.markerId as EarthMarkerId | undefined;
    if (directId) {
      emitPick(directId);
      return;
    }

    if (!picked || !point) return;

    const onGlobe = globeMeshes.some((mesh) => mesh === picked || picked.isDescendantOf(parent));
    if (!onGlobe || meshes.includes(picked)) return;

    const region = classifyGlobeHit(parent, point, radius, { generous: generousHits });
    if (region) emitPick(region);
  });

  return {
    onPick,
    setVisible: (visible) => {
      grid.setEnabled(visible);
      axis.setEnabled(visible);
      for (const mesh of meshes) mesh.setEnabled(visible);
    },
    setHighlight: (id) => {
      highlighted = id;
      refreshMaterials();
      scalePulse(north as Mesh, id === 'north-pole');
      scalePulse(south as Mesh, id === 'south-pole');
      equator.scaling.setAll(id === 'equator' ? 1.06 : 1);
    },
    setSurfacePickEnabled: (enabled) => {
      surfacePickEnabled = enabled;
    },
    setRecorded: (ids) => {
      recorded = new Set(ids);
      refreshMaterials();
    },
    dispose: () => {
      grid.dispose();
      axis.dispose();
      scene.onPointerObservable.remove(pickObserver);
      onPick.clear();
      for (const mesh of meshes) mesh.dispose(false, true);
      poleMat.dispose();
      equatorMat.dispose();
      highlightPoleMat.dispose();
      highlightEquatorMat.dispose();
      recordedMat.dispose();
    },
  };
}

/** Anneau équatorial, légèrement au-dessus de la surface. */
function createEquatorRing(
  scene: Scene,
  parent: TransformNode,
  radius: number,
  touchLayout: boolean,
): Mesh {
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
      // Mobile : tube plus épais = cible tactile plus large.
      radius: radius * (touchLayout ? 0.045 : 0.014),
      tessellation: 8,
      cap: 0,
    },
    scene,
  );
  tube.parent = parent;
  tube.metadata = { markerId: 'equator' satisfies EarthMarkerId };
  return tube;
}

export type ClassifyGlobeHitOptions = {
  /** Bandes élargies pour doigt (mobile) — sans chevauchement pôles / équateur. */
  generous?: boolean;
};

/**
 * Classe un point monde sur le globe (repère local du pivot : Y = pôles).
 * Bandes assez larges pour le doigt, sans se chevaucher.
 */
export function classifyGlobeHit(
  pivot: TransformNode,
  worldPoint: Vector3,
  radius: number,
  options?: ClassifyGlobeHitOptions,
): EarthMarkerId | null {
  const inv = Matrix.Invert(pivot.getWorldMatrix());
  const local = Vector3.TransformCoordinates(worldPoint, inv);
  const y = local.y / Math.max(radius, 1e-6);

  // Desktop serré ; mobile : ~calotte polaire / bande tropicale élargies.
  const poleMin = options?.generous ? 0.5 : 0.72;
  const equatorMax = options?.generous ? 0.38 : 0.22;

  // Pôles d'abord (priorité sur la bande équateur)
  if (y > poleMin) return 'north-pole';
  if (y < -poleMin) return 'south-pole';
  if (Math.abs(y) < equatorMax) return 'equator';
  return null;
}

function makeEmissiveMat(scene: Scene, name: string, color: Color3, alpha = 1): StandardMaterial {
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
