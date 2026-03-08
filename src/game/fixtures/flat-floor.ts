import { VoxelWorld } from "../world/world";

export function createFlatFloorWorld(width = 6, depth = 6): VoxelWorld {
  const cells = [];

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      cells.push({ x, y: 0, z, id: 1 });
    }
  }

  return new VoxelWorld(cells);
}
