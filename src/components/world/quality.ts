export type WorldQuality = "full" | "lite";
export type WorldTerrainMode = "infinite" | "preview_island";

export interface WorldQualityProfile {
  renderRadius: number;
  prefetchRadius: number;
  prefetchChunksPerFrame: number;
  cacheRadius: number;
  dpr: [number, number];
  shadows: boolean;
  shadowMapSize: number;
  antialias: boolean;
  fairyLightCount: number;
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
      shadowMapSize: 1024,
      antialias: true,
      fairyLightCount: 4,
    },
    lite: {
      renderRadius: 9,
      prefetchRadius: 16,
      prefetchChunksPerFrame: 1,
      cacheRadius: 18,
      dpr: [1, 1],
      shadows: true,
      shadowMapSize: 512,
      antialias: false,
      fairyLightCount: 1,
    },
  };

export function getWorldQuality(
  hasSideBySideHeroLayout: boolean,
  deviceMemory?: number,
  canInteract = true
): WorldQuality {
  // The bounded island can retain full visuals without allocating infinite terrain.
  if (!canInteract) return "full";
  return hasSideBySideHeroLayout && !(deviceMemory && deviceMemory <= 4)
    ? "full"
    : "lite";
}

export function parseWorldQualityOverride(
  value: unknown
): WorldQuality | undefined {
  return value === "full" || value === "lite" ? value : undefined;
}

export function resolveWorldQuality(
  requestedQuality: WorldQuality,
  _interactiveMode: boolean,
  _terrainMode: WorldTerrainMode
): WorldQuality {
  return requestedQuality;
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
