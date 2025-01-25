import { useEffect, useRef } from "react";
import { Vector3 } from "three";

export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

export function useKeyControls() {
  const keyState = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keyState;
}

export function getMovementVector(keyState: KeyState): Vector3 {
  const movement = new Vector3();
  
  if (keyState.forward) movement.z -= 1;
  if (keyState.backward) movement.z += 1;
  if (keyState.left) movement.x -= 1;
  if (keyState.right) movement.x += 1;
  
  // Normalize the movement vector
  if (movement.length() > 0) {
    movement.normalize();
  }
  
  return movement;
}