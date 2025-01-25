import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { Euler, Vector3 } from "three";
import { PlayerHelperProps } from "./types";

export interface PlayerAnimationHelper extends PlayerHelperProps {
  animate: boolean;
  isMovingRef: React.MutableRefObject<boolean>;
}

/**
 * Helper for player animations
 */
export const PlayerAnimationHelper = forwardRef(function PlayerAnimationHelper(
  {
    animate,
    leftArmRef,
    rightArmRef,
    leftLegRef,
    rightLegRef,
    playerRef,
    isMovingRef,
  }: PlayerAnimationHelper,
  ref
) {
  const limbDirection = useRef(1);
  const limbAngle = useRef(1);

  useFrame((state, delta) => {
    const maxArmAngle = Math.PI / 4;
    const maxLegAngle = Math.PI / 6;

    // Animate if explicitly set to animate OR if player is moving
    if (animate || isMovingRef.current) {
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