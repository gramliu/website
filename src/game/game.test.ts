import { describe, expect, it } from "bun:test";
import { vec3 } from "./core/math/vec3";
import { createFlatFloorWorld } from "./fixtures/flat-floor";
import { createLowCeilingWorld } from "./fixtures/low-ceiling";
import { createStepWorld } from "./fixtures/step";
import { createWallWorld } from "./fixtures/wall";
import { createGameState, simulateTick } from "./game";
import { createPlayerInputFrame } from "./systems/input";

const fixedDt = 1 / 60;

function runSteps(
  state: ReturnType<typeof createGameState>,
  inputFactory: (step: number) => ReturnType<typeof createPlayerInputFrame>,
  steps: number
) {
  let current = state;

  for (let step = 0; step < steps; step++) {
    current = simulateTick(current, inputFactory(step), fixedDt);
  }

  return current;
}

function runStepsWithHistory(
  state: ReturnType<typeof createGameState>,
  inputFactory: (step: number) => ReturnType<typeof createPlayerInputFrame>,
  steps: number
) {
  let current = state;
  const history = [state];

  for (let step = 0; step < steps; step++) {
    current = simulateTick(current, inputFactory(step), fixedDt);
    history.push(current);
  }

  return history;
}

describe("game simulation", () => {
  it("lands the player on the floor and marks them grounded", () => {
    const initial = createGameState(createFlatFloorWorld(), vec3(2.5, 4, 2.5));
    const settled = runSteps(initial, () => createPlayerInputFrame(), 180);

    expect(settled.player.grounded).toBe(true);
    expect(settled.player.position.y).toBeCloseTo(1, 3);
    expect(settled.player.velocity.y).toBe(0);
  });

  it("applies a jump only when the player is grounded", () => {
    const initial = createGameState(createFlatFloorWorld(), vec3(2.5, 2, 2.5));
    const grounded = runSteps(initial, () => createPlayerInputFrame(), 60);
    const jumped = simulateTick(
      grounded,
      createPlayerInputFrame({
        jumpHeld: true,
        jumpPressed: true,
      }),
      fixedDt
    );

    expect(jumped.player.grounded).toBe(false);
    expect(jumped.player.velocity.y).toBeGreaterThan(0);
    expect(jumped.player.position.y).toBeGreaterThan(1);
  });

  it("stops horizontal motion at solid walls", () => {
    const initial = createGameState(createWallWorld(), vec3(2.3, 2, 2.5));
    const grounded = runSteps(initial, () => createPlayerInputFrame(), 60);
    const moved = runSteps(
      grounded,
      () =>
        createPlayerInputFrame({
          moveX: 1,
        }),
      90
    );

    expect(moved.player.position.x).toBeLessThanOrEqual(2.701);
    expect(moved.player.lastMoveResult.clipped.x).toBe(true);
    expect(moved.player.lastMoveResult.contactFlags.east).toBe(true);
  });

  it("steps onto single-block ledges without jumping", () => {
    const initial = createGameState(createStepWorld(), vec3(1.3, 2, 2.5));
    const grounded = runSteps(initial, () => createPlayerInputFrame(), 60);
    const moved = runSteps(
      grounded,
      () =>
        createPlayerInputFrame({
          moveX: 1,
        }),
      30
    );

    expect(moved.player.position.x).toBeGreaterThan(2.2);
    expect(moved.player.position.y).toBeCloseTo(2, 2);
    expect(moved.player.grounded).toBe(true);
  });

  it("clips upward movement into low ceilings", () => {
    const initial = createGameState(createLowCeilingWorld(), vec3(2.5, 1, 2.5));
    const grounded = runSteps(initial, () => createPlayerInputFrame(), 1);
    const history = runStepsWithHistory(
      grounded,
      (step) =>
        createPlayerInputFrame({
          jumpHeld: step === 0,
          jumpPressed: step === 0,
        }),
      60
    );
    const maxHeight = Math.max(
      ...history.map((entry) => entry.player.position.y)
    );
    const hitCeiling = history.some(
      (entry) => entry.player.lastMoveResult.contactFlags.up
    );

    expect(maxHeight).toBeLessThan(1.21);
    expect(hitCeiling).toBe(true);
  });
});
