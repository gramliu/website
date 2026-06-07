import type { LoadedWorldCell } from "../world-loader";
import { WORLD_MIN_Y } from "./chunk-coords";
import { DIRT, GRASS, isGroundBlockId, SAND, WATER } from "./ground-blocks";

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function columnKey(x: number, z: number): string {
  return `${x},${z}`;
}

export interface MaterialWeights {
  grass: number;
  dirt: number;
  sand: number;
  stone: number;
  water: number;
}

export interface SeedEdgeSample {
  x: number;
  z: number;
  height: number;
  surfaceBlockId: number;
  materialWeights: MaterialWeights;
  distance: number;
}

const emptyMaterialWeights: MaterialWeights = {
  grass: 0,
  dirt: 0,
  sand: 0,
  stone: 0,
  water: 0,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function weightsForBlockId(blockId: number): MaterialWeights {
  switch (blockId) {
    case GRASS:
      return { ...emptyMaterialWeights, grass: 1 };
    case DIRT:
      return { ...emptyMaterialWeights, dirt: 1 };
    case WATER:
      return { ...emptyMaterialWeights, water: 1 };
    case SAND:
      return { ...emptyMaterialWeights, sand: 1 };
    default:
      return { ...emptyMaterialWeights, stone: 1 };
  }
}

export class StarterRegion {
  private readonly cells: LoadedWorldCell[];
  private readonly blockIds = new Map<string, number>();
  private readonly columns = new Map<string, LoadedWorldCell[]>();
  private readonly solidHeights = new Map<string, number>();
  private readonly minX: number;
  private readonly minY: number;
  private readonly minZ: number;
  private readonly maxX: number;
  private readonly maxY: number;
  private readonly maxZ: number;

  constructor(cells: LoadedWorldCell[]) {
    this.cells = cells.map((cell) => ({ ...cell }));

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (const cell of this.cells) {
      const key = columnKey(cell.x, cell.z);
      this.blockIds.set(cellKey(cell.x, cell.y, cell.z), cell.id);
      const column = this.columns.get(key) ?? [];
      column.push(cell);
      this.columns.set(key, column);

      if (isGroundBlockId(cell.id)) {
        this.solidHeights.set(
          key,
          Math.max(this.solidHeights.get(key) ?? WORLD_MIN_Y, cell.y)
        );
      }

      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      minZ = Math.min(minZ, cell.z);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
      maxZ = Math.max(maxZ, cell.z);
    }

    for (const column of Array.from(this.columns.values())) {
      column.sort((a, b) => a.y - b.y);
    }

    this.minX = Number.isFinite(minX) ? minX : 0;
    this.minY = Number.isFinite(minY) ? minY : WORLD_MIN_Y;
    this.minZ = Number.isFinite(minZ) ? minZ : 0;
    this.maxX = Number.isFinite(maxX) ? maxX : 0;
    this.maxY = Number.isFinite(maxY) ? maxY : WORLD_MIN_Y;
    this.maxZ = Number.isFinite(maxZ) ? maxZ : 0;
  }

  public hasColumn(x: number, z: number): boolean {
    return this.columns.has(columnKey(x, z));
  }

  public isInsideFootprint(x: number, z: number): boolean {
    return x >= this.minX && x <= this.maxX && z >= this.minZ && z <= this.maxZ;
  }

  public getDistanceToFootprint(x: number, z: number): number {
    const dx =
      x < this.minX ? this.minX - x : x > this.maxX ? x - this.maxX : 0;
    const dz =
      z < this.minZ ? this.minZ - z : z > this.maxZ ? z - this.maxZ : 0;
    return Math.max(dx, dz);
  }

  public getNearestEdgeSample(x: number, z: number): SeedEdgeSample | null {
    if (this.cells.length === 0) {
      return null;
    }

    const edgeX = clamp(x, this.minX, this.maxX);
    const edgeZ = clamp(z, this.minZ, this.maxZ);
    const height = this.getHighestSolidCell(edgeX, edgeZ);

    if (height === null) {
      return null;
    }

    const surfaceBlockId = this.getBlockIdAtCell(edgeX, height, edgeZ);
    return {
      x: edgeX,
      z: edgeZ,
      height,
      surfaceBlockId,
      materialWeights: this.getEdgeMaterialWeights(edgeX, edgeZ),
      distance: this.getDistanceToFootprint(x, z),
    };
  }

  public getEdgeMaterialWeights(x: number, z: number): MaterialWeights {
    const height = this.getHighestSolidCell(x, z);
    if (height === null) {
      return { ...emptyMaterialWeights };
    }

    return weightsForBlockId(this.getBlockIdAtCell(x, height, z));
  }

  public getBlockIdAtCell(x: number, y: number, z: number): number {
    return this.blockIds.get(cellKey(x, y, z)) ?? 0;
  }

  public getColumnCells(x: number, z: number): LoadedWorldCell[] {
    return (this.columns.get(columnKey(x, z)) ?? []).map((cell) => ({
      ...cell,
    }));
  }

  public getHighestSolidCell(x: number, z: number): number | null {
    return this.getHighestGroundCell(x, z);
  }

  public getHighestGroundCell(x: number, z: number): number | null {
    return this.solidHeights.get(columnKey(x, z)) ?? null;
  }

  public getCells(): LoadedWorldCell[] {
    return this.cells.map((cell) => ({ ...cell }));
  }

  public getCenter(): { x: number; y: number; z: number } {
    return {
      x: (this.minX + this.maxX) / 2,
      y: (this.minY + this.maxY) / 2,
      z: (this.minZ + this.maxZ) / 2,
    };
  }

  public getBounds() {
    return {
      min: { x: this.minX, y: this.minY, z: this.minZ },
      max: { x: this.maxX, y: this.maxY, z: this.maxZ },
    };
  }
}
