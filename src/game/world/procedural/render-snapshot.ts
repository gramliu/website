import type { WorldBounds } from "../../core/types";
import type { LoadedWorldCell } from "../world-loader";
import type { ProceduralRuntimeMode } from "./lod-policy";
import type { ProceduralVoxelWorld } from "./procedural-world";

export interface RenderOrigin {
  x: number;
  y: number;
  z: number;
}

export interface ProceduralRenderSnapshot {
  mode: ProceduralRuntimeMode;
  focus: RenderOrigin;
  renderOrigin: RenderOrigin;
  fullDetailBounds: WorldBounds;
  highDetailCells: LoadedWorldCell[];
}

export interface ProceduralRenderSnapshotOptions {
  world: ProceduralVoxelWorld;
  mode: ProceduralRuntimeMode;
  focus: RenderOrigin;
  renderOrigin?: RenderOrigin;
}

export function createProceduralRenderSnapshot({
  world,
  mode,
  focus,
  renderOrigin = { x: 0, y: 0, z: 0 },
}: ProceduralRenderSnapshotOptions): ProceduralRenderSnapshot {
  return {
    mode,
    focus: { ...focus },
    renderOrigin: { ...renderOrigin },
    fullDetailBounds: world.getFullDetailBounds(),
    highDetailCells:
      mode === "preview"
        ? world.getExposedRenderableCells()
        : world.getRenderableCells(),
  };
}
