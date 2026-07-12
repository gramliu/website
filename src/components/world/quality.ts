export type WorldQuality = "full" | "lite";
export type WorldTerrainMode = "infinite" | "preview_island";

export interface WorldQualityProfile {
  renderRadius: number;
  prefetchRadius: number;
  prefetchChunksPerFrame: number;
  cacheRadius: number;
  dpr: [number, number];
  antialias: boolean;
}

export const WORLD_QUALITY_PROFILES: Record<WorldQuality, WorldQualityProfile> =
  {
    full: {
      renderRadius: 13,
      prefetchRadius: 30,
      prefetchChunksPerFrame: 2,
      cacheRadius: 32,
      dpr: [1, 2],
      antialias: true,
    },
    lite: {
      renderRadius: 5,
      prefetchRadius: 8,
      prefetchChunksPerFrame: 1,
      cacheRadius: 10,
      dpr: [1, 1],
      antialias: false,
    },
  };

export function getWorldQuality(
  hasSideBySideHeroLayout: boolean
): WorldQuality {
  return hasSideBySideHeroLayout ? "full" : "lite";
}

export function parseWorldQualityOverride(
  value: unknown
): WorldQuality | undefined {
  return value === "full" || value === "lite" ? value : undefined;
}

export function getWorldTerrainMode(
  hasSideBySideHeroLayout: boolean
): WorldTerrainMode {
  return hasSideBySideHeroLayout ? "infinite" : "preview_island";
}

export interface WorldTerrainBehavior {
  usesInfiniteWorld: boolean;
  followsPlayer: boolean;
  usesRadialFringe: boolean;
}

export function getWorldTerrainBehavior(
  interactiveMode: boolean,
  terrainMode: WorldTerrainMode
): WorldTerrainBehavior {
  const usesInfiniteWorld = interactiveMode && terrainMode === "infinite";
  return {
    usesInfiniteWorld,
    followsPlayer: usesInfiniteWorld,
    usesRadialFringe: usesInfiniteWorld,
  };
}
