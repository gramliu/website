import { describe, expect, it } from "bun:test";
import { Vector3 } from "three";
import { computeDepthBandWeights, computeFadeDepth } from "./fringe-depth-fade";
import { FRINGE_CONFIG } from "./fringe-layout";

const camera = new Vector3(0, 0, 10);
const focus = new Vector3(0, 0, 0);

/** Builds a point with the given fade depth along the camera axis. */
function pointAtDepth(depth: number): Vector3 {
  return new Vector3(0, 0, -depth);
}

describe("computeFadeDepth", () => {
  it("is zero at the focus and negative toward the camera", () => {
    expect(computeFadeDepth(focus, camera, focus)).toBe(0);
    expect(computeFadeDepth(new Vector3(0, 0, 5), camera, focus)).toBeLessThan(
      0
    );
  });

  it("matches distance behind the focus along the view axis", () => {
    expect(computeFadeDepth(pointAtDepth(4), camera, focus)).toBeCloseTo(4);
  });
});

describe("computeDepthBandWeights", () => {
  const { solidFadeStart, solidFadeEnd, wireframeFadeStart, wireframeFadeEnd } =
    FRINGE_CONFIG.depthBands;

  it("orders the band thresholds for non-overlapping transitions", () => {
    expect(solidFadeStart).toBeLessThan(solidFadeEnd);
    expect(solidFadeEnd).toBeLessThanOrEqual(wireframeFadeStart);
    expect(wireframeFadeStart).toBeLessThan(wireframeFadeEnd);
  });

  it("renders points near the camera fully solid", () => {
    const weights = computeDepthBandWeights(pointAtDepth(0), camera, focus);
    expect(weights.solid).toBe(1);
    expect(weights.wireframe).toBe(0);
    expect(weights.tile).toBe(0);
  });

  it("renders points between the bands fully as wireframe", () => {
    const depth = (solidFadeEnd + wireframeFadeStart) / 2;
    const weights = computeDepthBandWeights(pointAtDepth(depth), camera, focus);
    expect(weights.solid).toBe(0);
    expect(weights.wireframe).toBe(1);
    expect(weights.tile).toBe(0);
  });

  it("renders far points fully as tiles", () => {
    const weights = computeDepthBandWeights(
      pointAtDepth(wireframeFadeEnd + 1),
      camera,
      focus
    );
    expect(weights.solid).toBe(0);
    expect(weights.wireframe).toBe(0);
    expect(weights.tile).toBe(1);
  });

  it("cross-fades solid into wireframe over the first band", () => {
    const depth = (solidFadeStart + solidFadeEnd) / 2;
    const weights = computeDepthBandWeights(pointAtDepth(depth), camera, focus);
    expect(weights.solid).toBeGreaterThan(0);
    expect(weights.solid).toBeLessThan(1);
    expect(weights.wireframe).toBeGreaterThan(0);
    expect(weights.solid + weights.wireframe).toBeCloseTo(1);
    expect(weights.tile).toBe(0);
  });

  it("cross-fades wireframe into tiles over the second band", () => {
    const depth = (wireframeFadeStart + wireframeFadeEnd) / 2;
    const weights = computeDepthBandWeights(pointAtDepth(depth), camera, focus);
    expect(weights.solid).toBe(0);
    expect(weights.wireframe).toBeGreaterThan(0);
    expect(weights.wireframe).toBeLessThan(1);
    expect(weights.wireframe + weights.tile).toBeCloseTo(1);
  });

  it("keeps the weights a partition of unity across all depths", () => {
    for (let depth = -2; depth <= wireframeFadeEnd + 2; depth += 0.25) {
      const { solid, wireframe, tile } = computeDepthBandWeights(
        pointAtDepth(depth),
        camera,
        focus
      );
      expect(solid + wireframe + tile).toBeCloseTo(1);
    }
  });
});
