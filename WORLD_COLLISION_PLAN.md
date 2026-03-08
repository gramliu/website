# Minecraft World Collision Analysis and Remediation Plan

## Overview

This document captures a deep analysis of the current collision logic for the
Three.js Minecraft-style world and lays out a practical, incremental plan to
fix the clipping issues where the player can partially enter existing boxes.

The short version is:

- the player is rendered like a boxy Minecraft character,
- but collision is currently handled like a narrow centerline with a couple of
  point samples,
- horizontal wall resolution is largely missing,
- support and grounding logic rely on brittle assumptions,
- and several smaller correctness bugs amplify the problem.

The most robust end state for this codebase is an upright player AABB
(axis-aligned bounding box) controller operating in voxel space, backed by
data-driven block solidity, axis-separated collision resolution, and substeps
for large frame deltas.

---

## Files Involved

### Core movement and collision

- `src/components/world/player/motion.tsx`
  - `calculateHorizontalMovement(...)`
  - `calculateVerticalMovement(...)`
  - `handleCollisions(...)`
  - `PlayerMotionHelper(...)`

### World lookup and block queries

- `src/components/world/world.tsx`
  - `getBlockAtPosition(...)`
  - `getHighestBlockPosition(...)`
  - `getAdjacentBlocks(...)`
  - `isWater(...)`

### Player placement and render shape

- `src/components/world/player/index.tsx`
- `src/components/world/entity.tsx`

### Scene integration and reset behavior

- `src/components/world/map.tsx`

### Block types and map data

- `src/components/world/blocks.tsx`
- `src/components/world/block.tsx`
- `src/components/world/world-data.ts`

---

## Current Collision Model

## Rendering shape

The player is visually about:

- 1 block wide
- 2 blocks tall

The player group is positioned at:

- `x + 0.5`
- `y`
- `z + 0.5`

That means the player origin is effectively the feet position, centered within
the block in X/Z.

## Physics shape

The physics system does not use a real box, capsule, or `Box3`.

Instead, collision is inferred from a few point samples:

- one sample at `nextPosition`
- one sample at `nextPosition + [0, 2, 0]`
- one support query using `getHighestBlockPosition(nextPosition.x, nextPosition.z)`

This means the player is treated more like:

- a centerline with no width,
- plus a head point,
- plus a vertical snap heuristic.

That mismatch between the rendered player volume and the collision volume is the
main structural reason clipping is possible.

---

## Current Logic Breakdown

### 1. Horizontal movement

`calculateHorizontalMovement(...)`:

- reads input from `getMovementVector(...)`
- sets `velocity.x` and `velocity.z`
- clamps movement only to hardcoded map bounds
- does not perform any real block-against-player horizontal collision

Implication:

- horizontal movement can proceed into walls or props as long as map bounds are
  not exceeded.

### 2. Vertical movement

`calculateVerticalMovement(...)`:

- determines grounding using:
  - `currentPosition.clone().add(new Vector3(0, -1, 0))`
  - `currentPosition.y % 1 === 0 && blockBelow !== 0`
- applies gravity if not grounded
- applies jump velocity if jump is pressed
- contains an "if moving toward a block, jump" auto-jump heuristic

Implication:

- grounded logic is brittle because it depends on exact integer Y,
- the auto-jump behavior is not real step logic,
- and the system mixes jump intent with collision handling.

### 3. Collision handling

`handleCollisions(...)`:

- computes `movement = velocity * delta`
- samples only the destination
- checks:
  - `nextBlock`
  - `nextHeadBlock`
  - `topBlock`
- adjusts `movement.y` in some cases
- never resolves X and Z penetration separately

Implication:

- collisions are mostly vertical
- horizontal clipping is underconstrained
- corner and side cases are unreliable

### 4. World lookup

`World.getBlockAtPosition(...)`:

- converts world coordinates to voxel coordinates using `Math.trunc`
- returns block ID or `0`

Implication:

- lookup is simple and fast,
- but it has incorrect semantics for negative coordinates,
- and it cannot express solid vs fluid vs passable without extra metadata.

### 5. Support query

`World.getHighestBlockPosition(x, z)`:

- starts from `y = 0`
- moves up until the first air block
- returns that air Y

Implication:

- this is not a general support query,
- it only works for columns that are continuously solid from the bottom up,
- and it fails for overhangs, floating blocks, canopies, or gaps.

---

## Root Causes of the Clipping Bug

## 1. Collider mismatch

The visual player occupies real width, but collision only samples the center.

