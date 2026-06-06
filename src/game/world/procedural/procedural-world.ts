import type { AABB } from "../../core/math/aabb";
import type { CellCoord, CollisionKind, WorldBounds } from "../../core/types";
import { COLLISION_EPSILON } from "../../rules/constants";
import {
  type BlockDefinition,
  getBlockDefinition,
  isBlockFluid,
  isBlockSolid,
} from "../block-registry";
import type { FluidAdjacency } from "../world";
import type { LoadedWorldCell } from "../world-loader";
import type { RenderableWorldQuery } from "../world-query";
import { columnIndex } from "./chunk";
import {
  CHUNK_SIZE_XZ,
  chunkOrigin,
  WORLD_MIN_Y,
  worldToChunkCoord,
} from "./chunk-coords";
import { ChunkStore } from "./chunk-store";
import {
  chunkChebyshevDistance,
  type LodBudget,
  PROCEDURAL_LOD_BUDGETS,
  type ProceduralRuntimeMode,
} from "./lod-policy";
import { TerrainGenerator } from "./terrain-generator";

const AIR = 0;
const STONE = 1;
const WATER = 9;

export interface ProceduralVoxelWorldOptions {
  seed?: number;
  mode?: ProceduralRuntimeMode;
  centerX?: number;
  centerZ?: number;
}

export interface SpawnColumn {
  x: number;
  y: number;
  z: number;
}

export class ProceduralVoxelWorld implements RenderableWorldQuery {
  private readonly generator: TerrainGenerator;
  private readonly store: ChunkStore;
  private mode: ProceduralRuntimeMode;
  private centerChunkX = 0;
  private centerChunkZ = 0;

  constructor(options: ProceduralVoxelWorldOptions = {}) {
    this.mode = options.mode ?? "preview";
    this.generator = new TerrainGenerator({ seed: options.seed });
    this.store = new ChunkStore({
      generator: this.generator,
      maxCachedChunks: this.budget.maxCachedChunks,
    });
    this.updateFocus(options.centerX ?? 0, options.centerZ ?? 0, this.mode);
  }

  public get budget(): LodBudget {
    return PROCEDURAL_LOD_BUDGETS[this.mode];
  }

  public updateFocus(
    x: number,
    z: number,
    mode: ProceduralRuntimeMode = this.mode
  ): boolean {
    const previousMode = this.mode;
    const previousChunkX = this.centerChunkX;
    const previousChunkZ = this.centerChunkZ;

    this.mode = mode;
    this.store.setMaxCachedChunks(this.budget.maxCachedChunks);

    const { chunkX, chunkZ } = worldToChunkCoord(Math.floor(x), Math.floor(z));
    this.centerChunkX = chunkX;
    this.centerChunkZ = chunkZ;
    const residentRenderRadius = Math.max(
      this.budget.highDetailRadius,
      this.budget.midDetailRadius
    );
    this.store.ensureWindow(chunkX, chunkZ, residentRenderRadius);
    this.store.retainWindow(chunkX, chunkZ, residentRenderRadius);

    return (
      previousMode !== mode ||
      previousChunkX !== chunkX ||
      previousChunkZ !== chunkZ
    );
  }

  public findSpawnColumn(x = 0, z = 0): SpawnColumn {
    const height = this.getHighestSolidCell(x, z) ?? WORLD_MIN_Y;
    return { x, y: height + 1, z };
  }

