import { type Object3D, Vector3 } from "three";
import { FRINGE_CONFIG, type FringeGridTile } from "./fringe-layout";

export interface FringeViewFadeConfig {
  backFadeStart: number;
  backFadeEnd: number;
  lateralInner: number;
  lateralOuter: number;
}

const toPoint = new Vector3();
const toCamera = new Vector3();
const viewDir = new Vector3();
const cross = new Vector3();
const cameraWorld = new Vector3();
const focusWorld = new Vector3();
const samplePoint = new Vector3();

const tileSampleOffsets: readonly [number, number][] = [
  [0.5, 0.5],
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function computeFringeViewFadeWeight(
  pointWorld: Vector3,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  fade: FringeViewFadeConfig = FRINGE_CONFIG.lineFade
): number {
  toPoint.subVectors(pointWorld, focusWorldPosition);
  toCamera.subVectors(cameraWorldPosition, focusWorldPosition);

  const pointDistance = toPoint.length();
  const cameraDistance = toCamera.length();
  if (pointDistance < 1e-6 || cameraDistance < 1e-6) {
    return 1;
  }

  const viewAlignment =
    toPoint.dot(toCamera) / (pointDistance * cameraDistance);
  const backFade = smoothstep(
    fade.backFadeEnd,
    fade.backFadeStart,
    viewAlignment
  );

  viewDir.copy(toCamera).multiplyScalar(1 / cameraDistance);
  cross.crossVectors(toPoint, viewDir);
  const lateralDist = cross.length();
  const lateralFade =
    1 - smoothstep(fade.lateralInner, fade.lateralOuter, lateralDist);

  return backFade * lateralFade;
}

function applyFadeExponent(weight: number, exponent: number): number {
  if (weight <= 0) {
    return 0;
  }

  return weight ** exponent;
}

function computeTileViewFadeWeight(
  tile: FringeGridTile,
  tileY: number,
  transformRoot: Object3D,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  fade: FringeViewFadeConfig,
  exponent: number
): number {
  samplePoint.set(tile.x + 0.5, tileY, tile.z + 0.5);
  transformRoot.localToWorld(samplePoint);
  const centerFade = computeFringeViewFadeWeight(
    samplePoint,
    cameraWorldPosition,
    focusWorldPosition,
    fade
  );

  let minFade = 1;
  for (const [offsetX, offsetZ] of tileSampleOffsets) {
    samplePoint.set(tile.x + offsetX, tileY, tile.z + offsetZ);
    transformRoot.localToWorld(samplePoint);

    minFade = Math.min(
      minFade,
      computeFringeViewFadeWeight(
        samplePoint,
        cameraWorldPosition,
        focusWorldPosition,
        fade
      )
    );
  }

  const blendedFade = centerFade * 0.8 + minFade * 0.2;
  return applyFadeExponent(blendedFade, exponent);
}

export function computeLocalViewFadeWeight(
  localX: number,
  localY: number,
  localZ: number,
  transformRoot: Object3D,
  cameraWorldPosition: Vector3,
  focusWorldPosition: Vector3,
  fade: FringeViewFadeConfig = FRINGE_CONFIG.particleFade,
  exponent = FRINGE_CONFIG.particleFadeExponent
): number {
  samplePoint.set(localX, localY, localZ);
  transformRoot.localToWorld(samplePoint);

  return applyFadeExponent(
    computeFringeViewFadeWeight(
      samplePoint,
      cameraWorldPosition,
      focusWorldPosition,
      fade
    ),
    exponent
  );
}

export function computeTileSpawnWeights(
  tiles: FringeGridTile[],
  tileY: number,
  transformRoot: Object3D,
  camera: { getWorldPosition: (target: Vector3) => Vector3 },
  focusObject: Object3D,
  weights: number[],
  fade: FringeViewFadeConfig = FRINGE_CONFIG.particleFade,
  exponent = FRINGE_CONFIG.particleFadeExponent
): number {
  camera.getWorldPosition(cameraWorld);
  focusObject.getWorldPosition(focusWorld);

  let totalWeight = 0;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const viewFade = computeTileViewFadeWeight(
      tile,
      tileY,
      transformRoot,
      cameraWorld,
      focusWorld,
      fade,
      exponent
    );
    const weight = tile.emissionWeight * viewFade;
    weights[i] = weight;
    totalWeight += weight;
  }

  return totalWeight;
}

export function updateFringeViewFadeContext(
  camera: { getWorldPosition: (target: Vector3) => Vector3 },
  focusObject: Object3D
): {
  cameraWorld: Vector3;
  focusWorld: Vector3;
} {
  camera.getWorldPosition(cameraWorld);
  focusObject.getWorldPosition(focusWorld);
  return { cameraWorld, focusWorld };
}
