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

/**
 * Calculate horizontal movement based on input and boundaries
 */
function calculateHorizontalMovement(
  currentPosition: Vector3,
  currentVelocity: Vector3,
  interactiveMode: boolean,
  delta: number,
  keyState: KeyState
): Vector3 {
  const velocity = currentVelocity.clone();
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
function calculateVerticalMovement(
  currentPosition: Vector3,
  currentVelocity: Vector3,
  world: World,
  interactiveMode: boolean,
  keyState: KeyState,
  delta: number
): Vector3 {
  const movement = new Vector3(0, currentVelocity.y, 0);

  // Check ground state
  const blockBelow = world.getBlockAtPosition(
    currentPosition.clone().add(new Vector3(0, -1, 0))
  );
  const onGround = currentPosition.y % 1 === 0 && blockBelow !== 0;

  // Apply gravity when not on ground
  if (!onGround) {
    movement.y += GRAVITY * delta;
  } else {
    // Reset downward velocity on ground
    if (movement.y < 0) {
      movement.y = 0;
    }

    // Handle jumping in interactive mode
    if (interactiveMode && keyState.jump) {
      movement.y = JUMP_VELOCITY;
    } else {
      movement.y = 0;
    }
  }

  return movement;
}

/**
 * Check for collisions and adjust position/velocity
 */
function handleCollisions(
  currentPosition: Vector3,
  velocity: Vector3,
  world: World,
  delta: number,
  keyState: KeyState
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

  // Check for vertical collisions
  if (nextBlock !== 0) {
    if (velocity.y > 0) {
      // Hit ceiling
      movement.y = 0;
    } else if (velocity.y < 0) {
      // Hit ground
      movement.y = Math.ceil(currentPosition.y) - currentPosition.y - 1;
    }
  } else if (nextHeadBlock !== 0) {
    // Hit ceiling
    movement.y = 0;
  }

  // // If not falling and on ground, snap to highest block
  // if (velocity.y >= 0 && onGround && !keyState.jump) {
  //   const topBlock = world.getHighestBlockPosition(
  //     nextPosition.x,
  //     nextPosition.z
  //   );
  //   movement.y = topBlock - currentPosition.y;
  // }

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
  const velocityRef = useRef(interactiveMode ? new Vector3() : new Vector3(0, 0, MOVEMENT_SPEED));
  const targetRotationRef = useRef(new Vector3());
  const rotating = useRef(false);

  useFrame((state, delta) => {
    const currentPosition = playerRef.current?.position;
    const currentRotation = playerRef.current?.rotation;

    if (currentPosition && currentRotation) {
      // Calculate movement components
      const horizontalVelocity = calculateHorizontalMovement(
        currentPosition,
        velocityRef.current,
        interactiveMode,
        delta,
        keyControlsRef.current
      );
      velocityRef.current.setX(horizontalVelocity.x);
      velocityRef.current.setZ(horizontalVelocity.z);

      console.log(velocityRef.current);

      const verticalVelocity = calculateVerticalMovement(
        currentPosition,
        velocityRef.current,
        world,
        interactiveMode,
        keyControlsRef.current,
        delta
      );
      velocityRef.current.setY(verticalVelocity.y);

      // Handle collisions and get final movement
      const movement = handleCollisions(
        currentPosition,
        velocityRef.current,
        world,
        delta,
        keyControlsRef.current
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
    if (interactiveMode) {
      velocityRef.current.set(0, 0, MOVEMENT_SPEED);
    }
  }, [interactiveMode]);

  return null;
});
