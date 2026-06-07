import { isBlockSolid } from "../block-registry";
import type { LoadedWorldCell } from "../world-loader";
import { WORLD_MIN_Y } from "./chunk-coords";

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function columnKey(x: number, z: number): string {
  return `${x},${z}`;
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

      if (isBlockSolid(cell.id)) {
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

  public getBlockIdAtCell(x: number, y: number, z: number): number {
    return this.blockIds.get(cellKey(x, y, z)) ?? 0;
  }

  public getColumnCells(x: number, z: number): LoadedWorldCell[] {
    return (this.columns.get(columnKey(x, z)) ?? []).map((cell) => ({
      ...cell,
    }));
  }

  public getHighestSolidCell(x: number, z: number): number | null {
    return this.solidHeights.get(columnKey(x, z)) ?? null;
  }

  public getCells(): LoadedWorldCell[] {
    return this.cells.map((cell) => ({ ...cell }));
  }

  public getBounds() {
    return {
      min: { x: this.minX, y: this.minY, z: this.minZ },
      max: { x: this.maxX, y: this.maxY, z: this.maxZ },
    };
  }
}
