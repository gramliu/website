import { useEffect, useRef } from "react";
import type { PlayerInputFrame } from "../../game/core/types";
import { createPlayerInputFrame } from "../../game/systems/input";

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

export function createKeyboardState(): KeyboardState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  };
}

export function useKeyboardState() {
  const keyState = useRef<KeyboardState>(createKeyboardState());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let handled = true;

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keyState.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keyState.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keyState.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keyState.current.right = true;
          break;
        case "Space":
          keyState.current.jump = true;
          break;
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      let handled = true;

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keyState.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keyState.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keyState.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keyState.current.right = false;
          break;
        case "Space":
          keyState.current.jump = false;
          break;
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown, {
      capture: true,
    });
    window.addEventListener("keyup", handleKeyUp, {
      capture: true,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
      window.removeEventListener("keyup", handleKeyUp, {
        capture: true,
      });
    };
  }, []);

  return keyState;
}

export function keyboardStateToInputFrame(
  current: KeyboardState,
  previous: KeyboardState
): PlayerInputFrame {
  const moveX = Number(current.right) - Number(current.left);
  const moveZ = Number(current.backward) - Number(current.forward);

  return createPlayerInputFrame({
    moveX,
    moveZ,
    jumpHeld: current.jump,
    jumpPressed: current.jump && !previous.jump,
  });
}
