# 8. Camera-Relative Fringe Fix Plan

## Problem statement

The procedural wireframe fringe is currently tied to the starter/full-detail footprint in world coordinates. As the player and camera move, the wireframes remain visually fixed instead of behaving like a camera-relative frontier where distant terrain is low fidelity and near terrain resolves to higher fidelity.

The fringe should be computed from **view-relative distance and LOD state**, not from a static perimeter around `world.getBounds()`.

## Invariant

- Preview mode may keep the authored seed visually centered/fixed.
- Interactive mode should evaluate fringe placement relative to the current camera/player focus.
- The high-detail authored seed remains exact when the focus is within the starter region.
- Generated fringe data must come from the same terrain generator and render snapshot as high/mid-detail terrain.

## Current failure mode

```text
computeProceduralFringeLayout(world.getBounds())
  → fixed rows around footprint
  → wireframes do not move with camera/focus
  → opacity is mostly static
```

This makes the fringe look like a permanent cage rather than a procedural horizon.

## Target model

```text
camera/player focus
  ↓
render origin / view frame
  ↓
LOD samples by column distance and screen relevance
  ↓
render snapshot bands
  ↓
fringe geometry + shader attributes
```

## Coordinate spaces

Define three explicit spaces:

1. **World space**: canonical simulation/generation coordinates.
2. **Render space**: world coordinates minus `renderOrigin`, used for Three.js object positions.
3. **View space**: render-space coordinates transformed by camera orientation for visibility/fade calculations.

Fringe generation should classify columns in world space, position them in render space, and fade them in view space.

## Camera-relative LOD anchor

In interactive mode, use the player/camera focus as the center of the LOD field:

```ts
lodFocus = gameState.player.position;
```

In preview mode, use the starter seed center:

```ts
lodFocus = starterRegion.center;
```

The full-detail footprint remains 10x10, but in interactive mode that footprint should follow `lodFocus` once the system supports generated terrain beyond the seed.

## Fringe band selection

Instead of hardcoded rows from bounds, sample columns in a ring around the current high-detail footprint:

```ts
for x/z in visibleCandidateArea:
  sample = lodPolicy.sampleColumn({ x, z, focus, camera });
  if sample.lod === "wire" or "horizon":
    add wire/grid/particle element
```

Candidate area should be bounded by render budget:

```ts
wireRadiusColumns = 18;
horizonRadiusColumns = 28;
```

## View relevance and camera fading

Use camera-relative weighting before creating or rendering wireframes:

```ts
viewDirectionWeight = saturate(dot(normalize(column - camera), cameraForward));
lateralWeight = 1 - smoothstep(maxLateralDistance * 0.7, maxLateralDistance, lateralDistance);
distanceWeight = lodPolicy.wireOpacity;
finalOpacity = distanceWeight * viewDirectionWeight * lateralWeight;
```

This avoids dense wireframes behind the player/camera and prevents fixed full-opacity cages.

## Snapshot additions

Add camera/focus metadata to `ProceduralRenderSnapshot`:

```ts
interface ProceduralRenderSnapshot {
  focus: Vec3;
  cameraPosition: Vec3;
  cameraForward: Vec3;
  renderOrigin: Vec3;
  highDetailBounds: WorldBounds;
  lodSamples: LodSample[];
  wireColumns: WireColumn[];
  gridTiles: FringeGridTile[];
  particleTiles: FringeGridTile[];
}
```

## Renderer changes

- `ProceduralWorldRuntime` should accept focus/camera context each frame.
- `computeProceduralFringeLayout` should consume snapshot data instead of `world.getBounds()`.
- `FringeRenderer` should render snapshot wire/grid/particle elements.
- Existing static fringe layout can remain unchanged for static mode.

## Tests

Add tests that:

- moving focus shifts procedural fringe candidates,
- moving camera changes wire opacity/view relevance,
- wireframes are not all equal opacity,
- wireframes behind the camera are reduced or omitted,
- preview mode remains anchored to the starter seed center.

## Acceptance criteria

- In interactive mode, wireframes advance with the player/camera instead of staying fixed to the initial seed perimeter.
- The densest wireframes appear near the visible frontier, not behind or underneath the player.
- Preview mode still uses the static seed as the fixed high-detail anchor.
