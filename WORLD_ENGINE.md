# World Engine

## Overview

The world scene runs on a small voxel game engine with three layers:

- `src/game/**` owns simulation truth.
- `src/adapters/**` bridges browser and Three.js concerns into the engine.
- `src/components/world/**` renders the current engine state.

The core rule is:

> The engine owns gameplay state. React and Three.js only project that state.

This keeps movement, collision, and block semantics testable without mounting the
scene.

## High-level architecture

### Simulation core

The simulation core lives under `src/game/**`.

Its responsibilities are:

- storing world block data,
- defining block semantics,
- storing player state,
- resolving movement and collisions,
- stepping game state forward with a fixed timestep.

The core does not depend on React, DOM events, or Three.js scene objects.

### Adapters

The adapters live under `src/adapters/**`.

They are responsible for:

- collecting keyboard input from the browser,
- translating browser input into `PlayerInputFrame`,
- syncing engine state into Three.js groups,
- rendering engine world cells as block components.

Adapters are intentionally thin. They should not decide collision outcomes or
store gameplay truth.

### Presentation

The visible scene still lives in `src/components/world/**`.

This layer is responsible for:

- creating the `Canvas`,
- configuring lights and camera,
- rotating the world in non-interactive mode,
- rendering block meshes and the player model,
- playing limb animations.

Presentation code should not implement gameplay rules.

## Folder map

```text
src/game/
  core/
    math/
      aabb.ts
      vec3.ts
    tick.ts
    types.ts
  entities/
    player.ts
  fixtures/
    autoplay-step.ts
    flat-floor.ts
    low-ceiling.ts
    step.ts
    wall.ts
  rules/
    constants.ts
  systems/
    input.ts
    player-controller.ts
  world/
    block-registry.ts
    world-loader.ts
    world.ts
  game.ts

src/adapters/
  input/
    keyboard.ts
  three/
    sync.ts
    world-renderer.tsx

src/components/world/
  index.tsx
  map.tsx
  player/
    index.tsx
    motion.tsx
    animation.tsx
```

## Core data model

### `GameState`

`src/game/game.ts` defines the root simulation state:

- `world: VoxelWorld`
- `player: PlayerState`
- `elapsedTime: number`

`createGameState()` builds an initial state, and `simulateTick()` advances it by
calling the player controller.

### `PlayerState`

`src/game/entities/player.ts` stores the player as plain data:

- position,
- velocity,
- facing,
- grounded,
- collider,
- movement intent,
- last movement result,
- moving flag.

This is the source of truth for gameplay. The rendered player group mirrors this
state every frame.

### `PlayerInputFrame`

`src/game/core/types.ts` defines the per-tick input contract:

- `moveX`
- `moveZ`
- `jumpHeld`
- `jumpPressed`

This separates input intent from physical outcome.

### `MoveResult`

The controller returns movement metadata through `lastMoveResult`, including:

- `grounded`
- `landed`
- `leftGround`
- `contactFlags`
- `clipped`

This makes collision outcomes inspectable in tests.

## World model

### Block registry

`src/game/world/block-registry.ts` defines block semantics in one place.

Each block has:

- numeric id,
- name,
- `collisionKind`,
- `renderKey`,
- flags such as `solid`, `fluid`, `transparent`, and `castsShadow`.

This avoids implicit rules like "all nonzero blocks are solid."

### `VoxelWorld`

`src/game/world/world.ts` stores world cells and exposes gameplay queries:

- `getBlockIdAtCell(x, y, z)`
- `getBlockAtCell(x, y, z)`
- `getCollisionKind(x, y, z)`
- `isCellSolid(x, y, z)`
- `isCellFluid(x, y, z)`
- `getFluidAdjacency(x, y, z)`
- `getOverlappingCells(aabb)`
- `collidesAABB(aabb)`
- `getBounds()`

The engine asks the world gameplay questions directly instead of reading render
data.

### World loading

`src/game/world/world-loader.ts` converts the existing `world-data.ts` string
format into logical cells.

`src/components/world/map.tsx` creates a single `VoxelWorld` instance from that
loaded data and seeds the initial `GameState`.

## Math and collision

### Math primitives

The core math helpers live in `src/game/core/math/**`.

