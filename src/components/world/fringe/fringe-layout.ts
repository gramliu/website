import type { WorldBounds } from "../../../game/core/types";
import type { VoxelWorld } from "../../../game/world/world";

export interface FringeWireframe {
  x: number;
  y: number;
  z: number;
  opacity: number;
}

export interface FringeGridTile {
  x: number;
  z: number;
  opacity: number;
}

export interface FringeLayout {
  wireframes: FringeWireframe[];
  gridTiles: FringeGridTile[];
  gridY: number;
}

export const FRINGE_CONFIG = {
  wireframeRows: 1,
  gridRows: 3,
  gridY: 0,
  wireframeOpacityByRow: [1.0],
  gridOpacityByRow: [1.0, 0.55, 0.2],
  minOpacity: 0.05,
} as const;

type FringeAxis = "x" | "z";
type FringeSign = 1 | -1;

interface EdgeFringeConfig {
  axis: FringeAxis;
  sign: FringeSign;
  anchor: number;
  iterateMin: number;
  iterateMax: number;
  useGrassHeight: boolean;
}

function getHighestGrassY(
  world: VoxelWorld,
  x: number,
  z: number
): number | null {
  const bounds = world.getBounds();
  for (let y = bounds.max.y; y >= bounds.min.y; y--) {
    if (world.getBlockAtCell(x, y, z).renderKey === "grass") {
      return y;
    }
  }

  return null;
}

function getHighestSolidExcludingLeaves(
  world: VoxelWorld,
  x: number,
  z: number
): number | null {
  const bounds = world.getBounds();
  for (let y = bounds.max.y; y >= bounds.min.y; y--) {
    if (!world.isCellSolid(x, y, z)) {
      continue;
    }

    if (world.getBlockAtCell(x, y, z).renderKey === "leaves") {
      continue;
    }

    return y;
  }

  return null;
}

function getColumnTopY(
  world: VoxelWorld,
  x: number,
  z: number,
  useGrassHeight: boolean
): number | null {
  if (!useGrassHeight) {
    return world.getHighestSolidCell(x, z);
  }

  return (
    getHighestGrassY(world, x, z) ??
    getHighestSolidExcludingLeaves(world, x, z)
  );
}

function getWireframeMaxY(topY: number): number {
  return topY > 0 ? topY - 1 : 0;
}

function outwardCoord(
  anchor: number,
  sign: FringeSign,
  offset: number
): number {
  return anchor + sign * offset;
}

function gridOpacityForRow(row: number): number {
  return (
    FRINGE_CONFIG.gridOpacityByRow[row - 1] ??
    FRINGE_CONFIG.gridOpacityByRow.at(-1) ??
    0.2
  );
}

function wireframeOpacityForRow(row: number): number {
  return (
    FRINGE_CONFIG.wireframeOpacityByRow[row - 1] ??
    FRINGE_CONFIG.wireframeOpacityByRow.at(-1) ??
    1.0
  );
}

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function addWireframe(
  wireframes: Map<string, FringeWireframe>,
  x: number,
  y: number,
  z: number,
  opacity: number
): void {
  wireframes.set(cellKey(x, y, z), { x, y, z, opacity });
}

function addGridTile(
  gridTiles: Map<string, FringeGridTile>,
  x: number,
  z: number,
  opacity: number
): void {
  if (opacity < FRINGE_CONFIG.minOpacity) {
    return;
  }

  gridTiles.set(`${x},${z}`, { x, z, opacity });
}

