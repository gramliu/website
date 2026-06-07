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
import { DIRT, GRASS, SAND, STONE, WATER } from "./ground-blocks";
import { StarterRegion } from "./starter-region";

const WATER_LEVEL = 5;
const SEED_HEIGHT_BLEND_RADIUS = 10;
const SEED_MATERIAL_BLEND_RADIUS = 6;
const MAX_NEIGHBOR_GROUND_DELTA = 1;

export interface TerrainGeneratorOptions {
  seed?: number;
  seedCells?: LoadedWorldCell[];
  starterRegion?: StarterRegion;
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function hash2d(x: number, z: number, seed: number): number {
  const n = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453;
  return fract(n);
}

function gradientVector(
  ix: number,
  iz: number,
  seed: number
): [number, number] {
  const angle = hash2d(ix, iz, seed) * Math.PI * 2;
  return [Math.cos(angle), Math.sin(angle)];
}

function fade(value: number): number {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function gradientNoise(x: number, z: number, seed: number): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const x1 = x0 + 1;
  const z1 = z0 + 1;
  const sx = fade(x - x0);
  const sz = fade(z - z0);
  const [g00x, g00z] = gradientVector(x0, z0, seed);
  const [g10x, g10z] = gradientVector(x1, z0, seed);
  const [g01x, g01z] = gradientVector(x0, z1, seed);
  const [g11x, g11z] = gradientVector(x1, z1, seed);
  const n00 = g00x * (x - x0) + g00z * (z - z0);
  const n10 = g10x * (x - x1) + g10z * (z - z0);
  const n01 = g01x * (x - x0) + g01z * (z - z1);
  const n11 = g11x * (x - x1) + g11z * (z - z1);
  const ix0 = lerp(n00, n10, sx);
  const ix1 = lerp(n01, n11, sx);

  return lerp(ix0, ix1, sz) * Math.SQRT2;
}

function fbmNoise(
  x: number,
  z: number,
  seed: number,
  octaves: number,
  frequency = 1
): number {
  let value = 0;
  let amplitude = 0.5;
  let totalAmplitude = 0;
  let currentFrequency = frequency;

  for (let octave = 0; octave < octaves; octave++) {
    value +=
      gradientNoise(
        x * currentFrequency,
        z * currentFrequency,
        seed + octave * 53
      ) * amplitude;
    totalAmplitude += amplitude;
    amplitude *= 0.5;
    currentFrequency *= 2;
  }

  return value / totalAmplitude;
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
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
  const warpX = fbmNoise(x / 40, z / 40, seed + 200, 2) * 3;
  const warpZ = fbmNoise(x / 40, z / 40, seed + 260, 2) * 3;
  const sampleX = x + warpX;
  const sampleZ = z + warpZ;
  const continentalness = fbmNoise(sampleX / 42, sampleZ / 42, seed, 4);
  const erosion = fbmNoise(sampleX / 24, sampleZ / 24, seed + 13, 3);
  const detail = fbmNoise(sampleX / 9, sampleZ / 9, seed + 29, 2);

  return continentalness * 4 - erosion * 1.25 + detail * 0.55;
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

export class TerrainGenerator {
  private readonly seed: number;
  private readonly starterRegion: StarterRegion | null;

  constructor(options: TerrainGeneratorOptions = {}) {
    this.seed = options.seed ?? 1337;
    this.starterRegion =
      options.starterRegion ??
      (options.seedCells ? new StarterRegion(options.seedCells) : null);
  }

  public getColumn(x: number, z: number): GeneratedColumn {
    const seededHeight = this.starterRegion?.getHighestSolidCell(x, z);
    if (seededHeight !== undefined && seededHeight !== null) {
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

    return this.applySeedTransition(x, z, this.getRawColumn(x, z));
  }

  private getRawColumn(x: number, z: number): GeneratedColumn {
    const noise = terrainNoise(x, z, this.seed);
    const slopeSignal = valueNoise(x / 10, z / 10, this.seed + 101);
    const height = this.smoothGeneratedHeight(
      x,
      z,
      clampWorldY(Math.round(7 + noise))
    );
    const biome = biomeForHeight(height, slopeSignal);

    if (biome === "shallows" || biome === "beach") {
      const supportedWaterLevel = this.getSupportedWaterLevel(x, z, height);
      return {
        height,
        biome,
        surfaceBlockId: SAND,
        subsurfaceBlockId: SAND,
        fluidLevel: supportedWaterLevel,
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

  private applySeedTransition(
    x: number,
    z: number,
    rawColumn: GeneratedColumn
  ): GeneratedColumn {
    const edgeSample = this.starterRegion?.getNearestEdgeSample(x, z);
    if (!edgeSample || edgeSample.distance > SEED_HEIGHT_BLEND_RADIUS) {
      return rawColumn;
    }

    const heightBlend =
      1 - smoothstep(clamp01(edgeSample.distance / SEED_HEIGHT_BLEND_RADIUS));
    const materialBlend =
      1 - smoothstep(clamp01(edgeSample.distance / SEED_MATERIAL_BLEND_RADIUS));
    const edgeSlopeOffset = Math.max(
      -3,
      Math.min(
        3,
        edgeSample.distance *
          (rawColumn.height > edgeSample.height ? 0.35 : -0.25)
      )
    );
    const height = clampWorldY(
      Math.round(
        lerp(rawColumn.height, edgeSample.height + edgeSlopeOffset, heightBlend)
      )
    );
    const surfaceBlockId = this.pickTransitionSurfaceBlock(
      rawColumn,
      edgeSample.surfaceBlockId,
      materialBlend,
      height
    );
    const subsurfaceBlockId =
      surfaceBlockId === GRASS
        ? DIRT
        : surfaceBlockId === WATER
          ? SAND
          : surfaceBlockId;

    return {
      height,
      biome:
        surfaceBlockId === SAND
          ? "beach"
          : surfaceBlockId === STONE
            ? "rocky"
            : "grassland",
      surfaceBlockId,
      subsurfaceBlockId,
      fluidLevel:
        surfaceBlockId === SAND
          ? this.getSupportedWaterLevel(x, z, height)
          : null,
    };
  }

  private smoothGeneratedHeight(
    x: number,
    z: number,
    rawHeight: number
  ): number {
    const neighborRawHeights = [
      this.getRawHeightOnly(x + 1, z),
      this.getRawHeightOnly(x - 1, z),
      this.getRawHeightOnly(x, z + 1),
      this.getRawHeightOnly(x, z - 1),
    ];
    const averageNeighborHeight = Math.round(
      neighborRawHeights.reduce((sum, height) => sum + height, 0) /
        neighborRawHeights.length
    );
    return clampWorldY(
      Math.max(
        averageNeighborHeight - MAX_NEIGHBOR_GROUND_DELTA,
        Math.min(averageNeighborHeight + MAX_NEIGHBOR_GROUND_DELTA, rawHeight)
      )
    );
  }

  private getRawHeightOnly(x: number, z: number): number {
    return clampWorldY(Math.round(7 + terrainNoise(x, z, this.seed)));
  }

  private getSupportedWaterLevel(
    x: number,
    z: number,
    groundHeight: number
  ): number | null {
    if (groundHeight >= WATER_LEVEL) {
      return null;
    }

    const neighborHeights = [
      this.getRawHeightOnly(x + 1, z),
      this.getRawHeightOnly(x - 1, z),
      this.getRawHeightOnly(x, z + 1),
      this.getRawHeightOnly(x, z - 1),
    ];
    const minNeighborHeight = Math.min(...neighborHeights);

    if (minNeighborHeight < groundHeight - 1) {
      return null;
    }

    return WATER_LEVEL;
  }

  private pickTransitionSurfaceBlock(
    rawColumn: GeneratedColumn,
    seedSurfaceBlockId: number,
    materialBlend: number,
    height: number
  ): number {
    if (materialBlend <= 0) {
      return rawColumn.surfaceBlockId;
    }

    if (seedSurfaceBlockId === SAND || seedSurfaceBlockId === WATER) {
      return height <= WATER_LEVEL + 1 || materialBlend > 0.25
        ? SAND
        : rawColumn.surfaceBlockId;
    }

    if (seedSurfaceBlockId === GRASS || seedSurfaceBlockId === DIRT) {
      if (materialBlend > 0.2) {
        return GRASS;
      }

      return height <= WATER_LEVEL ? SAND : rawColumn.surfaceBlockId;
    }

    if (seedSurfaceBlockId === STONE) {
      return rawColumn.biome === "rocky" || materialBlend > 0.65
        ? STONE
        : rawColumn.surfaceBlockId;
    }

    return rawColumn.surfaceBlockId;
  }

  public getBlockIdAtCell(x: number, y: number, z: number): number {
    if (this.starterRegion?.hasColumn(x, z)) {
      return this.starterRegion.getBlockIdAtCell(x, y, z);
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

        if (this.starterRegion?.hasColumn(worldX, worldZ)) {
          cells.push(...this.starterRegion.getColumnCells(worldX, worldZ));
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
    const isStarterCell =
      this.starterRegion?.hasColumn(cell.x, cell.z) ?? false;
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

      if (isStarterCell) {
        return (
          this.starterRegion?.getBlockIdAtCell(
            neighborX,
            neighborY,
            neighborZ
          ) === 0
        );
      }

      if (neighborY < WORLD_MIN_Y) {
        return false;
      }

      return this.getBlockIdAtCell(neighborX, neighborY, neighborZ) === 0;
    });
  }
}
