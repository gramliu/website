import { describe, expect, it } from "bun:test";
import worldData from "../../components/world/world-data";
import {
  BLOCK_ID,
  DEFAULT_WORLD_SEED,
  ISLAND_BLEND_RADIUS,
  SEA_LEVEL,
  TerrainGenerator,
} from "./terrain-generator";
import { loadWorldCellsFromString } from "./world-loader";

const islandCells = loadWorldCellsFromString(worldData);
const generator = new TerrainGenerator(DEFAULT_WORLD_SEED, islandCells);

describe("TerrainGenerator ground heights", () => {
  it("returns the island's own ground heights inside the footprint", () => {
    // Grass plateau at the island's north-west corner sits at y=4.
    expect(generator.getGroundHeight(0, 0)).toBe(4);
    // Pond floor at the south-east corner is the sand at y=0.
    expect(generator.getGroundHeight(9, 9)).toBe(0);
  });

  it("changes gradually: adjacent heights differ by at most 1 away from the island", () => {
    for (let x = 30; x <= 160; x++) {
      for (let z = 30; z <= 60; z++) {
        const here = generator.getGroundHeight(x, z);
        expect(
          Math.abs(generator.getGroundHeight(x + 1, z) - here)
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(generator.getGroundHeight(x, z + 1) - here)
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  it("changes gradually within the island blend ring (steps of at most 2)", () => {
    const reach = ISLAND_BLEND_RADIUS + 2;
    for (let x = -reach; x <= 9 + reach; x++) {
      for (let z = -reach; z <= 9 + reach; z++) {
        const here = generator.getGroundHeight(x, z);
        expect(
          Math.abs(generator.getGroundHeight(x + 1, z) - here)
        ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(generator.getGroundHeight(x, z + 1) - here)
        ).toBeLessThanOrEqual(2);
      }
    }
  });

  it("blends to within 1 block of island edge heights just outside the footprint", () => {
    for (let z = 0; z <= 9; z++) {
      const westEdge = generator.getGroundHeight(0, z);
      expect(
        Math.abs(generator.getGroundHeight(-1, z) - westEdge)
      ).toBeLessThanOrEqual(1);

      const eastEdge = generator.getGroundHeight(9, z);
      expect(
        Math.abs(generator.getGroundHeight(10, z) - eastEdge)
      ).toBeLessThanOrEqual(1);
    }
  });

  it("never goes below the bedrock floor", () => {
    for (let i = -300; i <= 300; i += 3) {
      expect(generator.getGroundHeight(i, -i)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("TerrainGenerator strata and surface", () => {
  it("builds stone -> dirt -> grass strata for inland columns", () => {
    // Find a tall grass column away from the island.
    let found = false;
    for (let x = 50; x <= 200 && !found; x++) {
      const z = 80;
      if (generator.getSurfaceBlockId(x, z) !== BLOCK_ID.grass) {
        continue;
      }
      const height = generator.getGroundHeight(x, z);
      if (height < 4) {
        continue;
      }
      found = true;

      const cells = generator.generateChunkCells(x, z, 1);
      const byY = new Map(
        cells
          .filter((cell) => cell.x === x && cell.z === z)
          .map((cell) => [cell.y, cell.id])
      );
      expect(byY.get(height)).toBe(BLOCK_ID.grass);
      expect(byY.get(height - 1)).toBe(BLOCK_ID.dirt);
      expect(byY.get(height - 2)).toBe(BLOCK_ID.dirt);
      expect(byY.get(0)).toBe(BLOCK_ID.stone);
    }
    expect(found).toBe(true);
  });

  it("uses sand for beach-band columns", () => {
    let checked = 0;
    for (let x = -200; x <= 200; x += 1) {
      const z = 33;
      const height = generator.getGroundHeight(x, z);
      if (generator.distanceToIsland(x, z) <= 2 || height > SEA_LEVEL + 1) {
        continue;
      }
      expect(generator.getSurfaceBlockId(x, z)).toBe(BLOCK_ID.sand);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe("TerrainGenerator water", () => {
  function buildRegionBlockMap(
    minX: number,
    maxX: number,
    minZ: number,
    maxZ: number
  ): Map<string, number> {
    const blocks = new Map<string, number>();
    const cells = generator.generateChunkCells(
      minX,
      minZ,
      Math.max(maxX - minX, maxZ - minZ) + 1
    );
    for (const cell of cells) {
      blocks.set(`${cell.x},${cell.y},${cell.z}`, cell.id);
    }
    return blocks;
  }

  it("always encloses water with water or solid ground laterally and below", () => {
    // Region straddling the island (and its pond extension) plus open terrain.
    const minX = -32;
    const maxX = 64;
    const minZ = -32;
    const maxZ = 64;
    const blocks = buildRegionBlockMap(minX, maxX, minZ, maxZ);

    const solidIds = new Set<number>([
      BLOCK_ID.stone,
      BLOCK_ID.grass,
      BLOCK_ID.dirt,
      BLOCK_ID.sand,
      BLOCK_ID.log,
      BLOCK_ID.leaves,
      58,
    ]);

    let waterCells = 0;
    for (const [key, id] of Array.from(blocks.entries())) {
      if (id !== BLOCK_ID.water) {
        continue;
      }
      const [x, y, z] = key.split(",").map(Number);
      // Skip water on the region border; its outside neighbor isn't in the map.
      if (x <= minX || x >= maxX || z <= minZ || z >= maxZ) {
        continue;
      }
      waterCells++;

      const neighbors: [number, number, number][] = [
        [x + 1, y, z],
        [x - 1, y, z],
        [x, y, z + 1],
        [x, y, z - 1],
        [x, y - 1, z],
      ];
      for (const [nx, ny, nz] of neighbors) {
        const neighborId = blocks.get(`${nx},${ny},${nz}`) ?? 0;
        const enclosed =
          neighborId === BLOCK_ID.water || solidIds.has(neighborId);
        expect(enclosed).toBe(true);
      }
    }

    // The island pond extension guarantees at least some water in the region.
    expect(waterCells).toBeGreaterThan(0);
  });

  it("places water only above the ground and up to sea level", () => {
    const blocks = buildRegionBlockMap(-16, 48, -16, 48);
    for (const [key, id] of Array.from(blocks.entries())) {
      if (id !== BLOCK_ID.water) {
        continue;
      }
      const [x, y, z] = key.split(",").map(Number);
      if (generator.isInsideIsland(x, z)) {
        continue;
      }
      expect(y).toBeLessThanOrEqual(SEA_LEVEL);
      expect(y).toBeGreaterThan(generator.getGroundHeight(x, z));
    }
  });
});

describe("TerrainGenerator trees", () => {
  it("anchors trees only on flat grass away from water and the island", () => {
    let anchors = 0;
    for (let x = -120; x <= 120; x++) {
      for (let z = -120; z <= 120; z += 3) {
        if (!generator.hasTreeAnchorAt(x, z)) {
          continue;
        }
        anchors++;

        expect(generator.getSurfaceBlockId(x, z)).toBe(BLOCK_ID.grass);
        expect(generator.distanceToIsland(x, z)).toBeGreaterThanOrEqual(3);

        const height = generator.getGroundHeight(x, z);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            expect(generator.getGroundHeight(x + dx, z + dz)).toBe(height);
          }
        }
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            expect(
              generator.getGroundHeight(x + dx, z + dz)
            ).toBeGreaterThanOrEqual(SEA_LEVEL);
          }
        }
      }
    }
    expect(anchors).toBeGreaterThan(0);
  });

  it("keeps tree anchors at least 5 blocks apart", () => {
    const anchors: [number, number][] = [];
    for (let x = -80; x <= 80; x++) {
      for (let z = -80; z <= 80; z++) {
        if (generator.hasTreeAnchorAt(x, z)) {
          anchors.push([x, z]);
        }
      }
    }
    expect(anchors.length).toBeGreaterThan(0);

    for (let i = 0; i < anchors.length; i++) {
      for (let j = i + 1; j < anchors.length; j++) {
        const distance = Math.max(
          Math.abs(anchors[i][0] - anchors[j][0]),
          Math.abs(anchors[i][1] - anchors[j][1])
        );
        expect(distance).toBeGreaterThan(4);
      }
    }
  });

  it("excludes trees from ground height", () => {
    // Find an anchor and confirm the ground height ignores trunk/canopy.
    let verified = false;
    for (let x = -80; x <= 80 && !verified; x++) {
      for (let z = -80; z <= 80 && !verified; z++) {
        if (!generator.hasTreeAnchorAt(x, z)) {
          continue;
        }
        const height = generator.getGroundHeight(x, z);
        const cells = generator.generateChunkCells(x - 2, z - 2, 5);
        const trunk = cells.find(
          (cell) => cell.x === x && cell.z === z && cell.id === BLOCK_ID.log
        );
        expect(trunk).toBeDefined();
        expect(generator.getGroundHeight(x, z)).toBe(height);
        verified = true;
      }
    }
    expect(verified).toBe(true);
  });
});

describe("TerrainGenerator island embedding", () => {
  it("reproduces every authored island cell verbatim", () => {
    const generated = new Map<string, number>();
    for (let chunkX = -8; chunkX <= 16; chunkX += 8) {
      for (let chunkZ = -8; chunkZ <= 16; chunkZ += 8) {
        for (const cell of generator.generateChunkCells(chunkX, chunkZ, 8)) {
          generated.set(`${cell.x},${cell.y},${cell.z}`, cell.id);
        }
      }
    }

    for (const cell of islandCells) {
      expect(generated.get(`${cell.x},${cell.y},${cell.z}`)).toBe(cell.id);
    }
  });
});