This causes:

- shoulder clipping
- corner clipping
- body overlap before the center enters a solid cell

## 2. Missing horizontal collision resolution

There is no proper X/Z face resolution against blocks.

This causes:

- walking into walls without being cleanly stopped
- diagonal penetration into corners
- inconsistent sliding behavior

## 3. Discrete destination-only collision tests

The system only checks the destination point, not the path taken to reach it.

This causes:

- tunneling on large deltas
- deeper penetration before correction
- inconsistent behavior at low frame rates

## 4. Incorrect support model

Support is inferred from `getHighestBlockPosition(...)`, which is not a true
query for "what is directly below the player's footprint right now?"

This causes:

- bad landing and snapping logic
- incorrect handling around trees, canopies, overhangs, and air gaps

## 5. Fragile grounding

The exact-integer Y grounding condition is too brittle for real movement.

This causes:

- false airborne states
- jitter
- missed jumps
- tiny penetrations before the system realizes the player is grounded

## 6. Supporting correctness bugs

Several smaller issues amplify the clipping problem:

- a velocity mutation bug in the frame loop
- reset spawn offset mismatch
- `Math.trunc` instead of `Math.floor`
- auto-jump masquerading as collision handling
- landing snap math that can pop upward

---

## Detailed Findings and Edge Cases

## 1. Straight wall collision

### Scenario

Walk directly into the side of a solid block or wall.

### Current behavior risk

- the feet/body center sample may stay in air briefly while the visible body is
  already intersecting the wall,
- and the system does not resolve X/Z penetration explicitly.

### Expected fix behavior

- the player should stop at the wall,
- with no visible penetration,
- and should remain stable if movement input continues.

---

## 2. Diagonal movement into corners

### Scenario

Move diagonally into the corner between two adjacent solid blocks.

### Current behavior risk

- no per-axis resolution,
- no width-aware collider,
- easy to partially embed or snag.

### Expected fix behavior

- the blocked axis should be rejected,
- the free axis should continue if possible,
- producing natural wall sliding.

---

## 3. Grazing a block with the player's shoulder

### Scenario

Move close enough that the visible body should collide, but the center point
still remains in empty space.

### Current behavior risk

- visible clipping with no collision response.

### Expected fix behavior

- collision should occur based on the player's full footprint, not just center.

---

## 4. Crafting table obstacle

### Scenario

Move around or into the crafting table in the scene.

The map already includes:

- a crafting table block (`58`)
- adjacent log blocks

### Current behavior risk

- the player may auto-jump instead of being cleanly blocked,
- may partially clip into the side,
- and may snap strangely because support is inferred from the column heuristic.

### Expected fix behavior

- solid side collision,
- no auto-hop unless explicitly designed,
- stable movement around the prop.

---

## 5. Tree trunk and canopy interaction

### Scenario

Move into the trunk or under/around the leaf canopy.

### Current behavior risk

- trunk side clipping due to no body width in collision,
- canopy behavior is inconsistent because support logic ignores discontinuous
  columns,
- leaves are treated as full solid cubes because all nonzero IDs are effectively
  solid.

### Expected fix behavior

- trunk should block cleanly,
- leaf collision should follow an explicit gameplay rule,
- overhead collisions should respect player width.

---

## 6. Low ceiling collisions

### Scenario

Jump into leaves, logs, or other low overhead blocks.

### Current behavior risk

- only a single head sample is used,
- body corners can intersect ceilings even if the centerline remains clear.

### Expected fix behavior

- any portion of the player's upper AABB hitting a solid block should stop
  upward movement.

---

## 7. Landing near edges

### Scenario

Land with only part of the player's footprint above a supporting block.

### Current behavior risk

- support is not evaluated against the full footprint,
- snapping is column-based,
- edge cases may jitter or snap incorrectly.

### Expected fix behavior

- grounding should depend on overlap between the player's footprint and actual
  solid support below,
- not on a single center sample or a bottom-up column scan.

---

## 8. Large delta or low FPS spikes

### Scenario

A frame hitch causes a larger-than-normal `delta`.

### Current behavior risk

- the player may move far enough in one frame to tunnel through block
  boundaries,
- especially during jumps or falls.

### Expected fix behavior

- motion should be subdivided into smaller physics steps,
- preventing boundary skipping.

---

## 9. Negative coordinates or slight out-of-bounds movement

### Scenario

The player moves slightly negative in X or Z, or ends up outside the intended
 map by a small amount.

