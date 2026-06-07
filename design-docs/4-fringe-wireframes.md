# 4. Fringe Wireframe and Fidelity Transition Plan

## Goal

Fix procedural fringe behavior so wireframes actually represent a low-fidelity frontier that resolves into higher-fidelity terrain near the render zone.

The current procedural fringe is effectively a fixed perimeter around the 10x10 footprint. It does not fade out of fidelity at the edge or become higher fidelity as it approaches the rendered area.

## Desired behavior

Approaching the full-detail zone:

```text
horizon particles/grid
  → wireframe terrain columns
  → translucent mid-detail columns
  → fully rendered blocks
```

Leaving the full-detail zone:

```text
fully rendered blocks
  → mid-detail columns
  → wireframe columns
  → sparse grid/particles
```

## Problems to solve

- Procedural wireframes use mostly fixed opacity.
- Fringe layout is derived from `world.getBounds()` rather than LOD bands.
- The shader only performs camera/back/lateral fade.
- No per-line fidelity attribute exists.
- Grid rows and particles are not tied to terrain LOD.

## Layout changes

Refactor `src/components/world/fringe/procedural-fringe-layout.ts` to consume render snapshot or LOD samples.

Suggested `FringeWireframe` additions:

```ts
interface FringeWireframe {
  x: number;
  y: number;
  z: number;
  opacity: number;
  fidelity?: number;
  distanceBand?: number;
}
```

Suggested `FringeGridTile` additions:

```ts
interface FringeGridTile {
  x: number;
  z: number;
  opacity: number;
  row: number;
  outward: [number, number];
  emissionWeight: number;
  fidelity?: number;
}
```

## Geometry changes

Update `src/components/world/fringe/fringe-line-geometry.ts`:

- add `fidelity` buffer attribute,
- add `distanceBand` buffer attribute,
- continue supporting static layout defaults.

## Shader changes

Update `src/components/world/fringe/fringe-line-field.tsx`:

- read `fidelity` and/or `distanceBand`,
- multiply opacity by LOD-derived fade,
- optionally pulse low-fidelity wireframes,
- keep existing camera-facing fade.

## Particle changes

Particle emission should derive from the far/horizon band:

- no particles in full-detail or mid-detail areas,
- more particles in horizon/grid rows,
- disabled or low budget in preview mode,
- enabled in interactive mode only if budget allows.

## Tests

Update `src/components/world/fringe/procedural-fringe-layout.test.ts`:

- inner wire band starts outside full-detail footprint,
- wire opacity changes by distance,
- horizon/grid opacity fades out,
- no fixed opacity for every procedural wireframe,
- particle tiles come only from horizon/far bands.

## Acceptance criteria

- Wireframes are not visually fixed around the map.
- Near terrain resolves into blocks/mid-detail rather than staying wireframe.
- Far terrain fades to grid/particles.
- Static fringe behavior remains unchanged.
