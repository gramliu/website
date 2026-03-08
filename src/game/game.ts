import type { Vec3 } from "./core/math/vec3";
import type { PlayerInputFrame } from "./core/types";
import { createPlayerState, type PlayerState } from "./entities/player";
import { simulatePlayerStep } from "./systems/player-controller";
import type { VoxelWorld } from "./world/world";

export interface GameState {
  world: VoxelWorld;
  player: PlayerState;
  elapsedTime: number;
}

export function createGameState(
  world: VoxelWorld,
  playerStartPosition: Vec3
): GameState {
  return {
    world,
    player: createPlayerState(playerStartPosition),
    elapsedTime: 0,
  };
}

export function simulateTick(
  gameState: GameState,
  input: PlayerInputFrame,
  dt: number
): GameState {
  return {
    ...gameState,
    elapsedTime: gameState.elapsedTime + dt,
    player: simulatePlayerStep(gameState.player, input, gameState.world, dt),
  };
}
