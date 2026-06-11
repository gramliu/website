import { describe, expect, it } from "bun:test";
import worldData from "../../components/world/world-data";
import { CHUNK_SIZE, InfiniteWorld } from "./infinite-world";
import {
  BLOCK_ID,
  DEFAULT_WORLD_SEED,
  TerrainGenerator,
} from "./terrain-generator";
import { loadWorldCellsFromString } from "./world-loader";

const islandCells = loadWorldCellsFromString(worldData);

function createWorld(): InfiniteWorld {
  return new InfiniteWorld(
    new TerrainGenerator(DEFAULT_WORLD_SEED, islandCells)
  );
}

describe("InfiniteWorld determinism", () => {
  it("produces identical blocks regardless of chunk generation order", () => {
    const a = createWorld();
    const b = createWorld();

    // Touch chunks in opposite orders.
    a.prefetchAround(0, 0, 32, 1000);
    b.getBlockIdAtCell(60, 3, -60);
    b.getBlockIdAtCell(-60, 3, 60);
    b.prefetchAround(40, -40, 32, 1000);

    for (let x = -24; x <= 24; x += 3) {
      for (let z = -24; z <= 24; z += 3) {
        for (let y = 0; y <= 8; y += 2) {
          expect(a.getBlockIdAtCell(x, y, z)).toBe(b.getBlockIdAtCell(x, y, z));
        }
      }
    }
  });

  it("embeds the island verbatim", () => {
    const world = createWorld();
    for (const cell of islandCells) {
      expect(world.getBlockIdAtCell(cell.x, cell.y, cell.z)).toBe(cell.id);
    }
  });
});

describe("InfiniteWorld collision", () => {
  const world = createWorld();

  it("has no lateral fence: far-away air does not collide", () => {
    const x = 200.5;
    const z = 200.5;
    const ground = world.getGroundHeight(200, 200);
    const aabb = {
      min: { x: x - 0.3, y: ground + 3, z: z - 0.3 },
      max: { x: x + 0.3, y: ground + 4.8, z: z + 0.3 },
    };
    expect(world.collidesAABB(aabb)).toBe(false);
  });

  it("collides with generated terrain", () => {
    const ground = world.getGroundHeight(200, 200);
    const aabb = {
      min: { x: 200.2, y: ground + 0.5, z: 200.2 },
      max: { x: 200.8, y: ground + 2, z: 200.8 },
    };
    expect(world.collidesAABB(aabb)).toBe(true);
  });

  it("keeps the bedrock floor", () => {
    const aabb = {
      min: { x: 500, y: -1, z: 500 },
      max: { x: 500.6, y: 0.5, z: 500.6 },
    };
    expect(world.collidesAABB(aabb)).toBe(true);
  });
});

describe("InfiniteWorld render window", () => {
  const world = createWorld();

  it("returns only cells inside the window", () => {
    const cells = world.getCellsInWindow(40, 40, 6);
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(Math.abs(cell.x - 40)).toBeLessThanOrEqual(6);
      expect(Math.abs(cell.z - 40)).toBeLessThanOrEqual(6);
    }
  });

  it("culls fully buried cells but keeps the surface", () => {
    const cells = world.getCellsInWindow(40, 40, 6);
    const byKey = new Set(cells.map((cell) => `${cell.x},${cell.y},${cell.z}`));

    for (let x = 36; x <= 44; x++) {
      for (let z = 36; z <= 44; z++) {
        const height = world.getGroundHeight(x, z);
        expect(byKey.has(`${x},${height},${z}`)).toBe(true);

        // Deep stone enclosed on all sides must be culled.
        if (height >= 3) {
          const neighborsBuried = [
            world.getGroundHeight(x + 1, z),
            world.getGroundHeight(x - 1, z),
            world.getGroundHeight(x, z + 1),
            world.getGroundHeight(x, z - 1),
          ].every((neighborHeight) => neighborHeight >= 2);
          if (neighborsBuried) {
            expect(byKey.has(`${x},0,${z}`)).toBe(false);
          }
        }
      }
    }
  });

  it("includes water surfaces", () => {
    // The island pond extends just past the footprint; sample its window.
    const cells = world.getCellsInWindow(10, 9, 4);
    const water = cells.filter((cell) => cell.id === BLOCK_ID.water);
    expect(water.length).toBeGreaterThan(0);
  });
});

describe("InfiniteWorld prefetch", () => {
  it("generates nearest missing chunks first, within budget", () => {
    const world = createWorld();
    const generated = world.prefetchAround(0, 0, 24, 4);
    expect(generated).toBe(4);

    // The player's own chunk is among the first generated.
    expect(world.hasChunk(0, 0)).toBe(true);

    // Repeated calls finish the set and then go idle.
    let safety = 100;
    while (world.prefetchAround(0, 0, 24, 8) > 0 && safety-- > 0) {
      // drain
    }
    expect(world.prefetchAround(0, 0, 24, 8)).toBe(0);

    const span = Math.floor(24 / CHUNK_SIZE);
    for (let cx = -span; cx <= span; cx++) {
      for (let cz = -span; cz <= span; cz++) {
        expect(world.hasChunk(cx, cz)).toBe(true);
      }
    }
  });
});
