import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { Vector3 } from "three";
import { getMovementVector, KeyState } from "../keycontrols";
import { World } from "../world";
import { PlayerMotionHelperProps } from "./types";

// Map boundaries
const MAP_MIN_X = 0;
const MAP_MAX_X = 10;
const MAP_MIN_Z = 0;
const MAP_MAX_Z = 10;
const MAX_Z_ANIMATION = 7;

// Physics constants
const MOVEMENT_SPEED = 2;
const GRAVITY = -15;
const JUMP_VELOCITY = 20;

/**
 * Calculate horizontal movement based on input and boundaries
 */
function calculateHorizontalMovement(
  currentPosition: Vector3,
  interactiveMode: boolean,
  speed: number,
  delta: number,
  keyState: KeyState
): Vector3 {
  const movement = new Vector3();

  if (interactiveMode) {
    // Get input-based movement
    const input = getMovementVector(keyState);
    movement.x = input.x * speed;
    movement.z = input.z * speed;

    // Calculate next position
    const nextPosition = currentPosition.clone().add(movement.clone().multiplyScalar(delta));

    // Clamp to boundaries
    movement.x = nextPosition.x >= MAP_MIN_X && nextPosition.x <= MAP_MAX_X ? movement.x : 0;
    movement.z = nextPosition.z >= MAP_MIN_Z && nextPosition.z <= MAP_MAX_Z ? movement.z : 0;
  } else {
    // Auto-movement logic
    if (currentPosition.z < MAP_MIN_Z) {
      movement.z = Math.abs(speed);
    } else if (currentPosition.z > MAX_Z_ANIMATION) {
      movement.z = -Math.abs(speed);
    } else {
      movement.z = currentPosition.z < MAX_Z_ANIMATION / 2 ? speed : -speed;
    }
  }

  return movement;
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
  delta: number
): Vector3 {
  const movement = velocity.clone().multiplyScalar(delta);
  const nextPosition = currentPosition.clone().add(movement);

  // Check vertical collision
  const nextBlock = world.getBlockAtPosition(nextPosition);
  const blockBelow = world.getBlockAtPosition(
    currentPosition.clone().add(new Vector3(0, -1, 0))
  );
  const onGround = currentPosition.y % 1 === 0 && blockBelow !== 0;

  if (nextBlock !== 0) {
    if (velocity.y > 0) {
      // Hit ceiling
      movement.y = 0;
    } else if (velocity.y < 0) {
      // Hit ground
      movement.y = Math.ceil(currentPosition.y) - currentPosition.y;
    }
  }

  // If not falling and on ground, snap to highest block
  if (velocity.y >= 0 && onGround) {
    const topBlock = world.getHighestBlockPosition(
      nextPosition.x,
      nextPosition.z
    );
    movement.y = topBlock - currentPosition.y;
  }

  return movement;
}

/**
 * Calculate rotation based on movement
 */
function calculateRotation(
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
    const diff = 0.5;
    if (rotating.current) {
      currentRotation.y = targetRotation.current.y;
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
  const velocityRef = useRef(new Vector3());
  const targetRotationRef = useRef(new Vector3());
  const rotating = useRef(false);

  useFrame((state, delta) => {
    const currentPosition = playerRef.current?.position;
    const currentRotation = playerRef.current?.rotation;

    if (currentPosition && currentRotation) {
      // Calculate movement components
      const horizontalVelocity = calculateHorizontalMovement(
        currentPosition,
        interactiveMode,
        MOVEMENT_SPEED,
        delta,
        keyControlsRef.current
      );
      
      velocityRef.current.setX(horizontalVelocity.x);
      velocityRef.current.setZ(horizontalVelocity.z);

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
        delta
      );

      // Apply movement
      currentPosition.add(movement);

      // Update rotation
      calculateRotation(
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

  return null;
}); 