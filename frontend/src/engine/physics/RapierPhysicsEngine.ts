// ============================================================================
// AlgoArena v5.0 - Rapier.js Dynamic Physics & Destructible Hazards (Section 3)
// Real-time 3D rigid-body simulation for collapsing barriers and physical debris
// ============================================================================

import RAPIER from '@dimforge/rapier3d-compat';

export interface PhysicalBodyState {
  id: number;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  rw: number;
}

export class RapierPhysicsEngine {
  private world: RAPIER.World | null = null;
  private rigidBodies: RAPIER.RigidBody[] = [];
  private isInitialized = false;

  public async initPhysics(): Promise<boolean> {
    if (this.isInitialized && this.world) return true;

    try {
      await RAPIER.init();
      const gravity = { x: 0.0, y: -9.81, z: 0.0 };
      this.world = new RAPIER.World(gravity);
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('[RapierPhysicsEngine]: WASM Physics initialization fallback', err);
      return false;
    }
  }

  public createStaticFloor(width = 50, depth = 50) {
    if (!this.world) return;
    const floorDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.5, 0);
    const floorBody = this.world.createRigidBody(floorDesc);
    const floorCollider = RAPIER.ColliderDesc.cuboid(width / 2, 0.5, depth / 2);
    this.world.createCollider(floorCollider, floorBody);
  }

  public spawnDestructibleBarrier(x: number, y: number, z: number): number | null {
    if (!this.world) return null;

    // Create dynamic rigid body for falling barrier block
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
    const body = this.world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setRestitution(0.3);
    this.world.createCollider(colliderDesc, body);
    this.rigidBodies.push(body);

    return body.handle;
  }

  public stepPhysics(_deltaTime = 1 / 60) {
    if (this.world) {
      this.world.step();
    }
  }

  public getBodyTranslations(): PhysicalBodyState[] {
    return this.rigidBodies.map((body, idx) => {
      const t = body.translation();
      const r = body.rotation();
      return {
        id: idx,
        x: t.x,
        y: t.y,
        z: t.z,
        rx: r.x,
        ry: r.y,
        rz: r.z,
        rw: r.w,
      };
    });
  }

  public getRigidBodyCount(): number {
    return this.rigidBodies.length;
  }

  public isReady(): boolean {
    return this.isInitialized && this.world !== null;
  }

  public resetPhysics() {
    if (this.world) {
      this.rigidBodies.forEach((body) => {
        try {
          this.world?.removeRigidBody(body);
        } catch {
          // ignore cleanup errors
        }
      });
      this.rigidBodies = [];
    }
  }
}
