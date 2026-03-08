import type { PlayerInputFrame } from "../core/types";
import type { PlayerState } from "../entities/player";
import { AUTOPLAY_MAX_Z, AUTOPLAY_MIN_Z } from "../rules/constants";

export function createPlayerInputFrame(
  input: Partial<PlayerInputFrame> = {}
): PlayerInputFrame {
  return {
    moveX: input.moveX ?? 0,
    moveZ: input.moveZ ?? 0,
    jumpHeld: input.jumpHeld ?? false,
    jumpPressed: input.jumpPressed ?? false,
  };
}

export function createAutoplayInputFrame(
  player: PlayerState
): PlayerInputFrame {
  const direction =
    player.position.z <= AUTOPLAY_MIN_Z + 0.25
      ? 1
      : player.position.z >= AUTOPLAY_MAX_Z + 0.75
        ? -1
        : player.velocity.z === 0
          ? 1
          : Math.sign(player.velocity.z);

  return createPlayerInputFrame({
    moveZ: direction,
  });
}
