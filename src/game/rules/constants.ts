export const FIXED_TIMESTEP = 1 / 60;
export const MAX_CATCH_UP_STEPS = 5;

export const PLAYER_MOVE_SPEED = 2;
export const PLAYER_GRAVITY = 15;
export const PLAYER_JUMP_VELOCITY = 8;
export const PLAYER_STEP_HEIGHT = 1.05;
export const PLAYER_GROUND_SNAP_DISTANCE = 0.15;
export const COLLISION_EPSILON = 1e-4;

export const PLAYER_COLLIDER = {
  halfWidth: 0.3,
  height: 1.8,
} as const;

export const AUTOPLAY_MIN_Z = 0;
export const AUTOPLAY_MAX_Z = 7;
