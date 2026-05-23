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

function getColumnTopY(
  world: VoxelWorld,
  x: number,
  z: number
): number | null {
  return world.getHighestSolidCell(x, z);
}

function getWireframeMaxY(topY: number): number {
  return topY > 0 ? topY - 1 : 0;
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

export function computeFringeLayout(world: VoxelWorld): FringeLayout {
  const bounds = world.getBounds();
  const { wireframeRows, gridRows } = FRINGE_CONFIG;
  const maxX = bounds.max.x;
  const maxZ = bounds.max.z;

  const wireframes = new Map<string, FringeWireframe>();
  const gridTiles = new Map<string, FringeGridTile>();

  for (let z = bounds.min.z; z <= maxZ; z++) {
    const topY = getColumnTopY(world, maxX, z);
    if (topY === null) {
      continue;
    }

    const maxWireframeY = getWireframeMaxY(topY);

    for (let row = 1; row <= wireframeRows; row++) {
      const opacity =
        FRINGE_CONFIG.wireframeOpacityByRow[row - 1] ??
        FRINGE_CONFIG.wireframeOpacityByRow.at(-1) ??
        1.0;
      for (let y = 0; y <= maxWireframeY; y++) {
        addWireframe(wireframes, maxX + row, y, z, opacity);
      }
    }

    for (let row = 1; row <= gridRows; row++) {
      const opacity =
        FRINGE_CONFIG.gridOpacityByRow[row - 1] ??
        FRINGE_CONFIG.gridOpacityByRow.at(-1) ??
        0.2;
      addGridTile(gridTiles, maxX + wireframeRows + row, z, opacity);
    }
  }

  for (let x = bounds.min.x; x <= maxX; x++) {
    const topY = getColumnTopY(world, x, maxZ);
    if (topY === null) {
      continue;
    }

    const maxWireframeY = getWireframeMaxY(topY);

    for (let row = 1; row <= wireframeRows; row++) {
      const opacity =
        FRINGE_CONFIG.wireframeOpacityByRow[row - 1] ??
        FRINGE_CONFIG.wireframeOpacityByRow.at(-1) ??
        1.0;
      for (let y = 0; y <= maxWireframeY; y++) {
        addWireframe(wireframes, x, y, maxZ + row, opacity);
      }
    }

    for (let row = 1; row <= gridRows; row++) {
      const opacity =
        FRINGE_CONFIG.gridOpacityByRow[row - 1] ??
        FRINGE_CONFIG.gridOpacityByRow.at(-1) ??
        0.2;
      addGridTile(gridTiles, x, maxZ + wireframeRows + row, opacity);
    }
  }

  for (let xRow = 1; xRow <= gridRows; xRow++) {
    for (let zRow = 1; zRow <= gridRows; zRow++) {
      const row = Math.max(xRow, zRow);
      const opacity =
        FRINGE_CONFIG.gridOpacityByRow[row - 1] ??
        FRINGE_CONFIG.gridOpacityByRow.at(-1) ??
        0.2;
      addGridTile(
        gridTiles,
        maxX + wireframeRows + xRow,
        maxZ + wireframeRows + zRow,
        opacity
      );
    }
  }

  // Bridge the +x and +z arms (they only cover z<=maxZ and x<=maxX respectively).
  for (let row = 1; row <= gridRows; row++) {
    const opacity =
      FRINGE_CONFIG.gridOpacityByRow[row - 1] ??
      FRINGE_CONFIG.gridOpacityByRow.at(-1) ??
      0.2;
    addGridTile(
      gridTiles,
      maxX + wireframeRows + row,
      maxZ + wireframeRows,
      opacity
    );
    addGridTile(
      gridTiles,
      maxX + wireframeRows,
      maxZ + wireframeRows + row,
      opacity
    );
  }

  return {
    wireframes: Array.from(wireframes.values()),
    gridTiles: Array.from(gridTiles.values()),
    gridY: FRINGE_CONFIG.gridY,
  };
}
