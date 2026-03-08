# Minecraft World Refactor and Engine Redesign Plan

## Overview

This document describes how to refactor the current Three.js Minecraft-style
world logic into a clearer, more extensible, more testable game architecture.

The immediate collision problems are symptoms of a deeper structural issue: the
current implementation mixes simulation, gameplay rules, rendering, input, and
scene graph updates inside React- and Three-oriented code.

That approach is fast to prototype, but it becomes harder to:

- reason about behavior,
- define clear semantics,
- test collision and movement,
- extend the game with new entity types or block rules,
- and prevent regressions.

The recommended long-term direction is to build a **small voxel game runtime**
or **mini-engine** with clear boundaries:

- the simulation core owns game truth,
- the renderer only draws the current truth,
- and adapters bridge input and timing into the simulation.

This does not require building a huge general-purpose engine. The goal is a
compact, explicit architecture tailored to this game.

---

## Current Structural Problems

The current world logic blurs several responsibilities together:

- rendering world blocks
- storing world data
- reading input
- simulating motion
- handling collisions
- deriving grounded/jump state
- rotating the player
- updating animation state

These concerns are spread across:

- `src/components/world/player/motion.tsx`
- `src/components/world/world.tsx`
- `src/components/world/player/index.tsx`
- `src/components/world/map.tsx`

That creates a few systemic issues:

## 1. Rendering and simulation are coupled

The simulation currently depends on scene graph objects and `useFrame(...)`.

This makes it difficult to:

- run simulation logic outside React,
- unit test movement without mounting components,
- inspect state transitions in a deterministic way.

## 2. Game semantics are implicit

Examples of implicit rules:

- "nonzero block means collision"
- "exact integer Y means grounded"
- "step-up is auto-jump"
- "world bounds are hardcoded"

These assumptions are not encoded as explicit game rules or types.

## 3. State is partly in refs and partly in transforms

The game currently stores meaningful simulation state in:

- `Vector3` refs
- scene object positions
- boolean refs like `isJumpingRef`

That makes it harder to know what the actual source of truth is.

## 4. Testing is difficult by design

The current architecture encourages testing by manually running the scene, not
by exercising pure logic with fixtures.

## 5. Extensibility is limited

As more features are added, the current design would make it difficult to add:

- multiple moving entities
- richer block semantics
- mobs/NPCs
- tools/interactions
- fluids
- stairs/slabs
- world generation or chunking

without increasing complexity in the React layer.

---

## Redesign Goals

The redesign should optimize for the following.

## 1. Clear ownership of truth

The simulation should own:

- world state
- entity state
- physics state
- gameplay rules

The renderer should not be the source of truth.

## 2. Clear semantics

Core concepts like these should be explicit:

- what counts as solid
- what counts as grounded
- what counts as a collision
- what a player intends to do
- what motion was actually allowed

## 3. Testability

The simulation should be runnable:

- without React
- without Three.js rendering
- without DOM events

## 4. Extensibility

The design should support future additions without major rewrites:

- more entities
- more block types
- richer movement rules
- different controllers
- larger worlds

## 5. Maintainability

The code should have:

- small modules
- predictable data flow
- explicit interfaces
- minimal hidden assumptions

---

## Core Design Principle

The most important architectural rule should be:

> The game simulation should run independently of React and independently of the
> Three.js scene graph.

In practice, that means:

- React components render state
- adapter code feeds inputs into simulation
- engine code computes next state

This makes the system much easier to test and reason about.

---

## Proposed Architecture Layers

## 1. Simulation core

This is the heart of the engine.

Responsibilities:

- world storage and lookup
- entity storage
- movement and collision
- game rules
- simulation stepping

Should not import:

- `react`
- `@react-three/fiber`
- `three` rendering components
- mesh/material code

May use:

- plain data objects
- lightweight math helpers
- pure functions

## 2. Adapter layer

This bridges platform/runtime concerns into the simulation.

Responsibilities:

- keyboard input collection
- converting raw inputs into game intent
- loading world data from current map formats
- ticking the simulation on a schedule
- synchronizing simulation state to render state

Examples:

- keyboard adapter
- timing/tick adapter
- world loader
- render sync adapter

## 3. Presentation layer

This is the visual/UI layer.

Responsibilities:

