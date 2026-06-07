export const CHUNK_SIZE_XZ = 16;
export const WORLD_MIN_Y = 0;
export const WORLD_MAX_Y = 32;

export interface ChunkCoord {
  chunkX: number;
  chunkZ: number;
}

export function floorDiv(value: number, size: number): number {
  return Math.floor(value / size);
}

export function worldToChunkCoord(x: number, z: number): ChunkCoord {
  return {
    chunkX: floorDiv(x, CHUNK_SIZE_XZ),
    chunkZ: floorDiv(z, CHUNK_SIZE_XZ),
  };
}

export function localCoord(value: number): number {
  return ((value % CHUNK_SIZE_XZ) + CHUNK_SIZE_XZ) % CHUNK_SIZE_XZ;
}

export function chunkKey(chunkX: number, chunkZ: number): string {
  return `${chunkX},${chunkZ}`;
}

export function chunkOrigin(chunkX: number, chunkZ: number): [number, number] {
  return [chunkX * CHUNK_SIZE_XZ, chunkZ * CHUNK_SIZE_XZ];
}
