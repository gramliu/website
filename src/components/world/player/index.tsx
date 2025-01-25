import { Vector3 as R3FVector3 } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { Group } from "three";
import {
  playerBodyTextures,
  playerHeadTextures,
  playerLeftArmTextures,
  playerLeftLegTextures,
  playerRightArmTextures,
  playerRightLegTextures,
} from "../entities";
import { EntityPart } from "../entity";
import { PlayerAnimationHelper } from "./animation";
import { PlayerMotionHelper } from "./motion";
import { PlayerProps } from "./types";

// Base dimensions
const headSize: [number, number, number] = [8, 8, 8];
const bodySize: [number, number, number] = [8, 12, 4];
const armSize: [number, number, number] = [4, 12, 4];
const legSize: [number, number, number] = [4, 12, 4];

const Player = forwardRef(function Player(
  {
    position: [x, y, z] = [0, 0, 0],
    rotation = [0, 0, 0],
    size = 1,
    animate = false,
    world,
    interactiveMode = false,
    keyControlsRef,
  }: PlayerProps,
  ref: React.Ref<Group>
) {
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const playerRef = ref as React.RefObject<Group>;
  const isMovingRef = useRef(false);

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
        isMovingRef={isMovingRef}
      />
      <PlayerMotionHelper
        world={world}
        leftArmRef={leftArmRef}
        rightArmRef={rightArmRef}
        leftLegRef={leftLegRef}
        rightLegRef={rightLegRef}
        playerRef={playerRef}
        interactiveMode={interactiveMode}
        isMovingRef={isMovingRef}
        keyControlsRef={keyControlsRef}
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