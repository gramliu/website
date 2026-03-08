import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
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
}: PlayerMotionHelperProps) {
  const fixedStepRef = useRef(createFixedStepState());
  const previousKeyboardStateRef = useRef(createKeyboardState());

  useFrame((_, delta) => {
    const steps = consumeFixedSteps(fixedStepRef.current, delta, {
      fixedDt: FIXED_TIMESTEP,
      maxCatchUpSteps: MAX_CATCH_UP_STEPS,
    });

    for (let step = 0; step < steps; step++) {
      const input = interactiveMode
        ? keyboardStateToInputFrame(
            keyControlsRef.current,
            previousKeyboardStateRef.current
          )
        : createAutoplayInputFrame(
            gameStateRef.current.player,
            gameStateRef.current.world
          );

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
  });

  useEffect(() => {
    fixedStepRef.current.accumulator = 0;
    previousKeyboardStateRef.current = createKeyboardState();
  }, [interactiveMode]);

  return null;
}
