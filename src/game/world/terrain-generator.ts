import { createFbmNoise2D, hashCell, type Noise2D } from "./noise";
import type { LoadedWorldCell } from "./world-loader";

/** Water surface height; matches the hand-authored island pond (water at y=1..2). */
export const SEA_LEVEL = 2;
export const TERRAIN_BASE_HEIGHT = 4;
export const TERRAIN_HEIGHT_AMPLITUDE = 3;
export const TERRAIN_HEIGHT_FREQUENCY = 1 / 24;
/** Columns within this Chebyshev distance of the island blend toward its edge heights. */
export const ISLAND_BLEND_RADIUS = 6;
/** Columns within this distance of the island copy its edge surface block. */
export const ISLAND_SURFACE_COPY_RADIUS = 2;
export const DEFAULT_WORLD_SEED = 20260610;

/** Highest possible generated cell (terrain crest + tree crown), for bounded scans. */
export const MAX_GENERATED_HEIGHT = 16;

export const BLOCK_ID = {
  stone: 1,
  grass: 2,
  dirt: 3,
  water: 9,
  sand: 12,
  log: 17,
  leaves: 18,
} as const;

/** Block ids that count as "ground" (trees, water, and props are excluded). */
const GROUND_BLOCK_IDS = new Set<number>([
  BLOCK_ID.stone,
  BLOCK_ID.grass,
  BLOCK_ID.dirt,
  BLOCK_ID.sand,
]);

const TREE_HASH_THRESHOLD = 0.97;
const TREE_SPACING_RADIUS = 4;
const TREE_CANOPY_RADIUS = 2;
/** Trees never spawn with their canopy touching the island footprint. */
const TREE_ISLAND_CLEARANCE = TREE_CANOPY_RADIUS + 1;
const MOISTURE_SAND_THRESHOLD = -0.55;

interface TreeTemplateBlock {
  dx: number;
  /** Offset above the ground surface block. */
  dy: number;
  dz: number;
  id: number;
}

/**
 * Tree shape extracted from the hand-authored island tree: a 5-log trunk,
 * a 5x5 canopy on the upper two trunk levels, and a plus-shaped crown.
 */
function buildTreeTemplate(): TreeTemplateBlock[] {
  const blocks: TreeTemplateBlock[] = [];

  for (let dy = 1; dy <= 5; dy++) {
    blocks.push({ dx: 0, dy, dz: 0, id: BLOCK_ID.log });
  }

  for (const dy of [4, 5]) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (dx === 0 && dz === 0) {
          continue;
        }
        blocks.push({ dx, dy, dz, id: BLOCK_ID.leaves });
      }
    }
  }

  for (const dy of [6, 7]) {
    for (const [dx, dz] of [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      blocks.push({ dx, dy, dz, id: BLOCK_ID.leaves });
    }
  }

  return blocks;
}

const TREE_TEMPLATE = buildTreeTemplate();

