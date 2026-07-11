export type WorldQuality = "full" | "lite";
export type WorldTerrainMode = "infinite" | "preview_island";

export interface WorldQualityProfile {
  renderRadius: number;
  prefetchRadius: number;
  prefetchChunksPerFrame: number;
  cacheRadius: number;
  dpr: [number, number];
  shadows: boolean;
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
      shadows: true,
      antialias: true,
    },
    lite: {
      renderRadius: 5,
      prefetchRadius: 8,
      prefetchChunksPerFrame: 1,
      cacheRadius: 10,
      dpr: [1, 1],
      shadows: false,
      antialias: false,
    },
  };

export function getWorldQuality(isDesktop: boolean): WorldQuality {
  return isDesktop ? "full" : "lite";
}

export function getWorldTerrainMode(isDesktop: boolean): WorldTerrainMode {
  return isDesktop ? "infinite" : "preview_island";
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