- rendering meshes
- applying textures/materials
- camera
- lights
- animation playback
- debug overlays

This layer should not decide gameplay or collision outcomes.

---

## Recommended Engine Concepts

The engine does not need to be large. It only needs a small number of clearly
named concepts.

## 1. World

The world should represent logical block state and expose collision-safe queries.

Responsibilities:

- block lookup by cell
- bounds
- collision semantics
- neighborhood lookup
- AABB overlap queries

Example responsibilities:

- `getBlock(cell)`
- `getBlockIdAtCell(x, y, z)`
- `getCollisionKind(cell)`
- `collidesAABB(aabb)`
- `getOverlappingCells(aabb)`
- `getBounds()`

Important rule:

- the world should answer gameplay questions,
- not just rendering questions.

## 2. Block registry

Define block types in one place with explicit semantics.

Each block should have:

- id
- name
- collision kind
- render/material key
- optional gameplay flags

Possible flags:

- `solid`
- `fluid`
- `transparent`
- `climbable`
- `hazardous`
- `breakable`
- `castsShadow`

This decouples:

- block visuals
- block behavior

and avoids accidental rules like "all nonzero blocks are solid."

## 3. Math primitives

Create a small set of reusable core math types.

Examples:

- `Vec3`
- `CellCoord`
- `AABB`
- `Ray`
- `HitResult`
- `MoveResult`

These should be engine-facing types, not scene graph types.

Using plain objects or small helpers instead of `three` math inside the core has
real benefits:

- simpler tests
- fewer hidden mutations
- less coupling to the render stack

## 4. Entity model

Entities should be represented as plain data.

For a player-like entity, store:

- id
- position
- velocity
- facing
- collider
- grounded
- movement intent
- controller state

Not:

- React refs
- mesh refs
- scene graph pointers

This makes state inspection and testing much easier.

## 5. Character controller

The player should use a dedicated kinematic controller.

Responsibilities:

- desired movement
- jump requests
- gravity
- grounded state
- collision resolution
- wall sliding
- optional step/snap behavior

This controller should accept:

- body state
- movement intent
- world query interface
- simulation constants

And return:

- new body state
- collision results
- grounded state
- movement result flags

## 6. Systems

Simulation behavior should be divided into systems that update data in a
predictable order.

Examples:

- input system
- player controller system
- physics system
- animation-state system
- camera follow system

This does not require a full ECS. Plain systems over plain objects are enough.

---

## Recommended Data Flow

A clearer update loop would look like this:

1. gather raw input
2. convert raw input into player intent
3. step simulation using intent and elapsed fixed time
4. derive render state from simulation state
5. render the scene

This separates:

- what the player wants
- what physics allows
- what the game renders

### Intent vs outcome

One of the biggest design improvements is to distinguish between:

- **intent**: move forward, jump, turn
- **desired motion**: target velocity or directional request
- **resolved motion**: actual movement after collision and rules

That distinction helps debugging and testing significantly.

---

## Proposed Folder Structure

One workable organization:

```text
src/game/
  core/
    math/
      vec3.ts
      aabb.ts
    types.ts
    tick.ts

  world/
    world.ts
    block-registry.ts
    world-loader.ts
    collision.ts

  entities/
    entity.ts
    player.ts

  systems/
    input.ts
    player-controller.ts
    physics.ts
    grounding.ts
    animation-state.ts

  rules/
    blocks.ts
    movement.ts
    constants.ts

  fixtures/
    flat-floor.ts
    wall.ts
    corner.ts
    low-ceiling.ts
    ledge.ts

src/adapters/
  input/
    keyboard.ts
  three/
    sync.ts
    world-renderer.ts
    player-renderer.ts

src/components/world/
  ...
```

This is only one possible organization, but the main idea is:

- `src/game/**` contains engine logic
- `src/adapters/**` bridges runtime concerns
- `src/components/**` handles React/Three rendering

---

## Suggested Interfaces and Semantics

## 1. World query interface

The simulation should depend on a world query contract, not a specific React or
render implementation.

Example responsibilities:

- get cell data
- test solidity
- test AABB overlap
- return bounds

This lets the same controller work with:

- current static world data
- generated worlds
- chunked worlds
- test fixture worlds

without changing controller logic.

## 2. Character controller interface

The controller should have a clear contract:

