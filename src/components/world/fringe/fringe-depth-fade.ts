import { type Object3D, Vector3 } from "three";
import { FRINGE_CONFIG } from "./fringe-layout";

export interface DepthBandWeights {
  solid: number;
  wireframe: number;
  tile: number;
}

/**
 * Shared uniforms for the camera-distance LOD fade. The same uniform objects
 * are referenced by the fringe line shader and by every patched block
 * material, so a single per-frame update propagates everywhere.
 */
export const fringeDepthFadeUniforms = {
  uCameraWorld: { value: new Vector3() },
  uFocusWorld: { value: new Vector3() },
  uSolidFadeStart: {
    value: FRINGE_CONFIG.depthBands.solidFadeStart as number,
  },
  uSolidFadeEnd: { value: FRINGE_CONFIG.depthBands.solidFadeEnd as number },
  uWireframeFadeStart: {
    value: FRINGE_CONFIG.depthBands.wireframeFadeStart as number,
  },
  uWireframeFadeEnd: {
    value: FRINGE_CONFIG.depthBands.wireframeFadeEnd as number,
  },
  // 0: camera-relative fade (static preview island). 1: radial fade around
  // the focus (interactive mode), symmetric in every walk direction.
  uRadialFade: { value: 0 },
};

/**
 * Switches the shared fade between camera-relative depth (preview) and
 * focus-centered radial depth (interactive mode), including the band
 * thresholds appropriate for each mode. Affects every consumer of the shared
 * uniforms plus the CPU mirrors' defaults.
 */
export function setFringeRadialFade(enabled: boolean): void {
  fringeDepthFadeUniforms.uRadialFade.value = enabled ? 1 : 0;

  const bands = enabled
    ? FRINGE_CONFIG.radialDepthBands
    : FRINGE_CONFIG.depthBands;
  fringeDepthFadeUniforms.uSolidFadeStart.value = bands.solidFadeStart;
  fringeDepthFadeUniforms.uSolidFadeEnd.value = bands.solidFadeEnd;
  fringeDepthFadeUniforms.uWireframeFadeStart.value = bands.wireframeFadeStart;
  fringeDepthFadeUniforms.uWireframeFadeEnd.value = bands.wireframeFadeEnd;
}

export function isFringeRadialFadeEnabled(): boolean {
  return fringeDepthFadeUniforms.uRadialFade.value > 0.5;
}

/**
 * GLSL mirror of {@link computeDepthBandWeights}. Returns
 * vec3(solid, wireframe, tile) weights for a world-space position.
 */
export const depthFadeParsGlsl = `
  uniform vec3 uCameraWorld;
  uniform vec3 uFocusWorld;
  uniform float uSolidFadeStart;
  uniform float uSolidFadeEnd;
  uniform float uWireframeFadeStart;
  uniform float uWireframeFadeEnd;
  uniform float uRadialFade;

  float fringeFadeDepth(vec3 worldPos) {
    float pointDist = length(worldPos.xz - uCameraWorld.xz);
    float focusDist = length(uFocusWorld.xz - uCameraWorld.xz);
    float cameraDepth = pointDist - focusDist;
    float radialDepth = length(worldPos.xz - uFocusWorld.xz);
    return mix(cameraDepth, radialDepth, uRadialFade);
  }

  vec3 fringeDepthBandWeights(vec3 worldPos) {
    float depth = fringeFadeDepth(worldPos);
    float solidOut = smoothstep(uSolidFadeStart, uSolidFadeEnd, depth);
    float wireframeOut = smoothstep(
      uWireframeFadeStart,
      uWireframeFadeEnd,
      depth
    );
    return vec3(
      1.0 - solidOut,
      solidOut * (1.0 - wireframeOut),
      wireframeOut
    );
  }
`;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Horizontal (XZ) distance behind the focus, relative to the camera (or, in
 * radial mode, around the focus itself). Using the horizontal distance keeps
 * the fade front vertical, so whole columns of blocks dissolve together
 * regardless of camera elevation.
 */
export function computeFadeDepth(
  pointWorld: Vector3,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  radial = isFringeRadialFadeEnabled()
): number {
  if (radial) {
    return Math.hypot(
      pointWorld.x - focusWorldPosition.x,
      pointWorld.z - focusWorldPosition.z
    );
  }

  const pointDist = Math.hypot(
    pointWorld.x - cameraWorldPosition.x,
    pointWorld.z - cameraWorldPosition.z
  );
  const focusDist = Math.hypot(
    focusWorldPosition.x - cameraWorldPosition.x,
    focusWorldPosition.z - cameraWorldPosition.z
  );
  return pointDist - focusDist;
}

/**
 * CPU mirror of the shader band weights: how strongly a point renders as a
 * solid block, a wireframe, or a grid tile / particle source.
 */
export interface DepthBands {
  solidFadeStart: number;
  solidFadeEnd: number;
  wireframeFadeStart: number;
  wireframeFadeEnd: number;
}

export function computeDepthBandWeights(
  pointWorld: Vector3,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  bands?: DepthBands,
  radial = isFringeRadialFadeEnabled()
): DepthBandWeights {
  const resolvedBands =
    bands ??
    (radial ? FRINGE_CONFIG.radialDepthBands : FRINGE_CONFIG.depthBands);
  const depth = computeFadeDepth(
    pointWorld,
    cameraWorldPosition,
    focusWorldPosition,
    radial
  );
  const solidOut = smoothstep(
    resolvedBands.solidFadeStart,
    resolvedBands.solidFadeEnd,
    depth
  );
  const wireframeOut = smoothstep(
    resolvedBands.wireframeFadeStart,
    resolvedBands.wireframeFadeEnd,
    depth
  );

  return {
    solid: 1 - solidOut,
    wireframe: solidOut * (1 - wireframeOut),
    tile: wireframeOut,
  };
}

const cameraWorld = new Vector3();
const focusWorld = new Vector3();

/**
 * Copies the current camera/focus world positions into the shared uniforms.
 * Call once per frame from the fringe renderer.
 */
export function updateFringeDepthFadeUniforms(
  camera: { getWorldPosition: (target: Vector3) => Vector3 },
  focusObject: Object3D
): void {
  camera.getWorldPosition(cameraWorld);
  focusObject.getWorldPosition(focusWorld);
  fringeDepthFadeUniforms.uCameraWorld.value.copy(cameraWorld);
  fringeDepthFadeUniforms.uFocusWorld.value.copy(focusWorld);
}
