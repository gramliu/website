import { useFrame } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { getMovementVector, KeyState } from "../keycontrols";
import { World } from "../world";
import { PlayerMotionHelperProps } from "./types";
import { inRange } from "../../../lib/utils";

// Map boundaries
const MAP_MIN_X = 0;
const MAP_MAX_X = 10;
const MAP_MIN_Z = 0;
const MAP_MAX_Z = 10;

const ANIMATION_Z_START = MAP_MIN_Z;
const ANIMATION_Z_END = 7;
const ROTATION_OFFSET = 0.5;

// Physics constants
const MOVEMENT_SPEED = 2;
const GRAVITY = -15;
const JUMP_VELOCITY = 8;

interface MovementFunctionProps {
  world: World;
  interactiveMode: boolean;
  keyState: KeyState;
  delta: number;
  currentPosition: Vector3;
  currentVelocity: Vector3;
  isJumpingRef: React.MutableRefObject<boolean>;
}

/**
 * Calculate horizontal movement based on input and boundaries
 */
function calculateHorizontalMovement({
  interactiveMode,
  keyState,
  delta,
  currentPosition,
  currentVelocity,
}: MovementFunctionProps): Vector3 {
  // Clone only the x and z components
  const velocity = currentVelocity.clone().setY(0);
  if (interactiveMode) {
    // Get input-based movement
    const input = getMovementVector(keyState);
    velocity.x = input.x * MOVEMENT_SPEED;
    velocity.z = input.z * MOVEMENT_SPEED;

    // Calculate next position
    const nextPosition = currentPosition
      .clone()
      .add(velocity.clone().multiplyScalar(delta));

    // Clamp to boundaries
    velocity.x = inRange(nextPosition.x, MAP_MIN_X, MAP_MAX_X) ? velocity.x : 0;
    velocity.z = inRange(nextPosition.z, MAP_MIN_Z, MAP_MAX_Z) ? velocity.z : 0;
  } else {
    // Auto-movement logic
    if (currentPosition.z < MAP_MIN_Z) {
      // Snap forward
      velocity.z = Math.abs(velocity.z);
    } else if (currentPosition.z > ANIMATION_Z_END) {
      // Snap backward
      velocity.z = -Math.abs(velocity.z);
    }
  }

  return velocity;
}

/**
 * Calculate vertical movement based on gravity and jumping
 */
function calculateVerticalMovement({
  currentPosition,
  currentVelocity,
  world,
  interactiveMode,
  keyState,
  delta,
  isJumpingRef,
}: MovementFunctionProps): Vector3 {
  const velocity = new Vector3(0, currentVelocity.y, 0);

  // Check ground state
  const blockBelow = world.getBlockAtPosition(
    currentPosition.clone().add(new Vector3(0, -1, 0))
  );
  const onGround = currentPosition.y % 1 === 0 && blockBelow !== 0;

  // Apply gravity when not on ground
  if (!onGround) {
    velocity.y += GRAVITY * delta;
  } else {
    // Reset downward velocity on ground
    if (velocity.y < 0) {
      velocity.y = 0;
    }

    // Handle jumping in interactive mode
    if (interactiveMode && !isJumpingRef.current) {
      velocity.y = keyState.jump ? JUMP_VELOCITY : 0;
      isJumpingRef.current = keyState.jump;
    }

    // If moving towards block, jump
    const blockInPath = world.getBlockAtPosition(
      currentPosition
        .clone()
        .add(new Vector3(currentVelocity.x / 4, 0, currentVelocity.z / 4))
    );
    if (
      blockInPath !== 0 &&
      onGround &&
      !isJumpingRef.current &&
      (Math.abs(currentVelocity.x) > 0.01 || Math.abs(currentVelocity.z) > 0.01)
    ) {
      velocity.y = JUMP_VELOCITY;
      isJumpingRef.current = true;
    }
  }

  return velocity;
}

/**
 * Check for collisions and adjust position/velocity
 */
