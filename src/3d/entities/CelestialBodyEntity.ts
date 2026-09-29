import {
  Animation,
  Color3,
  HighlightLayer,
  Mesh,
  Observable,
  PointerEventTypes,
  Quaternion,
  Vector3,
  type AbstractMesh,
  type Observer,
  type PointerInfo,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import { loadCelestialBody, type LoadedCelestialBody } from '@/3d/entities/loadCelestialBody';
import { prefersReducedMotion } from '@/lib/motion';
import type { CelestialBodyDefinition } from '@/types/celestial';

export type CelestialBodyEntityOptions = {
  definition: CelestialBodyDefinition;
  position?: Vector3;
  /** Active la rotation axiale continue (défaut true ; off si reduced-motion). */
  spin?: boolean;
};

/**
 * Abstraction corps céleste : données scientifiques séparées du mesh.
 */
export class CelestialBodyEntity {
  readonly definition: CelestialBodyDefinition;
  readonly onPick = new Observable<CelestialBodyEntity>();

  private loaded!: LoadedCelestialBody;
  private highlight?: HighlightLayer;
  private selected = false;
  private highlighted = false;
  private spinObserver: Observer<Scene> | null = null;
  private pickObserver: Observer<PointerInfo> | null = null;
  private disposed = false;

  private constructor(
    private readonly scene: Scene,
    definition: CelestialBodyDefinition,
  ) {
    this.definition = definition;
  }

  static async create(
    scene: Scene,
    options: CelestialBodyEntityOptions,
  ): Promise<CelestialBodyEntity> {
    const entity = new CelestialBodyEntity(scene, options.definition);
    await entity.init(options);
    return entity;
  }

  get pivot(): TransformNode {
    return this.loaded.pivot;
  }

  get meshes(): AbstractMesh[] {
    return this.loaded.meshes;
  }

  get isSelected(): boolean {
    return this.selected;
  }

  private async init(options: CelestialBodyEntityOptions): Promise<void> {
    const { visual, scientific } = this.definition;
    this.loaded = await loadCelestialBody(this.scene, visual.bodyId, visual.visualRadius);

    const tilt = ((scientific.axialTiltDeg ?? 0) * Math.PI) / 180;
    // Obliquité via quaternion seulement si nécessaire.
    // Sinon laisser rotationQuaternion = null pour que l’Euler (tidal lock) fonctionne.
    if (Math.abs(tilt) > 1e-6) {
      this.loaded.pivot.rotationQuaternion = Quaternion.RotationAxis(Vector3.Forward(), tilt);
      this.loaded.pivot.rotation.setAll(0);
    } else {
      this.loaded.pivot.rotationQuaternion = null;
      this.loaded.pivot.rotation.setAll(0);
    }

    if (options.position) {
      this.loaded.pivot.position.copyFrom(options.position);
    }

    // Contour externe seulement — jamais de glow intérieur (masque la texture)
    this.highlight = new HighlightLayer(`hl-${this.definition.id}`, this.scene, {
      blurHorizontalSize: 0.35,
      blurVerticalSize: 0.35,
    });
    this.highlight.innerGlow = false;
    this.highlight.outerGlow = true;

    this.pickObserver = this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return;
      const picked = pointerInfo.pickInfo?.pickedMesh;
      if (!picked) return;
      // Ignorer les marqueurs pédagogiques (enfants du pivot)
      if (picked.metadata?.markerId) return;
      const hit = this.loaded.meshes.some(
        (mesh) => mesh === picked || picked.isDescendantOf(this.loaded.pivot),
      );
      if (hit) {
        this.onPick.notifyObservers(this);
      }
    });

    const allowSpin = options.spin !== false && !prefersReducedMotion();
    if (allowSpin) {
      this.setSpinning(true);
    }
  }

  setSpinning(enabled: boolean): void {
    if (this.spinObserver) {
      this.scene.onBeforeRenderObservable.remove(this.spinObserver);
      this.spinObserver = null;
    }
    if (!enabled) return;

    const factor = this.definition.visual.spinSpeedFactor ?? 1;
    const radPerSec = 0.15 * factor;
    this.spinObserver = this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.scene.getEngine().getDeltaTime() / 1000;
      this.loaded.pivot.rotate(Vector3.Up(), radPerSec * dt);
    });
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    this.applyHighlight();
  }

  setHighlighted(highlighted: boolean): void {
    this.highlighted = highlighted;
    this.applyHighlight();
  }

  private applyHighlight(): void {
    if (!this.highlight) return;
    for (const mesh of this.loaded.meshes) {
      if (!(mesh instanceof Mesh)) continue;
      this.highlight.removeMesh(mesh);
      // Sélection : pas de surbrillance (caméra déjà cadrée). Flash discret = feedback temporaire.
      if (this.highlighted) {
        this.highlight.addMesh(mesh, new Color3(0.4, 0.55, 0.7));
      }
    }
  }

  async playAppear(): Promise<void> {
    if (prefersReducedMotion()) return;
    const pivot = this.loaded.pivot;
    const target = pivot.scaling.clone();
    if (target.lengthSquared() < 1e-8) {
      target.setAll(1);
    }
    pivot.scaling.setAll(0.01);
    try {
      await animateScaling(pivot, pivot.scaling.clone(), target, 24);
    } finally {
      // Garantit une taille visible même si l'anim est interrompue
      pivot.scaling.copyFrom(target);
    }
  }

  async playDisappear(): Promise<void> {
    if (prefersReducedMotion()) {
      this.loaded.pivot.setEnabled(false);
      return;
    }
    const pivot = this.loaded.pivot;
    const from = pivot.scaling.clone();
    await animateScaling(pivot, from, new Vector3(0.01, 0.01, 0.01), 20);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.spinObserver) {
      this.scene.onBeforeRenderObservable.remove(this.spinObserver);
    }
    if (this.pickObserver) {
      this.scene.onPointerObservable.remove(this.pickObserver);
    }
    this.onPick.clear();
    this.highlight?.dispose();
    this.loaded.dispose();
  }
}

function animateScaling(
  node: TransformNode,
  from: Vector3,
  to: Vector3,
  frames: number,
): Promise<void> {
  return new Promise((resolve) => {
    const scene = node.getScene();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      node.scaling.copyFrom(to);
      resolve();
    };

    const anim = new Animation(
      `scale-${node.name}`,
      'scaling',
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );
    anim.setKeys([
      { frame: 0, value: from },
      { frame: frames, value: to },
    ]);
    scene.beginDirectAnimation(node, [anim], 0, frames, false, 1, finish);

    // Filet de sécurité si la render loop est absente / scène disposée
    window.setTimeout(finish, (frames / 60) * 1000 + 500);
  });
}
