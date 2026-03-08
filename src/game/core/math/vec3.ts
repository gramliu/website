export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

export function scaleVec3(vector: Vec3, scalar: number): Vec3 {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar,
  };
}

export function lengthSqXZ(vector: Vec3): number {
  return vector.x * vector.x + vector.z * vector.z;
}

export function normalizeXZ(vector: Vec3): Vec3 {
  const lengthSq = lengthSqXZ(vector);
  if (lengthSq === 0) {
    return vec3();
  }

  const length = Math.sqrt(lengthSq);
  return {
    x: vector.x / length,
    y: 0,
    z: vector.z / length,
  };
}
