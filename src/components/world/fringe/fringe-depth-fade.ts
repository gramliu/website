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
  // 0: camera-relative solid fade (preview). 1: radial solid fade around the
  // focus (interactive mode). Wireframe/tile bands always use camera depth.
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

  float fringeCameraDepth(vec3 worldPos) {
    float pointDist = length(worldPos.xz - uCameraWorld.xz);
    float focusDist = length(uFocusWorld.xz - uCameraWorld.xz);
    return pointDist - focusDist;
  }

  float fringeRadialDepth(vec3 worldPos) {
    return length(worldPos.xz - uFocusWorld.xz);
  }

  vec3 fringeDepthBandWeights(vec3 worldPos) {
    float cameraDepth = fringeCameraDepth(worldPos);
    float radialDepth = fringeRadialDepth(worldPos);
    float solidDepth = mix(cameraDepth, radialDepth, uRadialFade);

    float solidOut = smoothstep(uSolidFadeStart, uSolidFadeEnd, solidDepth);
    float wireframeOut = smoothstep(
      uWireframeFadeStart,
      uWireframeFadeEnd,
      cameraDepth
    );
    float behindFocus = step(uSolidFadeStart, cameraDepth);
    return vec3(
      1.0 - solidOut,
      solidOut * (1.0 - wireframeOut) * behindFocus,
      wireframeOut * behindFocus
    );
  }
`;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Camera-relative depth: positive behind the focus along the view axis. */
export function computeCameraFadeDepth(
  pointWorld: Vector3,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3
): number {
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

/** Radial depth from the focus in XZ. */
export function computeRadialFadeDepth(
  pointWorld: Vector3,
  focusWorldPosition: Vector3
): number {
  return Math.hypot(
    pointWorld.x - focusWorldPosition.x,
    pointWorld.z - focusWorldPosition.z
  );
}

/**
 * Depth used for the solid band. Radial in interactive mode, camera-relative
 * in preview. Using horizontal distance keeps the fade front vertical.
 */
export function computeSolidFadeDepth(
  pointWorld: Vector3,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  radial = isFringeRadialFadeEnabled()
): number {
  if (radial) {
    return computeRadialFadeDepth(pointWorld, focusWorldPosition);
  }
  return computeCameraFadeDepth(
    pointWorld,
    cameraWorldPosition,
    focusWorldPosition
  );
}

/** @deprecated Use {@link computeSolidFadeDepth} or {@link computeCameraFadeDepth}. */
export function computeFadeDepth(
  pointWorld: Vector3,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  radial = isFringeRadialFadeEnabled()
): number {
  return computeSolidFadeDepth(
    pointWorld,
    cameraWorldPosition,
    focusWorldPosition,
    radial
  );
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
  const solidDepth = computeSolidFadeDepth(
    pointWorld,
    cameraWorldPosition,
    focusWorldPosition,
    radial
  );
  const wireframeDepth = computeCameraFadeDepth(
    pointWorld,
    cameraWorldPosition,
    focusWorldPosition
  );
  const solidOut = smoothstep(
    resolvedBands.solidFadeStart,
    resolvedBands.solidFadeEnd,
    solidDepth
  );
  const wireframeOut = smoothstep(
    resolvedBands.wireframeFadeStart,
    resolvedBands.wireframeFadeEnd,
    wireframeDepth
  );
  const behindFocus = wireframeDepth >= resolvedBands.solidFadeStart ? 1 : 0;

  return {
    solid: 1 - solidOut,
    wireframe: solidOut * (1 - wireframeOut) * behindFocus,
    tile: wireframeOut * behindFocus,
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
