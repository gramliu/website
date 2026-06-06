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
