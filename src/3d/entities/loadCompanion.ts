import {
  AnimationGroup,
  SceneLoader,
  TransformNode,
  Vector3,
  type AbstractMesh,
  type Scene,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { COMPANION_3D_URL } from '@/lib/assets/paths';

export type CompanionClip =
  | 'idle'
  | 'agree'
  | 'cheer'
  | 'confused'
  | 'walk'
  | 'run'
  | 'rest';

const CLIP_NAMES: Record<CompanionClip, string> = {
  idle: 'Idle_11',
  agree: 'Agree_Gesture',
  cheer: 'Cheer_with_Both_Hands_Up',
  confused: 'Confused_Scratch',
  walk: 'Walking',
  run: 'Running',
  rest: 'restpose',
};

export type LoadedCompanion = {
  pivot: TransformNode;
  meshes: AbstractMesh[];
  /** Hauteur approximative du modèle à l’échelle 1 (monde local). */
  sourceHeight: number;
  play: (clip: CompanionClip, loop?: boolean) => void;
  stop: () => void;
  dispose: () => void;
};

/**
 * Charge le GLB compagnon (skinned + AnimationGroups).
 * `targetHeight` : hauteur souhaitée en unités scène (pieds → tête).
 */
export async function loadCompanion(
  scene: Scene,
  targetHeight = 0.1,
  url: string = COMPANION_3D_URL,
): Promise<LoadedCompanion> {
  const slash = url.lastIndexOf('/');
  const rootUrl = slash >= 0 ? url.slice(0, slash + 1) : '/';
  const fileName = slash >= 0 ? url.slice(slash + 1) : url;

  const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
  const pivot = new TransformNode('companion-pivot', scene);

  for (const mesh of result.meshes) {
    if (!mesh.parent) mesh.parent = pivot;
  }
  for (const node of result.transformNodes) {
    if (!node.parent) node.parent = pivot;
  }
  for (const skeleton of result.skeletons) {
    void skeleton;
  }

  // Mesure hauteur source (avant scale)
  let minY = Infinity;
  let maxY = -Infinity;
  for (const mesh of result.meshes) {
    if (!mesh.getBoundingInfo) continue;
    mesh.computeWorldMatrix(true);
    const bi = mesh.getBoundingInfo();
    minY = Math.min(minY, bi.boundingBox.minimumWorld.y);
    maxY = Math.max(maxY, bi.boundingBox.maximumWorld.y);
  }
  const sourceHeight = Number.isFinite(minY) && maxY > minY ? maxY - minY : 1;
  const scale = targetHeight / Math.max(sourceHeight, 1e-4);
  pivot.scaling.setAll(scale);

  const groups = new Map<CompanionClip, AnimationGroup>();
  for (const group of result.animationGroups) {
    group.stop();
    for (const [clip, name] of Object.entries(CLIP_NAMES) as [CompanionClip, string][]) {
      if (group.name === name) groups.set(clip, group);
    }
  }

  let active: AnimationGroup | null = null;

  const stop = () => {
    if (active) {
      active.stop();
      active = null;
    }
  };

  const play = (clip: CompanionClip, loop = clip === 'idle' || clip === 'walk' || clip === 'run') => {
    const next = groups.get(clip) ?? groups.get('idle') ?? groups.get('rest');
    if (!next) return;
    stop();
    next.loopAnimation = loop;
    next.start(loop, 1.0, next.from, next.to, false);
    active = next;
    if (!loop) {
      next.onAnimationEndObservable.addOnce(() => {
        if (active === next) {
          active = null;
          play('idle', true);
        }
      });
    }
  };

  return {
    pivot,
    meshes: result.meshes,
    sourceHeight,
    play,
    stop,
    dispose: () => {
      stop();
      for (const group of result.animationGroups) group.dispose();
      for (const mesh of result.meshes) mesh.dispose(false, true);
      for (const node of result.transformNodes) node.dispose();
      for (const sk of result.skeletons) sk.dispose();
      pivot.dispose();
    },
  };
}
