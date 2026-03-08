import { createBodyAABB, translateAABB } from "../core/math/aabb";
import { normalizeXZ, vec3 } from "../core/math/vec3";
import type { PlayerInputFrame } from "../core/types";
import type { PlayerState } from "../entities/player";
import {
  AUTOPLAY_MAX_Z,
  AUTOPLAY_MIN_Z,
  COLLISION_EPSILON,
  FIXED_TIMESTEP,
  PLAYER_MOVE_SPEED,
} from "../rules/constants";
import type { VoxelWorld } from "../world/world";

export function createPlayerInputFrame(
  input: Partial<PlayerInputFrame> = {}
): PlayerInputFrame {
  return {
    moveX: input.moveX ?? 0,
    moveZ: input.moveZ ?? 0,
    jumpHeld: input.jumpHeld ?? false,
    jumpPressed: input.jumpPressed ?? false,
  };
}

export function createAutoplayInputFrame(
  player: PlayerState,
  world: VoxelWorld
): PlayerInputFrame {
  const direction =
    player.position.z <= AUTOPLAY_MIN_Z + 0.25
      ? 1
      : player.position.z >= AUTOPLAY_MAX_Z + 0.75
        ? -1
        : player.velocity.z === 0
          ? 1
          : Math.sign(player.velocity.z);

  const nextInput = createPlayerInputFrame({
    moveZ: direction,
  });

  if (shouldAutoplayJump(player, world, nextInput)) {
    return createPlayerInputFrame({
      ...nextInput,
      jumpHeld: true,
      jumpPressed: true,
    });
  }

  return nextInput;
}

function shouldAutoplayJump(
  player: PlayerState,
  world: VoxelWorld,
  input: PlayerInputFrame
): boolean {
  if (!player.grounded) {
    return false;
  }

  const desiredDirection = normalizeXZ(vec3(input.moveX, 0, input.moveZ));
  if (desiredDirection.x === 0 && desiredDirection.z === 0) {
    return false;
  }

  const lookAheadDistance =
    player.collider.halfWidth + PLAYER_MOVE_SPEED * FIXED_TIMESTEP;
  const projectedAabb = translateAABB(
    createBodyAABB(player.position, player.collider),
    {
      x: desiredDirection.x * lookAheadDistance,
      z: desiredDirection.z * lookAheadDistance,
    }
  );
  const obstacleLevel = Math.floor(player.position.y + COLLISION_EPSILON);
  const overlappingCells = world.getOverlappingCells(projectedAabb);

  const hasObstacleAtRiseLevel = overlappingCells.some((cell) => {
    return (
      cell.y === obstacleLevel && world.isCellSolid(cell.x, cell.y, cell.z)
    );
  });
  const hasObstacleAboveRiseLevel = overlappingCells.some((cell) => {
    return (
      cell.y === obstacleLevel + 1 && world.isCellSolid(cell.x, cell.y, cell.z)
    );
  });

  return hasObstacleAtRiseLevel && !hasObstacleAboveRiseLevel;
}