### Current behavior risk

- `Math.trunc(-0.2) === 0`, which is not correct voxel behavior,
- so lookup can accidentally read the wrong in-bounds cell.

### Expected fix behavior

- world-to-cell conversion should use `Math.floor`,
- and bounds should be applied to the collider extents, not only the center.

---

## 10. World boundary contact

### Scenario

The player walks to the edge of the map.

### Current behavior risk

- bounds are hardcoded and applied to the player center,
- not to a true collision box,
- so part of the body can overhang or clip near the edge.

### Expected fix behavior

- clamp the AABB against actual world bounds derived from world data.

---

## 11. Reset behavior

### Scenario

Press `R` after moving or colliding.

### Current behavior risk

- initial spawn is centered with `+0.5` in X/Z,
- reset writes raw coordinates directly to the group,
- causing a half-block mismatch between normal spawn and reset spawn.

### Expected fix behavior

- reset should use the same centering convention as initial placement,
- and motion state should be reset with position.

---

## 12. Water and leaf semantics

### Scenario

Move through water or interact with leaf blocks.

### Current behavior risk

- all nonzero blocks are effectively solid,
- water therefore behaves like a solid cube unless separately handled,
- leaves are only visually translucent, not physically differentiated.

### Expected fix behavior

- collision should be data-driven:
  - air: passable
  - water: fluid or passable
  - leaves: explicitly chosen behavior
  - terrain/log/crafting table: solid

---

## Code-Specific Bugs to Fix Early

These are low-risk, high-value fixes that should be done before or during the
larger collision refactor.

## 1. Velocity mutation bug

In `PlayerMotionHelper(...)`, this line mutates the live velocity ref:

```ts
currentVelocity: velocityRef.current.add(horizontalVelocity)
```

Because `Vector3.add()` mutates, the vertical movement code receives a velocity
that has already been altered in place.

### Why this matters

- the lookahead probe for obstacle detection becomes inconsistent,
- horizontal state leaks into subsequent calculations,
- and debugging collision behavior becomes harder.

### Fix

- clone before adding, or restructure the calculation so no temporary mutation
  occurs.

## 2. Reset centering mismatch

Initial placement centers the player in a block, but reset does not.

### Fix

- make reset use the same centered transform convention as initial spawn.

## 3. `Math.trunc` world lookup

### Fix

- replace with `Math.floor` for voxel semantics.

## 4. Exact grounded equality

### Fix

- replace exact integer checks with collision-derived grounding plus epsilon.

## 5. Landing snap math

Current falling collision uses:

```ts
movement.y = Math.ceil(currentPosition.y) - currentPosition.y;
```

This can pop the player upward when falling from fractional heights.

### Fix

- snap to the actual top of the collided support surface instead.

## 6. Auto-jump on obstacle

### Fix

- remove it early; it masks the real collision problem and introduces extra
  unpredictability.

---

## Recommended End State

## Use an upright AABB

For this voxel world, the right collider is an upright axis-aligned box.

Suggested starting dimensions:

- width: `0.6` to `0.8`
- depth: `0.6` to `0.8`
- height: `1.8` to `2.0`

Anchored at the feet:

- `min = [x - halfWidth, y, z - halfDepth]`
- `max = [x + halfWidth, y + height, z + halfDepth]`

### Why AABB is appropriate here

- the world is made of axis-aligned unit cubes,
- broad collision can be done via voxel cell overlap,
- axis-separated resolution is simple and stable,
- and it matches Minecraft-style movement well.

Capsules are unnecessary complexity for this map style.

---

## World Query API Changes

The world class should expose collision-focused queries rather than forcing
physics to infer meaning from render IDs.

## Phase 1 API additions

Add:

```ts
getBlockIdAtCell(x: number, y: number, z: number): number
worldToCell(x: number, y: number, z: number): { x: number; y: number; z: number }
isSolidAtCell(x: number, y: number, z: number): boolean
isFluidAtCell(x: number, y: number, z: number): boolean
isPassableAtCell(x: number, y: number, z: number): boolean
getBounds(): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
```

## Phase 2 API additions

Once the player uses an explicit collision box, add:

```ts
getCellsOverlappingAABB(min: Vector3, max: Vector3): Array<{ x: number; y: number; z: number; id: number }>
collidesSolidAABB(min: Vector3, max: Vector3): boolean
```

These two methods are enough to support a stable AABB controller.

## What to retire from player physics

Do not keep using:

- `getHighestBlockPosition(...)`

