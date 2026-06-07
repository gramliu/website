# 1. World Runtime Refactor Plan

## Goal

## Non-negotiable preview seed invariant

Preview mode must continue to render the current authored static map definition as the canonical seed. Procedural terrain is allowed to branch outward from that seed, but it must not replace, reinterpret, smooth, or mutate the authored 10x10 starter area. Any runtime/refactor work must preserve this rule:

```text
preview = authored static worldData seed + procedural continuation outside seed bounds
interactive = same seed as origin + procedural continuation as player explores
```

This invariant applies to block lookup, render snapshots, collision, fringe layout, terrain blending, and camera/presentation behavior.

Create a cleaner architecture for the procedural world so future changes do not keep accumulating inside `Map`, `ProceduralVoxelWorld`, and the fringe renderer.

The current prototype proves that a procedural mode can work, but several responsibilities are mixed together:

- gameplay queries,
- chunk loading,
- terrain generation,
- seeded-map preservation,
- preview anchoring,
- interactive focus following,
- render footprint selection,
- fringe layout,
- player/camera presentation.

This refactor should make those responsibilities explicit.

## Target architecture

```text
World component
  └─ Map component
      └─ useWorldRuntime()
          ├─ StaticWorldRuntime
          └─ ProceduralWorldRuntime
              ├─ ProceduralVoxelWorld      gameplay/block queries
              ├─ TerrainPipeline           terrain generation
              ├─ ChunkStore                chunk cache/lifecycle
              ├─ LodPolicy                 fidelity classification
              ├─ StarterRegion             seeded 10x10 map
              └─ RenderSnapshot            render-ready terrain/fringe data
```

## New modules

```text
src/components/world/use-world-runtime.ts
src/game/world/procedural/procedural-runtime.ts
src/game/world/procedural/render-snapshot.ts
src/game/world/procedural/starter-region.ts
src/game/world/procedural/render-origin.ts
```

## Responsibility split

### `ProceduralVoxelWorld`

Keep this focused on `WorldQuery` behavior:

- `getBlockIdAtCell`,
- `getBlockAtCell`,
- `getCollisionKind`,
- `isCellSolid`,
- `isCellFluid`,
- `getFluidAdjacency`,
- `getHighestSolidCell`,
- `collidesAABB`.

It should not decide how the world is rendered, how preview mode anchors, or how the camera follows.

### `ProceduralWorldRuntime`

Own runtime state:

- current mode: preview or interactive,
- focus position,
- chunk window radius,
- preview anchor,
- interactive player-follow focus,
- chunk ensure/evict calls,
- render snapshot creation.

### `RenderSnapshot`

Bridge world simulation and rendering.

Suggested shape:

```ts
interface ProceduralRenderSnapshot {
  mode: "preview" | "interactive";
  focus: { x: number; y: number; z: number };
  renderOrigin: { x: number; y: number; z: number };
  fullDetailBounds: WorldBounds;
  highDetailCells: LoadedWorldCell[];
  midDetailColumns: MidDetailColumn[];
  wireColumns: WireColumn[];
  gridTiles: FringeGridTile[];
  particleTiles: FringeGridTile[];
}
```

### `StarterRegion`

Represent the existing 10x10 map as an authored starter region:

- exact seeded block lookup,
- seeded bounds,
- seeded surface heights,
- nearest seeded-edge lookup,
- transition-skirt metadata.

This keeps seed logic out of the terrain generator internals.

## Implementation steps

1. Add `StarterRegion` and move seed-cell indexing out of `TerrainGenerator`.
2. Add `ProceduralWorldRuntime` and move mode/focus/chunk-window logic out of `ProceduralVoxelWorld`.
3. Add `useWorldRuntime()` and move procedural/static world selection out of `Map`.
4. Add `RenderSnapshot` and route procedural renderers through it.
5. Keep static rendering unchanged until the procedural path is stable.
6. Update tests so pure runtime functions are tested without React.

## Acceptance criteria

- `Map` no longer directly constructs `ProceduralVoxelWorld`.
- Preview/starter rendering still uses the authored static `worldData` seed exactly.
- `ProceduralVoxelWorld` only answers gameplay/world queries.
- Preview anchoring and interactive following live in runtime/presentation modules.
- Renderers consume explicit render snapshots instead of calling procedural world render helpers directly.
- Static world mode continues to work unchanged.
