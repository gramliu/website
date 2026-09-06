/** Coordinates are mirrored before reaching this module, matching the preview.
 * Hand.side preserves the detector label on that mirrored input, not the user's
 * anatomical side: detector Left drives the user's right-hand movement; detector
 * Right drives the user's left-hand rotation and jump. Keep UI labels separate.
 */
export interface Point {
  x: number;
  y: number;
}
export interface Hand {
  side: "Left" | "Right";
  landmarks: Point[];
  score: number;
}
export interface GestureOutput {
  moveX: number;
  moveY: number;
  turn: number;
  jump: boolean;
  timestamp: number;
  markers: { side: Hand["side"]; point: Point; origin: Point | null }[];
}
interface Pinch {
  armed: boolean;
  held: boolean;
  origin: Point | null;
  filtered: Point | null;
}
const freshPinch = (): Pinch => ({
  armed: false,
  held: false,
  origin: null,
  filtered: null,
});
export const STALE_MS = 250;
export const emptyGestures = (): GestureOutput => ({
  moveX: 0,
  moveY: 0,
  turn: 0,
  jump: false,
  timestamp: 0,
  markers: [],
});
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function joystick(x: number, y: number): Point {
  const length = Math.hypot(x, y);
  const speed = Math.min(1, Math.max(0, (length - 0.025) / 0.15));
  return length
    ? { x: (x / length) * speed, y: (y / length) * speed }
    : { x: 0, y: 0 };
}

function pinch(state: Pinch, ratio: number, point: Point, blend: number) {
  if (ratio > 0.5) {
    state.armed = true;
    state.held = false;
    state.origin = null;
    state.filtered = null;
  } else if (ratio < 0.3 && state.armed && !state.held) {
    state.held = true;
    state.origin = { ...point };
    state.filtered = { ...point };
  }
  if (state.held && state.filtered) {
    state.filtered.x += (point.x - state.filtered.x) * blend;
    state.filtered.y += (point.y - state.filtered.y) * blend;
  }
}

export class GestureTracker {
  private left = freshPinch();
  private right = freshPinch();
  private jump = freshPinch();
  private lastTime = 0;

  reset() {
    this.left = freshPinch();
    this.right = freshPinch();
    this.jump = freshPinch();
    this.lastTime = 0;
  }

  update(hands: Hand[], timestamp: number): GestureOutput {
    if (timestamp - this.lastTime > STALE_MS) this.reset();
    const blend = this.lastTime
      ? 1 - Math.exp((-18 * (timestamp - this.lastTime)) / 1000)
      : 1;
    this.lastTime = timestamp;
    const output = { ...emptyGestures(), timestamp };
    for (const side of ["Left", "Right"] as const) {
      // Ambiguous identity is treated as tracking loss, never as another hand.
      const matches = hands.filter(
        (h) =>
          h.side === side &&
          h.score >= 0.7 &&
          h.landmarks.length === 21 &&
          h.landmarks.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
      );
      if (matches.length !== 1) {
        if (side === "Left") this.left = freshPinch();
        else {
          this.right = freshPinch();
          this.jump = freshPinch();
        }
        continue;
      }
      const points = matches[0].landmarks;
      const scale = distance(points[0], points[9]);
      if (scale < 0.025) {
        if (side === "Left") this.left = freshPinch();
        else {
          this.right = freshPinch();
          this.jump = freshPinch();
        }
        continue;
      }
      const point = {
        x: (points[4].x + points[8].x) / 2,
        y: (points[4].y + points[8].y) / 2,
      };
      const state = side === "Left" ? this.left : this.right;
      if (side === "Right") {
        const wasJumping = this.jump.held;
        pinch(this.jump, distance(points[4], points[12]) / scale, point, blend);
        output.jump = this.jump.held && !wasJumping;
        if (this.jump.held) {
          this.right = freshPinch();
          output.markers.push({ side, point, origin: null });
          continue;
        }
      }
      pinch(state, distance(points[4], points[8]) / scale, point, blend);
      output.markers.push({ side, point, origin: state.origin });
      if (!state.held || !state.origin || !state.filtered) continue;
      const offset = joystick(
        state.filtered.x - state.origin.x,
        side === "Left" ? state.filtered.y - state.origin.y : 0
      );
      if (side === "Left") {
        output.moveX = offset.x;
        output.moveY = offset.y;
      } else output.turn = offset.x;
    }
    return output;
  }
}

/** Screen right and screen down projected onto the horizontal ground plane. */
export function viewRelativeMovement(x: number, y: number, yaw: number) {
  return {
    moveX: Math.cos(yaw) * x + Math.sin(yaw) * y,
    moveZ: -Math.sin(yaw) * x + Math.cos(yaw) * y,
  };
}

export function readGestures(
  output: GestureOutput,
  now: number
): GestureOutput {
  return now - output.timestamp > STALE_MS ? emptyGestures() : output;
}
