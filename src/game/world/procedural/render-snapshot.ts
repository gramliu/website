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

      const relevance = viewRelevance(x, z, focus, camera);
      lodSamples.push({ x, z, ...sample });

      if (sample.blockOpacity > 0.03) {
        const opacity =
          mode === "preview" && sample.distanceFromFullDetail === 0
            ? 1
            : sample.blockOpacity;
        highDetailCells.push(
          ...world.getRenderableColumnCells(x, z, "preview").map((cell) => ({
            ...cell,
            opacity,
            fidelity: sample.fidelity,
          }))
        );
      }

      const height = world.getHighestSolidCell(x, z) ?? WORLD_MIN_Y;
      const surfaceBlockId = world.getBlockIdAtCell(x, height, z);

      if (sample.midOpacity > 0.03) {
        midDetailColumns.push({
          x,
          z,
          y: WORLD_MIN_Y,
          height,
          surfaceBlockId,
          opacity: sample.midOpacity,
          fidelity: sample.fidelity,
        });
      }

      if (sample.wireOpacity > 0.03) {
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

      if (sample.lod === "horizon" && sample.particleOpacity > 0.03) {
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
