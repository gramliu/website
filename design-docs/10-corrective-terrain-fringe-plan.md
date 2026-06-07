# 10. Corrective Terrain, Fringe, and Fade Plan

## Why this doc exists

The first procedural implementation proved out the runtime/snapshot shape, but the current visual output still has several issues:

- the fringe/mid-detail area is much larger than intended,
- faded/proxy terrain can cover the camera and player,
- water can appear elevated or unsupported relative to adjacent blocks,
- seed-adjacent generation can still choose incompatible material bands,
- generated terrain can still create abrupt vertical walls,
- terrain generation should move from the current value-noise prototype toward a Perlin/simplex-family pipeline with smoothing and explicit hydrology/material constraints.

This document narrows the next implementation pass. It should supersede the broad parts of docs 7-9 where they conflict.

## Non-negotiable invariants

1. The authored `worldData` 10x10 starter area remains exact.
2. Trees are decorations and must not affect ground height blending.
3. “Ground” height means the highest block whose type is one of:
   - grass,
   - dirt,
   - stone,
   - sand,
   - water.
4. Leaves, logs, crafting table, and other decorative/structure blocks are ignored for terrain height constraints.
5. Water can be at or below surrounding ground/shore height, but must not float as an elevated block over unsupported air.
6. Procedural fringe and proxy render layers must never obscure the player/camera in interactive mode.

## Immediate visual constraints

### Fringe size cap

The visible fringe/proxy area should be small:

```ts
const MAX_FRINGE_DISTANCE_COLUMNS = 2;
const MAX_MID_DETAIL_DISTANCE_COLUMNS = 1;
```

Meaning:

- full blocks render in the current 10x10 high-detail footprint,
- mid-detail/proxy blocks may render at most one column beyond that footprint,
- wireframe blocks may render at most two columns beyond that footprint,
- grid/particles can sit beyond that, but should be sparse and low opacity.

This keeps the visual composition close to the original static map while still suggesting procedural continuation.

### No camera/player obstruction

A faded/proxy block should not render if it is between the camera and player or overlaps the player safety radius.

Add snapshot culling/fade rules:

```ts
const PLAYER_VISIBILITY_RADIUS = 1.75;
const CAMERA_OCCLUSION_CORRIDOR_RADIUS = 1.1;
```

For each non-solid visual layer candidate:

1. Project the column center onto the camera-to-player segment.
2. If the projected point is on the segment and the lateral distance is below the corridor radius, either:
   - omit the proxy/wire element, or
   - multiply opacity by `0.0` to `0.15`.
3. If the column is within `PLAYER_VISIBILITY_RADIUS` of the player, omit proxy/wire rendering.

This should apply to:

- mid-detail translucent columns,
- faded high-detail generated blocks outside the core full-detail footprint,
- wireframes,
- grid/particles near the player.

The authored full-detail blocks still render normally because they are the playable surface.

## Terrain generation overhaul

### Move from value noise to Perlin/simplex-family fields

The current terrain uses basic value noise. Replace the terrain source with layered gradient noise:

```text
src/game/world/procedural/terrain/
  gradient-noise.ts
  octave-noise.ts
  fields.ts
  height-smoothing.ts
  hydrology.ts
  material-zones.ts
  seed-boundary.ts
```

Recommended algorithm family:

- 2D improved Perlin noise or simplex noise for base terrain fields,
- fractal Brownian motion (fBm) for broad terrain,
- domain warping for less grid-aligned biome/shore boundaries,
- low-frequency material/biome fields for gradual biome bands.

Example field stack:

```ts
continentalness = fbm2(x * 0.018, z * 0.018, seedA, 4);
erosion = fbm2(x * 0.035, z * 0.035, seedB, 3);
moisture = fbm2(x * 0.025, z * 0.025, seedC, 3);
temperature = fbm2(x * 0.02, z * 0.02, seedD, 3);
localDetail = fbm2(x * 0.12, z * 0.12, seedE, 2) * 0.5;
```

Height:

```ts
baseHeight = 6 + continentalness * 4;
erosionAdjustment = -erosion * 1.5;
rawHeight = baseHeight + erosionAdjustment + localDetail;
```

Then clamp through the slope/smoothing pass rather than emitting directly.

### Ground height from ground blocks only

Add a canonical helper:

```ts
type GroundBlockId = 1 | 2 | 3 | 9 | 12;

function isGroundBlockId(id: number): id is GroundBlockId {
  return id === STONE || id === GRASS || id === DIRT || id === WATER || id === SAND;
}
```

`StarterRegion.getHighestGroundCell(x, z)` should use only ground block IDs.

Use this helper for:

- seed-edge height samples,
- nearest edge transition samples,
- terrain smoothing constraints,
- hydrology constraints,
- spawn/ground classification when relevant.

Do **not** use leaves/logs/tree height for sibling terrain generation.

### Height smoothing / no abrupt vertical walls

Use a two-pass heightfield pipeline:

1. Generate raw height for an expanded chunk area with padding.
2. Apply smoothing only to generated columns; seed columns act as fixed boundary constraints.

