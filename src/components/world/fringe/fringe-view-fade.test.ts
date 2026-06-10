import { describe, expect, it } from "bun:test";
import { Vector3 } from "three";
import { pickWeightedTile } from "./fringe-animation";
import type { FringeGridTile } from "./fringe-layout";
import { computeFringeViewFadeWeight } from "./fringe-view-fade";

const lineFade = {
  lateralInner: 2.0,
  lateralOuter: 8.0,
};

const particleFade = {
  lateralInner: 1.7,
  lateralOuter: 7.3,
};

describe("computeFringeViewFadeWeight", () => {
  const focus = new Vector3(5, 0, 5);
  const camera = new Vector3(15, 10, 15);

  it("returns zero weight for points on the camera-facing side of focus", () => {
    const point = new Vector3(8, 0, 8);
    expect(computeFringeViewFadeWeight(point, camera, focus, lineFade)).toBe(0);
  });

  it("returns positive weight for points far behind the focus", () => {
    const point = new Vector3(0, 0, 0);
    const weight = computeFringeViewFadeWeight(point, camera, focus, lineFade);
    expect(weight).toBeGreaterThan(0);
    expect(weight).toBeLessThan(1);
  });

  it("returns full weight for far points directly behind the focus", () => {
    const point = new Vector3(-2, -7, -2);
    const weight = computeFringeViewFadeWeight(point, camera, focus, lineFade);
    expect(weight).toBeCloseTo(1, 1);
  });

  it("fades peripheral points more aggressively with particle fade", () => {
    const point = new Vector3(0, 0, 0);
    const lineWeight = computeFringeViewFadeWeight(
      point,
      camera,
      focus,
      lineFade
    );
    const particleWeight = computeFringeViewFadeWeight(
      point,
      camera,
      focus,
      particleFade
    );
    expect(particleWeight).toBeLessThan(lineWeight);
  });
});

describe("pickWeightedTile", () => {
  const tiles: FringeGridTile[] = [
    {
      x: 0,
      z: 0,
      opacity: 1,
      row: 2,
      outward: [1, 0],
      emissionWeight: 1,
    },
    {
      x: 1,
      z: 0,
      opacity: 1,
      row: 2,
      outward: [1, 0],
      emissionWeight: 1,
    },
  ];

  it("returns null when all weights are zero", () => {
    expect(pickWeightedTile(tiles, [0, 0])).toBeNull();
  });

  it("only selects tiles with positive weight", () => {
    for (let i = 0; i < 20; i++) {
      const tile = pickWeightedTile(tiles, [0, 1]);
      expect(tile).toBe(tiles[1]);
    }
  });
});
