import { describe, expect, it } from "bun:test";
import { InfiniteWorld } from "../../../game/world/infinite-world";
import {
  DEFAULT_WORLD_SEED,
  TerrainGenerator,
} from "../../../game/world/terrain-generator";
import { VoxelWorld } from "../../../game/world/world";
import { loadWorldCellsFromString } from "../../../game/world/world-loader";
import worldData from "../world-data";
import {
  computeFringeLayout,
  computeWindowFringeLayout,
  FRINGE_CONFIG,
} from "./fringe-layout";

const world = new VoxelWorld(loadWorldCellsFromString(worldData));

function hasGridTile(
  layout: ReturnType<typeof computeFringeLayout>,
  x: number,
  z: number
): boolean {
  return layout.gridTiles.some((tile) => tile.x === x && tile.z === z);
}

function hasWireframe(
  layout: ReturnType<typeof computeFringeLayout>,
  x: number,
  y: number,
  z: number
): boolean {
  return layout.wireframes.some(
    (wireframe) => wireframe.x === x && wireframe.y === y && wireframe.z === z
  );
}

describe("computeFringeLayout", () => {
  it("covers all four perimeter edges including negative coords", () => {
    const layout = computeFringeLayout(world);

    expect(hasWireframe(layout, 10, 0, 5)).toBe(true);
    expect(hasWireframe(layout, -1, 0, 5)).toBe(true);
    expect(hasWireframe(layout, 5, 0, 10)).toBe(true);
    expect(hasWireframe(layout, 5, 0, -1)).toBe(true);

    expect(hasGridTile(layout, -2, 5)).toBe(true);
    expect(hasGridTile(layout, 5, -2)).toBe(true);
    expect(hasGridTile(layout, 12, 5)).toBe(true);
    expect(hasGridTile(layout, 5, 12)).toBe(true);
  });

  it("fills all four corner quadrants without gaps", () => {
    const layout = computeFringeLayout(world);
    const { wireframeRows, gridRows } = FRINGE_CONFIG;
    const maxX = 9;
    const maxZ = 9;

    const corners = [
      { signX: 1, signZ: 1, baseX: maxX, baseZ: maxZ },
      { signX: -1, signZ: 1, baseX: 0, baseZ: maxZ },
      { signX: 1, signZ: -1, baseX: maxX, baseZ: 0 },
      { signX: -1, signZ: -1, baseX: 0, baseZ: 0 },
    ] as const;

    for (const { signX, signZ, baseX, baseZ } of corners) {
      const gaps: string[] = [];

      for (let xRow = 0; xRow <= gridRows; xRow++) {
        for (let zRow = 0; zRow <= gridRows; zRow++) {
          if (xRow === 0 && zRow === 0) {
            continue;
          }

          const x = baseX + signX * (wireframeRows + xRow);
          const z = baseZ + signZ * (wireframeRows + zRow);
          if (!hasGridTile(layout, x, z)) {
            gaps.push(`${x},${z}`);
          }
        }
      }

      expect(gaps).toEqual([]);
    }
  });

  it("includes wireframes for the island's own non-water cells", () => {
    const layout = computeFringeLayout(world);

    // Stone at the island base and grass on the surface get wireframes.
    expect(hasWireframe(layout, 0, 0, 0)).toBe(true);
    expect(hasWireframe(layout, 0, 4, 0)).toBe(true);

    // Water cells never get wireframes (pond at y=1, z=9).
    expect(hasWireframe(layout, 5, 1, 9)).toBe(false);
  });

  it("limits back-edge wireframe height to top grass, ignoring leaves", () => {
    const layout = computeFringeLayout(world);
    const backWireframeYs = layout.wireframes
      .filter((wireframe) => wireframe.x === -1 && wireframe.z === 0)
      .map((wireframe) => wireframe.y)
      .sort((a, b) => a - b);

    expect(backWireframeYs).toEqual([0, 1, 2, 3]);
    expect(hasWireframe(layout, -1, 4, 0)).toBe(false);
  });

  it("assigns outward vectors pointing away from world center", () => {
    const layout = computeFringeLayout(world);
    const bounds = world.getBounds();
    const centerX = (bounds.min.x + bounds.max.x + 1) / 2;
    const centerZ = (bounds.min.z + bounds.max.z + 1) / 2;

    for (const tile of layout.gridTiles) {
      const toCenterX = centerX - (tile.x + 0.5);
      const toCenterZ = centerZ - (tile.z + 0.5);
      const dot = tile.outward[0] * toCenterX + tile.outward[1] * toCenterZ;
      expect(dot).toBeLessThan(0);
      expect(tile.emissionWeight).toBe(tile.opacity);
      expect(tile.row).toBeGreaterThanOrEqual(1);
      expect(tile.row).toBeLessThanOrEqual(FRINGE_CONFIG.gridRows);
    }
  });
});

describe("computeWindowFringeLayout", () => {
  const infiniteWorld = new InfiniteWorld(
    new TerrainGenerator(
      DEFAULT_WORLD_SEED,
      loadWorldCellsFromString(worldData)
    )
  );

  function buildLayout(centerX: number, centerZ: number, radius: number) {
    const cells = infiniteWorld.getCellsInWindow(centerX, centerZ, radius);
    return {
      cells,
      layout: computeWindowFringeLayout(
        infiniteWorld,
        centerX,
        centerZ,
        radius,
        cells
      ),
    };
  }

  it("centers the focus on the window and wraps it with a ring", () => {
    const radius = 6;
    const { layout } = buildLayout(40, 40, radius);

    expect(layout.focus.x).toBe(40.5);
    expect(layout.focus.z).toBe(40.5);

    const { wireframeRows } = FRINGE_CONFIG;
    // Ring wireframe columns sit just past the window edge on all sides.
    const groundEast = infiniteWorld.getGroundHeight(40 + radius, 40);
    if (groundEast > 0) {
      expect(
        layout.wireframes.some(
          (wireframe) =>
            wireframe.x === 40 + radius + wireframeRows && wireframe.z === 40
        )
      ).toBe(true);
    }
    // Grid tiles extend beyond the wireframe row.
    expect(
      layout.gridTiles.some(
        (tile) => tile.x === 40 + radius + wireframeRows + 1 && tile.z === 40
      )
    ).toBe(true);
    expect(
      layout.gridTiles.some(
        (tile) => tile.x === 40 - radius - wireframeRows - 1 && tile.z === 40
      )
    ).toBe(true);
  });

  it("gives window surface cells wireframes but never water", () => {
    const { cells, layout } = buildLayout(11, 9, 5);
    const wireframeKeys = new Set(
      layout.wireframes.map(
        (wireframe) => `${wireframe.x},${wireframe.y},${wireframe.z}`
      )
    );

    let sawWater = false;
    for (const cell of cells) {
      const key = `${cell.x},${cell.y},${cell.z}`;
      if (cell.id === 9) {
        sawWater = true;
        expect(wireframeKeys.has(key)).toBe(false);
      } else {
        expect(wireframeKeys.has(key)).toBe(true);
      }
    }
    // The pond extension just past the island guarantees water in this window.
    expect(sawWater).toBe(true);
  });

  it("moves with the window center", () => {
    const a = buildLayout(40, 40, 6).layout;
    const b = buildLayout(41, 40, 6).layout;
    expect(b.focus.x - a.focus.x).toBe(1);

    const aTiles = new Set(a.gridTiles.map((tile) => `${tile.x},${tile.z}`));
    const bTiles = new Set(b.gridTiles.map((tile) => `${tile.x},${tile.z}`));
    expect(aTiles).not.toEqual(bTiles);
  });
});
