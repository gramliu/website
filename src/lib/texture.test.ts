import { describe, expect, it } from "bun:test";
import { MeshStandardMaterial, Texture } from "three";
import {
  terrainColorFadeGlsl,
  terrainFadeAlphaGlsl,
} from "../components/world/fringe/fringe-terrain-visibility";
import {
  applyTerrainVisibility,
  createFringeOcclusionMaterial,
  createFringeShadowDepthMaterial,
  shouldOccludeFringe,
} from "./texture";

function compileMaterial(
  material: {
    onBeforeCompile: (shader: never, renderer: never) => void;
  },
  fragmentBody: string
) {
  const shader = {
    uniforms: {},
    vertexShader: "#include <common>\n#include <project_vertex>",
    fragmentShader: `#include <common>\n${fragmentBody}`,
  };
  material.onBeforeCompile(shader as never, {} as never);
  return shader;
}

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

  it("writes alpha-hashed proportional depth without color", () => {
    const material = createFringeOcclusionMaterial(
      { path: "textures/oak_leaves.png", translucent: true },
      new Texture()
    );
    expect(material.colorWrite).toBe(false);
    expect(material.depthWrite).toBe(true);
    expect(material.transparent).toBe(false);
    expect(material.alphaTest).toBe(0.2);
    expect(material.alphaHash).toBe(true);

    const shader = compileMaterial(
      material,
      "#include <alphatest_fragment>\n#include <alphahash_fragment>"
    );
    expect(shader.fragmentShader).toContain("fringeDepthBandWeights");
    expect(shader.fragmentShader).toContain(terrainFadeAlphaGlsl);
    expect(shader.fragmentShader.indexOf(terrainFadeAlphaGlsl)).toBeLessThan(
      shader.fragmentShader.indexOf("#include <alphahash_fragment>")
    );
  });

  it("smoothly blends color and shares reveal weight with hashed depth passes", () => {
    const color = new MeshStandardMaterial();
    applyTerrainVisibility(color);
    const occlusion = createFringeOcclusionMaterial(
      { path: "textures/grass_top.png" },
      new Texture()
    );
    const shadow = createFringeShadowDepthMaterial(
      { path: "textures/grass_top.png" },
      new Texture()
    );

    expect(color.transparent).toBe(true);
    expect(color.depthWrite).toBe(false);
    expect(color.alphaHash).toBe(false);
    expect(occlusion.alphaHash).toBe(true);
    expect(shadow.alphaHash).toBe(true);

    const colorShader = compileMaterial(color, "#include <alphatest_fragment>");
    const depthShaders = [occlusion, shadow].map((material) =>
      compileMaterial(
        material,
        "#include <alphatest_fragment>\n#include <alphahash_fragment>"
      )
    );

    expect(colorShader.fragmentShader).toContain(terrainColorFadeGlsl);
    expect(colorShader.vertexShader).toContain(
      "modelMatrix * vec4(transformed, 1.0)"
    );
    expect(colorShader.fragmentShader).not.toContain("fringeVoxel");

    for (const shader of depthShaders) {
      expect(shader.vertexShader).toContain(
        "modelMatrix * vec4(transformed, 1.0)"
      );
      expect(shader.fragmentShader).toContain(terrainFadeAlphaGlsl);
      expect(shader.fragmentShader).not.toContain("fringeVoxel");
      expect(shader.fragmentShader).not.toContain("< 0.5");
    }
  });

  it("keeps alpha-tested leaf cutouts in the shadow material", () => {
    const shadow = createFringeShadowDepthMaterial(
      { path: "textures/oak_leaves.png", translucent: true },
      new Texture()
    );
    expect(shadow.alphaTest).toBe(0.2);
    expect(shadow.map).toBeInstanceOf(Texture);
  });
});
