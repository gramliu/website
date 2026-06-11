import type { AABB } from "../core/math/aabb";
import type { CellCoord, CollisionKind } from "../core/types";
import {
  type BlockDefinition,
  getBlockDefinition,
  isBlockFluid,
  isBlockSolid,
} from "./block-registry";
import {
  MAX_GENERATED_HEIGHT,
  type TerrainGenerator,
} from "./terrain-generator";
import {
  type FluidAdjacency,
  getCellsOverlappingAABB,
  type WorldQuery,
} from "./world";
import type { LoadedWorldCell } from "./world-loader";

export const CHUNK_SIZE = 8;

interface GeneratedChunk {
  cells: LoadedWorldCell[];
}

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function toChunkCoord(coord: number): number {
  return Math.floor(coord / CHUNK_SIZE);
}

/**
 * Unbounded procedurally generated world. Chunks are generated lazily (and
 * deterministically) on first access and cached for the session. Queries are
 * synchronous: touching an ungenerated chunk generates it on the spot, so
 * collision and rendering can never observe a hole; `prefetchAround` keeps a
 * ring of chunks generated ahead of the player so that synchronous fallback
 * rarely happens on the render path.
 */
export class InfiniteWorld implements WorldQuery {
  private readonly blockIds = new Map<string, number>();
  private readonly chunks = new Map<string, GeneratedChunk>();
  private readonly generator: TerrainGenerator;

  constructor(generator: TerrainGenerator) {
    this.generator = generator;
  }

  private ensureChunk(cx: number, cz: number): GeneratedChunk {
    const key = chunkKey(cx, cz);
    const existing = this.chunks.get(key);
    if (existing) {
      return existing;
    }

    const cells = this.generator.generateChunkCells(
      cx * CHUNK_SIZE,
      cz * CHUNK_SIZE,
      CHUNK_SIZE
    );
    for (const cell of cells) {
      this.blockIds.set(cellKey(cell.x, cell.y, cell.z), cell.id);
    }

    const chunk: GeneratedChunk = { cells };
    this.chunks.set(key, chunk);
    return chunk;
  }

  public hasChunk(cx: number, cz: number): boolean {
    return this.chunks.has(chunkKey(cx, cz));
  }

