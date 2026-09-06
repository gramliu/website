import { describe, expect, test } from "bun:test";
import {
  emptyGestures,
  GestureTracker,
  type Hand,
  joystick,
  readGestures,
  viewRelativeMovement,
} from "./gestures";

function hand(
  side: Hand["side"],
  x = 0.4,
  y = 0.4,
  indexRatio = 1,
  middleRatio = 1
): Hand {
  const landmarks = Array.from({ length: 21 }, () => ({ x, y }));
  landmarks[0] = { x, y: y + 0.2 };
  landmarks[9] = { x, y };
  landmarks[4] = { x, y };
  landmarks[8] = { x: x + indexRatio * 0.2, y };
  landmarks[12] = { x: x - middleRatio * 0.2, y };
  return { side, score: 1, landmarks };
}

describe("camera gestures", () => {
  test("neutral zone and analog displacement clamp speed", () => {
    expect(joystick(0.02, 0)).toEqual({ x: 0, y: 0 });
    expect(joystick(0.1, 0).x).toBeCloseTo(0.5);
    expect(Math.hypot(...Object.values(joystick(1, 1)))).toBeCloseTo(1);
  });
  test("requires open hand before first pinch, then establishes neutral origin", () => {
    const tracker = new GestureTracker();
    expect(
      tracker.update([hand("Left", 0.4, 0.4, 0)], 100).markers[0].origin
    ).toBeNull();
    tracker.update([hand("Left")], 150);
    expect(tracker.update([hand("Left", 0.4, 0.4, 0)], 200).moveX).toBe(0);
    const moved = tracker.update([hand("Left", 0.6, 0.4, 0)], 250);
    expect(moved.moveX).toBeGreaterThan(0);
    expect(moved.moveX).toBeLessThan(1);
    expect(tracker.update([hand("Left")], 300).moveX).toBe(0);
    expect(tracker.update([hand("Left", 0.6, 0.4, 0)], 350).moveX).toBe(0);
  });
  test("simultaneous translation and rotation, with pinch hysteresis", () => {
    const tracker = new GestureTracker();
    tracker.update([hand("Left"), hand("Right")], 100);
    tracker.update(
      [hand("Left", 0.4, 0.4, 0), hand("Right", 0.4, 0.4, 0)],
      150
    );
    const result = tracker.update(
      [hand("Left", 0.55, 0.2, 0.4), hand("Right", 0.6, 0.4, 0.4)],
      200
    );
    expect(result.moveX).toBeGreaterThan(0);
    expect(result.moveY).toBeLessThan(0);
    expect(result.turn).toBeGreaterThan(0);
  });
  test("jump fires once, suppresses rotation, and requires releasing rotation to resume", () => {
    const tracker = new GestureTracker();
    tracker.update([hand("Right")], 100);
    tracker.update([hand("Right", 0.4, 0.4, 0)], 150);
    const jump = tracker.update([hand("Right", 0.6, 0.4, 0, 0)], 200);
    expect(jump.jump).toBe(true);
    expect(jump.turn).toBe(0);
    expect(tracker.update([hand("Right", 0.6, 0.4, 0, 0)], 250).jump).toBe(
      false
    );
    expect(tracker.update([hand("Right", 0.7, 0.4, 0, 1)], 300).turn).toBe(0);
    tracker.update([hand("Right")], 350);
    expect(tracker.update([hand("Right", 0.4, 0.4, 1, 0)], 400).jump).toBe(
      true
    );
  });
  test("tracking loss clears movement and held gestures cannot re-engage", () => {
    const tracker = new GestureTracker();
    tracker.update([hand("Left")], 100);
    tracker.update([hand("Left", 0.4, 0.4, 0)], 150);
    expect(tracker.update([], 200).moveX).toBe(0);
    expect(
      tracker.update([hand("Left", 0.6, 0.4, 0)], 250).markers[0].origin
    ).toBeNull();
    tracker.update([hand("Left")], 300);
    tracker.update([hand("Left", 0.4, 0.4, 0)], 350);
    expect(tracker.update([hand("Left", 0.6, 0.4, 0)], 700).moveX).toBe(0);
  });
  test("low confidence, ambiguous identity, and explicit resets require rearming", () => {
    for (const bad of [
      [{ ...hand("Left"), score: 0.5 }],
      [hand("Left"), hand("Left")],
    ]) {
      const tracker = new GestureTracker();
      tracker.update([hand("Left")], 100);
      tracker.update(bad, 150);
      expect(
        tracker.update([hand("Left", 0.4, 0.4, 0)], 200).markers[0].origin
      ).toBeNull();
      tracker.update([hand("Left")], 250);
      tracker.reset();
      expect(
        tracker.update([hand("Left", 0.4, 0.4, 0)], 300).markers[0].origin
      ).toBeNull();
    }
  });
  test("stale inputs clear all actions including pending jump", () => {
    const output = {
      ...emptyGestures(),
      moveX: 1,
      turn: 1,
      jump: true,
      timestamp: 100,
    };
    expect(readGestures(output, 200)).toBe(output);
    expect(readGestures(output, 351)).toEqual(emptyGestures());
  });
  test("view-relative movement at initial, quarter and half turns", () => {
    expect(viewRelativeMovement(1, 0, 0)).toEqual({ moveX: 1, moveZ: 0 });
    const quarter = viewRelativeMovement(0, -1, Math.PI / 2);
    expect(quarter.moveX).toBeCloseTo(-1);
    expect(quarter.moveZ).toBeCloseTo(0);
    const half = viewRelativeMovement(1, 0, Math.PI);
    expect(half.moveX).toBeCloseTo(-1);
    expect(half.moveZ).toBeCloseTo(0);
  });
});
