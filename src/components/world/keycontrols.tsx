import { Vector3 } from "three";
import type { KeyboardState } from "../../adapters/input/keyboard";

export type { KeyboardState as KeyState } from "../../adapters/input/keyboard";
export {
  createKeyboardState,
  keyboardStateToInputFrame,
  useKeyboardState as useKeyControls,
} from "../../adapters/input/keyboard";

export function getMovementVector(keyState: KeyboardState): Vector3 {
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
