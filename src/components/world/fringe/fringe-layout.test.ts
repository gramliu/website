import { describe, expect, it } from "bun:test";
import { VoxelWorld } from "../../../game/world/world";
import { loadWorldCellsFromString } from "../../../game/world/world-loader";
import worldData from "../world-data";
import { computeFringeLayout, FRINGE_CONFIG } from "./fringe-layout";

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
