import { describe, expect, it } from "bun:test";
import worldData from "../../../components/world/world-data";
import { createBodyAABB } from "../../core/math/aabb";
import { vec3 } from "../../core/math/vec3";
import { PLAYER_COLLIDER } from "../../rules/constants";
import { VoxelWorld } from "../world";
import { loadWorldCellsFromString } from "../world-loader";
import { columnIndex } from "./chunk";
import { CHUNK_SIZE_XZ } from "./chunk-coords";
import { ChunkStore } from "./chunk-store";
import {
  classifyChunkLod,
  FULL_DETAIL_SIZE_XZ,
  PROCEDURAL_LOD_BUDGETS,
  sampleColumnLod,
} from "./lod-policy";
import { ProceduralWorldRuntime } from "./procedural-runtime";
import { ProceduralVoxelWorld } from "./procedural-world";
import { StarterRegion } from "./starter-region";
import { TerrainGenerator } from "./terrain-generator";

describe("StarterRegion", () => {
  it("indexes authored seed cells without generating replacement blocks", () => {
    const seedCells = loadWorldCellsFromString(worldData);
    const starterRegion = new StarterRegion(seedCells);
    const bounds = starterRegion.getBounds();

    expect(bounds.min.x).toBe(0);
    expect(bounds.min.z).toBe(0);
    expect(bounds.max.x).toBe(9);
    expect(bounds.max.z).toBe(9);

    for (const cell of seedCells.slice(0, 25)) {
      expect(starterRegion.getBlockIdAtCell(cell.x, cell.y, cell.z)).toBe(
        cell.id
      );
    }
  });
});

