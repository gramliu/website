import { describe, expect, it } from "bun:test";
import { Texture } from "three";
import {
  createFringeOcclusionMaterial,
  FRINGE_OCCLUSION_FADE_THRESHOLD,
  shouldOccludeFringe,
} from "./texture";

describe("fringe terrain occlusion", () => {
  it("includes solid terrain and alpha-tested leaves but excludes water", () => {
    expect(shouldOccludeFringe({ path: "textures/grass_top.png" })).toBe(true);
    expect(
      shouldOccludeFringe({
        path: "textures/oak_leaves.png",
        translucent: true,
      })
    ).toBe(true);
    expect(
      shouldOccludeFringe({
        path: "textures/water_still.png",
        translucent: true,
        opacity: 0.7,
      })
    ).toBe(false);
  });

  it("writes depth without color and discards dissolved terrain", () => {
    const material = createFringeOcclusionMaterial(
      { path: "textures/oak_leaves.png", translucent: true },
      new Texture()
    );
    expect(material.colorWrite).toBe(false);
    expect(material.depthWrite).toBe(true);
    expect(material.transparent).toBe(false);
    expect(material.alphaTest).toBe(0.2);

    const shader = {
      uniforms: {},
      vertexShader: "#include <common>\n#include <project_vertex>",
      fragmentShader: "#include <common>\n#include <alphatest_fragment>",
    };
    material.onBeforeCompile(shader as never, {} as never);
    expect(shader.fragmentShader).toContain("fringeDepthBandWeights");
    expect(shader.fragmentShader).toContain(
      String(FRINGE_OCCLUSION_FADE_THRESHOLD)
    );
  });
});
