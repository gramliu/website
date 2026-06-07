# 2. Minecraft-Like Terrain Generation Plan

## Goal

## Seed invariant

The authored static map remains the source of truth for the preview/starter area. The procedural generator must branch off that map rather than regenerate it. In practice:

- every existing `worldData` cell in the 10x10 seed must remain exact,
- seeded column heights and block IDs must be read from the authored map,
- smoothing and biome generation may only affect non-seeded columns,
- generated columns adjacent to the seed should blend toward the seed edge instead of altering the seed.

Replace the current simple column noise with a staged, Minecraft-like terrain pipeline that produces smoother height transitions and more coherent block/biome changes.

Adjacent blocks should not abruptly change height or material unless the terrain intentionally enters a cliff/mountain feature.

## Current problem

The current generator chooses height and biome directly from a small number of noise samples. This can cause:

- abrupt height cliffs,
- one-column material spikes,
- harsh grass/sand/stone boundaries,
- generated terrain that does not blend cleanly into the seeded 10x10 starter map.

## Target generation pipeline

```text
seed
  ↓
climate fields
  temperature, humidity, continentalness
  ↓
terrain fields
  base height, erosion, peaks/valleys, detail
  ↓
biome selection
  plains, beach, shallows, rocky hills, water
  ↓
height smoothing
  neighborhood-aware pass with chunk borders
  ↓
surface material pass
  grass/dirt/sand/stone/water by biome + slope + waterline
  ↓
chunk cell emission
```

## Proposed modules

```text
src/game/world/procedural/terrain/
  noise.ts
  climate.ts
  heightfield.ts
  biomes.ts
  surface.ts
  seed-transition.ts
```

## Terrain fields

Use multiple low-frequency fields instead of one direct height function:

- `continentalness`: controls land vs water mass.
- `erosion`: lowers/smooths terrain and produces valleys.
- `peaks`: raises hills/mountains.
- `detail`: small local variation, applied after smoothing and clamped.

Suggested height formula:

```ts
baseHeight = waterLevel + continentalness * 6;
erodedHeight = baseHeight - erosion * 3;
peakHeight = peaks > threshold ? (peaks - threshold) * 8 : 0;
rawHeight = erodedHeight + peakHeight + detail;
```

Then apply a smoothing/quantization pass.

## Height smoothing rules

1. Generate each chunk with a border of at least one column around it.
2. Smooth isolated pits/spikes.
3. Clamp most neighboring column deltas to 1 or 2 blocks.
4. Allow larger deltas only if a cliff classifier says the area is rocky/mountainous.
5. Ensure chunk boundaries use the same samples so adjacent chunks match.

## Biome and material transitions

Biome selection should be gradual:

- water/shallows near or below water level,
- beach near waterline,
- grassland inland,
- rocky hills where slope/height are high.

Surface material rules:

- Waterline columns use sand near shore.
- Grassland uses grass on top, dirt below, stone deeper.
- Rocky slopes expose stone on steep or high terrain.
- Transitions should be based on neighborhood/slope, not isolated random choice.

## Seeded 10x10 starter region

The existing map should remain exact inside the seeded area.

Outside the seed, add a transition skirt:

- `SEED_BLEND_RADIUS`, for example 8 columns.
- Nearest seeded edge height influences generated height.
- Generated terrain height is blended toward seeded edge height near the starter area.
- Material preferences are blended from nearest seeded surface material.

## Tests

Add or update tests in `src/game/world/procedural/procedural-world.test.ts`:

- deterministic generation with same seed,
- chunk boundary continuity,
- neighboring generated column height delta stays within configured threshold,
- seed cells remain exact and are never smoothed/replaced,
- seed transition skirt does not create abrupt cliffs,
- beach/grass/stone transitions do not create one-column spikes,
- water level remains stable across adjacent columns.

## Acceptance criteria

- Adjacent generated columns rarely differ by more than 1-2 blocks except in classified cliffs.
- Biome/material changes happen in bands rather than isolated cells.
- The starter 10x10 map remains exact and is the visible preview seed.
- Terrain outside the starter map blends smoothly into the authored seed area.
