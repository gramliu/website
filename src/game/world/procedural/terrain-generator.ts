import { isBlockSolid } from "../block-registry";
import type { LoadedWorldCell } from "../world-loader";
import {
  type BiomeId,
  clampWorldY,
  columnIndex,
  createEmptyHeightmap,
  type GeneratedColumn,
  type VoxelChunk,
} from "./chunk";
import { CHUNK_SIZE_XZ, chunkOrigin, WORLD_MIN_Y } from "./chunk-coords";

const STONE = 1;
const GRASS = 2;
const DIRT = 3;
const WATER = 9;
const SAND = 12;
const WATER_LEVEL = 5;

export interface TerrainGeneratorOptions {
  seed?: number;
  seedCells?: LoadedWorldCell[];
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function hash2d(x: number, z: number, seed: number): number {
  const n = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453;
  return fract(n);
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function valueNoise(x: number, z: number, seed: number): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = smoothstep(x - x0);
  const tz = smoothstep(z - z0);

  const a = hash2d(x0, z0, seed);
  const b = hash2d(x0 + 1, z0, seed);
  const c = hash2d(x0, z0 + 1, seed);
  const d = hash2d(x0 + 1, z0 + 1, seed);

  const ab = a + (b - a) * tx;
  const cd = c + (d - c) * tx;
  return ab + (cd - ab) * tz;
}

function terrainNoise(x: number, z: number, seed: number): number {
  const broad = valueNoise(x / 48, z / 48, seed) * 2 - 1;
  const rolling = valueNoise(x / 18, z / 18, seed + 13) * 2 - 1;
  const detail = valueNoise(x / 7, z / 7, seed + 29) * 2 - 1;
  return broad * 5 + rolling * 2.5 + detail * 0.8;
}

function biomeForHeight(height: number, slopeSignal: number): BiomeId {
  if (height <= WATER_LEVEL - 1) {
    return "shallows";
  }

  if (height <= WATER_LEVEL + 1) {
    return "beach";
  }

  if (height >= 12 || slopeSignal > 0.72) {
    return "rocky";
  }

  return "grassland";
}

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function columnKey(x: number, z: number): string {
  return `${x},${z}`;
}

export class TerrainGenerator {
  private readonly seed: number;
  private readonly seedBlockIds = new Map<string, number>();
  private readonly seedColumns = new Map<string, LoadedWorldCell[]>();
  private readonly seedSolidHeights = new Map<string, number>();

  constructor(options: TerrainGeneratorOptions = {}) {
    this.seed = options.seed ?? 1337;

    for (const cell of options.seedCells ?? []) {
      const key = columnKey(cell.x, cell.z);
      this.seedBlockIds.set(cellKey(cell.x, cell.y, cell.z), cell.id);
      const column = this.seedColumns.get(key) ?? [];
      column.push(cell);
      this.seedColumns.set(key, column);

      if (isBlockSolid(cell.id)) {
        this.seedSolidHeights.set(
          key,
          Math.max(this.seedSolidHeights.get(key) ?? WORLD_MIN_Y, cell.y)
        );
      }
    }

    for (const column of Array.from(this.seedColumns.values())) {
      column.sort((a, b) => a.y - b.y);
    }
  }

  public getColumn(x: number, z: number): GeneratedColumn {
    const seededHeight = this.seedSolidHeights.get(columnKey(x, z));
    if (seededHeight !== undefined) {
      const surfaceBlockId = this.getBlockIdAtCell(x, seededHeight, z);
      const subsurfaceBlockId =
        this.getBlockIdAtCell(x, seededHeight - 1, z) || surfaceBlockId;

      return {
        height: seededHeight,
        biome: surfaceBlockId === SAND ? "beach" : "grassland",
        surfaceBlockId,
        subsurfaceBlockId,
        fluidLevel: null,
      };
    }

    const noise = terrainNoise(x, z, this.seed);
    const slopeSignal = valueNoise(x / 10, z / 10, this.seed + 101);
    const height = clampWorldY(Math.round(7 + noise));
    const biome = biomeForHeight(height, slopeSignal);

    if (biome === "shallows" || biome === "beach") {
      return {
        height,
        biome,
        surfaceBlockId: SAND,
        subsurfaceBlockId: SAND,
        fluidLevel: height < WATER_LEVEL ? WATER_LEVEL : null,
      };
    }

    if (biome === "rocky") {
      return {
        height,
        biome,
        surfaceBlockId: STONE,
        subsurfaceBlockId: STONE,
        fluidLevel: null,
      };
    }

    return {
      height,
      biome,
      surfaceBlockId: GRASS,
      subsurfaceBlockId: DIRT,
      fluidLevel: null,
    };
  }

