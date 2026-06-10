import type { WorldBounds } from "../../../game/core/types";
import { getBlockDefinition } from "../../../game/world/block-registry";
import type { VoxelWorld } from "../../../game/world/world";
import { computeOutwardVector } from "./fringe-animation";

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
  row: number;
  outward: [number, number];
  emissionWeight: number;
}

export interface FringeFocus {
  x: number;
  y: number;
  z: number;
}

export interface FringeLayout {
  wireframes: FringeWireframe[];
  gridTiles: FringeGridTile[];
  gridY: number;
  focus: FringeFocus;
}

export const FRINGE_CONFIG = {
  wireframeRows: 1,
  gridRows: 3,
  gridY: 0,
  wireframeOpacityByRow: [1.0],
  gridOpacityByRow: [1.0, 0.3, 0.06],
  minOpacity: 0.05,
  particleMinRow: 2,
  particlePoolSize: 12000,
  particlesPerSecond: 2160,
  particleSize: 0.2,
  particleMinLife: 0.8,
  particleMaxLife: 1.6,
  particleGravity: 0.2,
  // Depth thresholds (world units behind the focus, relative to the camera)
  // controlling the LOD fade: solid blocks -> wireframes -> tiles/particles.
  depthBands: {
    solidFadeStart: 0.75,
    solidFadeEnd: 2.0,
    wireframeFadeStart: 2.5,
    wireframeFadeEnd: 4.0,
  },
  lineFade: {
    lateralInner: 2.0,
    lateralOuter: 8.0,
  },
  // Wireframes live on the island itself (plus one ring row), so the lateral
  // bounds are generous: the fade zone sits well off the camera-focus axis.
  wireframeFade: {
    lateralInner: 7.0,
    lateralOuter: 11.0,
  },
  particleFade: {
    lateralInner: 1.7,
    lateralOuter: 7.3,
  },
  particleFadeExponent: 1.3,
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
    getHighestGrassY(world, x, z) ?? getHighestSolidExcludingLeaves(world, x, z)
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

function addEdgeFringe(
  world: VoxelWorld,
  wireframes: Map<string, FringeWireframe>,
  gridTiles: Map<string, FringeGridTile>,
  config: EdgeFringeConfig,
  centerX: number,
  centerZ: number
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
      const outward = outwardCoord(anchor, sign, wireframeRows + row);
      const gx = axis === "x" ? outward : x;
      const gz = axis === "z" ? outward : z;
      addGridTile(gridTiles, gx, gz, row, centerX, centerZ);
    }
  }
}

function addCornerFringe(
  gridTiles: Map<string, FringeGridTile>,
  signX: FringeSign,
  signZ: FringeSign,
  bounds: WorldBounds,
  centerX: number,
  centerZ: number
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
        row,
        centerX,
        centerZ
      );
    }
  }

  for (let row = 1; row <= gridRows; row++) {
    addGridTile(
      gridTiles,
      outwardCoord(anchorX, signX, wireframeRows + row),
      outwardCoord(anchorZ, signZ, wireframeRows),
      row,
      centerX,
      centerZ
    );
    addGridTile(
      gridTiles,
      outwardCoord(anchorX, signX, wireframeRows),
      outwardCoord(anchorZ, signZ, wireframeRows + row),
      row,
      centerX,
      centerZ
    );
  }
}

function isExposedCell(
  world: VoxelWorld,
  x: number,
  y: number,
  z: number
): boolean {
  return (
    !world.isCellSolid(x + 1, y, z) ||
    !world.isCellSolid(x - 1, y, z) ||
    !world.isCellSolid(x, y + 1, z) ||
    !world.isCellSolid(x, y - 1, z) ||
    !world.isCellSolid(x, y, z + 1) ||
    !world.isCellSolid(x, y, z - 1)
  );
}

function addIslandWireframes(
  world: VoxelWorld,
  wireframes: Map<string, FringeWireframe>
): void {
  for (const cell of world.getRenderableCells()) {
    if (getBlockDefinition(cell.id).renderKey === "water") {
      continue;
    }

    // Only surface cells get wireframes; interior cells would render as a
    // dense lattice once the solid blocks fade out.
    if (!isExposedCell(world, cell.x, cell.y, cell.z)) {
      continue;
    }

    addWireframe(wireframes, cell.x, cell.y, cell.z, 1.0);
  }
}

export function computeFringeLayout(world: VoxelWorld): FringeLayout {
  const bounds = world.getBounds();
  const centerX = (bounds.min.x + bounds.max.x + 1) / 2;
  const centerZ = (bounds.min.z + bounds.max.z + 1) / 2;
  const wireframes = new Map<string, FringeWireframe>();
  const gridTiles = new Map<string, FringeGridTile>();

  addIslandWireframes(world, wireframes);

  addEdgeFringe(
    world,
    wireframes,
    gridTiles,
    {
      axis: "x",
      sign: 1,
      anchor: bounds.max.x,
      iterateMin: bounds.min.z,
      iterateMax: bounds.max.z,
      useGrassHeight: false,
    },
    centerX,
    centerZ
  );
  addEdgeFringe(
    world,
    wireframes,
    gridTiles,
    {
      axis: "x",
      sign: -1,
      anchor: bounds.min.x,
      iterateMin: bounds.min.z,
      iterateMax: bounds.max.z,
      useGrassHeight: true,
    },
    centerX,
    centerZ
  );
  addEdgeFringe(
    world,
    wireframes,
    gridTiles,
    {
      axis: "z",
      sign: 1,
      anchor: bounds.max.z,
      iterateMin: bounds.min.x,
      iterateMax: bounds.max.x,
      useGrassHeight: false,
    },
    centerX,
    centerZ
  );
  addEdgeFringe(
    world,
    wireframes,
    gridTiles,
    {
      axis: "z",
      sign: -1,
      anchor: bounds.min.z,
      iterateMin: bounds.min.x,
      iterateMax: bounds.max.x,
      useGrassHeight: true,
    },
    centerX,
    centerZ
  );

  addCornerFringe(gridTiles, 1, 1, bounds, centerX, centerZ);
  addCornerFringe(gridTiles, -1, 1, bounds, centerX, centerZ);
  addCornerFringe(gridTiles, 1, -1, bounds, centerX, centerZ);
  addCornerFringe(gridTiles, -1, -1, bounds, centerX, centerZ);

  return {
    wireframes: Array.from(wireframes.values()),
    gridTiles: Array.from(gridTiles.values()),
    gridY: FRINGE_CONFIG.gridY,
    focus: {
      x: centerX,
      y: FRINGE_CONFIG.gridY,
      z: centerZ,
    },
  };
}
