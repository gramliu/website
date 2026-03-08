import type { AABB } from "../core/math/aabb";
import type { CellCoord, CollisionKind, WorldBounds } from "../core/types";
import { COLLISION_EPSILON } from "../rules/constants";
import {
  type BlockDefinition,
  getBlockDefinition,
  isBlockFluid,
  isBlockSolid,
} from "./block-registry";
import type { LoadedWorldCell } from "./world-loader";

export interface FluidAdjacency {
  top: boolean;
  bottom: boolean;
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

export class VoxelWorld {
  private readonly blockIds = new Map<string, number>();
  private readonly renderableCells: LoadedWorldCell[];
  private readonly bounds: WorldBounds;

  constructor(cells: LoadedWorldCell[]) {
    this.renderableCells = cells;

    let maxX = 0;
    let maxY = 0;
    let maxZ = 0;

    for (const cell of cells) {
      this.blockIds.set(cellKey(cell.x, cell.y, cell.z), cell.id);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
      maxZ = Math.max(maxZ, cell.z);
    }

    this.bounds = {
      min: { x: 0, y: 0, z: 0 },
      max: { x: maxX, y: maxY, z: maxZ },
    };
  }

  public getBounds(): WorldBounds {
    return this.bounds;
  }

  public getRenderableCells(): LoadedWorldCell[] {
    return this.renderableCells;
  }

  public getBlockIdAtCell(x: number, y: number, z: number): number {
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
    for (let y = this.bounds.max.y; y >= this.bounds.min.y; y--) {
      if (this.isCellSolid(x, y, z)) {
        return y;
      }
    }

    return null;
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
    if (
      aabb.min.x < this.bounds.min.x ||
      aabb.min.z < this.bounds.min.z ||
      aabb.max.x > this.bounds.max.x + 1 ||
      aabb.max.z > this.bounds.max.z + 1 ||
      aabb.min.y < this.bounds.min.y
    ) {
      return true;
    }

    for (const cell of this.getOverlappingCells(aabb)) {
      if (this.isCellSolid(cell.x, cell.y, cell.z)) {
        return true;
      }
    }

    return false;
  }
}