for player support or grounding. It can remain if it is useful for unrelated
presentation logic, but not for core collision.

---

## Block Collision Semantics

Collision behavior should be explicit and data-driven.

## Recommended initial classification

- `0` air -> `passable`
- `9` water -> `fluid` or non-solid
- `18` leaves -> `solid` for now, unless the design wants decorative passable
  leaves
- terrain, logs, crafting table -> `solid`

## Why this matters

Rendering translucency is not the same as collision behavior.

Right now:

- water looks translucent, but behaves like a solid block,
- leaves are translucent, but also behave like full solids by accident rather
  than explicit design.

Making collision intent explicit will prevent future content bugs.

---

## Movement Integration Plan

The movement loop should be reorganized into deterministic physics steps.

## Per-frame order

1. Read input
2. Compute desired horizontal movement
3. If jump was pressed and the player is grounded, set vertical jump velocity
4. Apply gravity
5. Break motion into substeps if necessary
6. For each substep:
   1. resolve horizontal movement
   2. resolve vertical movement
   3. update grounded state
   4. optionally apply small ground snap

## Horizontal resolution

Resolve horizontal axes separately:

- X first, then Z
- or largest-magnitude axis first, then the other

This allows:

- clean wall stopping
- natural sliding
- better corner behavior

## Vertical resolution

Resolve Y separately after horizontal movement in each substep:

- upward collision stops ascent
- downward collision establishes support and grounded state

## Physics state to track

Track:

- position
- velocity
- grounded
- optionally `wasGroundedLastFrame`

Do not use jump-button state as the main source of truth for grounding.

---

## Grounding and Step Strategy

## Grounding

Grounding should come from actual collision with support below the AABB.

Recommended rule:

- if downward movement hits a solid block beneath the feet footprint:
  - `grounded = true`
  - `velocity.y = 0`
- otherwise:
  - `grounded = false`

## Ground snap

Add a small snap-down only when:

- vertical velocity is not strongly upward,
- the player was grounded recently,
- support exists within a small distance below.

Suggested values:

- `GROUND_SNAP = 0.05` to `0.1`

This helps:

- prevent tiny hovering over seams,
- keep walking stable over slightly uneven transitions,
- and reduce visual jitter.

## Step-up policy

For the current all-cube world, do not support automatic full-block stepping.

Initial recommendation:

- remove the current auto-jump behavior
- do not auto-climb 1-block obstacles
- require an explicit jump for full-height cubes
- optionally allow only a tiny micro-step for seam correction

If slabs or stairs are added later, then implement a true step-up system:

- when horizontal motion is blocked,
- try moving up by `stepHeight`,
- test horizontal motion again,
- and only accept it if support exists under the resulting position.

---

## Epsilons and Tolerances

Collision code should use explicit tolerances instead of exact equality.

Suggested constants:

- `SKIN = 0.001`
- `GROUND_EPS = 0.001`
- `GROUND_SNAP = 0.05`
- `MAX_SUBSTEP_MOVE = 0.25`

Use them for:

- AABB-to-cell conversion
- face-contact comparisons
- grounded checks
- world-bound clamping

Example approach:

- `minCell = floor(min + SKIN)`
- `maxCell = floor(max - SKIN)`

This avoids counting exact face contact as penetration while still catching real
overlap.

---

## Tunneling Mitigation

Before implementing full swept AABB, use motion substeps.

## Recommended approach

Split each frame into `N` substeps such that no component moves more than about
`0.25` blocks in one substep.

Example:

```ts
const maxComponent = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
const steps = Math.max(1, Math.ceil(maxComponent / MAX_SUBSTEP_MOVE));
```

This is enough for walking and jumping at current speeds.

## Future upgrade

If the game later adds:

- very fast movement
- dashes
- knockback
- projectiles

then consider:

- swept AABB
- voxel DDA traversal

But that is not necessary for the current controller.

---

## Incremental Implementation Plan

## Phase 0: correctness cleanup

Goal: eliminate the bugs that make collision harder to reason about.

Tasks:

1. Fix the `Vector3.add()` mutation bug in `motion.tsx`
2. Fix reset spawn centering in `map.tsx`
3. Replace `Math.trunc` with `Math.floor` in `world.tsx`
4. Remove exact-integer grounded logic
5. Remove auto-jump obstacle handling
6. Stop using `getHighestBlockPosition(...)` for player collision and support
7. Fix landing snap behavior so it resolves to actual support surfaces

Benefit:

