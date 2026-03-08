import type { Vec3 } from "../core/math/vec3";
import { vec3 } from "../core/math/vec3";
import type { MoveResult, PlayerInputFrame } from "../core/types";
import { createContactFlags, createEmptyInputFrame } from "../core/types";
import { PLAYER_COLLIDER } from "../rules/constants";

export interface PlayerState {
  id: string;
  position: Vec3;
  velocity: Vec3;
  facing: number;
  grounded: boolean;
  collider: {
    halfWidth: number;
    height: number;
  };
  movementIntent: PlayerInputFrame;
  lastMoveResult: MoveResult;
  moving: boolean;
}

export function createPlayerState(position: Vec3): PlayerState {
  return {
    id: "player",
    position,
    velocity: vec3(),
    facing: 0,
    grounded: false,
    collider: PLAYER_COLLIDER,
    movementIntent: createEmptyInputFrame(),
    lastMoveResult: {
      grounded: false,
      landed: false,
      leftGround: false,
      steppedUp: false,
      contactFlags: createContactFlags(),
      clipped: {
        x: false,
        y: false,
        z: false,
      },
    },
    moving: false,
  };
}
