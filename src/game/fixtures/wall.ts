import { VoxelWorld } from "../world/world";

export function createWallWorld(): VoxelWorld {
  const cells = [];

  for (let x = 0; x < 6; x++) {
    for (let z = 0; z < 6; z++) {
      cells.push({ x, y: 0, z, id: 1 });
    }
  }

  for (let y = 1; y <= 2; y++) {
    cells.push({ x: 3, y, z: 2, id: 1 });
  }

  return new VoxelWorld(cells);
}
