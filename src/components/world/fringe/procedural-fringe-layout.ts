import { CHUNK_SIZE_XZ } from "../../../game/world/procedural/chunk-coords";
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
  const minX = bounds.min.x + CHUNK_SIZE_XZ;
  const maxX = bounds.max.x - CHUNK_SIZE_XZ;
  const minZ = bounds.min.z + CHUNK_SIZE_XZ;
  const maxZ = bounds.max.z - CHUNK_SIZE_XZ;
  const wireframes = new Map<string, FringeWireframe>();
  const gridTiles = new Map<string, FringeGridTile>();

  for (let x = minX; x <= maxX; x++) {
    addWireColumn(wireframes, world, x, minZ, 0.9);
    addWireColumn(wireframes, world, x, maxZ, 0.9);
  }

  for (let z = minZ; z <= maxZ; z++) {
    addWireColumn(wireframes, world, minX, z, 0.9);
    addWireColumn(wireframes, world, maxX, z, 0.9);
  }

  for (let row = 1; row <= FRINGE_CONFIG.gridRows; row++) {
    for (let x = minX - row; x <= maxX + row; x++) {
      addGridTile(gridTiles, x, minZ - row, row, centerX, centerZ);
      addGridTile(gridTiles, x, maxZ + row, row, centerX, centerZ);
    }

    for (let z = minZ - row; z <= maxZ + row; z++) {
      addGridTile(gridTiles, minX - row, z, row, centerX, centerZ);
      addGridTile(gridTiles, maxX + row, z, row, centerX, centerZ);
    }
  }

  return {
    wireframes: Array.from(wireframes.values()),
    gridTiles: Array.from(gridTiles.values()),
    gridY: FRINGE_CONFIG.gridY,
    focus: { x: centerX, y: 0, z: centerZ },
  };
}
