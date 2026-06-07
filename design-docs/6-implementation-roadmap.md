# 6. Implementation Roadmap

## Recommended order

## Global invariant

All milestones must preserve this invariant: the current static `worldData` map is the exact preview/starter seed, and procedural generation branches outward from it. The seed must remain exact for rendering, collision, block lookup, LOD classification, and fringe placement.

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

### 3. Seed-transition terrain fix

Implement the transition-skirt terrain plan in `7-seed-transition-terrain.md` before expanding farther from the seed.

Why third:

- fixes the visible cliffs/material jumps immediately adjacent to the authored map,
- keeps the seed exact while making generated terrain respect seed-edge boundary conditions,
- can be tested as pure height/material field logic.

### 4. LOD policy and render snapshot

Make LOD classification and fidelity values shared between renderers and fringe. Use the continuous opacity model in `9-seamless-fidelity-transitions.md`.

Why fourth:

- fixes block pop-in/pop-out,
- prepares mid-detail rendering,
- makes procedural rendering deterministic and testable.

### 5. Camera-relative fringe refactor

Use snapshot/LOD/camera data to drive wireframe and grid placement as described in `8-camera-relative-fringe.md`.

Why fifth:

- depends on LOD policy,
- removes hardcoded procedural perimeter behavior,
- makes the frontier move with the interactive player/camera.

### 6. Minecraft-like terrain pipeline

Refactor terrain generation into climate, heightfield, biome, surface, and seed-transition stages.

Why sixth:

- larger change,
- easier once the runtime/snapshot boundaries exist,
- extends the seed-transition fix to the full world.

### 7. Mid-detail terrain renderer

Add simplified terrain columns between full-detail blocks and wireframes.

Why seventh:

- depends on render snapshots and LOD fidelity,
- completes the visual transition from wireframe to blocks.

### 8. Player-centered render origin

Replace or augment follow camera with render-origin recentering for infinite interactive terrain.

Why eighth:

- best long-term architecture,
- easier after snapshots separate simulation and presentation coordinates.

## Milestone checklist

### Milestone A: Architecture foundation

- [ ] `StarterRegion` owns seeded 10x10 map and preserves it exactly.
- [ ] `ProceduralWorldRuntime` owns mode/focus/chunk window.
- [ ] `RenderSnapshot` exists.
- [ ] `Map` consumes runtime output.
- [ ] Static mode still works.

### Milestone B: Player framing

- [ ] Interactive follow camera exists.
- [ ] Preview mode remains fixed.
- [ ] Reset key resets player and presentation state.

### Milestone C: Seed-transition terrain

- [ ] Seed edge samples are available from `StarterRegion`.
- [ ] Generated columns near the seed blend toward seed-edge heights.
- [ ] Generated materials near the seed blend toward seed-edge material weights.
- [ ] Seed cells remain exact and immutable.

### Milestone D: LOD/fringe/fade

- [ ] `LodPolicy` returns discrete LOD and continuous fidelity.
- [ ] Render snapshots include opacity for high/mid/wire/particle layers.
- [ ] Procedural fringe consumes LOD/snapshot/camera data.
- [ ] Wireframe opacity changes by distance and camera relevance.
- [ ] Blocks and wireframes overlap during fade transitions.
- [ ] Particles only emit in far/horizon band.

### Milestone E: Terrain quality

- [ ] Heightfield smoothing implemented.
- [ ] Biome transitions are gradual.
- [ ] Seed transition skirt implemented.
- [ ] Chunk boundary tests pass.

### Milestone F: Render quality

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
- seeded 10x10 area exactly matches current static map,
- generated terrain does not cliff abruptly near seed,
- wireframes fade from horizon into higher-fidelity terrain,
- mobile WASD still controls the player on `/world`.
