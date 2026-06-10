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
  uSolidFadeStart: { value: FRINGE_CONFIG.depthBands.solidFadeStart },
  uSolidFadeEnd: { value: FRINGE_CONFIG.depthBands.solidFadeEnd },
  uWireframeFadeStart: { value: FRINGE_CONFIG.depthBands.wireframeFadeStart },
  uWireframeFadeEnd: { value: FRINGE_CONFIG.depthBands.wireframeFadeEnd },
};

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

  float fringeFadeDepth(vec3 worldPos) {
    float pointDist = length(worldPos.xz - uCameraWorld.xz);
    float focusDist = length(uFocusWorld.xz - uCameraWorld.xz);
    return pointDist - focusDist;
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
 * Horizontal (XZ) distance behind the focus, relative to the camera. Using
 * the horizontal distance keeps the fade front vertical, so whole columns
 * of blocks dissolve together regardless of camera elevation.
 */
export function computeFadeDepth(
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

/**
 * CPU mirror of the shader band weights: how strongly a point renders as a
 * solid block, a wireframe, or a grid tile / particle source.
 */
export function computeDepthBandWeights(
  pointWorld: Vector3,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  bands = FRINGE_CONFIG.depthBands
): DepthBandWeights {
  const depth = computeFadeDepth(
    pointWorld,
    cameraWorldPosition,
    focusWorldPosition
  );
  const solidOut = smoothstep(bands.solidFadeStart, bands.solidFadeEnd, depth);
  const wireframeOut = smoothstep(
    bands.wireframeFadeStart,
    bands.wireframeFadeEnd,
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
