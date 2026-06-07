import type { WorldBounds } from "../../core/types";

export type ChunkLod = "high" | "mid" | "wire" | "horizon" | "unloaded";
export const FULL_DETAIL_SIZE_XZ = 10;
export type ProceduralRuntimeMode = "preview" | "interactive";

export interface LodBudget {
  highDetailRadius: number;
  midDetailRadius: number;
  wireRadius: number;
  horizonRadius: number;
  collisionRadius: number;
  maxCachedChunks: number;
  particlesEnabled: boolean;
  shadowsEnabled: boolean;
}

export interface LodSample {
  lod: ChunkLod;
  fidelity: number;
  blockOpacity: number;
  midOpacity: number;
  wireOpacity: number;
  particleOpacity: number;
  distanceFromFullDetail: number;
}

export const PROCEDURAL_LOD_BUDGETS: Record<ProceduralRuntimeMode, LodBudget> =
  {
    preview: {
      highDetailRadius: 0,
      midDetailRadius: 1,
      wireRadius: 2,
      horizonRadius: 3,
      collisionRadius: 0,
      maxCachedChunks: 25,
      particlesEnabled: false,
      shadowsEnabled: false,
    },
    interactive: {
      highDetailRadius: 1,
      midDetailRadius: 2,
      wireRadius: 3,
      horizonRadius: 4,
      collisionRadius: 2,
      maxCachedChunks: 81,
      particlesEnabled: true,
      shadowsEnabled: true,
    },
  };

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function columnDistanceFromBounds(
  x: number,
  z: number,
  bounds: WorldBounds
): number {
  const dx =
    x < bounds.min.x
      ? bounds.min.x - x
      : x > bounds.max.x
        ? x - bounds.max.x
        : 0;
  const dz =
    z < bounds.min.z
      ? bounds.min.z - z
      : z > bounds.max.z
        ? z - bounds.max.z
        : 0;
  return Math.max(dx, dz);
}

export function classifyChunkLod(
  distanceChunks: number,
  budget: LodBudget
): ChunkLod {
  if (distanceChunks <= budget.highDetailRadius) {
    return "high";
  }

  if (distanceChunks <= budget.midDetailRadius) {
    return "mid";
  }

  if (distanceChunks <= budget.wireRadius) {
    return "wire";
  }

  if (distanceChunks <= budget.horizonRadius) {
    return "horizon";
  }

  return "unloaded";
}

export function sampleColumnLod(
  x: number,
  z: number,
  bounds: WorldBounds,
  budget: LodBudget
): LodSample {
  const distanceFromFullDetail = columnDistanceFromBounds(x, z, bounds);
  const midEnd = Math.max(3, budget.midDetailRadius * 4);
  const wireEnd = Math.max(midEnd + 4, budget.wireRadius * 4 + 2);
  const horizonEnd = Math.max(wireEnd + 4, budget.horizonRadius * 4 + 4);
  const fidelity = 1 - smoothstep(0, wireEnd, distanceFromFullDetail);
  const blockOpacity =
    distanceFromFullDetail === 0 ? 1 : smoothstep(0.62, 0.98, fidelity);
  const midOpacity = clamp01(1 - Math.abs(fidelity - 0.55) / 0.45);
  const wireOpacity = 1 - smoothstep(0.25, 0.72, fidelity);
  const particleOpacity = 1 - smoothstep(0, 0.25, fidelity);
  let lod: ChunkLod = "unloaded";

  if (distanceFromFullDetail === 0 || blockOpacity > 0.55) {
    lod = "high";
  } else if (distanceFromFullDetail <= midEnd) {
    lod = "mid";
  } else if (distanceFromFullDetail <= wireEnd) {
    lod = "wire";
  } else if (distanceFromFullDetail <= horizonEnd) {
    lod = "horizon";
  }

  return {
    lod,
    fidelity,
    blockOpacity,
    midOpacity,
    wireOpacity,
    particleOpacity,
    distanceFromFullDetail,
  };
}

export function getColumnLodSearchRadius(budget: LodBudget): number {
  return Math.max(8, budget.horizonRadius * 4 + 4);
}

export function chunkChebyshevDistance(
  chunkX: number,
  chunkZ: number,
  centerChunkX: number,
  centerChunkZ: number
): number {
  return Math.max(
    Math.abs(chunkX - centerChunkX),
    Math.abs(chunkZ - centerChunkZ)
  );
}
