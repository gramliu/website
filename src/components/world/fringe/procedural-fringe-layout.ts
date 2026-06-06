import type { RenderableWorldQuery } from "../../../game/world/world-query";
import { computeOutwardVector } from "./fringe-animation";
import {
  FRINGE_CONFIG,
  type FringeGridTile,
  type FringeLayout,
  type FringeWireframe,
} from "./fringe-layout";

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function gridOpacityForRow(row: number): number {
  return (
    FRINGE_CONFIG.gridOpacityByRow[row - 1] ??
    FRINGE_CONFIG.gridOpacityByRow.at(-1) ??
    0.2
  );
}

function addWireColumn(
  wireframes: Map<string, FringeWireframe>,
  world: RenderableWorldQuery,
  x: number,
  z: number,
  opacity: number
): void {
  const topY = world.getHighestSolidCell(x, z);
  if (topY === null) {
    return;
  }

  const maxY = Math.max(0, topY - 1);
  for (let y = 0; y <= maxY; y++) {
    wireframes.set(cellKey(x, y, z), { x, y, z, opacity });
  }
}

function addGridTile(
  gridTiles: Map<string, FringeGridTile>,
  x: number,
  z: number,
  row: number,
  centerX: number,
  centerZ: number
): void {
  const opacity = gridOpacityForRow(row);
  if (opacity < FRINGE_CONFIG.minOpacity) {
    return;
  }

  gridTiles.set(`${x},${z}`, {
    x,
    z,
    opacity,
    row,
    outward: computeOutwardVector(x, z, centerX, centerZ),
    emissionWeight: opacity,
  });
}

export function computeProceduralFringeLayout(
  world: RenderableWorldQuery
): FringeLayout {
  const bounds = world.getBounds();
  const centerX = (bounds.min.x + bounds.max.x) / 2;
  const centerZ = (bounds.min.z + bounds.max.z) / 2;
  const minX = bounds.min.x;
  const maxX = bounds.max.x;
  const minZ = bounds.min.z;
  const maxZ = bounds.max.z;
  const wireMinX = minX - 1;
  const wireMaxX = maxX + 1;
  const wireMinZ = minZ - 1;
  const wireMaxZ = maxZ + 1;
  const wireframes = new Map<string, FringeWireframe>();
  const gridTiles = new Map<string, FringeGridTile>();

  for (let x = wireMinX; x <= wireMaxX; x++) {
    addWireColumn(wireframes, world, x, wireMinZ, 0.9);
    addWireColumn(wireframes, world, x, wireMaxZ, 0.9);
  }

  for (let z = wireMinZ; z <= wireMaxZ; z++) {
    addWireColumn(wireframes, world, wireMinX, z, 0.9);
    addWireColumn(wireframes, world, wireMaxX, z, 0.9);
  }

  for (let row = 1; row <= FRINGE_CONFIG.gridRows; row++) {
    const gridMinX = wireMinX - row;
    const gridMaxX = wireMaxX + row;
    const gridMinZ = wireMinZ - row;
    const gridMaxZ = wireMaxZ + row;

    for (let x = gridMinX; x <= gridMaxX; x++) {
      addGridTile(gridTiles, x, gridMinZ, row, centerX, centerZ);
      addGridTile(gridTiles, x, gridMaxZ, row, centerX, centerZ);
    }

    for (let z = gridMinZ; z <= gridMaxZ; z++) {
      addGridTile(gridTiles, gridMinX, z, row, centerX, centerZ);
      addGridTile(gridTiles, gridMaxX, z, row, centerX, centerZ);
    }
  }

  return {
    wireframes: Array.from(wireframes.values()),
    gridTiles: Array.from(gridTiles.values()),
    gridY: FRINGE_CONFIG.gridY,
    focus: { x: centerX, y: 0, z: centerZ },
  };
}
