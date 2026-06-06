import { describe, expect, it } from "bun:test";
import { createBodyAABB } from "../../core/math/aabb";
import { vec3 } from "../../core/math/vec3";
import { PLAYER_COLLIDER } from "../../rules/constants";
import { columnIndex } from "./chunk";
import { CHUNK_SIZE_XZ } from "./chunk-coords";
import { ChunkStore } from "./chunk-store";
import { classifyChunkLod, PROCEDURAL_LOD_BUDGETS } from "./lod-policy";
import { ProceduralVoxelWorld } from "./procedural-world";
import { TerrainGenerator } from "./terrain-generator";

describe("TerrainGenerator", () => {
  it("generates deterministic chunks for a seed", () => {
    const first = new TerrainGenerator({ seed: 42 }).generateChunk(1, -2);
    const second = new TerrainGenerator({ seed: 42 }).generateChunk(1, -2);

    expect(Array.from(first.heightmap)).toEqual(Array.from(second.heightmap));
    expect(first.exposedCells).toEqual(second.exposedCells);
  });

  it("keeps heights continuous across chunk boundaries", () => {
    const generator = new TerrainGenerator({ seed: 7 });
    const left = generator.generateChunk(0, 0);
    const right = generator.generateChunk(1, 0);

    for (let z = 0; z < CHUNK_SIZE_XZ; z++) {
      const leftBoundary = left.heightmap[columnIndex(CHUNK_SIZE_XZ - 1, z)];
      const rightBoundary = right.heightmap[columnIndex(0, z)];
      expect(Math.abs(leftBoundary - rightBoundary)).toBeLessThanOrEqual(4);
    }
  });
});

describe("ChunkStore", () => {
  it("evicts least-recently-used chunks when over budget", () => {
    const store = new ChunkStore({
      generator: new TerrainGenerator({ seed: 1 }),
      maxCachedChunks: 2,
    });

    store.ensureChunk(0, 0);
    store.ensureChunk(1, 0);
    store.ensureChunk(2, 0);

    expect(store.size).toBe(2);
    expect(store.hasChunk(0, 0)).toBe(false);
    expect(store.hasChunk(1, 0)).toBe(true);
    expect(store.hasChunk(2, 0)).toBe(true);
  });
});

describe("ProceduralVoxelWorld", () => {
  it("answers block and collision queries across chunk boundaries", () => {
    const world = new ProceduralVoxelWorld({ seed: 5, mode: "interactive" });
    const leftHeight = world.getHighestSolidCell(CHUNK_SIZE_XZ - 1, 0);
    const rightHeight = world.getHighestSolidCell(CHUNK_SIZE_XZ, 0);

    expect(leftHeight).not.toBeNull();
    expect(rightHeight).not.toBeNull();
    expect(world.isCellSolid(CHUNK_SIZE_XZ - 1, leftHeight as number, 0)).toBe(
      true
    );
    expect(world.isCellSolid(CHUNK_SIZE_XZ, rightHeight as number, 0)).toBe(
      true
    );
  });

  it("places spawn above generated terrain", () => {
    const world = new ProceduralVoxelWorld({ seed: 11 });
    const spawn = world.findSpawnColumn(0, 0);

    expect(world.isCellSolid(spawn.x, spawn.y - 1, spawn.z)).toBe(true);
    expect(world.isCellSolid(spawn.x, spawn.y, spawn.z)).toBe(false);
  });

  it("collides with generated ground", () => {
    const world = new ProceduralVoxelWorld({ seed: 13, mode: "interactive" });
    const spawn = world.findSpawnColumn(0, 0);
    const aabb = createBodyAABB(
      vec3(spawn.x + 0.5, spawn.y - 0.9, spawn.z + 0.5),
      PLAYER_COLLIDER
    );

    expect(world.collidesAABB(aabb)).toBe(true);
  });
});

describe("procedural LOD policy", () => {
  it("keeps preview mode lightweight", () => {
    const budget = PROCEDURAL_LOD_BUDGETS.preview;

    expect(classifyChunkLod(0, budget)).toBe("high");
    expect(classifyChunkLod(1, budget)).toBe("mid");
    expect(classifyChunkLod(2, budget)).toBe("wire");
    expect(classifyChunkLod(4, budget)).toBe("unloaded");
    expect(budget.particlesEnabled).toBe(false);
    expect(budget.shadowsEnabled).toBe(false);
  });
});
