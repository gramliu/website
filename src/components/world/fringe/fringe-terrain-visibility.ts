import { depthFadeParsGlsl } from "./fringe-depth-fade";

export const TERRAIN_COLOR_ALPHA_EPSILON = 0.004;
export const TERRAIN_OCCLUSION_CROSSFADE_END = 0.2;

export interface TerrainShaderSource {
  vertexShader: string;
  fragmentShader: string;
}

/** Shared reveal calculation for color, occlusion, and shadow passes. */
export const terrainVisibilityParsGlsl = depthFadeParsGlsl;

export const terrainFadeAlphaGlsl =
  "diffuseColor.a *= fringeDepthBandWeights(vFringeWorldPos).x;";

export const terrainOcclusionFadeGlsl = `
float fringeSolidAlpha = fringeDepthBandWeights(vFringeWorldPos).x;
diffuseColor.a *= smoothstep(
  0.0,
  ${TERRAIN_OCCLUSION_CROSSFADE_END},
  fringeSolidAlpha
);`;

export const terrainColorFadeGlsl = `${terrainFadeAlphaGlsl}
if (diffuseColor.a < ${TERRAIN_COLOR_ALPHA_EPSILON}) discard;`;

export function computeTerrainOcclusionCoverage(solidAlpha: number): number {
  const t = Math.max(
    0,
    Math.min(1, solidAlpha / TERRAIN_OCCLUSION_CROSSFADE_END)
  );
  return t * t * (3 - 2 * t);
}

function replaceRequired(
  source: string,
  search: string,
  replacement: string,
  label: string
): string {
  if (!source.includes(search)) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Unable to inject terrain visibility at ${label}`);
    }
    return source;
  }
  return source.replace(search, replacement);
}

/** Passes per-fragment world position to the shared reveal calculation. */
export function injectTerrainVisibilityVarying(
  shader: TerrainShaderSource
): void {
  shader.vertexShader = replaceRequired(
    shader.vertexShader,
    "#include <common>",
    "#include <common>\nvarying vec3 vFringeWorldPos;",
    "vertex <common>"
  );
  shader.vertexShader = replaceRequired(
    shader.vertexShader,
    "#include <project_vertex>",
    "#include <project_vertex>\nvFringeWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;",
    "vertex <project_vertex>"
  );
  shader.fragmentShader = replaceRequired(
    shader.fragmentShader,
    "#include <common>",
    `#include <common>\nvarying vec3 vFringeWorldPos;\n${terrainVisibilityParsGlsl}`,
    "fragment <common>"
  );
}

/** Smoothly blends visible terrain after texture cutout alpha testing. */
export function injectTerrainColorFade(shader: TerrainShaderSource): void {
  const anchor = "#include <alphatest_fragment>";
  shader.fragmentShader = replaceRequired(
    shader.fragmentShader,
    anchor,
    `${anchor}\n${terrainColorFadeGlsl}`,
    "fragment color alpha"
  );
}

/**
 * Feeds the same smooth reveal weight into Three's fine-grained alpha hash for
 * proportional depth and shadow-map coverage.
 */
export function injectTerrainHashedFade(shader: TerrainShaderSource): void {
  const anchor = "#include <alphahash_fragment>";
  shader.fragmentShader = replaceRequired(
    shader.fragmentShader,
    anchor,
    `${terrainFadeAlphaGlsl}\n${anchor}`,
    "fragment alpha hash"
  );
}

/** Keeps full terrain occlusion until the final portion of the color fade. */
export function injectTerrainOcclusionFade(shader: TerrainShaderSource): void {
  const anchor = "#include <alphahash_fragment>";
  shader.fragmentShader = replaceRequired(
    shader.fragmentShader,
    anchor,
    `${terrainOcclusionFadeGlsl}\n${anchor}`,
    "fragment occlusion alpha hash"
  );
}
