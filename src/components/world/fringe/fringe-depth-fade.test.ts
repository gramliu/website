import { describe, expect, it } from "bun:test";
import { Vector3 } from "three";
import {
  computeDepthBandWeights,
  computeFadeDepth,
  fringeDepthFadeUniforms,
  isFringeRadialFadeEnabled,
  setFringeRadialFade,
} from "./fringe-depth-fade";
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

  it("orders the band thresholds (overlap between bands is allowed)", () => {
    expect(solidFadeStart).toBeLessThan(solidFadeEnd);
    expect(wireframeFadeStart).toBeLessThan(wireframeFadeEnd);
    expect(solidFadeStart).toBeLessThanOrEqual(wireframeFadeStart);
    expect(solidFadeEnd).toBeLessThanOrEqual(wireframeFadeEnd);
  });

  it("renders points near the camera fully solid", () => {
    const weights = computeDepthBandWeights(pointAtDepth(0), camera, focus);
    expect(weights.solid).toBe(1);
    expect(weights.wireframe).toBe(0);
    expect(weights.tile).toBe(0);
  });

  it("peaks the wireframe weight between the band midpoints", () => {
    const depth = (solidFadeEnd + wireframeFadeStart) / 2;
    const weights = computeDepthBandWeights(pointAtDepth(depth), camera, focus);
    expect(weights.wireframe).toBeGreaterThan(weights.solid);
    expect(weights.wireframe).toBeGreaterThan(weights.tile);
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
    expect(weights.wireframe).toBeGreaterThan(0);
    expect(weights.wireframe).toBeLessThan(1);
    expect(weights.tile).toBeGreaterThan(0);
    expect(weights.tile).toBeLessThan(1);
  });

  it("keeps the weights bounded and monotonic toward tiles", () => {
    let previousTile = 0;
    for (let depth = -2; depth <= wireframeFadeEnd + 2; depth += 0.25) {
      const { solid, wireframe, tile } = computeDepthBandWeights(
        pointAtDepth(depth),
        camera,
        focus
      );
      for (const weight of [solid, wireframe, tile]) {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      }
      // Bands overlap slightly, so the sum hovers around 1 without dipping.
      expect(solid + wireframe + tile).toBeGreaterThanOrEqual(0.99);
      expect(solid + wireframe + tile).toBeLessThanOrEqual(1.05);
      expect(tile).toBeGreaterThanOrEqual(previousTile);
      previousTile = tile;
    }
  });
});

describe("computeDepthBandWeights in radial mode", () => {
  const { solidFadeStart, wireframeFadeEnd } = FRINGE_CONFIG.depthBands;

  function radialWeights(point: Vector3) {
    return computeDepthBandWeights(
      point,
      camera,
      focus,
      FRINGE_CONFIG.depthBands,
      true
    );
  }

  it("uses distance from the focus, ignoring the camera", () => {
    expect(
      computeFadeDepth(new Vector3(3, 0, 4), camera, focus, true)
    ).toBeCloseTo(5);
    // Points toward the camera fade exactly like points away from it.
    const toward = radialWeights(new Vector3(0, 0, wireframeFadeEnd + 1));
    const away = radialWeights(new Vector3(0, 0, -(wireframeFadeEnd + 1)));
    expect(toward).toEqual(away);
  });

  it("is symmetric in every walk direction", () => {
    const radius = (solidFadeStart + wireframeFadeEnd) / 2;
    const reference = radialWeights(new Vector3(radius, 0, 0));
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 7) {
      const weights = radialWeights(
        new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      );
      expect(weights.solid).toBeCloseTo(reference.solid);
      expect(weights.wireframe).toBeCloseTo(reference.wireframe);
      expect(weights.tile).toBeCloseTo(reference.tile);
    }
  });

  it("renders the focus itself fully solid and far rings as tiles", () => {
    const center = radialWeights(new Vector3(0, 0, 0));
    expect(center.solid).toBe(1);

    const far = radialWeights(new Vector3(wireframeFadeEnd + 2, 0, 0));
    expect(far.solid).toBe(0);
    expect(far.tile).toBe(1);
  });

  it("ignores vertical distance so whole columns dissolve together", () => {
    const low = radialWeights(new Vector3(4, 0, 0));
    const high = radialWeights(new Vector3(4, 10, 0));
    expect(low).toEqual(high);
  });
});

describe("setFringeRadialFade", () => {
  it("toggles the uniform and swaps the band thresholds per mode", () => {
    setFringeRadialFade(true);
    expect(isFringeRadialFadeEnabled()).toBe(true);
    expect(fringeDepthFadeUniforms.uSolidFadeEnd.value).toBe(
      FRINGE_CONFIG.radialDepthBands.solidFadeEnd
    );
    expect(fringeDepthFadeUniforms.uWireframeFadeEnd.value).toBe(
      FRINGE_CONFIG.radialDepthBands.wireframeFadeEnd
    );

    setFringeRadialFade(false);
    expect(isFringeRadialFadeEnabled()).toBe(false);
    expect(fringeDepthFadeUniforms.uSolidFadeEnd.value).toBe(
      FRINGE_CONFIG.depthBands.solidFadeEnd
    );
    expect(fringeDepthFadeUniforms.uWireframeFadeEnd.value).toBe(
      FRINGE_CONFIG.depthBands.wireframeFadeEnd
    );
  });
});
