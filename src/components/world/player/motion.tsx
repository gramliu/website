import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { getMovementVector } from "../keycontrols";
import { World } from "../world";
import { PlayerHelperProps } from "./types";

// Map boundaries
const MAP_MIN_X = 0;
const MAP_MAX_X = 10;
const MAP_MIN_Z = 0;
const MAP_MAX_Z = 10;
const MAX_Z_ANIMATION = 7;

export interface PlayerMotionHelper extends PlayerHelperProps {
  world: World;
  interactiveMode?: boolean;
}

/**
 * Helper for player motion
 */
export const PlayerMotionHelper = forwardRef(function PlayerMotionHelper(
  {
    world,
    leftArmRef,
    rightArmRef,
    leftLegRef,
    rightLegRef,
    playerRef,
    interactiveMode = false,
  }: PlayerMotionHelper,
  ref
) {
  // Constants
  const speed = new Vector3(0, 0, 2);
  const gravity = new Vector3(0, -15, 0);
  const jump = new Vector3(0, 8, 0);

  // Refs
  const velocityRef = useRef(speed.clone());
  const targetRotationRef = useRef(new Vector3(0, 0, 0));
  const rotating = useRef(false);

  useFrame((state, delta) => {
    const currentPosition = playerRef.current?.position;
    const currentRotation = playerRef.current?.rotation;

    if (currentPosition && currentRotation) {
      if (interactiveMode) {
        // Handle interactive movement
        const movement = getMovementVector();
        velocityRef.current.x = movement.x * speed.z;
        velocityRef.current.z = movement.z * speed.z;

        // Update rotation based on movement direction
        if (movement.length() > 0) {
          const angle = Math.atan2(movement.x, -movement.z);
          currentRotation.y = angle;
        }

        // Calculate next position with just the horizontal movement
        const horizontalVelocity = velocityRef.current.clone();
        horizontalVelocity.y = 0;
        const nextPosition = currentPosition
          .clone()
          .add(horizontalVelocity.clone().multiplyScalar(delta));

        // Check boundaries before applying movement
        if (nextPosition.x >= MAP_MIN_X && nextPosition.x <= MAP_MAX_X) {
          currentPosition.x = nextPosition.x;
        }
        if (nextPosition.z >= MAP_MIN_Z && nextPosition.z <= MAP_MAX_Z) {
          currentPosition.z = nextPosition.z;
        }
      } else {
        // Original auto-movement logic
        const diff = 0.5;

        // Start rotating player near edge
        if (
          currentPosition.z < MAP_MIN_Z + diff ||
          currentPosition.z > MAX_Z_ANIMATION - diff
        ) {
          if (!rotating.current) {
            rotating.current = true;
            targetRotationRef.current = new Vector3(
              0,
              Math.sign(velocityRef.current.z),
              0
            )
              .multiplyScalar(Math.PI / 2)
              .addScalar(Math.PI / 2);
          }
        } else {
          currentRotation.y = targetRotationRef.current.y;
          rotating.current = false;
        }

        if (rotating.current) {
          const d = Math.min(
            Math.abs(currentPosition.z - MAP_MIN_Z),
            Math.abs(currentPosition.z - MAX_Z_ANIMATION)
          );
          const t = MathUtils.mapLinear(d, 0, diff, -0.9, 0);
          currentRotation.y = MathUtils.lerp(
            currentRotation.y,
            targetRotationRef.current.y,
            -t
          );
        }

        // If player is out of bounds, set to closest bound
        if (currentPosition.z < MAP_MIN_Z - diff) {
          currentPosition.z = MAP_MIN_Z;
          currentPosition.y = 5;
          currentPosition.x = MAP_MAX_X;
        } else if (currentPosition.z > MAP_MAX_Z + diff) {
          currentPosition.z = MAP_MAX_Z;
          currentPosition.y = 5;
          currentPosition.x = MAP_MIN_X;
        }

        // Reverse direction
        if (currentPosition.z < MAP_MIN_Z) {
          velocityRef.current.setZ(Math.abs(velocityRef.current.z));
        } else if (currentPosition.z > MAX_Z_ANIMATION) {
          velocityRef.current.setZ(-Math.abs(velocityRef.current.z));
        }
      }

      // Check for ground
      const currentBlock = world.getBlockAtPosition(currentPosition);
      const blockBelow = world.getBlockAtPosition(
        currentPosition.clone().add(new Vector3(0, -1, 0))
      );

      const falling = currentPosition.y % 1 !== 0 || currentBlock === 0;
      const onGround = currentPosition.y % 1 === 0 && blockBelow !== 0;

      if (currentPosition.y > 0 && !onGround && falling) {
        // Apply gravity
        velocityRef.current.add(gravity.clone().multiplyScalar(delta));
      } else {
        // Stop falling
        velocityRef.current.setY(0);

        if (currentBlock !== 0) {
          const topBlock = world.getHighestBlockPosition(
            currentPosition.x,
            currentPosition.z
          );
          // Snap to ground
          currentPosition.y = topBlock;
        }
      }

      // If moving towards block, jump so that player cross block on zenith
      const blockInPath = world.getBlockAtPosition(
        currentPosition
          .clone()
          .add(new Vector3(0, 0, velocityRef.current.z / 2))
      );
      if (blockInPath !== 0 && onGround) {
        velocityRef.current.add(jump);
      }

      // Only apply the final displacement in auto mode or for vertical movement in interactive mode
      if (!interactiveMode) {
        const displacement = velocityRef.current.clone().multiplyScalar(delta);
        currentPosition.add(displacement);
      } else {
        // In interactive mode, only apply vertical movement (gravity/jumping)
        const verticalDisplacement = new Vector3(0, velocityRef.current.y * delta, 0);
        currentPosition.add(verticalDisplacement);
      }

      const newBlock = world.getBlockAtPosition(currentPosition);
      // If falling into block, round to block height
      if (velocityRef.current.y < 0 && newBlock !== 0) {
        currentPosition.y = Math.round(currentPosition.y);
      }
    }
  });

  return null;
}); 