function addEdgeFringe(
  world: VoxelWorld,
  wireframes: Map<string, FringeWireframe>,
  gridTiles: Map<string, FringeGridTile>,
  config: EdgeFringeConfig
): void {
  const { wireframeRows, gridRows } = FRINGE_CONFIG;
  const { axis, sign, anchor, iterateMin, iterateMax, useGrassHeight } = config;

  for (let i = iterateMin; i <= iterateMax; i++) {
    const x = axis === "x" ? anchor : i;
    const z = axis === "z" ? anchor : i;
    const topY = getColumnTopY(world, x, z, useGrassHeight);
    if (topY === null) {
      continue;
    }

    const maxWireframeY = getWireframeMaxY(topY);

    for (let row = 1; row <= wireframeRows; row++) {
      const opacity = wireframeOpacityForRow(row);
      const outward = outwardCoord(anchor, sign, row);
      const wx = axis === "x" ? outward : x;
      const wz = axis === "z" ? outward : z;
      for (let y = 0; y <= maxWireframeY; y++) {
        addWireframe(wireframes, wx, y, wz, opacity);
      }
    }

    for (let row = 1; row <= gridRows; row++) {
      const opacity = gridOpacityForRow(row);
      const outward = outwardCoord(anchor, sign, wireframeRows + row);
      const gx = axis === "x" ? outward : x;
      const gz = axis === "z" ? outward : z;
      addGridTile(gridTiles, gx, gz, opacity);
    }
  }
}

function addCornerFringe(
  gridTiles: Map<string, FringeGridTile>,
  signX: FringeSign,
  signZ: FringeSign,
  bounds: WorldBounds
): void {
  const { wireframeRows, gridRows } = FRINGE_CONFIG;
  const anchorX = signX === 1 ? bounds.max.x : bounds.min.x;
  const anchorZ = signZ === 1 ? bounds.max.z : bounds.min.z;

  for (let xRow = 1; xRow <= gridRows; xRow++) {
    for (let zRow = 1; zRow <= gridRows; zRow++) {
      const row = Math.max(xRow, zRow);
      addGridTile(
        gridTiles,
        outwardCoord(anchorX, signX, wireframeRows + xRow),
        outwardCoord(anchorZ, signZ, wireframeRows + zRow),
        gridOpacityForRow(row)
      );
    }
  }

  for (let row = 1; row <= gridRows; row++) {
    const opacity = gridOpacityForRow(row);
    addGridTile(
      gridTiles,
      outwardCoord(anchorX, signX, wireframeRows + row),
      outwardCoord(anchorZ, signZ, wireframeRows),
      opacity
    );
    addGridTile(
      gridTiles,
      outwardCoord(anchorX, signX, wireframeRows),
      outwardCoord(anchorZ, signZ, wireframeRows + row),
      opacity
    );
  }
}

export function computeFringeLayout(world: VoxelWorld): FringeLayout {
  const bounds = world.getBounds();
  const wireframes = new Map<string, FringeWireframe>();
  const gridTiles = new Map<string, FringeGridTile>();

  addEdgeFringe(world, wireframes, gridTiles, {
    axis: "x",
    sign: 1,
    anchor: bounds.max.x,
    iterateMin: bounds.min.z,
    iterateMax: bounds.max.z,
    useGrassHeight: false,
  });
  addEdgeFringe(world, wireframes, gridTiles, {
    axis: "x",
    sign: -1,
    anchor: bounds.min.x,
    iterateMin: bounds.min.z,
    iterateMax: bounds.max.z,
    useGrassHeight: true,
  });
  addEdgeFringe(world, wireframes, gridTiles, {
    axis: "z",
    sign: 1,
    anchor: bounds.max.z,
    iterateMin: bounds.min.x,
    iterateMax: bounds.max.x,
    useGrassHeight: false,
  });
  addEdgeFringe(world, wireframes, gridTiles, {
    axis: "z",
    sign: -1,
    anchor: bounds.min.z,
    iterateMin: bounds.min.x,
    iterateMax: bounds.max.x,
    useGrassHeight: true,
  });

  addCornerFringe(gridTiles, 1, 1, bounds);
  addCornerFringe(gridTiles, -1, 1, bounds);
  addCornerFringe(gridTiles, 1, -1, bounds);
  addCornerFringe(gridTiles, -1, -1, bounds);

  return {
    wireframes: Array.from(wireframes.values()),
    gridTiles: Array.from(gridTiles.values()),
    gridY: FRINGE_CONFIG.gridY,
  };
}
