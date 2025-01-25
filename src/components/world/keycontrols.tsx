// Key listeners
import { Vector3 } from "three";

export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

export const keyState: KeyState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
};

export function onKeyDown(event: KeyboardEvent) {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      keyState.forward = true;
      break;
    case "KeyS":
    case "ArrowDown":
      keyState.backward = true;
      break;
    case "KeyA":
    case "ArrowLeft":
      keyState.left = true;
      break;
    case "KeyD":
    case "ArrowRight":
      keyState.right = true;
      break;
    case "Space":
      keyState.jump = true;
      break;
  }
}

export function onKeyUp(event: KeyboardEvent) {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      keyState.forward = false;
      break;
    case "KeyS":
    case "ArrowDown":
      keyState.backward = false;
      break;
    case "KeyA":
    case "ArrowLeft":
      keyState.left = false;
      break;
    case "KeyD":
    case "ArrowRight":
      keyState.right = false;
      break;
    case "Space":
      keyState.jump = false;
      break;
  }
}

export function getMovementVector(): Vector3 {
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