function smoothstep01(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function columnKey(x: number, z: number): string {
  return `${x},${z}`;
}

interface IslandColumn {
  /** Top ground block (stone/grass/dirt/sand), excluding trees, props, water. */
  groundHeight: number;
  /** Block id at the ground height. */
  surfaceId: number;
  /** All authored cells in this column, copied verbatim into chunks. */
  cells: LoadedWorldCell[];
}

/**
 * Deterministic, chunk-independent terrain generator. Heights, surface types,
 * water, and tree placement are all pure functions of (x, z) plus the seed,
 * so any chunk can be generated in any order with identical results. The
 * hand-authored island is embedded verbatim and generated terrain blends out
 * from its edges.
 */
export class TerrainGenerator {
  private readonly heightNoise: Noise2D;
  private readonly moistureNoise: Noise2D;
  private readonly treeSeed: number;
  private readonly islandColumns = new Map<string, IslandColumn>();
  private readonly islandBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  private readonly heightCache = new Map<string, number>();

  constructor(seed: number, islandCells: LoadedWorldCell[]) {
    this.heightNoise = createFbmNoise2D(seed, {
      octaves: 3,
      lacunarity: 2,
      persistence: 0.5,
      frequency: TERRAIN_HEIGHT_FREQUENCY,
    });
    this.moistureNoise = createFbmNoise2D(seed + 7919, {
      octaves: 2,
      lacunarity: 2,
      persistence: 0.5,
      frequency: 1 / 40,
    });
    this.treeSeed = (seed ^ 0x5f356495) | 0;

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (const cell of islandCells) {
      minX = Math.min(minX, cell.x);
      maxX = Math.max(maxX, cell.x);
      minZ = Math.min(minZ, cell.z);
      maxZ = Math.max(maxZ, cell.z);

      const key = columnKey(cell.x, cell.z);
      let column = this.islandColumns.get(key);
      if (!column) {
        column = { groundHeight: 0, surfaceId: BLOCK_ID.stone, cells: [] };
        this.islandColumns.set(key, column);
      }
      column.cells.push(cell);

      if (GROUND_BLOCK_IDS.has(cell.id) && cell.y >= column.groundHeight) {
        column.groundHeight = cell.y;
        column.surfaceId = cell.id;
      }
    }

    this.islandBounds = { minX, maxX, minZ, maxZ };
  }

  public isInsideIsland(x: number, z: number): boolean {
    const { minX, maxX, minZ, maxZ } = this.islandBounds;
    return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
  }

  /** Chebyshev distance from (x, z) to the island footprint; 0 inside. */
  public distanceToIsland(x: number, z: number): number {
    const { minX, maxX, minZ, maxZ } = this.islandBounds;
    const dx = Math.max(minX - x, 0, x - maxX);
    const dz = Math.max(minZ - z, 0, z - maxZ);
    return Math.max(dx, dz);
  }

  private nearestIslandColumn(x: number, z: number): IslandColumn {
    const { minX, maxX, minZ, maxZ } = this.islandBounds;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    const clampedZ = Math.max(minZ, Math.min(maxZ, z));
    const column = this.islandColumns.get(columnKey(clampedX, clampedZ));
    if (!column) {
      throw new Error(`Missing island column at ${clampedX},${clampedZ}`);
    }
    return column;
  }

  /**
   * Ground height of the column at (x, z): the y of the top ground block,
   * excluding water (which sits above it) and trees (decoration pass).
   * Heights change gradually: the fBm parameters keep the continuous slope
   * below 1 per block, and near the island heights blend toward the island's
   * own edge heights.
   */
  public getGroundHeight(x: number, z: number): number {
    const key = columnKey(x, z);
    const cached = this.heightCache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    let height: number;
    if (this.isInsideIsland(x, z)) {
      height = this.nearestIslandColumn(x, z).groundHeight;
    } else {
      const generated =
        TERRAIN_BASE_HEIGHT + TERRAIN_HEIGHT_AMPLITUDE * this.heightNoise(x, z);

      const distance = this.distanceToIsland(x, z);
      let continuous = generated;
      if (distance <= ISLAND_BLEND_RADIUS) {
        const edgeHeight = this.nearestIslandColumn(x, z).groundHeight;
        const t = smoothstep01(distance / ISLAND_BLEND_RADIUS);
        continuous = edgeHeight + (generated - edgeHeight) * t;
      }

      height = Math.max(0, Math.round(continuous));
    }

    this.heightCache.set(key, height);
    return height;
  }

  /** Surface block id for the column at (x, z) (top of the ground strata). */
  public getSurfaceBlockId(x: number, z: number): number {
    if (this.isInsideIsland(x, z)) {
      return this.nearestIslandColumn(x, z).surfaceId;
    }

    const height = this.getGroundHeight(x, z);

    // Beach band: low columns (including all underwater floors) are sand.
    if (height <= SEA_LEVEL + 1) {
      return BLOCK_ID.sand;
    }

    if (this.distanceToIsland(x, z) <= ISLAND_SURFACE_COPY_RADIUS) {
      const edgeSurface = this.nearestIslandColumn(x, z).surfaceId;
      // Buried edge surfaces (dirt/stone) read as grass once exposed.
      return edgeSurface === BLOCK_ID.sand ? BLOCK_ID.sand : BLOCK_ID.grass;
    }

    return this.moistureNoise(x, z) < MOISTURE_SAND_THRESHOLD
      ? BLOCK_ID.sand
      : BLOCK_ID.grass;
  }

  /**
   * Whether a tree trunk is anchored at (x, z). Deterministic blue-noise-ish
   * placement: sparse hash candidates thinned by a minimum-spacing contest,
   * restricted to flat grass away from water and the island.
   */
  public hasTreeAnchorAt(x: number, z: number): boolean {
    if (this.distanceToIsland(x, z) < TREE_ISLAND_CLEARANCE) {
      return false;
    }

    const hash = hashCell(this.treeSeed, x, z);
    if (hash <= TREE_HASH_THRESHOLD) {
      return false;
    }

    // Spacing contest: the highest hash among nearby candidates wins.
    for (let dx = -TREE_SPACING_RADIUS; dx <= TREE_SPACING_RADIUS; dx++) {
      for (let dz = -TREE_SPACING_RADIUS; dz <= TREE_SPACING_RADIUS; dz++) {
        if (dx === 0 && dz === 0) {
          continue;
        }
        const other = hashCell(this.treeSeed, x + dx, z + dz);
        if (other <= TREE_HASH_THRESHOLD) {
          continue;
        }
        if (
          other > hash ||
          (other === hash && (dx < 0 || (dx === 0 && dz < 0)))
        ) {
          return false;
        }
      }
    }

    if (this.getSurfaceBlockId(x, z) !== BLOCK_ID.grass) {
      return false;
    }

    // Flat ground under the trunk and no water under the canopy.
    const height = this.getGroundHeight(x, z);
    for (let dx = -TREE_CANOPY_RADIUS; dx <= TREE_CANOPY_RADIUS; dx++) {
      for (let dz = -TREE_CANOPY_RADIUS; dz <= TREE_CANOPY_RADIUS; dz++) {
        const neighborHeight = this.getGroundHeight(x + dx, z + dz);
        if (neighborHeight < SEA_LEVEL) {
          return false;
        }
        const adjacent = Math.max(Math.abs(dx), Math.abs(dz)) <= 1;
        if (adjacent && neighborHeight !== height) {
          return false;
        }
      }
    }

    return true;
  }

  /** Terrain cells (strata + water, no trees) for a generated column. */
  private generateColumnCells(x: number, z: number): LoadedWorldCell[] {
    const cells: LoadedWorldCell[] = [];
    const height = this.getGroundHeight(x, z);
    const surfaceId = this.getSurfaceBlockId(x, z);
    const subSurfaceId =
      surfaceId === BLOCK_ID.sand ? BLOCK_ID.sand : BLOCK_ID.dirt;

    for (let y = 0; y <= height; y++) {
      let id: number;
      if (y === height) {
        id = surfaceId;
      } else if (y >= height - 2) {
        id = subSurfaceId;
      } else {
        id = BLOCK_ID.stone;
      }
      cells.push({ x, y, z, id });
    }

    // Lakes: water fills the basin up to sea level. Enclosure is guaranteed
    // by construction: lateral neighbors either also hold water at the same y
    // (their ground is below sea level too) or are solid ground at that y.
    if (height < SEA_LEVEL) {
      for (let y = height + 1; y <= SEA_LEVEL; y++) {
        cells.push({ x, y, z, id: BLOCK_ID.water });
      }
    }

    return cells;
  }

  /**
   * All cells of the chunk spanning [minX, minX+size) x [minZ, minZ+size):
   * island cells verbatim, generated strata/water elsewhere, plus blocks of
   * any tree whose canopy reaches into this chunk. Chunk-independent: tree
   * anchors are evaluated in a margin around the chunk so canopies crossing
   * chunk borders are seamless.
   */
  public generateChunkCells(
    minX: number,
    minZ: number,
    size: number
  ): LoadedWorldCell[] {
    const maxX = minX + size - 1;
    const maxZ = minZ + size - 1;
    const cells: LoadedWorldCell[] = [];

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (this.isInsideIsland(x, z)) {
          const column = this.islandColumns.get(columnKey(x, z));
          if (column) {
            cells.push(...column.cells);
          }
          continue;
        }
        cells.push(...this.generateColumnCells(x, z));
      }
    }

    for (
      let x = minX - TREE_CANOPY_RADIUS;
      x <= maxX + TREE_CANOPY_RADIUS;
      x++
    ) {
      for (
        let z = minZ - TREE_CANOPY_RADIUS;
        z <= maxZ + TREE_CANOPY_RADIUS;
        z++
      ) {
        if (!this.hasTreeAnchorAt(x, z)) {
          continue;
        }

        const groundHeight = this.getGroundHeight(x, z);
        for (const block of TREE_TEMPLATE) {
          const blockX = x + block.dx;
          const blockZ = z + block.dz;
          if (
            blockX < minX ||
            blockX > maxX ||
            blockZ < minZ ||
            blockZ > maxZ
          ) {
            continue;
          }
          cells.push({
            x: blockX,
            y: groundHeight + block.dy,
            z: blockZ,
            id: block.id,
          });
        }
      }
    }

    return cells;
  }
}