  /**
   * Generates up to `budget` missing chunks within `radius` blocks of the
   * given position, nearest first. Returns the number of chunks generated.
   */
  public prefetchAround(
    centerX: number,
    centerZ: number,
    radius: number,
    budget: number
  ): number {
    const minCx = toChunkCoord(centerX - radius);
    const maxCx = toChunkCoord(centerX + radius);
    const minCz = toChunkCoord(centerZ - radius);
    const maxCz = toChunkCoord(centerZ + radius);
    const playerCx = toChunkCoord(centerX);
    const playerCz = toChunkCoord(centerZ);

    const missing: { cx: number; cz: number; distance: number }[] = [];
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        if (!this.hasChunk(cx, cz)) {
          missing.push({
            cx,
            cz,
            distance: Math.max(
              Math.abs(cx - playerCx),
              Math.abs(cz - playerCz)
            ),
          });
        }
      }
    }

    missing.sort((a, b) => a.distance - b.distance);

    const count = Math.min(budget, missing.length);
    for (let i = 0; i < count; i++) {
      this.ensureChunk(missing[i].cx, missing[i].cz);
    }

    return count;
  }

  public getGroundHeight(x: number, z: number): number {
    return this.generator.getGroundHeight(x, z);
  }

  public getBlockIdAtCell(x: number, y: number, z: number): number {
    if (y < 0 || y > MAX_GENERATED_HEIGHT) {
      return 0;
    }
    this.ensureChunk(toChunkCoord(x), toChunkCoord(z));
    return this.blockIds.get(cellKey(x, y, z)) ?? 0;
  }

  public getBlockAtCell(x: number, y: number, z: number): BlockDefinition {
    return getBlockDefinition(this.getBlockIdAtCell(x, y, z));
  }

  public getCollisionKind(x: number, y: number, z: number): CollisionKind {
    return this.getBlockAtCell(x, y, z).collisionKind;
  }

  public isCellSolid(x: number, y: number, z: number): boolean {
    return isBlockSolid(this.getBlockIdAtCell(x, y, z));
  }

  public isCellFluid(x: number, y: number, z: number): boolean {
    return isBlockFluid(this.getBlockIdAtCell(x, y, z));
  }

  public getFluidAdjacency(x: number, y: number, z: number): FluidAdjacency {
    return {
      top: this.isCellFluid(x, y + 1, z),
      bottom: this.isCellFluid(x, y - 1, z),
      north: this.isCellFluid(x, y, z - 1),
      south: this.isCellFluid(x, y, z + 1),
      east: this.isCellFluid(x + 1, y, z),
      west: this.isCellFluid(x - 1, y, z),
    };
  }

  public getHighestSolidCell(x: number, z: number): number | null {
    for (let y = MAX_GENERATED_HEIGHT; y >= 0; y--) {
      if (this.isCellSolid(x, y, z)) {
        return y;
      }
    }

    return null;
  }

  public getOverlappingCells(aabb: AABB): CellCoord[] {
    return getCellsOverlappingAABB(aabb);
  }

  public collidesAABB(aabb: AABB): boolean {
    // No lateral fence: the world is infinite. Only the bedrock floor remains.
    if (aabb.min.y < 0) {
      return true;
    }

    for (const cell of this.getOverlappingCells(aabb)) {
      if (this.isCellSolid(cell.x, cell.y, cell.z)) {
        return true;
      }
    }

    return false;
  }

  /** A cell is hidden when boxed in by opaque solid neighbors on all sides. */
  private isCellExposed(x: number, y: number, z: number): boolean {
    const neighbors: [number, number, number][] = [
      [x + 1, y, z],
      [x - 1, y, z],
      [x, y + 1, z],
      [x, y - 1, z],
      [x, y, z + 1],
      [x, y, z - 1],
    ];

    for (const [nx, ny, nz] of neighbors) {
      if (ny < 0) {
        continue;
      }
      const definition = getBlockDefinition(
        this.blockIds.get(cellKey(nx, ny, nz)) ?? 0
      );
      if (!definition.solid || definition.transparent) {
        return true;
      }
    }

    return false;
  }

  /**
   * Renderable cells within a square window (Chebyshev radius) centered on a
   * cell, with interior culling: fully enclosed cells are skipped so the mesh
   * count stays proportional to the visible surface.
   */
  public getCellsInWindow(
    centerX: number,
    centerZ: number,
    radius: number
  ): LoadedWorldCell[] {
    const minX = centerX - radius;
    const maxX = centerX + radius;
    const minZ = centerZ - radius;
    const maxZ = centerZ + radius;

    // Ensure the window plus a 1-cell ring exists so exposure checks are valid.
    const minCx = toChunkCoord(minX - 1);
    const maxCx = toChunkCoord(maxX + 1);
    const minCz = toChunkCoord(minZ - 1);
    const maxCz = toChunkCoord(maxZ + 1);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        this.ensureChunk(cx, cz);
      }
    }

    const cells: LoadedWorldCell[] = [];
    for (let cx = toChunkCoord(minX); cx <= toChunkCoord(maxX); cx++) {
      for (let cz = toChunkCoord(minZ); cz <= toChunkCoord(maxZ); cz++) {
        for (const cell of this.ensureChunk(cx, cz).cells) {
          if (
            cell.x < minX ||
            cell.x > maxX ||
            cell.z < minZ ||
            cell.z > maxZ
          ) {
            continue;
          }
          if (this.isCellExposed(cell.x, cell.y, cell.z)) {
            cells.push(cell);
          }
        }
      }
    }

    return cells;
  }
}
