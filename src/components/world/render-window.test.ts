import { describe, expect, it } from "bun:test";
import { Vector3 } from "three";
import type { PlayerRevealSource } from "./effects/player-effects";
import { computeFairyExpandedRenderRadius } from "./render-window";

function fairySource(x: number, z: number, radius: number): PlayerRevealSource {
  return {
    id: "test-fairy",
    kind: "fairyLight",
    position: new Vector3(x, 0, z),
    radius,
    intensity: 1,
    falloffStart: 0.5,
    color: "#ffffff",
  };
}

describe("computeFairyExpandedRenderRadius", () => {
  it("keeps the base radius without fairy reveal sources", () => {
    expect(computeFairyExpandedRenderRadius({ x: 0, z: 0 }, [], 12)).toBe(12);
  });

  it("does not shrink when a fairy is already inside the base window", () => {
    expect(
      computeFairyExpandedRenderRadius(
        { x: 0, z: 0 },
        [fairySource(2, 3, 4)],
        12
      )
    ).toBe(12);
  });

  it("expands far enough to mount terrain around a fairy near the fringe", () => {
    expect(
      computeFairyExpandedRenderRadius(
        { x: 0, z: 0 },
        [fairySource(13.2, -1, 5.5)],
        12,
        2
      )
    ).toBe(21);
  });
});
