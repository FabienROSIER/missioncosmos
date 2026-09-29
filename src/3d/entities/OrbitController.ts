import { Vector3, type Observer, type Scene, type TransformNode } from '@babylonjs/core';

export type OrbitParams = {
  /** Centre de l'orbite (ex. Soleil / Terre). */
  center: TransformNode | Vector3;
  /** Demi-grand axe visuel (unités scène). */
  radius: number;
  /** Angle initial (radians). */
  startAngle?: number;
  /**
   * Sens horaire vu du pôle +Y (true = horaire).
   * Défaut false = antihoraire (prograde vu du nord).
   */
  clockwise?: boolean;
  /** Vitesses pédagogiques (rad/s). */
  angularSpeed?: number;
  /**
   * Verrouillage gravitationnel : la même face reste tournée vers le centre.
   */
  tidalLock?: boolean;
  /**
   * Décalage yaw (rad) pour aligner la face « proche » du modèle GLB.
   * 0 = +Z local vers le centre.
   */
  facingOffsetRad?: number;
  /**
   * Inclinaison de l’orbite (rad) autour de l’axe X local — pour montrer
   * pourquoi les éclipses ne sont pas mensuelles.
   */
  inclinationRad?: number;
};

/**
 * Orbite circulaire simplifiée (représentation visuelle, pas simulation N-corps).
 */
export class OrbitController {
  private angle: number;
  private inclination: number;
  private observer: Observer<Scene> | null = null;
  private disposed = false;

  constructor(
    private readonly scene: Scene,
    private readonly body: TransformNode,
    private readonly params: OrbitParams,
  ) {
    this.angle = params.startAngle ?? 0;
    this.inclination = params.inclinationRad ?? 0;
    this.applyPosition();
  }

  /** Signe du sens d’orbite (+1 antihoraire vu +Y, −1 horaire). */
  getDirectionSign(): number {
    return this.params.clockwise ? -1 : 1;
  }

  start(): void {
    if (this.observer || this.disposed) return;
    const speed = this.params.angularSpeed ?? 0.12;
    const sign = this.getDirectionSign();
    this.observer = this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.scene.getEngine().getDeltaTime() / 1000;
      this.angle += sign * speed * dt;
      this.applyPosition();
    });
  }

  stop(): void {
    if (this.observer) {
      this.scene.onBeforeRenderObservable.remove(this.observer);
      this.observer = null;
    }
  }

  setAngle(angle: number): void {
    this.angle = angle;
    this.applyPosition();
  }

  /**
   * Déplacement depuis un swipe horizontal (dx > 0 = doigt vers la droite).
   * Respecte le sens d’orbite configuré.
   */
  nudgeFromSwipe(dx: number): void {
    this.setAngle(this.angle + this.getDirectionSign() * dx);
  }

  getAngle(): number {
    return this.angle;
  }

  /** Incline l’orbite (rad). 0 = plan XZ. */
  setInclination(radians: number): void {
    this.inclination = radians;
    this.applyPosition();
  }

  getInclination(): number {
    return this.inclination;
  }

  private resolveCenter(): Vector3 {
    return this.params.center instanceof Vector3
      ? this.params.center
      : this.params.center.getAbsolutePosition();
  }

  private applyPosition(): void {
    const center = this.resolveCenter();
    const r = this.params.radius;
    const c = Math.cos(this.angle);
    const s = Math.sin(this.angle);
    const i = this.inclination;
    // Plan incliné autour de X : Y sort du plan quand i ≠ 0
    this.body.position.set(
      center.x + c * r,
      center.y + s * Math.sin(i) * r,
      center.z + s * Math.cos(i) * r,
    );

    if (this.params.tidalLock) {
      this.applyTidalLock(center);
    }
  }

  /** Même face vers la Terre : yaw uniquement, pivot droit. */
  private applyTidalLock(center: Vector3): void {
    const pos = this.body.position;
    const dx = center.x - pos.x;
    const dz = center.z - pos.z;
    // Un quaternion actif (obliquité) ignore rotation.y — forcer l’Euler pour le lock.
    this.body.rotationQuaternion = null;
    this.body.rotation.x = 0;
    this.body.rotation.z = 0;
    // +Z local pointe vers le centre (Terre)
    this.body.rotation.y = Math.atan2(dx, dz) + (this.params.facingOffsetRad ?? 0);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
  }
}