describe("TerrainGenerator", () => {
  it("generates deterministic chunks for a seed", () => {
    const first = new TerrainGenerator({ seed: 42 }).generateChunk(1, -2);
    const second = new TerrainGenerator({ seed: 42 }).generateChunk(1, -2);

    expect(Array.from(first.heightmap)).toEqual(Array.from(second.heightmap));
    expect(first.exposedCells).toEqual(second.exposedCells);
  });

  it("blends generated columns away from the authored seed edge", () => {
    const seedCells = loadWorldCellsFromString(worldData);
    const starterRegion = new StarterRegion(seedCells);
    const generator = new TerrainGenerator({ seed: 17, starterRegion });

    for (let x = 0; x <= 9; x++) {
      const seedHeight = starterRegion.getHighestSolidCell(x, 0);
      const generatedHeight = generator.getColumn(x, -1).height;

      expect(seedHeight).not.toBeNull();
      expect(
        Math.abs(generatedHeight - (seedHeight as number))
      ).toBeLessThanOrEqual(2);
    }
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

describe("ProceduralWorldRuntime", () => {
  it("keeps preview snapshots anchored to the authored 10x10 seed", () => {
    const seedCells = loadWorldCellsFromString(worldData);
    const runtime = new ProceduralWorldRuntime({
      seed: 19,
      mode: "preview",
      previewCenterX: 5,
      previewCenterZ: 5,
      seedCells,
    });

    runtime.updateFocus({ x: 100, y: 0, z: 100 }, "preview");
    const snapshot = runtime.createSnapshot();

    expect(snapshot.fullDetailBounds.min.x).toBe(0);
    expect(snapshot.fullDetailBounds.min.z).toBe(0);
    expect(snapshot.fullDetailBounds.max.x).toBe(9);
    expect(snapshot.fullDetailBounds.max.z).toBe(9);
    expect(snapshot.mode).toBe("preview");
  });

  it("builds overlapping fade bands in render snapshots", () => {
    const runtime = new ProceduralWorldRuntime({
      seed: 19,
      mode: "interactive",
      previewCenterX: 5,
      previewCenterZ: 5,
      seedCells: loadWorldCellsFromString(worldData),
    });

    runtime.updateFocus({ x: 5, y: 0, z: 5 }, "interactive");
    const snapshot = runtime.createSnapshot();

    expect(snapshot.highDetailCells.some((cell) => cell.opacity < 1)).toBe(
      true
    );
    expect(snapshot.midDetailColumns.length).toBeGreaterThan(0);
    expect(snapshot.wireColumns.length).toBeGreaterThan(0);
    expect(
      new Set(snapshot.wireColumns.map((column) => column.opacity)).size
    ).toBeGreaterThan(1);
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

  it("keeps the fully rendered procedural footprint at 10x10 columns", () => {
    const world = new ProceduralVoxelWorld({ seed: 17, mode: "interactive" });
    const bounds = world.getBounds();
    const cells = world.getRenderableCells();
    const renderedColumns = new Set(cells.map((cell) => `${cell.x},${cell.z}`));

    expect(bounds.max.x - bounds.min.x + 1).toBe(FULL_DETAIL_SIZE_XZ);
    expect(bounds.max.z - bounds.min.z + 1).toBe(FULL_DETAIL_SIZE_XZ);
    expect(renderedColumns.size).toBe(
      FULL_DETAIL_SIZE_XZ * FULL_DETAIL_SIZE_XZ
    );
    expect(
      cells.every(
        (cell) =>
          cell.x >= bounds.min.x &&
          cell.x <= bounds.max.x &&
          cell.z >= bounds.min.z &&
          cell.z <= bounds.max.z
      )
    ).toBe(true);
  });

  it("keeps preview bounds anchored even as focus updates", () => {
    const world = new ProceduralVoxelWorld({
      seed: 17,
      mode: "preview",
      centerX: 5,
      centerZ: 5,
    });
    const initialBounds = world.getBounds();

    world.updateFocus(100, 100, "preview");

    expect(world.getBounds()).toEqual(initialBounds);
  });

  it("uses the existing static map as the initial 10x10 seed area", () => {
    const seedCells = loadWorldCellsFromString(worldData);
    const world = new ProceduralVoxelWorld({
      seed: 17,
      mode: "preview",
      centerX: 5,
      centerZ: 5,
      seedCells,
    });
    const bounds = world.getBounds();

    expect(bounds.min.x).toBe(0);
    expect(bounds.min.z).toBe(0);
    expect(bounds.max.x).toBe(9);
    expect(bounds.max.z).toBe(9);

    for (const cell of seedCells) {
      expect(world.getBlockIdAtCell(cell.x, cell.y, cell.z)).toBe(cell.id);
    }
  });

  it("matches the static map exposed cells for the seeded 10x10 preview", () => {
    const seedCells = loadWorldCellsFromString(worldData);
    const staticWorld = new VoxelWorld(seedCells);
    const proceduralWorld = new ProceduralVoxelWorld({
      seed: 17,
      mode: "preview",
      centerX: 5,
      centerZ: 5,
      seedCells,
    });
    const staticKeys = new Set(
      staticWorld
        .getExposedRenderableCells()
        .map((cell) => `${cell.x},${cell.y},${cell.z},${cell.id}`)
    );
    const proceduralKeys = new Set(
      proceduralWorld
        .getExposedRenderableCells()
        .map((cell) => `${cell.x},${cell.y},${cell.z},${cell.id}`)
    );

    expect(proceduralKeys).toEqual(staticKeys);
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

  it("returns continuous opacity samples by column distance", () => {
    const bounds = {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 9, y: 4, z: 9 },
    };
    const near = sampleColumnLod(
      10,
      5,
      bounds,
      PROCEDURAL_LOD_BUDGETS.interactive
    );
    const far = sampleColumnLod(
      18,
      5,
      bounds,
      PROCEDURAL_LOD_BUDGETS.interactive
    );

    expect(near.blockOpacity).toBeGreaterThan(far.blockOpacity);
    expect(far.wireOpacity).toBeGreaterThan(near.wireOpacity);
  });
});
