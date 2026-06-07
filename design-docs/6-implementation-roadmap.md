# 6. Implementation Roadmap

## Recommended order

### 1. Runtime refactor

Implement `useWorldRuntime`, `ProceduralWorldRuntime`, `StarterRegion`, and `RenderSnapshot`.

Why first:

- reduces coupling,
- gives terrain/fringe/camera work clean integration points,
- prevents `Map` and `ProceduralVoxelWorld` from growing further.

### 2. Short-term interactive camera follow

Add an interactive follow camera before the render-origin system.

Why second:

- quickly fixes the player going off screen,
- low risk,
- does not block deeper architecture.

### 3. LOD policy and render snapshot

Make LOD classification and fidelity values shared between renderers and fringe.

Why third:

- fixes the fixed-fringe problem,
- prepares mid-detail rendering,
- makes procedural rendering deterministic and testable.

### 4. Fringe fidelity refactor

Use snapshot/LOD data to drive wireframe and grid opacity.

Why fourth:

- depends on LOD policy,
- removes hardcoded procedural perimeter behavior.

### 5. Minecraft-like terrain pipeline

Refactor terrain generation into climate, heightfield, biome, surface, and seed-transition stages.

Why fifth:

- larger change,
- easier once the runtime/snapshot boundaries exist,
- can be tested mostly as pure functions.

### 6. Mid-detail terrain renderer

Add simplified terrain columns between full-detail blocks and wireframes.

Why sixth:

- depends on render snapshots and LOD fidelity,
- completes the visual transition from wireframe to blocks.

### 7. Player-centered render origin

Replace or augment follow camera with render-origin recentering for infinite interactive terrain.

Why seventh:

- best long-term architecture,
- easier after snapshots separate simulation and presentation coordinates.

## Milestone checklist

### Milestone A: Architecture foundation

- [ ] `StarterRegion` owns seeded 10x10 map.
- [ ] `ProceduralWorldRuntime` owns mode/focus/chunk window.
- [ ] `RenderSnapshot` exists.
- [ ] `Map` consumes runtime output.
- [ ] Static mode still works.

### Milestone B: Player framing

- [ ] Interactive follow camera exists.
- [ ] Preview mode remains fixed.
- [ ] Reset key resets player and presentation state.

### Milestone C: LOD/fringe

- [ ] `LodPolicy` returns discrete LOD and continuous fidelity.
- [ ] Procedural fringe consumes LOD/snapshot data.
- [ ] Wireframe opacity changes by distance.
- [ ] Particles only emit in far/horizon band.

### Milestone D: Terrain quality

- [ ] Heightfield smoothing implemented.
- [ ] Biome transitions are gradual.
- [ ] Seed transition skirt implemented.
- [ ] Chunk boundary tests pass.

### Milestone E: Render quality

- [ ] Mid-detail renderer exists.
- [ ] High/mid/wire/horizon bands transition smoothly.
- [ ] Render origin supports infinite interactive movement.

## Validation commands

Run after each milestone:

```bash
bun run lint
bun test
bun run build
```

Manual validation:

- preview mode remains stable,
- interactive player stays framed,
- seeded 10x10 area matches current map,
- generated terrain does not cliff abruptly near seed,
- wireframes fade from horizon into higher-fidelity terrain,
- mobile WASD still controls the player on `/world`.
