# 9. Seamless Block-to-Wire Fidelity Transition Plan

## Problem statement

Blocks currently clip into and out of existence when the active full-detail footprint changes. Wireframes and blocks are separate hard bands, so terrain does not gradually resolve from wireframe to rendered blocks or dissolve back to wireframe as the player moves.

The fix is to make **continuous fidelity** the shared source of truth for all render layers.

## Invariant

- Full-resolution collision and seed blocks remain authoritative.
- The authored starter seed is fully opaque/high fidelity in preview mode.
- Outside the full-detail footprint, generated terrain should pass through mid-detail and wireframe states instead of popping.
- Fading should be visual only; collision availability must remain conservative and should not fade.

## Current failure mode

```text
column enters full-detail footprint
  → render block immediately
column leaves full-detail footprint
  → remove block immediately
wireframe perimeter separately rendered
  → no crossfade with blocks
```

## Target transition

For each terrain column/cell, compute a continuous fidelity value:

```ts
fidelity = 1 - smoothstep(fullStart, wireEnd, distanceFromHighDetailZone);
```

Then derive layer opacities:

```ts
blockOpacity = smoothstep(0.72, 1.0, fidelity);
midOpacity = 1 - abs(fidelity - 0.55) / 0.45;
wireOpacity = 1 - smoothstep(0.25, 0.72, fidelity);
particleOpacity = 1 - smoothstep(0.0, 0.25, fidelity);
```

Expected visual progression:

```text
fidelity 1.00: opaque textured blocks
fidelity 0.70: blocks fading, mid columns visible
fidelity 0.50: translucent mid-detail terrain dominates
fidelity 0.25: mid columns fading, wireframes dominate
fidelity 0.00: sparse grid/particles only
```

## Hysteresis and transition state

Distance-only opacity still flickers at band boundaries if the focus moves back and forth. Add per-column visual state:

```ts
interface ColumnVisualState {
  key: string;
  currentLod: ChunkLod;
  previousLod: ChunkLod | null;
  enteredAtMs: number;
  lastSeenAtMs: number;
  transitionDurationMs: number;
}
```

Blend final opacity with transition progress:

```ts
transitionProgress = smoothstep(0, duration, now - enteredAtMs);
finalOpacity = mix(previousOpacity, targetOpacity, transitionProgress);
```

Use hysteresis radii:

```ts
highEnterRadius = 5.0 columns;
highExitRadius = 6.5 columns;
midEnterRadius = 10.0 columns;
midExitRadius = 12.0 columns;
```

## Render snapshot requirements

Render snapshot should contain all active visual layers for overlapping transition bands:

```ts
interface ProceduralRenderSnapshot {
  highDetailCells: HighDetailCell[];   // includes opacity
  midDetailColumns: MidDetailColumn[]; // includes opacity
  wireColumns: WireColumn[];           // includes opacity/fidelity
  particleTiles: ParticleTile[];       // includes opacity
}
```

Important: a column may appear in more than one layer during transition. For example, near `fidelity = 0.7`, it may have both block cells and a mid-detail proxy so the layers can crossfade.

## Block opacity support

The current `WorldRenderer` renders block components as fully opaque. Add a procedural high-detail renderer path that accepts opacity:

```text
src/adapters/three/procedural-high-detail-renderer.tsx
```

Initial implementation can group cells by opacity/material and pass opacity into materials. Longer term, use instancing with per-instance opacity or dithered fade.

Recommended first step:

- keep static `WorldRenderer` unchanged,
- add procedural renderer for snapshot high-detail cells,
- for `opacity < 1`, use transparent material or alpha-tested dither to avoid sorting artifacts.

## Wireframe fade support

Wire geometry needs per-vertex attributes:

```ts
attribute float fidelity;
attribute float lodOpacity;
attribute float transitionProgress;
```

Shader opacity:

```glsl
float opacity = baseOpacity * lodOpacity * cameraFade * transitionProgress;
```

## Mid-detail proxy support

Mid-detail terrain columns should bridge between blocks and wireframes:

- simplified column sides and top surface,
- biome/surface color or low-cost material,
- transparent fade in/out,
- no collision authority.

Without this layer, block-to-wire crossfade will still feel abrupt because wireframes have very different visual density.

## Implementation order

1. Add column-distance LOD sampling with continuous fidelity.
2. Extend render snapshot with opacity for high/mid/wire/particle layers.
3. Add transition state/hysteresis in `ProceduralWorldRuntime`.
4. Add procedural high-detail renderer that accepts block opacity.
5. Add mid-detail column renderer.
6. Update fringe geometry/shader to use snapshot opacity and fidelity.
7. Stop rendering procedural terrain through the old hard-cut `WorldRenderer` path except for static mode.

## Tests

Add tests for:

- opacity curves are monotonic where expected,
- blocks and wireframes overlap during transition instead of hard switching,
- hysteresis prevents repeated LOD flips near thresholds,
- snapshot includes both old and new layers during transition windows,
- seed preview blocks remain fully opaque.

## Acceptance criteria

- Walking forward does not cause blocks to pop into existence.
- Walking backward does not cause blocks to disappear instantly.
- Wireframes fade down as blocks/mid-detail terrain fade up.
- The transition is driven by one shared LOD/fidelity policy.
- Static rendering behavior remains unchanged.