function handleCollisions(
  currentPosition: Vector3,
  velocity: Vector3,
  world: World,
  delta: number,
  isJumpingRef: React.MutableRefObject<boolean>
): Vector3 {
  const movement = velocity.clone().multiplyScalar(delta);
  const nextPosition = currentPosition.clone().add(movement);

  // Check vertical collision
  const nextBlock = world.getBlockAtPosition(nextPosition);
  const nextHeadBlock = world.getBlockAtPosition(
    nextPosition.clone().add(new Vector3(0, 2, 0))
  );
  const blockBelow = world.getBlockAtPosition(
    currentPosition.clone().add(new Vector3(0, -1, 0))
  );
  const onGround = currentPosition.y % 1 === 0 && blockBelow !== 0;
  const topBlock = world.getHighestBlockPosition(
    nextPosition.x,
    nextPosition.z
  );

  // Check for vertical collisions
  if (nextBlock !== 0) {
    if (velocity.y > 0) {
      // Hit ceiling
      movement.y = 0;
    } else if (velocity.y < 0) {
      // Hit ground
      movement.y = Math.ceil(currentPosition.y) - currentPosition.y;
      isJumpingRef.current = false;
    }
  } else if (nextHeadBlock !== 0) {
    // Hit ceiling
    movement.y = 0;
  }

  // If not falling and on ground, snap to highest block
  if (
    velocity.y >= 0 &&
    !isJumpingRef.current &&
    Math.abs(topBlock - currentPosition.y) < 1
  ) {
    movement.y = topBlock - currentPosition.y;
    velocity.y = 0;
  } else if (velocity.y < 0 && nextPosition.y < topBlock) {
    movement.y = topBlock - currentPosition.y;
  }

  return movement;
}

/**
 * Calculate rotation based on movement
 */
function calculateRotation(
  currentPosition: Vector3,
  currentRotation: { y: number },
  velocity: Vector3,
  interactiveMode: boolean,
  rotating: { current: boolean },
  targetRotation: { current: Vector3 }
): void {
  if (interactiveMode) {
    // Rotate based on movement direction
    if (velocity.length() > 0) {
      currentRotation.y = Math.atan2(velocity.x, velocity.z);
    }
  } else {
    // Auto-movement rotation
    if (
      currentPosition.z < ANIMATION_Z_START + ROTATION_OFFSET ||
      currentPosition.z > ANIMATION_Z_END - ROTATION_OFFSET
    ) {
      if (!rotating.current) {
        rotating.current = true;

        // [0, PI]
        targetRotation.current = new Vector3(0, Math.sign(velocity.z), 0)
          .multiplyScalar(Math.PI / 2)
          .addScalar(Math.PI / 2);
      }
    } else {
      currentRotation.y = targetRotation.current.y;
      rotating.current = false;
    }

    if (rotating.current) {
      const d = Math.min(
        Math.abs(currentPosition.z - ANIMATION_Z_START),
        Math.abs(currentPosition.z - ANIMATION_Z_END)
      );
      const t = MathUtils.mapLinear(d, 0, ROTATION_OFFSET, -0.9, 0);
      currentRotation.y = MathUtils.lerp(
        currentRotation.y,
        targetRotation.current.y,
        -t
      );
    }
  }
}

/**
 * Helper for player motion
 */
export const PlayerMotionHelper = forwardRef(function PlayerMotionHelper(
  {
    world,
    playerRef,
    interactiveMode = false,
    isMovingRef,
    keyControlsRef,
  }: PlayerMotionHelperProps,
  ref
) {
  // Refs
  const velocityRef = useRef(
    interactiveMode ? new Vector3() : new Vector3(0, 0, MOVEMENT_SPEED)
  );
  const targetRotationRef = useRef(new Vector3());
  const rotating = useRef(false);
  const isJumpingRef = useRef(false);

  useFrame((state, delta) => {
    const currentPosition = playerRef.current?.position;
    const currentRotation = playerRef.current?.rotation;

    if (currentPosition && currentRotation) {
      // Calculate movement components
      const movementProps: MovementFunctionProps = {
        world,
        interactiveMode,
        keyState: keyControlsRef.current,
        delta,
        currentPosition,
        currentVelocity: velocityRef.current,
        isJumpingRef,
      };
      const horizontalVelocity = calculateHorizontalMovement(movementProps);
      const verticalVelocity = calculateVerticalMovement({
        ...movementProps,
        currentVelocity: velocityRef.current.add(horizontalVelocity),
      });

      // Add horizontal and vertical velocities
      const netVelocity = horizontalVelocity.clone().add(verticalVelocity);

      velocityRef.current.set(netVelocity.x, netVelocity.y, netVelocity.z);

      // Handle collisions and get final movement
      const movement = handleCollisions(
        currentPosition,
        velocityRef.current,
        world,
        delta,
        isJumpingRef
      );

      // Apply movement
      currentPosition.add(movement);

      // Update rotation
      calculateRotation(
        currentPosition,
        currentRotation,
        velocityRef.current,
        interactiveMode,
        rotating,
        targetRotationRef
      );

      // Update movement state for animation
      isMovingRef.current = velocityRef.current.length() > 0.01;
    }
  });

  useEffect(() => {
    if (!interactiveMode) {
      velocityRef.current.set(0, 0, MOVEMENT_SPEED);
      targetRotationRef.current.set(0, 0, 0);
    }
  }, [interactiveMode]);

  return null;
});
