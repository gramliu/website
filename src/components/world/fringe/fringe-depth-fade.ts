import { type Object3D, Vector3 } from "three";
import { PLAYER_REVEAL_RADIUS } from "../effects/player-effects";
import { FRINGE_CONFIG } from "./fringe-layout";

export interface DepthBandWeights {
  solid: number;
  wireframe: number;
  tile: number;
}

export const MAX_REVEAL_LIGHTS = 4;

export interface RevealLightInput {
  position: Vector3;
  radius: number;
  intensity: number;
  falloffStart?: number;
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
  uPlayerRevealRadius: { value: PLAYER_REVEAL_RADIUS },
  uRevealLightCount: { value: 0 },
  uRevealLightPositions: {
    value: Array.from({ length: MAX_REVEAL_LIGHTS }, () => new Vector3()),
  },
  uRevealLightRadii: {
    value: Array.from({ length: MAX_REVEAL_LIGHTS }, () => 0),
  },
  uRevealLightIntensities: {
    value: Array.from({ length: MAX_REVEAL_LIGHTS }, () => 0),
  },
  uRevealLightFalloffStarts: {
    value: Array.from({ length: MAX_REVEAL_LIGHTS }, () => 0.35),
  },
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
  uniform float uPlayerRevealRadius;
  uniform int uRevealLightCount;
  uniform vec3 uRevealLightPositions[${MAX_REVEAL_LIGHTS}];
  uniform float uRevealLightRadii[${MAX_REVEAL_LIGHTS}];
  uniform float uRevealLightIntensities[${MAX_REVEAL_LIGHTS}];
  uniform float uRevealLightFalloffStarts[${MAX_REVEAL_LIGHTS}];

  float fringeCameraDepth(vec3 worldPos) {
    float pointDist = length(worldPos.xz - uCameraWorld.xz);
    float focusDist = length(uFocusWorld.xz - uCameraWorld.xz);
    return pointDist - focusDist;
  }

  float fringeRadialDepth(vec3 worldPos) {
    return length(worldPos.xz - uFocusWorld.xz);
  }

  float fringeRevealLightWeight(
    vec3 worldPos,
    vec3 lightPos,
    float radius,
    float intensity,
    float falloffStart
  ) {
    float distanceToLight = length(worldPos.xz - lightPos.xz);
    float innerRadius = radius * clamp(falloffStart, 0.0, 0.95);
    return intensity * (1.0 - smoothstep(innerRadius, radius, distanceToLight));
  }

  float fringeRevealWeight(vec3 worldPos, float radialDepth) {
    float reveal = 1.0 - smoothstep(
      uPlayerRevealRadius,
      uSolidFadeEnd,
      radialDepth
    );

    for (int i = 0; i < ${MAX_REVEAL_LIGHTS}; i++) {
      if (i >= uRevealLightCount) {
        break;
      }
      reveal += fringeRevealLightWeight(
        worldPos,
        uRevealLightPositions[i],
        uRevealLightRadii[i],
        uRevealLightIntensities[i],
        uRevealLightFalloffStarts[i]
      );
    }

    return clamp(reveal, 0.0, 1.0);
  }

  vec3 fringeDepthBandWeights(vec3 worldPos) {
    float cameraDepth = fringeCameraDepth(worldPos);
    float radialDepth = fringeRadialDepth(worldPos);
    float solidDepth = mix(cameraDepth, radialDepth, uRadialFade);

    float reveal = fringeRevealWeight(worldPos, radialDepth);
    float solidOut = smoothstep(uSolidFadeStart, uSolidFadeEnd, solidDepth);
    solidOut = mix(solidOut, 1.0 - reveal, uRadialFade);
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

export function computeRevealLightWeight(
  pointWorld: Vector3,
  light: RevealLightInput
): number {
  const distanceToLight = Math.hypot(
    pointWorld.x - light.position.x,
    pointWorld.z - light.position.z
  );
  const falloffStart = Math.max(0, Math.min(0.95, light.falloffStart ?? 0.35));
  const innerRadius = light.radius * falloffStart;
  return (
    light.intensity *
    (1 - smoothstep(innerRadius, light.radius, distanceToLight))
  );
}

export function computeRevealWeight(
  pointWorld: Vector3,
  focusWorldPosition: Vector3,
  lights: RevealLightInput[] = [],
  playerRevealRadius: number = PLAYER_REVEAL_RADIUS,
  fadeEnd: number = FRINGE_CONFIG.radialDepthBands.solidFadeEnd
): number {
  const radialDepth = computeRadialFadeDepth(pointWorld, focusWorldPosition);
  let reveal = 1 - smoothstep(playerRevealRadius, fadeEnd, radialDepth);
  for (const light of lights.slice(0, MAX_REVEAL_LIGHTS)) {
    reveal += computeRevealLightWeight(pointWorld, light);
  }
  return Math.max(0, Math.min(1, reveal));
}

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
  let solidOut = smoothstep(
    resolvedBands.solidFadeStart,
    resolvedBands.solidFadeEnd,
    solidDepth
  );
  if (radial) {
    const reveal = computeRevealWeight(
      pointWorld,
      focusWorldPosition,
      [],
      PLAYER_REVEAL_RADIUS,
      resolvedBands.solidFadeEnd
    );
    solidOut = 1 - reveal;
  }
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

export function updateFringeRevealLightUniforms(
  lights: RevealLightInput[]
): void {
  const count = Math.min(lights.length, MAX_REVEAL_LIGHTS);
  fringeDepthFadeUniforms.uRevealLightCount.value = count;

  for (let index = 0; index < MAX_REVEAL_LIGHTS; index += 1) {
    const light = lights[index];
    if (index < count && light) {
      fringeDepthFadeUniforms.uRevealLightPositions.value[index].copy(
        light.position
      );
      fringeDepthFadeUniforms.uRevealLightRadii.value[index] = light.radius;
      fringeDepthFadeUniforms.uRevealLightIntensities.value[index] =
        light.intensity;
      fringeDepthFadeUniforms.uRevealLightFalloffStarts.value[index] =
        light.falloffStart ?? 0.35;
    } else {
      fringeDepthFadeUniforms.uRevealLightPositions.value[index].set(0, 0, 0);
      fringeDepthFadeUniforms.uRevealLightRadii.value[index] = 0;
      fringeDepthFadeUniforms.uRevealLightIntensities.value[index] = 0;
      fringeDepthFadeUniforms.uRevealLightFalloffStarts.value[index] = 0.35;
    }
  }
}
