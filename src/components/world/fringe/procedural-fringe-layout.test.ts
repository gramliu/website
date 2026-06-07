import { describe, expect, it } from "bun:test";
import { FULL_DETAIL_SIZE_XZ } from "../../../game/world/procedural/lod-policy";
import { ProceduralWorldRuntime } from "../../../game/world/procedural/procedural-runtime";
import { ProceduralVoxelWorld } from "../../../game/world/procedural/procedural-world";
import { computeProceduralFringeLayout } from "./procedural-fringe-layout";

describe("computeProceduralFringeLayout", () => {
  it("starts wireframes immediately outside the 10x10 rendered footprint", () => {
    const world = new ProceduralVoxelWorld({ seed: 23, mode: "preview" });
    const bounds = world.getBounds();
    const layout = computeProceduralFringeLayout(world);
    const wireframeXs = new Set(
      layout.wireframes.map((wireframe) => wireframe.x)
    );
    const wireframeZs = new Set(
      layout.wireframes.map((wireframe) => wireframe.z)
    );

    expect(bounds.max.x - bounds.min.x + 1).toBe(FULL_DETAIL_SIZE_XZ);
    expect(bounds.max.z - bounds.min.z + 1).toBe(FULL_DETAIL_SIZE_XZ);
    expect(wireframeXs.has(bounds.min.x - 1)).toBe(true);
    expect(wireframeXs.has(bounds.max.x + 1)).toBe(true);
    expect(wireframeZs.has(bounds.min.z - 1)).toBe(true);
    expect(wireframeZs.has(bounds.max.z + 1)).toBe(true);
  });

  it("uses snapshot bands so procedural wireframes shift with focus", () => {
    const runtime = new ProceduralWorldRuntime({
      seed: 23,
      mode: "interactive",
      previewCenterX: 5,
      previewCenterZ: 5,
    });

    runtime.updateFocus({ x: 5, y: 0, z: 5 }, "interactive");
    const firstLayout = computeProceduralFringeLayout(
      runtime.world,
      runtime.createSnapshot()
    );

    runtime.updateFocus({ x: 20, y: 0, z: 5 }, "interactive");
    const secondLayout = computeProceduralFringeLayout(
      runtime.world,
      runtime.createSnapshot()
    );

    const firstMinX = Math.min(...firstLayout.wireframes.map((wire) => wire.x));
    const secondMinX = Math.min(
      ...secondLayout.wireframes.map((wire) => wire.x)
    );

    expect(secondMinX).toBeGreaterThan(firstMinX);
  });
});
