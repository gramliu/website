import type { Collider } from "./math/aabb";
import type { Vec3 } from "./math/vec3";

export interface CellCoord {
  x: number;
  y: number;
  z: number;
}

export interface WorldBounds {
  min: CellCoord;
  max: CellCoord;
}

export type CollisionKind = "empty" | "solid" | "fluid";

export interface ContactFlags {
  east: boolean;
  west: boolean;
  north: boolean;
  south: boolean;
  up: boolean;
  down: boolean;
}

export interface ClippedAxes {
  x: boolean;
  y: boolean;
  z: boolean;
}

export interface MoveResult {
  grounded: boolean;
  landed: boolean;
  leftGround: boolean;
  steppedUp: boolean;
  contactFlags: ContactFlags;
  clipped: ClippedAxes;
}

export interface PlayerInputFrame {
  moveX: number;
  moveZ: number;
  jumpHeld: boolean;
  jumpPressed: boolean;
}

export interface PlayerStateSnapshot {
  position: Vec3;
  velocity: Vec3;
  facing: number;
  collider: Collider;
  grounded: boolean;
}

export function createContactFlags(): ContactFlags {
  return {
    east: false,
    west: false,
    north: false,
    south: false,
    up: false,
    down: false,
  };
}

export function createEmptyInputFrame(): PlayerInputFrame {
  return {
    moveX: 0,
    moveZ: 0,
    jumpHeld: false,
    jumpPressed: false,
  };
}