- fewer "sometimes" bugs,
- more deterministic behavior,
- cleaner baseline for later changes.

## Phase 1: add collision metadata to the world

Goal: make block collision semantics explicit.

Tasks:

1. Add collision classification for block IDs
2. Add solid/fluid/passable world queries
3. Add world bounds queries derived from map data

Benefit:

- decouples physics from rendering assumptions,
- makes water and leaves intentional rather than accidental.

## Phase 2: intermediate improvement with footprint sampling

Goal: reduce clipping risk without a full controller rewrite.

Tasks:

1. Define intended player extents
2. Sample multiple points:
   - foot corners
   - body corners
   - head corners
3. Block movement when any required sample overlaps a solid cell

Benefit:

- large improvement over centerline collision,
- lower implementation risk,
- useful stepping stone to a full AABB controller.

Limitation:

- still not as robust as proper overlap-based AABB collision.

## Phase 3: full upright AABB controller

Goal: implement the real long-term fix.

Tasks:

1. Add AABB overlap queries to `World`
2. Define player collider dimensions
3. Resolve movement axis-by-axis
4. Compute grounded state from actual support collisions
5. Add small ground snap
6. Clamp the collider against real world bounds

Benefit:

- consistent wall blocking,
- correct sliding,
- stable grounding,
- much lower risk of clipping at corners and edges.

## Phase 4: architecture cleanup

Goal: make the collision system testable and maintainable.

Tasks:

1. Move physics calculations into a pure helper module
2. Keep `PlayerMotionHelper(...)` as a thin integration layer
3. Feed input in, receive updated physics state out

Benefit:

- much easier unit testing,
- easier regression prevention,
- clearer separation between rendering and physics.

---

## Testing Plan

There are currently no collision tests in the repository, so testing needs to be
added alongside the refactor.

## Unit tests for world queries

### World-to-cell conversion

Test:

- `0.0 -> 0`
- `0.999 -> 0`
- `1.0 -> 1`
- `-0.001 -> -1`

### Collision classification

Test:

- air is passable
- water is not solid
- leaves follow the chosen policy
- terrain and props are solid

### AABB overlap

Test:

- exact face-touching is not penetration
- slight overlap is penetration
- negative coordinate overlap behaves correctly

## Unit tests for player controller

Test:

1. standing still on a floor remains grounded and stable
2. walking into a wall blocks movement
3. diagonal movement into a wall slides along the free axis
4. jump only begins when grounded
5. upward collision with a ceiling zeroes vertical velocity
6. walking off a ledge causes a fall
7. landing on a block edge is stable
8. water does not behave like solid ground if configured as fluid
9. large delta substeps do not tunnel through a 1-block wall
10. negative-coordinate cases behave symmetrically

## Manual smoke tests in the existing map

Use the current scene features:

- terrain edges
- water pools
- tree trunk
- leaf canopy
- crafting table
- reset with `R`

Manual checklist:

- no visible wall clipping
- no shoulder clipping against block faces
- no strange auto-hop behavior
- no upward pop on landing
- no jitter while resting on ground
- stable behavior at edges and corners
- reset spawn matches initial spawn
- water behaves intentionally
- leaves behave intentionally

---

## Recommended Priority Order

## Highest priority

1. Fix the velocity mutation bug
2. Fix reset spawn centering mismatch
3. Replace `Math.trunc` with `Math.floor`
4. Remove exact-integer grounded assumptions
5. Remove player-physics dependence on `getHighestBlockPosition(...)`

## Next priority

6. Add explicit block collision semantics
7. Add world bounds and collision-focused world queries
8. Replace point sampling with multi-point footprint sampling or go directly to
   AABB

## Final robust solution

9. Full AABB controller
10. Substeps plus ground snap
11. Dedicated collision tests

---

## Bottom Line

The clipping issue is not caused by a single bad comparison. It is the product
of several overlapping design problems:

- the player is rendered as a wide, tall character but collides like a narrow
  centerline,
- horizontal collisions are not properly resolved,
- support logic uses a column heuristic that does not match real voxel support,
- grounding relies on exact integer Y,
- and smaller correctness bugs make the behavior even less stable.

The correct long-term fix is to replace the current center-sample system with a
feet-anchored upright AABB controller using:

- explicit solid-block queries,
- axis-separated collision resolution,
- epsilon-based contact handling,
- and substeps for large frame deltas.

That approach will address the current clipping issues while also giving the
codebase a collision system that can support future gameplay changes without
becoming more brittle.
