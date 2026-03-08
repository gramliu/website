import type { Vec3 } from "./vec3";

export interface AABB {
  min: Vec3;
  max: Vec3;
}

export interface Collider {
  halfWidth: number;
  height: number;
}

export function createBodyAABB(position: Vec3, collider: Collider): AABB {
  return {
    min: {
      x: position.x - collider.halfWidth,
      y: position.y,
      z: position.z - collider.halfWidth,
    },
    max: {
      x: position.x + collider.halfWidth,
      y: position.y + collider.height,
      z: position.z + collider.halfWidth,
    },
  };
}

export function translateAABB(aabb: AABB, delta: Partial<Vec3>): AABB {
  const dx = delta.x ?? 0;
  const dy = delta.y ?? 0;
  const dz = delta.z ?? 0;

  return {
    min: {
      x: aabb.min.x + dx,
      y: aabb.min.y + dy,
      z: aabb.min.z + dz,
    },
    max: {
      x: aabb.max.x + dx,
      y: aabb.max.y + dy,
      z: aabb.max.z + dz,
    },
  };
}
