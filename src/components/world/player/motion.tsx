import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useCameraControls } from "../../../adapters/input/camera/context";
import {
  readGestures,
  viewRelativeMovement,
} from "../../../adapters/input/camera/gestures";
import {
  createKeyboardState,
  keyboardStateToInputFrame,
} from "../../../adapters/input/keyboard";
import { syncPlayerGroup } from "../../../adapters/three/sync";
import {
  consumeFixedSteps,
  createFixedStepState,
} from "../../../game/core/tick";
import { simulateTick } from "../../../game/game";
import {
  FIXED_TIMESTEP,
  MAX_CATCH_UP_STEPS,
} from "../../../game/rules/constants";
import {
  createAutoplayInputFrame,
  createPlayerInputFrame,
} from "../../../game/systems/input";
import type { PlayerMotionHelperProps } from "./types";

export function PlayerMotionHelper({
  gameStateRef,
  playerRef,
  interactiveMode = false,
  isMovingRef,
  keyControlsRef,
  worldRevision = 0,
}: PlayerMotionHelperProps) {
  const cameraInput = useCameraControls();
  const direction = useRef(new Vector3());
  const fixedStepRef = useRef(createFixedStepState());
  const previousKeyboardStateRef = useRef(createKeyboardState());

  useFrame(({ camera }, delta) => {
    const steps = consumeFixedSteps(fixedStepRef.current, delta, {
      fixedDt: FIXED_TIMESTEP,
      maxCatchUpSteps: MAX_CATCH_UP_STEPS,
    });

    for (let step = 0; step < steps; step++) {
      let input = interactiveMode
        ? keyboardStateToInputFrame(
            keyControlsRef.current,
            previousKeyboardStateRef.current
          )
        : createAutoplayInputFrame(
            gameStateRef.current.player,
            gameStateRef.current.world
          );

      if (interactiveMode && cameraInput) {
        const gesture = readGestures(cameraInput.current, performance.now());
        camera.getWorldDirection(direction.current);
        const yaw = Math.atan2(-direction.current.x, -direction.current.z);
        input = createPlayerInputFrame({
          ...viewRelativeMovement(gesture.moveX, gesture.moveY, yaw),
          jumpPressed: gesture.jump,
          jumpHeld: gesture.jump,
        });
        cameraInput.current.jump = false;
      }

      gameStateRef.current = simulateTick(
        gameStateRef.current,
        interactiveMode ? input : createPlayerInputFrame(input),
        FIXED_TIMESTEP
      );

      previousKeyboardStateRef.current = { ...keyControlsRef.current };
    }

    if (playerRef.current) {
      syncPlayerGroup(playerRef.current, gameStateRef.current.player);
      isMovingRef.current = gameStateRef.current.player.moving;
    }
  }, -2);

  useEffect(() => {
    fixedStepRef.current.accumulator = 0;
    previousKeyboardStateRef.current = createKeyboardState();
  }, [interactiveMode, worldRevision, cameraInput]);

  return null;
}
