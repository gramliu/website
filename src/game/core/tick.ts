export interface FixedStepConfig {
  fixedDt: number;
  maxCatchUpSteps: number;
}

export interface FixedStepState {
  accumulator: number;
}

export function createFixedStepState(): FixedStepState {
  return { accumulator: 0 };
}

export function consumeFixedSteps(
  state: FixedStepState,
  delta: number,
  config: FixedStepConfig
): number {
  state.accumulator += delta;

  let steps = 0;
  while (
    state.accumulator >= config.fixedDt &&
    steps < config.maxCatchUpSteps
  ) {
    state.accumulator -= config.fixedDt;
    steps++;
  }

  if (steps === config.maxCatchUpSteps) {
    state.accumulator = Math.min(state.accumulator, config.fixedDt);
  }

  return steps;
}
