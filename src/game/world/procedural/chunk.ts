import type { LoadedWorldCell } from "../world-loader";
import { CHUNK_SIZE_XZ, WORLD_MAX_Y, WORLD_MIN_Y } from "./chunk-coords";

export type BiomeId = "grassland" | "beach" | "shallows" | "rocky";

export interface GeneratedColumn {
  height: number;
  biome: BiomeId;
  surfaceBlockId: number;
  subsurfaceBlockId: number;
  fluidLevel: number | null;
}

export interface VoxelChunk {
  chunkX: number;
  chunkZ: number;
  minY: number;
  maxY: number;
  cells: LoadedWorldCell[];
  exposedCells: LoadedWorldCell[];
  heightmap: Int16Array;
  biomes: BiomeId[];
  generatedAt: number;
  lastAccessedAt: number;
}

export function columnIndex(localX: number, localZ: number): number {
  return localZ * CHUNK_SIZE_XZ + localX;
}

export function createEmptyHeightmap(): Int16Array {
  return new Int16Array(CHUNK_SIZE_XZ * CHUNK_SIZE_XZ).fill(WORLD_MIN_Y);
}

export function clampWorldY(y: number): number {
  return Math.max(WORLD_MIN_Y, Math.min(WORLD_MAX_Y, y));
}
