import { Vector3 as R3FVector3, useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { Euler, Group, MathUtils, Vector3 } from "three";
import { CommonProps } from "../common/types";
import {
  playerBodyTextures,
  playerHeadTextures,
  playerLeftArmTextures,
  playerLeftLegTextures,
  playerRightArmTextures,
  playerRightLegTextures,
} from "./entities";
import { EntityPart } from "./entity";
import { World } from "./world";

// Base dimensions
const headSize: [number, number, number] = [8, 8, 8];
const bodySize: [number, number, number] = [8, 12, 4];
const armSize: [number, number, number] = [4, 12, 4];
const legSize: [number, number, number] = [4, 12, 4];

interface PlayerProps extends CommonProps {
  animate?: boolean;
  playerRef?: React.RefObject<Group>;
  world: World;
}

interface PlayerHelperProps {
  leftArmRef: React.RefObject<Group>;
  rightArmRef: React.RefObject<Group>;
  leftLegRef: React.RefObject<Group>;
  rightLegRef: React.RefObject<Group>;
  playerRef: React.RefObject<Group>;
}

interface PlayerAnimationHelper extends PlayerHelperProps {
  animate: boolean;
}

interface PlayerMotionHelper extends PlayerHelperProps {
  world: World;
}

/**
 * Helper for player animations
 */
const PlayerAnimationHelper = forwardRef(function PlayerAnimationHelper(
  {
    animate,
    leftArmRef,
    rightArmRef,
    leftLegRef,
    rightLegRef,
  }: PlayerAnimationHelper,
  ref
) {
  const limbDirection = useRef(1);
  const limbAngle = useRef(1);

  useFrame((state, delta) => {
    const maxArmAngle = Math.PI / 4;
    const maxLegAngle = Math.PI / 6;

    if (animate) {
      limbAngle.current += delta * limbDirection.current * 3;
      if (Math.abs(limbAngle.current) > Math.PI) {
        limbAngle.current = 0;
      } else if (limbAngle.current > 1) {
        limbDirection.current = -1;
      } else if (limbAngle.current < -1) {
        limbDirection.current = 1;
      }
    } else {
      if (Math.abs(limbAngle.current) <= delta) {
        limbAngle.current = 0;
      } else {
        limbDirection.current = limbAngle.current > 0 ? -1 : 1;
        limbAngle.current += delta * limbDirection.current * 3;
      }
    }

    const armAngle = limbAngle.current * maxArmAngle;
    const legAngle = limbAngle.current * maxLegAngle;

    if (leftArmRef.current)
      leftArmRef.current.setRotationFromEuler(new Euler(-armAngle, 0, 0));
    if (rightArmRef.current)
      rightArmRef.current.setRotationFromEuler(new Euler(armAngle, 0, 0));
    if (leftLegRef.current)
      leftLegRef.current.setRotationFromEuler(new Euler(legAngle, 0, 0));
    if (rightLegRef.current)
      rightLegRef.current.setRotationFromEuler(new Euler(-legAngle, 0, 0));
  });

  return null;
});

/**
 * Helper for player motion
 */
const PlayerMotionHelper = forwardRef(function PlayerMotionHelper(
  {
    world,
    leftArmRef,
    rightArmRef,
    leftLegRef,
    rightLegRef,
    playerRef,
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
    const start = 0;
    const end = 7;

    const currentPosition = playerRef.current?.position;
    const currentRotation = playerRef.current?.rotation;

    if (currentPosition && currentRotation) {
      const diff = 0.5;

      // Start rotating player near edge
      if (currentPosition.z < start + diff || currentPosition.z > end - diff) {
        if (!rotating.current) {
          rotating.current = true;
          // [0, pi]
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
          Math.abs(currentPosition.z - start),
          Math.abs(currentPosition.z - end)
        );
        const t = MathUtils.mapLinear(d, 0, diff, -0.9, 0);
        currentRotation.y = MathUtils.lerp(
          currentRotation.y,
          targetRotationRef.current.y,
          -t
        );
      }

      // If player is out of bounds, set to closest bound
      if (currentPosition.z < start - diff) {
        currentPosition.z = start;
        currentPosition.y = 5;
        currentPosition.x = 9;
      } else if (currentPosition.z > end + diff) {
        currentPosition.z = end;
        currentPosition.y = 5;
        currentPosition.x = 9;
      }

      // Reverse direction
      if (currentPosition.z < start) {
        velocityRef.current.setZ(Math.abs(velocityRef.current.z));
      } else if (currentPosition.z > end) {
        velocityRef.current.setZ(-Math.abs(velocityRef.current.z));
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
        currentPosition.clone().add(new Vector3(0, 0, velocityRef.current.z / 2))
      );
      if (blockInPath !== 0 && onGround) {
        velocityRef.current.add(jump);
      }

      const displacement = velocityRef.current.clone().multiplyScalar(delta);

      currentPosition.add(displacement);

      const newBlock = world.getBlockAtPosition(currentPosition);
      // If falling into block, round to block height
      if (displacement.y < 0 && newBlock !== 0) {
        currentPosition.y = Math.round(currentPosition.y);
      }

      // console.group("Player");
      // console.table({
      //   position: currentPosition
      // });
      // console.groupEnd();
    }
  });

  return null;
});

const Player = forwardRef(function Player(
  {
    position: [x, y, z] = [0, 0, 0],
    rotation = [0, 0, 0],
    size = 1,
    animate = false,
    world,
  }: PlayerProps,
  ref: React.Ref<Group>
) {
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const playerRef = ref as React.RefObject<Group>;

  const trueSize = size / 16;

  // Center the player model
  const truePosition: R3FVector3 = [x + 0.5, y, z + 0.5];
  return (
    <group
      position={truePosition}
      rotation={rotation}
      scale={[trueSize, trueSize, trueSize]}
      castShadow
      ref={playerRef}
    >
      <PlayerAnimationHelper
        animate={animate}
        leftArmRef={leftArmRef}
        rightArmRef={rightArmRef}
        leftLegRef={leftLegRef}
        rightLegRef={rightLegRef}
        playerRef={playerRef}
      />
      <PlayerMotionHelper
        world={world}
        leftArmRef={leftArmRef}
        rightArmRef={rightArmRef}
        leftLegRef={leftLegRef}
        rightLegRef={rightLegRef}
        playerRef={playerRef}
      />
      {/* Head */}
      <EntityPart
        position={[0, 28, 0]}
        size={headSize}
        texture={playerHeadTextures}
      />
      {/* Body */}
      <EntityPart
        position={[0, 18, 0]}
        size={bodySize}
        texture={playerBodyTextures}
      />
      {/* Left Arm */}
      <EntityPart
        position={[-6, 18, 0]}
        size={armSize}
        texture={playerLeftArmTextures}
        pivotOffset={[0, 4, 0]}
        ref={leftArmRef}
      />
      {/* Right Arm */}
      <EntityPart
        position={[6, 18, 0]}
        size={armSize}
        texture={playerRightArmTextures}
        pivotOffset={[0, 4, 0]}
        ref={rightArmRef}
      />
      {/* Left Leg */}
      <EntityPart
        position={[-2, 6, 0]}
        size={legSize}
        texture={playerLeftLegTextures}
        pivotOffset={[0, 4, 0]}
        ref={leftLegRef}
      />
      {/* Right Leg */}
      <EntityPart
        position={[2, 6, 0]}
        size={legSize}
        texture={playerRightLegTextures}
        pivotOffset={[0, 4, 0]}
        ref={rightLegRef}
      />
    </group>
  );
});

export default Player;
