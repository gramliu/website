import type { WorldBounds } from "../../core/types";
import type { LoadedWorldCell } from "../world-loader";
import { WORLD_MIN_Y } from "./chunk-coords";
import {
  getColumnLodSearchRadius,
  type LodSample,
  type ProceduralRuntimeMode,
  sampleColumnLod,
} from "./lod-policy";
import type { ProceduralVoxelWorld } from "./procedural-world";

export interface RenderOrigin {
  x: number;
  y: number;
  z: number;
}

export interface CameraSnapshotContext {
  position: RenderOrigin;
  forward: RenderOrigin;
}

export interface HighDetailCell extends LoadedWorldCell {
  opacity: number;
  fidelity: number;
}

export interface MidDetailColumn {
  x: number;
  z: number;
  y: number;
  height: number;
  surfaceBlockId: number;
  opacity: number;
  fidelity: number;
}

export interface WireColumn {
  x: number;
  z: number;
  minY: number;
  maxY: number;
  opacity: number;
  fidelity: number;
  distanceBand: number;
}

export interface SnapshotGridTile {
  x: number;
  z: number;
  opacity: number;
  row: number;
  emissionWeight: number;
  fidelity: number;
}

export interface ProceduralRenderSnapshot {
  mode: ProceduralRuntimeMode;
  focus: RenderOrigin;
  cameraPosition: RenderOrigin | null;
  cameraForward: RenderOrigin | null;
  renderOrigin: RenderOrigin;
  fullDetailBounds: WorldBounds;
  lodSamples: Array<LodSample & { x: number; z: number }>;
  highDetailCells: HighDetailCell[];
  midDetailColumns: MidDetailColumn[];
  wireColumns: WireColumn[];
  gridTiles: SnapshotGridTile[];
  particleTiles: SnapshotGridTile[];
}

export interface ProceduralRenderSnapshotOptions {
  world: ProceduralVoxelWorld;
  mode: ProceduralRuntimeMode;
  focus: RenderOrigin;
  renderOrigin?: RenderOrigin;
  camera?: CameraSnapshotContext | null;
}

function normalize2d(x: number, z: number): { x: number; z: number } {
  const length = Math.hypot(x, z);
  if (length === 0) {
    return { x: 0, z: 1 };
  }

  return { x: x / length, z: z / length };
}

function distancePointToSegment2d(
  pointX: number,
  pointZ: number,
  start: RenderOrigin,
  end: RenderOrigin
): { distance: number; onSegment: boolean } {
  const segmentX = end.x - start.x;
  const segmentZ = end.z - start.z;
  const lengthSquared = segmentX * segmentX + segmentZ * segmentZ;

  if (lengthSquared === 0) {
    return {
      distance: Math.hypot(pointX - end.x, pointZ - end.z),
      onSegment: false,
    };
  }

  const t =
    ((pointX - start.x) * segmentX + (pointZ - start.z) * segmentZ) /
    lengthSquared;
  const clampedT = Math.max(0, Math.min(1, t));
  const closestX = start.x + segmentX * clampedT;
  const closestZ = start.z + segmentZ * clampedT;

  return {
    distance: Math.hypot(pointX - closestX, pointZ - closestZ),
    onSegment: t >= 0 && t <= 1,
  };
}

function playerVisibilityMultiplier(
  x: number,
  z: number,
  focus: RenderOrigin,
  camera: CameraSnapshotContext | null | undefined
): number {
  if (Math.hypot(x - focus.x, z - focus.z) <= 1.75) {
    return 0;
  }

  if (!camera) {
    return 1;
  }

  const occlusion = distancePointToSegment2d(x, z, camera.position, focus);
  if (occlusion.onSegment && occlusion.distance <= 1.1) {
    return 0.1;
  }

  return 1;
}

function viewRelevance(
  x: number,
  z: number,
  focus: RenderOrigin,
  camera: CameraSnapshotContext | null | undefined
): number {
  if (!camera) {
    return 1;
  }

  const toColumn = normalize2d(x - camera.position.x, z - camera.position.z);
  const forward = normalize2d(camera.forward.x, camera.forward.z);
  const facing = Math.max(0, toColumn.x * forward.x + toColumn.z * forward.z);
  const lateralDistance = Math.abs(
    (x - focus.x) * forward.z - (z - focus.z) * forward.x
  );
  const lateralFade = 1 - Math.min(1, Math.max(0, (lateralDistance - 4) / 10));

  return Math.max(0.12, facing) * lateralFade;
}

