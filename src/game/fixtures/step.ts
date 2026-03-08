import { VoxelWorld } from "../world/world";

export function createStepWorld(): VoxelWorld {
  const cells = [];

  for (let x = 0; x < 6; x++) {
    for (let z = 0; z < 6; z++) {
      cells.push({ x, y: 0, z, id: 1 });
    }
  }

  cells.push({ x: 2, y: 1, z: 2, id: 1 });

  return new VoxelWorld(cells);
}