  public getBounds(): WorldBounds {
    const chunks = this.store.getLoadedChunks();
    if (chunks.length === 0) {
      return {
        min: { x: 0, y: WORLD_MIN_Y, z: 0 },
        max: { x: 0, y: WORLD_MIN_Y, z: 0 },
      };
    }

    let minX = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = WORLD_MIN_Y;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (const chunk of chunks) {
      const [originX, originZ] = chunkOrigin(chunk.chunkX, chunk.chunkZ);
      minX = Math.min(minX, originX);
      minZ = Math.min(minZ, originZ);
      maxX = Math.max(maxX, originX + CHUNK_SIZE_XZ - 1);
      maxY = Math.max(maxY, chunk.maxY);
      maxZ = Math.max(maxZ, originZ + CHUNK_SIZE_XZ - 1);
    }

    return {
      min: { x: minX, y: WORLD_MIN_Y, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    };
  }

  public getRenderableCells(): LoadedWorldCell[] {
    return this.getCellsForActiveWindow("full");
  }

  public getExposedRenderableCells(): LoadedWorldCell[] {
    return this.getCellsForActiveWindow("preview");
  }

  public getBlockIdAtCell(x: number, y: number, z: number): number {
    if (y < WORLD_MIN_Y) {
      return STONE;
    }

    const column = this.generator.getColumn(x, z);
    if (y <= column.height) {
      if (y === column.height) {
        return column.surfaceBlockId;
      }

      return y >= column.height - 3 ? column.subsurfaceBlockId : STONE;
    }

    if (column.fluidLevel !== null && y <= column.fluidLevel) {
      return WATER;
    }

    return AIR;
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
    return this.generator.getColumn(x, z).height;
  }

  public getOverlappingCells(aabb: AABB): CellCoord[] {
    const minX = Math.floor(aabb.min.x + COLLISION_EPSILON);
    const maxX = Math.floor(aabb.max.x - COLLISION_EPSILON);
    const minY = Math.floor(aabb.min.y + COLLISION_EPSILON);
    const maxY = Math.floor(aabb.max.y - COLLISION_EPSILON);
    const minZ = Math.floor(aabb.min.z + COLLISION_EPSILON);
    const maxZ = Math.floor(aabb.max.z - COLLISION_EPSILON);

    const cells: CellCoord[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          cells.push({ x, y, z });
        }
      }
    }

    return cells;
  }

  public collidesAABB(aabb: AABB): boolean {
    if (aabb.min.y < WORLD_MIN_Y) {
      return true;
    }

    this.ensureCollisionChunks(aabb);

    for (const cell of this.getOverlappingCells(aabb)) {
      if (this.isCellSolid(cell.x, cell.y, cell.z)) {
        return true;
      }
    }

    return false;
  }

  private getCellsForActiveWindow(
    detail: "full" | "preview"
  ): LoadedWorldCell[] {
    const cells: LoadedWorldCell[] = [];
    for (const chunk of this.store.getLoadedChunks()) {
      const distance = chunkChebyshevDistance(
        chunk.chunkX,
        chunk.chunkZ,
        this.centerChunkX,
        this.centerChunkZ
      );

      if (distance <= this.budget.highDetailRadius) {
        cells.push(...chunk.exposedCells);
        continue;
      }

      if (detail === "preview" && distance <= this.budget.midDetailRadius) {
        cells.push(
          ...this.getHeightmapSurfaceCells(chunk.chunkX, chunk.chunkZ)
        );
      }
    }

    return cells;
  }

  private getHeightmapSurfaceCells(
    chunkX: number,
    chunkZ: number
  ): LoadedWorldCell[] {
    const chunk = this.store.ensureChunk(chunkX, chunkZ);
    const [originX, originZ] = chunkOrigin(chunkX, chunkZ);
    const cells: LoadedWorldCell[] = [];

    for (let localZ = 0; localZ < CHUNK_SIZE_XZ; localZ++) {
      for (let localX = 0; localX < CHUNK_SIZE_XZ; localX++) {
        const index = columnIndex(localX, localZ);
        const x = originX + localX;
        const z = originZ + localZ;
        const y = chunk.heightmap[index];
        cells.push({ x, y, z, id: this.getBlockIdAtCell(x, y, z) });
      }
    }

    return cells;
  }

  private ensureCollisionChunks(aabb: AABB): void {
    const min = worldToChunkCoord(
      Math.floor(aabb.min.x),
      Math.floor(aabb.min.z)
    );
    const max = worldToChunkCoord(
      Math.floor(aabb.max.x),
      Math.floor(aabb.max.z)
    );

    for (let chunkZ = min.chunkZ; chunkZ <= max.chunkZ; chunkZ++) {
      for (let chunkX = min.chunkX; chunkX <= max.chunkX; chunkX++) {
        this.store.ensureChunk(chunkX, chunkZ);
      }
    }
  }
}