export function createProceduralRenderSnapshot({
  world,
  mode,
  focus,
  renderOrigin = { x: 0, y: 0, z: 0 },
  camera = null,
}: ProceduralRenderSnapshotOptions): ProceduralRenderSnapshot {
  const fullDetailBounds = world.getFullDetailBounds();
  const searchRadius = getColumnLodSearchRadius(world.budget);
  const minX = fullDetailBounds.min.x - searchRadius;
  const maxX = fullDetailBounds.max.x + searchRadius;
  const minZ = fullDetailBounds.min.z - searchRadius;
  const maxZ = fullDetailBounds.max.z + searchRadius;
  const lodSamples: Array<LodSample & { x: number; z: number }> = [];
  const highDetailCells: HighDetailCell[] = [];
  const midDetailColumns: MidDetailColumn[] = [];
  const wireColumns: WireColumn[] = [];
  const gridTiles: SnapshotGridTile[] = [];
  const particleTiles: SnapshotGridTile[] = [];

  for (let z = minZ; z <= maxZ; z++) {
    for (let x = minX; x <= maxX; x++) {
      const sample = sampleColumnLod(x, z, fullDetailBounds, world.budget);
      if (sample.lod === "unloaded") {
        continue;
      }

      const visibility = playerVisibilityMultiplier(x, z, focus, camera);
      const relevance = viewRelevance(x, z, focus, camera) * visibility;
      lodSamples.push({ x, z, ...sample });

      if (sample.blockOpacity > 0.03) {
        const opacity =
          mode === "preview" && sample.distanceFromFullDetail === 0
            ? 1
            : sample.blockOpacity;
        highDetailCells.push(
          ...world.getRenderableColumnCells(x, z, "preview").map((cell) => ({
            ...cell,
            opacity:
              sample.distanceFromFullDetail === 0
                ? opacity
                : opacity * visibility,
            fidelity: sample.fidelity,
          }))
        );
      }

      const height = world.getHighestSolidCell(x, z) ?? WORLD_MIN_Y;
      const surfaceBlockId = world.getBlockIdAtCell(x, height, z);

      if (
        sample.midOpacity > 0.03 &&
        sample.distanceFromFullDetail > 0 &&
        visibility > 0
      ) {
        midDetailColumns.push({
          x,
          z,
          y: WORLD_MIN_Y,
          height,
          surfaceBlockId,
          opacity: sample.midOpacity * visibility,
          fidelity: sample.fidelity,
        });
      }

      if (
        sample.wireOpacity > 0.03 &&
        sample.distanceFromFullDetail > 1 &&
        sample.distanceFromFullDetail <= 2 &&
        visibility > 0
      ) {
        wireColumns.push({
          x,
          z,
          minY: WORLD_MIN_Y,
          maxY: Math.max(WORLD_MIN_Y, height),
          opacity: sample.wireOpacity * relevance,
          fidelity: sample.fidelity,
          distanceBand: sample.distanceFromFullDetail,
        });
      }

      if (
        sample.lod === "horizon" &&
        sample.particleOpacity > 0.03 &&
        visibility > 0
      ) {
        const tile = {
          x,
          z,
          opacity: sample.particleOpacity * relevance,
          row: Math.max(1, Math.round(sample.distanceFromFullDetail)),
          emissionWeight: sample.particleOpacity * relevance,
          fidelity: sample.fidelity,
        };
        gridTiles.push(tile);
        particleTiles.push(tile);
      }
    }
  }

  return {
    mode,
    focus: { ...focus },
    cameraPosition: camera ? { ...camera.position } : null,
    cameraForward: camera ? { ...camera.forward } : null,
    renderOrigin: { ...renderOrigin },
    fullDetailBounds,
    lodSamples,
    highDetailCells,
    midDetailColumns,
    wireColumns,
    gridTiles,
    particleTiles,
  };
}