- input: current body state + intent + world
- output: resolved body state + collision info

Possible configuration:

- collider dimensions
- movement speed
- gravity
- jump velocity
- ground snap
- step height
- collision epsilon

That makes the controller reusable and tunable.

## 3. Tick interface

The simulation should expose a single clear update entry point.

Examples:

- `simulateTick(gameState, inputFrame, dt)`
- `stepWorld(worldState, commands, fixedDt)`

The important point is that the tick operates on plain data and can be run
outside the UI.

---

## Physics and Collision as a Reusable Subsystem

The movement and collision code should become its own subsystem rather than a
helper inside a player component.

## Desired responsibilities

- resolve kinematic body movement
- apply gravity
- enforce grounded rules
- handle ceiling/wall contact
- return collision flags
- support substeps or fixed-step updates

## Suggested outputs

Instead of just mutating a position, return structured data such as:

- final position
- final velocity
- grounded
- hit wall X
- hit wall Z
- hit ceiling
- landed this frame
- left ground this frame

This gives later systems better information:

- animation
- sound
- camera bob
- effects

---

## Fixed Timestep Recommendation

One major improvement would be to shift simulation to a fixed timestep.

Instead of directly simulating using the current render `delta`, use:

- fixed simulation steps, for example `1 / 60`
- optionally multiple catch-up steps if render frames are slow

Benefits:

- deterministic behavior
- easier reproducibility
- more stable collision
- simpler testing
- less dependency on rendering performance

If a full fixed timestep is too much for the first refactor, then at minimum:

- use bounded substeps inside movement resolution

That still improves correctness significantly.

---

## Why Not Keep Everything in React Hooks?

React hooks are fine for:

- synchronization
- subscriptions
- render lifecycle

But they are not an ideal home for the core game runtime because:

- state is fragmented across refs and component transforms
- update order becomes harder to reason about
- logic is harder to test without mounting components
- reusing the logic outside this scene becomes difficult

The goal is not to remove React. The goal is to make React the view layer, not
the game engine.

---

## Should This Use ECS?

Maybe eventually, but probably not yet.

## Recommended near-term approach

Use:

- plain state objects
- explicit systems
- modular subsystems

This gives most of the benefits of a real engine without the complexity of a
full entity-component-system implementation.

## Why not start with ECS

ECS adds:

- component storage complexity
- query systems
- debugging overhead
- more abstraction than this project likely needs today

## When ECS might become worthwhile

If the game grows to include:

- many entity types
- dynamic interactions
- combat
- AI
- inventories/items
- lots of independently updating systems

then ECS may make sense later.

For now, a compact simulation core is the better tradeoff.

---

## How to Make the Logic More Testable

## 1. Remove `three` vectors from the core

Core simulation code should avoid `Vector3` and other scene-driven types when
possible.

Prefer:

- plain objects
- small utility math modules

This reduces accidental mutation and keeps tests lightweight.

## 2. Favor pure functions

The most valuable engine functions should be easy to test directly.

Examples:

- `worldToCell(...)`
- `getOverlappingCells(aabb, world)`
- `collidesAABB(...)`
- `resolveHorizontalMove(...)`
- `resolveVerticalMove(...)`
- `computeGrounded(...)`
- `simulatePlayerStep(...)`

Pure functions make it easy to create table-driven tests and regression cases.

## 3. Use fixture worlds

Create small logical worlds used only for tests.

Examples:

- flat floor
- single wall
- corner
- low ceiling
- ledge
- overhang
- water pool

Each fixture can verify a specific scenario deterministically.

## 4. Test outcomes, not visuals

Test:

- final position
- velocity
- grounded
- collision flags
- accepted or rejected jump
- whether movement was clipped on each axis

Do not make rendering the primary test mechanism.

## 5. Keep the render sync thin

If the render layer only mirrors engine state, then most logic can be tested
without touching React.

That is one of the biggest maintainability wins available.

---

## How to Make the Logic More Maintainable

## 1. Use explicit vocabulary

Names should reflect true semantics.

Examples of clearer concepts:

- `grounded`
- `movementIntent`
- `collisionKind`
- `supportBelow`
- `contactFlags`
- `jumpQueued`
- `jumpConsumed`

Avoid names that blur behavior or overstate meaning.

## 2. Centralize gameplay rules

