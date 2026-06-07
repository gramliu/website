# 5. Camera and Presentation Mode Plan

## Goal

Prevent the player from going off screen in interactive mode while preserving the current portfolio-style preview behavior.

Preview and interactive mode should have different presentation rules.

## Desired mode behavior

| Mode | Player | Camera / map | Purpose |
| --- | --- | --- | --- |
| Preview | Player/autoplay moves within staged scene | Map remains fixed or rotates | Portfolio preview |
| Interactive | Player remains framed or centered | Camera follows or world recenters | Playable world |
| Procedural infinite | Player drives chunk focus | Render origin follows player | Infinite terrain stability |

## Short-term fix: follow camera

Add a camera-follow helper for interactive mode.

Suggested file:

```text
src/components/world/player-camera-follow.tsx
```

Behavior:

- disabled in preview mode,
- enabled in interactive mode,
- reads `gameStateRef.current.player.position`,
- lerps camera to a third-person offset,
- calls `camera.lookAt(player.x, player.y + 1, player.z)`.

Example camera offset:

```ts
const offset = { x: 8, y: 6, z: 8 };
```

## Long-term fix: render origin

For infinite procedural terrain, use a render origin rather than rendering all objects at large simulation coordinates.

Simulation coordinates remain real:

```text
player.position = world-space position
collision uses world-space position
chunks load around world-space position
```

Presentation coordinates are rebased:

```text
renderOrigin = player.position in interactive mode
terrain renders at cell.position - renderOrigin
player renders near visual center
camera stays near visual center
```

Suggested file:

```text
src/game/world/procedural/render-origin.ts
```

## Preview rules

Preview mode should not recenter on the player:

- map remains fixed,
- player/autoplay moves around the seeded 10x10 scene,
- procedural focus can remain anchored to preview center,
- no camera-follow behavior.

## Interactive rules

Interactive mode should keep the player visible:

- initially use follow camera,
- later switch procedural mode to player-centered render origin,
- update procedural chunk focus from player simulation position,
- keep world/collision simulation unchanged.

## Implementation steps

1. Add follow camera helper and enable it only in interactive mode.
2. Add presentation mode type:
   - `preview-fixed`,
   - `interactive-follow-camera`,
   - future `interactive-centered-origin`.
3. Extract presentation selection into `useWorldRuntime()`.
4. Add render-origin abstraction for procedural interactive mode.
5. Update render snapshots to store both simulation coordinates and render-relative coordinates.

## Acceptance criteria

- In preview mode, the world looks like a fixed portfolio scene.
- In interactive mode, the player stays in frame.
- Procedural chunk focus follows the player only in interactive mode.
- The system is ready for render-origin recentering without rewriting physics.
