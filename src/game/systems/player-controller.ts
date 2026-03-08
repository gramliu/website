import { createBodyAABB, translateAABB } from "../core/math/aabb";
import { normalizeXZ, vec3 } from "../core/math/vec3";
import {
  createContactFlags,
  type MoveResult,
  type PlayerInputFrame,
} from "../core/types";
import type { PlayerState } from "../entities/player";
import {
  PLAYER_GRAVITY,
  PLAYER_GROUND_SNAP_DISTANCE,
  PLAYER_JUMP_VELOCITY,
  PLAYER_MOVE_SPEED,
  PLAYER_STEP_HEIGHT,
} from "../rules/constants";
import type { VoxelWorld } from "../world/world";

type Axis = "x" | "y" | "z";

interface AxisResolution {
  amount: number;
  clipped: boolean;
}

interface HorizontalResolution extends AxisResolution {
  stepHeightApplied: number;
}

function resolveAxis(
  world: VoxelWorld,
  aabb: ReturnType<typeof createBodyAABB>,
  axis: Axis,
  amount: number
): AxisResolution {
  if (amount === 0) {
    return {
      amount: 0,
      clipped: false,
    };
  }

  const attempted = translateAABB(aabb, { [axis]: amount });
  if (!world.collidesAABB(attempted)) {
    return {
      amount,
      clipped: false,
    };
  }

  let safeFraction = 0;
  let blockedFraction = 1;

  for (let iteration = 0; iteration < 12; iteration++) {
    const middle = (safeFraction + blockedFraction) / 2;
    const nextAabb = translateAABB(aabb, { [axis]: amount * middle });

    if (world.collidesAABB(nextAabb)) {
      blockedFraction = middle;
    } else {
      safeFraction = middle;
    }
  }

  return {
    amount: amount * safeFraction,
    clipped: true,
  };
}

function resolveHorizontalAxis(
  world: VoxelWorld,
  aabb: ReturnType<typeof createBodyAABB>,
  axis: "x" | "z",
  amount: number,
  grounded: boolean
): HorizontalResolution {
  const direct = resolveAxis(world, aabb, axis, amount);
  if (!direct.clipped || !grounded) {
    return {
      ...direct,
      stepHeightApplied: 0,
    };
  }

  const stepUp = resolveAxis(world, aabb, "y", PLAYER_STEP_HEIGHT);
  if (stepUp.clipped) {
    return {
      ...direct,
      stepHeightApplied: 0,
    };
  }

  const raisedAabb = translateAABB(aabb, { y: stepUp.amount });
  const stepped = resolveAxis(world, raisedAabb, axis, amount);
  if (stepped.clipped) {
    return {
      ...direct,
      stepHeightApplied: 0,
    };
  }

  return {
    amount: stepped.amount,
    clipped: false,
    stepHeightApplied: stepUp.amount,
  };
}

function applyAxisContact(
  moveResult: MoveResult,
  axis: Axis,
  amount: number
): void {
  if (axis === "x") {
    moveResult.clipped.x = true;
    if (amount > 0) {
      moveResult.contactFlags.east = true;
    } else {
      moveResult.contactFlags.west = true;
    }
  }

  if (axis === "y") {
    moveResult.clipped.y = true;
    if (amount > 0) {
      moveResult.contactFlags.up = true;
    } else {
      moveResult.contactFlags.down = true;
    }
  }

  if (axis === "z") {
    moveResult.clipped.z = true;
    if (amount > 0) {
      moveResult.contactFlags.south = true;
    } else {
      moveResult.contactFlags.north = true;
    }
  }
}

function createMoveResult(previousGrounded: boolean): MoveResult {
  return {
    grounded: false,
    landed: false,
    leftGround: previousGrounded,
    steppedUp: false,
    contactFlags: createContactFlags(),
    clipped: {
      x: false,
      y: false,
      z: false,
    },
  };
}

export function simulatePlayerStep(
  player: PlayerState,
  input: PlayerInputFrame,
  world: VoxelWorld,
  dt: number
): PlayerState {
  const moveResult = createMoveResult(player.grounded);
  const desiredDirection = normalizeXZ(vec3(input.moveX, 0, input.moveZ));

  const nextPosition = { ...player.position };
  const nextVelocity = {
    ...player.velocity,
    x: desiredDirection.x * PLAYER_MOVE_SPEED,
    z: desiredDirection.z * PLAYER_MOVE_SPEED,
  };

  if (input.jumpPressed && player.grounded) {
    nextVelocity.y = PLAYER_JUMP_VELOCITY;
  }

  nextVelocity.y -= PLAYER_GRAVITY * dt;

  let aabb = createBodyAABB(nextPosition, player.collider);
  const requestedX = nextVelocity.x * dt;
  const requestedZ = nextVelocity.z * dt;
  const requestedY = nextVelocity.y * dt;

  const xResolution = resolveHorizontalAxis(
    world,
    aabb,
    "x",
    requestedX,
    player.grounded
  );
  nextPosition.y += xResolution.stepHeightApplied;
  nextPosition.x += xResolution.amount;
  aabb = createBodyAABB(nextPosition, player.collider);
  if (xResolution.clipped) {
    applyAxisContact(moveResult, "x", requestedX);
    nextVelocity.x = 0;
  }
  if (xResolution.stepHeightApplied > 0) {
    moveResult.steppedUp = true;
  }

  const zResolution = resolveHorizontalAxis(
    world,
    aabb,
    "z",
    requestedZ,
    player.grounded
  );
  nextPosition.y += zResolution.stepHeightApplied;
  nextPosition.z += zResolution.amount;
  aabb = createBodyAABB(nextPosition, player.collider);
  if (zResolution.clipped) {
    applyAxisContact(moveResult, "z", requestedZ);
    nextVelocity.z = 0;
  }
  if (zResolution.stepHeightApplied > 0) {
    moveResult.steppedUp = true;
  }

  const yResolution = resolveAxis(world, aabb, "y", requestedY);
  nextPosition.y += yResolution.amount;
  aabb = createBodyAABB(nextPosition, player.collider);
  if (yResolution.clipped) {
    applyAxisContact(moveResult, "y", requestedY);
    nextVelocity.y = 0;
  }

  if (moveResult.contactFlags.down) {
    moveResult.grounded = true;
    moveResult.landed = !player.grounded;
    moveResult.leftGround = false;
  } else if (nextVelocity.y <= 0) {
    const snapResolution = resolveAxis(
      world,
      aabb,
      "y",
      -PLAYER_GROUND_SNAP_DISTANCE
    );

    if (snapResolution.clipped) {
      nextPosition.y += snapResolution.amount;
      nextVelocity.y = 0;
      moveResult.grounded = true;
      moveResult.landed = !player.grounded;
      moveResult.leftGround = false;
      aabb = createBodyAABB(nextPosition, player.collider);
    }
  }

  if (!moveResult.grounded) {
    moveResult.leftGround = player.grounded;
  }

  const moving =
    Math.abs(nextVelocity.x) > 0.01 || Math.abs(nextVelocity.z) > 0.01;

  const facing = moving
    ? Math.atan2(nextVelocity.x, nextVelocity.z)
    : player.facing;

  return {
    ...player,
    position: nextPosition,
    velocity: nextVelocity,
    facing,
    grounded: moveResult.grounded,
    movementIntent: input,
    lastMoveResult: moveResult,
    moving,
  };
}