Keep gameplay constants and rules in one place:

- gravity
- movement speed
- jump velocity
- collider dimensions
- epsilon
- ground snap
- step height

This makes balancing and future changes safer.

## 3. Remove hidden assumptions

Turn assumptions into explicit contracts or configuration.

Examples:

- origin is feet-centered
- blocks are 1x1x1
- world coordinates map to cells using floor
- water is non-solid
- leaves are solid or passable by explicit choice

## 4. Separate world data from world rendering

The current `World` class mixes logical block storage with render element
construction.

A clearer split would be:

- `VoxelWorld` for data and queries
- `WorldRenderer` for converting world state to meshes

This makes both parts easier to change independently.

## 5. Make state transitions inspectable

A simulation step should produce data that can be logged and debugged.

For example:

- input intent
- desired movement
- collision results
- final resolved movement

This helps explain behavior without stepping through scene graph mutation.

---

## Proposed Migration Strategy

This redesign can be done incrementally rather than as a one-shot rewrite.

## Stage 1: extract simulation from React hooks

Goal:

- move movement/collision logic into pure modules
- keep current behavior as close as possible

Tasks:

- create engine-facing player state types
- move collision helpers out of `motion.tsx`
- call them from the current component layer

Outcome:

- first layer of separation
- lower risk than a total rewrite

## Stage 2: define explicit world and block semantics

Goal:

- stop treating render IDs as implicit gameplay rules

Tasks:

- create block registry
- add collision kinds
- expose world bounds and collision-grade queries

Outcome:

- much clearer semantics
- better foundation for richer gameplay

## Stage 3: introduce a proper kinematic controller

Goal:

- replace ad hoc movement logic with a reusable body controller

Tasks:

- define collider
- resolve movement with AABB collision
- track grounded and collision flags
- support substeps or fixed steps

Outcome:

- more robust movement
- reusable control logic
- easier testing

## Stage 4: make rendering a projection of game state

Goal:

- reduce scene graph objects to presentation only

Tasks:

- sync engine state to rendered meshes
- derive animation state from simulation outputs
- remove direct simulation ownership from React components

Outcome:

- clearer rendering code
- easier feature work

## Stage 5: optionally formalize a larger engine loop

Goal:

- support larger future growth

Possible additions:

- multiple entity types
- world generation/chunking
- more systems
- save/load state
- replay/debug tooling

Outcome:

- scalable runtime architecture if the project grows beyond a single scene.

---

## Minimal Viable Engine Contracts

If the redesign were kept intentionally small, these would be the most useful
core contracts.

## Game state

A plain object representing:

- world
- entities
- player state
- simulation time

## Input state

A plain object representing:

- movement axes
- jump pressed
- jump held
- optional look/turn input later

## World query API

Functions to ask:

- what block is here
- is this cell solid
- does this AABB collide
- what bounds exist

## Controller API

A function that receives:

- player/body state
- input intent
- world
- dt

and returns:

- next body state
- movement/collision results

## Render sync API

A small adapter that takes:

- current engine state

and applies it to:

- Three.js groups
- animations
- camera targets

---

## Practical Benefits of This Redesign

This architecture would make it much easier to:

- fix and validate collision bugs
- add new block types safely
- change player movement rules
- support multiple entities
- build tests around movement edge cases
- inspect and debug state transitions
- reason about code ownership

It also reduces the chance that future features accidentally reintroduce the
same class of brittle assumptions.

---

## Suggested First Principles for the New Design

If this is redesigned from the ground up, these principles should guide it:

1. simulation owns truth
2. rendering reflects truth
3. inputs are intentions, not outcomes
4. collision semantics are explicit
5. state is plain data
6. core logic is testable without UI
7. update order is deterministic
8. small modules with strong names beat convenient mixed-responsibility helpers

---

## Bottom Line

Yes, this can and probably should be redesigned into a clearer mini-engine.

The most valuable structural improvements are:

1. separate simulation from rendering
2. define explicit world and block semantics
3. represent player/world state as plain data
4. replace hook-local motion logic with a reusable character controller
5. use fixed-step or substepped simulation
6. make the core logic pure enough for direct unit tests

That redesign would not just fix the current collision problems. It would give
the project clearer semantics, better tests, easier debugging, and a much more
maintainable path for future game features.
