import { VoxelWorld } from "../world/world";

export function createAutoplayStepWorld(): VoxelWorld {
  const cells = [];

  for (let x = 0; x < 6; x++) {
    for (let z = 0; z < 8; z++) {
      cells.push({ x, y: 0, z, id: 1 });
    }
  }

  cells.push({ x: 2, y: 1, z: 2, id: 1 });

  return new VoxelWorld(cells);
}
