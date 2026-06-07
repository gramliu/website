import type { AABB } from "../core/math/aabb";
import type { CellCoord, CollisionKind, WorldBounds } from "../core/types";
import type { BlockDefinition } from "./block-registry";
import type { FluidAdjacency } from "./world";
import type { LoadedWorldCell } from "./world-loader";

export interface WorldQuery {
  getBlockIdAtCell(x: number, y: number, z: number): number;
  getBlockAtCell(x: number, y: number, z: number): BlockDefinition;
  getCollisionKind(x: number, y: number, z: number): CollisionKind;
  isCellSolid(x: number, y: number, z: number): boolean;
  isCellFluid(x: number, y: number, z: number): boolean;
  getFluidAdjacency(x: number, y: number, z: number): FluidAdjacency;
  getHighestSolidCell(x: number, z: number): number | null;
  getOverlappingCells(aabb: AABB): CellCoord[];
  collidesAABB(aabb: AABB): boolean;
}

export interface RenderableWorldQuery extends WorldQuery {
  getBounds(): WorldBounds;
  getRenderableCells(): LoadedWorldCell[];
  getExposedRenderableCells(): LoadedWorldCell[];
}