Suggested constraints:

```ts
const MAX_GROUND_DELTA = 1;
const MAX_TERRACE_DELTA = 2;
```

Rules:

- Adjacent non-cliff ground columns should differ by at most 1 block.
- Terraced transitions may differ by 2 blocks, but not repeatedly in a single straight vertical wall.
- Larger cliffs require an explicit cliff classifier and should not occur in the seed transition radius.
- Seed transition radius defaults to non-cliff behavior.

Algorithm outline:

```ts
for pass in 0..2:
  for each generated column in padded area:
    for each cardinal neighbor:
      if !isCliffColumn(column, neighbor):
        column.height = clamp(
          column.height,
          neighbor.height - MAX_GROUND_DELTA,
          neighbor.height + MAX_GROUND_DELTA
        );
```

This pass should run before block emission.

## Water and hydrology constraints

Water should not be a floating elevated strip.

### Water classification

Instead of selecting water from a single column height, compute water from basin/shore context:

```ts
isWaterCandidate = height <= WATER_LEVEL && basinNoise > threshold;
```

Then enforce neighborhood support:

```ts
for each water column:
  for each cardinal neighbor:
    if neighbor.height < waterSurfaceY - 1:
      lower waterSurfaceY or fill neighbor ground/shore support
```

### Water emission rules

- Water fills from local terrain height + 1 up to `waterSurfaceY` only if there is solid ground underneath.
- Water surface should be flat within a local basin.
- A water column must have a non-air block below it.
- Adjacent shore columns should be sand or grass/dirt, not air.
- Do not emit water where every adjacent ground column is lower than the water surface unless the basin is also filled.

### Tests for water

Add tests:

- no water block has air below it,
- water columns have at least one adjacent non-air/shore support,
- adjacent water basin surface heights are equal or differ only by an explicitly allowed waterfall feature,
- seed-adjacent water does not float above generated terrain.

## Material transition constraints

Material choice should come from smooth material/biome fields, not direct per-column hard switches.

### Material fields

Compute continuous weights:

```ts
interface GroundMaterialWeights {
  grass: number;
  sand: number;
  stone: number;
  water: number;
}
```

Sources:

- moisture/temperature for grass vs dry/sand,
- distance to water for beach sand,
- slope/height for exposed stone,
- seed-edge material weights inside transition radius.

### No abrupt enclosure rule

A grass/dirt region should not be immediately enclosed by sand. Enforce a minimum transition band:

```ts
const MIN_MATERIAL_TRANSITION_RADIUS = 2;
```

If a generated column chooses a material different from most adjacent ground columns:

1. prefer the local majority material, or
2. assign a transition material if one exists:
   - grass ↔ sand: grass/dirt shore band, then sand,
   - grass ↔ stone: dirt/grass with stone on steep sides,
   - sand ↔ stone: sand on flat shore, stone only on steep/high columns.

### Tests for material continuity

- no single-column isolated sand/stone/grass spikes unless produced by an allowed decoration,
- seed-edge grass remains surrounded by at least one band of grass/dirt before sand dominates,
- beaches form bands near water instead of enclosing arbitrary seed terrain,
- stone is driven by slope/height, not random adjacency.

## Updated snapshot/fringe constraints

### Snapshot distance limits

The render snapshot builder should not scan a huge radius for near visual layers.

```ts
highDetailBounds = 10x10;
midDetailBounds = highDetailBounds expanded by 1;
wireBounds = highDetailBounds expanded by 2;
horizonGridBounds = highDetailBounds expanded by 3 or 4;
```

This is enough to preserve the edge semantics without overwhelming the view.

### Layer priority

When multiple layers overlap:

1. full blocks inside high-detail bounds,
2. player visibility mask,
3. mid-detail columns outside high-detail bounds only,
4. wireframes outside high + mid bounds only,
5. horizon grid/particles outside wire bounds only.

Do not render translucent mid-detail columns over full-detail blocks.

## Implementation order

1. Reduce LOD/fringe search radius and band distances to 1-2 columns.
2. Add player/camera occlusion culling for proxy/wire layers.
3. Add `isGroundBlockId` and `StarterRegion.getHighestGroundCell`.
4. Replace seed-edge height references with ground-only samples.
5. Implement water support rules and tests.
6. Implement material continuity rules and tests.
7. Replace value-noise terrain source with Perlin/simplex-family fBm fields.
8. Add padded heightfield smoothing before chunk emission.
9. Re-test preview and interactive mode visually.

## Acceptance criteria

- Fringe is visible only just beyond the rendered area, not as a large translucent shell.
- Player remains clearly visible; proxy/faded terrain does not cover the player or camera.
- Water is supported by ground/shore blocks and does not float above lower adjacent terrain.
- Seed-edge height sampling ignores trees/leaves/wood.
- Grass/dirt, sand, stone, and water transition in coherent bands.
- Generated terrain forms slopes/terraces instead of abrupt vertical walls.
- The terrain algorithm uses Perlin/simplex-family gradient noise with fBm/domain-warp style fields rather than the current direct value-noise prototype.
