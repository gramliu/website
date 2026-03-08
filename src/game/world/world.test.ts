import { describe, expect, it } from "bun:test";
import { createBodyAABB } from "../core/math/aabb";
import { vec3 } from "../core/math/vec3";
import { PLAYER_COLLIDER } from "../rules/constants";
import { VoxelWorld } from "./world";

describe("VoxelWorld", () => {
  it("treats water as fluid but not solid", () => {
    const world = new VoxelWorld([
      { x: 0, y: 0, z: 0, id: 1 },
      { x: 1, y: 0, z: 0, id: 9 },
    ]);

    expect(world.isCellSolid(0, 0, 0)).toBe(true);
    expect(world.isCellSolid(1, 0, 0)).toBe(false);
    expect(world.isCellFluid(1, 0, 0)).toBe(true);
  });

  it("detects adjacent fluid faces for rendering", () => {
    const world = new VoxelWorld([
      { x: 1, y: 1, z: 1, id: 9 },
      { x: 2, y: 1, z: 1, id: 9 },
      { x: 1, y: 2, z: 1, id: 9 },
    ]);

    expect(world.getFluidAdjacency(1, 1, 1)).toEqual({
      top: true,
      bottom: false,
      north: false,
      south: false,
      east: true,
      west: false,
    });
  });

  it("collides player bodies against solid cells", () => {
    const world = new VoxelWorld([{ x: 0, y: 0, z: 0, id: 1 }]);

    const colliding = createBodyAABB(vec3(0.5, 0.2, 0.5), PLAYER_COLLIDER);
    const clear = createBodyAABB(vec3(0.5, 1, 0.5), PLAYER_COLLIDER);

    expect(world.collidesAABB(colliding)).toBe(true);
    expect(world.collidesAABB(clear)).toBe(false);
  });
});
