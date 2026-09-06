# Website

Welcome to my personal website built with Next.JS and Typescript!

Check it out [here](https://gramliu.com/)

## World camera controls

Open `/world?mode=interactive&controls=camera` for the camera setup. The URL never opens the webcam automatically: click **Enable camera**. Choosing **Camera** next to the play button also starts setup; **Keyboard** or the preview's close button releases the webcam without restarting play.

- Open your hands first to arm tracking.
- Right thumb/index pinch: move from the neutral marker to walk relative to the view. Farther means faster.
- Left thumb/index pinch: move sideways to orbit horizontally around the player.
- Left thumb/middle pinch: jump once. Release before jumping again.
- Release a pinch to stop that control. After tracking loss, open your hand before pinching again.

Detection runs in a worker on the device, with one frame in flight. Frames are never uploaded or recorded. `bun run dev` and `bun run build` copy the pinned MediaPipe runtime into ignored `public/hand-tracker/` assets; the worker downloads Google's versioned hand model on first use. Camera access needs localhost or HTTPS and browser permission.

`quality=lite|full` still selects rendering quality. The dedicated `/world` page uses infinite terrain at every viewport width during play, with lighter rendering on smaller screens. The homepage preview retains its responsive island behavior. Gesture thresholds, smoothing and stale-frame limits live in `src/adapters/input/camera/gestures.ts`.

Validation: `bun run test`, `bun run lint`, `bun run build`. For a webcam trial, test both hands together, jumping while moving, release-to-stop, leaving/re-entering the frame while pinched, hiding/restoring the tab, quarter/half-turn orbits, and closing/reopening the preview. Verify direction and comfort with a real camera before adjusting the initial sensitivity defaults.

The homepage preview shares the keyboard/camera selector. Starting play opens a focused full-window view with the same instruction panel; Stop, Back to homepage, or Escape returns to the preview and releases the camera. The keyboard diagram highlights WASD (including arrow-key equivalents), Space, and R while held, and clears when play stops or focus is lost.
