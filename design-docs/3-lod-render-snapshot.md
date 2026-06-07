# 3. LOD and Render Snapshot Plan

## Goal

## Seed/render invariant

The high-detail preview/starter footprint is the authored static 10x10 map. Render snapshots must treat those seed cells as canonical high-detail cells and build mid-detail, wireframe, grid, and particle bands outward from that seed footprint. The LOD system should never swap the seed for generated terrain in preview mode.

Make LOD the single source of truth for what gets rendered as full blocks, mid-detail terrain, wireframes, grid, and particles.

The current procedural path has high-detail blocks and a fringe perimeter, but it does not yet model a continuous fidelity transition.

## Target fidelity bands

```text
10x10 full-detail footprint
  → high-detail textured blocks
near ring
  → simplified/mid-detail terrain columns
outer ring
  → wireframe terrain columns
horizon ring
  → sparse grid and particles
unloaded
  → no render data
```

## LodPolicy responsibilities

Extend `src/game/world/procedural/lod-policy.ts` so it can answer:

```ts
interface LodSample {
  lod: "high" | "mid" | "wire" | "horizon" | "unloaded";
  fidelity: number;
  blockOpacity: number;
  midOpacity: number;
  wireOpacity: number;
  particleOpacity: number;
  distanceFromFullDetail: number;
}
```

The policy should work at column/cell distance from the full-detail footprint, not only chunk distance.

## Render snapshot

Add `src/game/world/procedural/render-snapshot.ts`.

Suggested types:

```ts
interface MidDetailColumn {
  x: number;
  z: number;
  y: number;
  height: number;
  surfaceBlockId: number;
  biome: BiomeId;
  opacity: number;
}

interface WireColumn {
  x: number;
  z: number;
  minY: number;
  maxY: number;
  opacity: number;
  fidelity: number;
}

interface ProceduralRenderSnapshot {
  highDetailCells: LoadedWorldCell[];
  midDetailColumns: MidDetailColumn[];
  wireColumns: WireColumn[];
  gridTiles: FringeGridTile[];
  particleTiles: FringeGridTile[];
}
```

## Rendering layers

### High detail

Use the existing `WorldRenderer` path initially:

- seeded 10x10 map,
- fully textured blocks,
- collision-authored terrain.

Eventually replace per-block React rendering with chunk-instanced meshes.

### Mid detail

Add a simplified renderer:

```text
src/adapters/three/procedural-mid-detail-renderer.tsx
```

It should render:

- top surfaces,
- simplified side columns,
- biome/surface color or existing texture,
- fading opacity based on `LodSample.midOpacity`.

### Wire/horizon

Wireframe and grid should come from the same snapshot, not an independent perimeter calculation.

## Implementation steps

1. Extend `LodPolicy` with column-distance/fidelity helpers.
2. Add `RenderSnapshot` types and builder.
3. Make `ProceduralWorldRuntime` build snapshots from chunk data and LOD samples.
4. Update `Map` to render snapshot layers.
5. Keep static `WorldRenderer` unchanged.
6. Add tests that snapshot classification matches LOD policy.

## Acceptance criteria

- Full blocks render only inside the high-detail footprint, and the preview high-detail footprint is the authored static seed.
- Mid-detail terrain appears outside full-detail blocks.
- Wireframes appear outside mid-detail terrain.
- Opacity/fidelity changes by distance instead of fixed hardcoded rows.
- Terrain renderer and fringe renderer agree on LOD classification.
