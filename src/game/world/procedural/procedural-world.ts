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
import { WORLD_MIN_Y, worldToChunkCoord } from "./chunk-coords";
import { ChunkStore } from "./chunk-store";
import {
  FULL_DETAIL_SIZE_XZ,
  type LodBudget,
  PROCEDURAL_LOD_BUDGETS,
  type ProceduralRuntimeMode,
} from "./lod-policy";
import { StarterRegion } from "./starter-region";
import { TerrainGenerator } from "./terrain-generator";

const STONE = 1;

export interface ProceduralVoxelWorldOptions {
  seed?: number;
  mode?: ProceduralRuntimeMode;
  centerX?: number;
  centerZ?: number;
  seedCells?: LoadedWorldCell[];
  starterRegion?: StarterRegion;
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
  private focusCellX = 0;
  private focusCellZ = 0;
  private readonly previewFocusCellX: number;
  private readonly previewFocusCellZ: number;

  constructor(options: ProceduralVoxelWorldOptions = {}) {
    this.mode = options.mode ?? "preview";
    this.previewFocusCellX = Math.floor(options.centerX ?? 0);
    this.previewFocusCellZ = Math.floor(options.centerZ ?? 0);
    this.generator = new TerrainGenerator({
      seed: options.seed,
      starterRegion:
        options.starterRegion ??
        (options.seedCells ? new StarterRegion(options.seedCells) : undefined),
    });
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
    const previousFocusCellX = this.focusCellX;
    const previousFocusCellZ = this.focusCellZ;

    this.mode = mode;
    this.store.setMaxCachedChunks(this.budget.maxCachedChunks);

    this.focusCellX =
      mode === "preview" ? this.previewFocusCellX : Math.floor(x);
    this.focusCellZ =
      mode === "preview" ? this.previewFocusCellZ : Math.floor(z);
    const { chunkX, chunkZ } = worldToChunkCoord(
      this.focusCellX,
      this.focusCellZ
    );
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
      previousChunkZ !== chunkZ ||
      previousFocusCellX !== this.focusCellX ||
      previousFocusCellZ !== this.focusCellZ
    );
  }

  public findSpawnColumn(x = 0, z = 0): SpawnColumn {
    const height = this.getHighestSolidCell(x, z) ?? WORLD_MIN_Y;
    return { x, y: height + 1, z };
  }

  public getBounds(): WorldBounds {
    return this.getFullDetailBounds();
  }

  public getFullDetailBounds(): WorldBounds {
    const halfSize = Math.floor(FULL_DETAIL_SIZE_XZ / 2);
    const minX = this.focusCellX - halfSize;
    const minZ = this.focusCellZ - halfSize;
    const maxX = minX + FULL_DETAIL_SIZE_XZ - 1;
    const maxZ = minZ + FULL_DETAIL_SIZE_XZ - 1;
    let maxY = WORLD_MIN_Y;

    for (let z = minZ; z <= maxZ; z++) {
      for (let x = minX; x <= maxX; x++) {
        const column = this.generator.getColumn(x, z);
        maxY = Math.max(maxY, column.fluidLevel ?? column.height);
      }
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

    return this.generator.getBlockIdAtCell(x, y, z);
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
    const bounds = this.getFullDetailBounds();
    const cells: LoadedWorldCell[] = [];

    for (const chunk of this.store.getLoadedChunks()) {
      const sourceCells = detail === "full" ? chunk.cells : chunk.exposedCells;
      for (const cell of sourceCells) {
        if (this.isWithinFullDetailFootprint(cell.x, cell.z, bounds)) {
          cells.push(cell);
        }
      }
    }

    return cells;
  }

  private isWithinFullDetailFootprint(
    x: number,
    z: number,
    bounds = this.getFullDetailBounds()
  ): boolean {
    return (
      x >= bounds.min.x &&
      x <= bounds.max.x &&
      z >= bounds.min.z &&
      z <= bounds.max.z
    );
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