- `vec3.ts` provides engine-facing vector helpers.
- `aabb.ts` defines collider shape and body AABB construction.

These are plain objects rather than mutable Three.js vectors.

### Collision model

The player uses an AABB collider.

`src/game/systems/player-controller.ts` resolves movement axis-by-axis:

1. compute desired horizontal velocity from input,
2. apply jump impulse when allowed,
3. apply gravity,
4. resolve X movement,
5. resolve Z movement,
6. resolve Y movement,
7. apply ground snap when falling onto support,
8. derive grounded/contact state.

The controller currently does **not** auto-step or auto-jump. If the player
runs into a one-block rise without a jump input, the body is clipped by the
obstacle.

## Fixed timestep

The engine uses a fixed simulation timestep:

- fixed dt: `1 / 60`
- bounded catch-up steps: `MAX_CATCH_UP_STEPS`

`src/game/core/tick.ts` accumulates render deltas and converts them into stable
simulation steps. `src/components/world/player/motion.tsx` drives this process
inside `useFrame(...)`.

This keeps simulation behavior more deterministic and easier to test.

## Input flow

### Keyboard-controlled mode

`src/adapters/input/keyboard.ts` listens for browser keyboard events and stores
them in a `KeyboardState` ref.

Each fixed step:

1. `keyboardStateToInputFrame(...)` turns current and previous key states into a
   `PlayerInputFrame`.
2. `simulateTick(...)` advances the engine.
3. `syncPlayerGroup(...)` mirrors the result into the rendered player group.

### Autoplay mode

The default non-interactive world preview uses autoplay.

`src/game/systems/input.ts` implements `createAutoplayInputFrame(...)`. It:

- chooses a forward/backward direction along the preview path,
- probes the next footprint using the current collider and world overlap query,
- queues a jump when autoplay is about to hit a one-block rise with headroom.

This means auto-jump is now a presentation/demo behavior, not a core engine
behavior.

## Render sync

### World rendering

`src/adapters/three/world-renderer.tsx` turns `VoxelWorld` cells into `Block`
components.

The renderer uses each block's `renderKey` and asks the world for water/fluid
adjacency so visual face culling stays separate from collision semantics.

### Player rendering

`src/components/world/player/index.tsx` renders the player model.

Two helpers hang off the rendered group:

- `PlayerMotionHelper` advances the engine and syncs the group transform.
- `PlayerAnimationHelper` drives limb swing based on the engine's `moving` flag
  or preview animation mode.

The rendered group is not authoritative; it mirrors `gameStateRef.current`.

## Scene orchestration

`src/components/world/map.tsx` is the bridge between scene setup and engine
state.

It is responsible for:

- creating the initial `GameState`,
- holding the player and world refs,
- wiring the keyboard adapter,
- resetting player/world state on `r`,
- rotating the world in preview mode,
- mounting `WorldRenderer` and `Player`.

`src/components/world/index.tsx` owns the `Canvas` and disables orbit controls
while interactive play mode is active.

## Testing strategy

The engine is validated primarily through direct logic tests.

### Automated tests

`src/game/game.test.ts` covers:

- landing and grounding,
- jump gating,
- wall collision clipping,
- no ledge climbing without jump input,
- autoplay-generated jump before a one-block rise,
- low-ceiling collision.

`src/game/world/world.test.ts` covers:

- fluid vs solid block semantics,
- fluid adjacency,
- AABB collision queries.

### Manual verification

The live `/world` page is still used as a smoke test for:

- autoplay preview behavior,
- keyboard movement,
- jump,
- reset,
- render sync.

Manual testing is useful for confirming that adapters and presentation still
drive the engine correctly.

## Design constraints and current behavior

- The world is static and loaded from a serialized map string.
- There is currently one simulated entity: the player.
- Movement is kinematic and collision-driven.
- The core engine does not depend on React or Three.js scene objects.
- Autoplay-specific behaviors belong in the input layer, not the controller.

## Future extensions

This architecture is intentionally small, but it leaves room for:

- more entities,
- richer block semantics,
- chunked/generated worlds,
- replay/debug tooling,
- additional controllers,
- sound/effects driven from `MoveResult`.

If those features are added, the main rule should stay the same:

> simulation owns truth, rendering reflects truth.