  public getBlockIdAtCell(x: number, y: number, z: number): number {
    const seededColumn = this.seedColumns.get(columnKey(x, z));
    if (seededColumn) {
      return this.seedBlockIds.get(cellKey(x, y, z)) ?? 0;
    }

    const column = this.getColumn(x, z);
    if (y < WORLD_MIN_Y) {
      return STONE;
    }

    if (y <= column.height) {
      if (y === column.height) {
        return column.surfaceBlockId;
      }

      return y >= column.height - 3 ? column.subsurfaceBlockId : STONE;
    }

    if (column.fluidLevel !== null && y <= column.fluidLevel) {
      return WATER;
    }

    return 0;
  }

  public generateChunk(chunkX: number, chunkZ: number): VoxelChunk {
    const [originX, originZ] = chunkOrigin(chunkX, chunkZ);
    const cells: LoadedWorldCell[] = [];
    const heightmap = createEmptyHeightmap();
    const biomes: BiomeId[] = [];

    for (let localZ = 0; localZ < CHUNK_SIZE_XZ; localZ++) {
      for (let localX = 0; localX < CHUNK_SIZE_XZ; localX++) {
        const worldX = originX + localX;
        const worldZ = originZ + localZ;
        const column = this.getColumn(worldX, worldZ);
        const index = columnIndex(localX, localZ);
        heightmap[index] = column.height;
        biomes[index] = column.biome;

        const seededColumn = this.seedColumns.get(columnKey(worldX, worldZ));
        if (seededColumn) {
          cells.push(...seededColumn);
          continue;
        }

        for (let y = WORLD_MIN_Y; y <= column.height; y++) {
          const id =
            y === column.height
              ? column.surfaceBlockId
              : y >= column.height - 3
                ? column.subsurfaceBlockId
                : STONE;
          cells.push({ x: worldX, y, z: worldZ, id });
        }

        if (column.fluidLevel !== null) {
          for (let y = column.height + 1; y <= column.fluidLevel; y++) {
            cells.push({ x: worldX, y, z: worldZ, id: WATER });
          }
        }
      }
    }

    let maxY = WATER_LEVEL;
    for (let index = 0; index < heightmap.length; index++) {
      maxY = Math.max(maxY, heightmap[index]);
    }

    const generatedAt = Date.now();
    return {
      chunkX,
      chunkZ,
      minY: WORLD_MIN_Y,
      maxY,
      cells,
      exposedCells: cells.filter((cell) => this.hasExposedFace(cell)),
      heightmap,
      biomes,
      generatedAt,
      lastAccessedAt: generatedAt,
    };
  }

  private hasExposedFace(cell: LoadedWorldCell): boolean {
    const isSeededCell = this.seedColumns.has(columnKey(cell.x, cell.z));
    const neighborOffsets = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ] as const;

    return neighborOffsets.some(([dx, dy, dz]) => {
      const neighborX = cell.x + dx;
      const neighborY = cell.y + dy;
      const neighborZ = cell.z + dz;

      if (isSeededCell) {
        return !this.seedBlockIds.has(cellKey(neighborX, neighborY, neighborZ));
      }

      if (neighborY < WORLD_MIN_Y) {
        return false;
      }

      return this.getBlockIdAtCell(neighborX, neighborY, neighborZ) === 0;
    });
  }
}
