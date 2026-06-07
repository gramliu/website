# 7. Seed-Transition Terrain Fix Plan

## Problem statement

The current procedural terrain can branch away from the authored 10x10 starter seed with sharp height cliffs and abrupt material swaps. This creates visible columns where grass, sand, stone, and water appear next to incompatible seed blocks, and it makes the procedural continuation look pasted onto the starter island instead of grown from it.

The fix is **not** to smooth or mutate the seed. The authored 10x10 block layout remains canonical. The generator must instead treat the seed edge as boundary conditions for the surrounding heightfield and material field.

## Invariant

- Every authored `worldData` cell inside the starter footprint remains exact.
- Seed columns are never smoothed, quantized, regenerated, or reclassified.
- Procedural columns adjacent to the seed are generated from the same terrain algorithm as the rest of the world, then blended toward seed-edge height/material constraints.
- Collision and rendering must query the same blended/generated column data.

## Current failure mode

```text
seed column height/material
  ↓ hard boundary
procedural noise height/material
  ↓ no transition skirt
abrupt cliff or one-column material mismatch
```

This happens because the current generator has only two states:

1. exact seeded column,
2. unconstrained procedural column.

There is no “near seed” transition state.

## Target generation model

```text
StarterRegion
  ↓ exposes edge columns and nearest-edge samples
BaseTerrainField
  ↓ computes raw Minecraft-like terrain away from seed
SeedTransitionField
  ↓ blends raw height/material toward seed boundary conditions
SmoothingPass
  ↓ removes spikes/pits while respecting immutable seed cells
SurfacePass
  ↓ assigns block stacks from blended biome/material fields
ChunkEmission
```

## Seed transition skirt

Add a configurable transition skirt outside the starter footprint:

```ts
const SEED_HEIGHT_BLEND_RADIUS = 10;
const SEED_MATERIAL_BLEND_RADIUS = 6;
const MAX_NON_CLIFF_NEIGHBOR_DELTA = 2;
```

For any non-seed column `(x, z)`:

1. Compute distance to starter footprint.
2. Find the nearest seed-edge column or the nearest few seed-edge columns.
3. Compute raw procedural height/material.
4. Compute blend weight:

```ts
seedWeight = 1 - smoothstep(0, SEED_HEIGHT_BLEND_RADIUS, distanceToSeedEdge);
```

5. Blend height:

```ts
blendedHeight = round(lerp(rawHeight, seedEdgeHeight + edgeSlopeOffset, seedWeight));
```

`edgeSlopeOffset` should allow gentle outward slopes instead of forcing all nearby generated columns to equal the seed height.

Suggested offset:

```ts
edgeSlopeOffset = clamp(distanceToSeedEdge * preferredSlope, -3, 3);
preferredSlope = rawHeight > seedEdgeHeight ? 0.35 : -0.25;
```

## Neighbor continuity pass

After base blending, run a local smoothing pass over generated columns only:

```ts
for each generated column:
  for each cardinal neighbor:
    if neither side is classified cliff:
      clamp height delta to MAX_NON_CLIFF_NEIGHBOR_DELTA
```

Important details:

- Seed columns participate as fixed neighbors but are never modified.
- Chunk generation must sample a padding border so smoothing produces identical results across chunk boundaries.
- Cliffs are allowed only where a low-frequency cliff/rocky classifier says the area is steep.
- The transition skirt near the seed should default to non-cliff behavior unless the authored seed itself has a steep edge.

## Material transition field

Do not assign materials from height alone. Add a material preference field blended from seed-edge materials:

```ts
interface MaterialWeights {
  grass: number;
  dirt: number;
  sand: number;
  stone: number;
  water: number;
}
```

For non-seed columns near the starter footprint:

```ts
materialWeights = mix(rawBiomeWeights, seedEdgeMaterialWeights, materialSeedWeight);
```

Rules:

- Seed-edge grass should produce nearby grass/dirt before transitioning to other biomes.
- Seed-edge sand/water should produce beach/shore bands before open water or grassland.
- Seed-edge stone should allow nearby rocky faces but should not create giant vertical stone slabs unless height/slope requires it.
- Top block choice should be based on blended weights and local slope, not a single raw noise threshold.

## Implementation outline

### 1. Extend `StarterRegion`

Add helpers:

```ts
getNearestEdgeSample(x, z): SeedEdgeSample;
getEdgeMaterialWeights(x, z): MaterialWeights;
getDistanceToFootprint(x, z): number;
isInsideFootprint(x, z): boolean;
```

`SeedEdgeSample` should include:

```ts
interface SeedEdgeSample {
  x: number;
  z: number;
  height: number;
  surfaceBlockId: number;
  materialWeights: MaterialWeights;
  distance: number;
}
```

### 2. Split terrain generation stages

Create or refactor toward:

```text
src/game/world/procedural/terrain/
  base-fields.ts
  seed-transition.ts
  smoothing.ts
  surface-materials.ts
```

### 3. Generate chunks with padding

For chunk `(chunkX, chunkZ)`, generate a padded height/material field:

```ts
padding = 2;
area = chunk area expanded by padding;
```

Use the padded area for smoothing, then emit only the real chunk area.

### 4. Preserve seed exactly in emission

If `(x, z)` is a seed column, emit `StarterRegion.getColumnCells(x, z)` exactly and skip procedural surface emission.

## Tests

Add tests for:

- seed cells remain exact after transition and smoothing,
- generated columns adjacent to seed do not exceed configured height delta unless classified cliff,
- terrain height continuity across chunk boundaries with seed skirt active,
- material bands near seed edge match the seed edge before transitioning outward,
- water/sand/grass transitions do not create isolated one-column material spikes.

## Acceptance criteria

- No large procedural wall appears immediately adjacent to the starter seed unless the authored seed edge already implies a cliff.
- Generated terrain visibly slopes or terraces away from seed-edge heights.
- Material transitions near the seed are locally coherent.
- The starter 10x10 area remains visually identical to the static map.
