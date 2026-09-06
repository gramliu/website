import { describe, expect, it } from "bun:test";
import {
  getWorldQuality,
  getWorldTerrainBehavior,
  getWorldTerrainMode,
  parseWorldQualityOverride,
  resolveWorldQuality,
  WORLD_QUALITY_PROFILES,
} from "./quality";
import { shouldDowngradeQuality, summarizeFrameTimes } from "./runtime";

describe("world quality profiles", () => {
  it("uses lite quality on mobile with a bounded render and cache radius", () => {
    const lite = WORLD_QUALITY_PROFILES.lite;
    expect(getWorldQuality(false)).toBe("lite");
    expect(getWorldTerrainMode(false)).toBe("preview_island");
    expect(lite.renderRadius).toBe(9);
    expect(lite.prefetchRadius).toBe(16);
    expect(lite.cacheRadius).toBeGreaterThanOrEqual(lite.prefetchRadius);
    expect(lite.shadows).toBe(true);
    expect(lite.shadowMapSize).toBe(512);
    expect(lite.antialias).toBe(false);
    expect(lite.dpr).toEqual([1, 1]);
    expect(lite.fairyLightCount).toBe(1);
  });

  it("keeps full quality for the side-by-side hero layout", () => {
    expect(getWorldQuality(true)).toBe("full");
    expect(getWorldTerrainMode(true)).toBe("infinite");
    expect(WORLD_QUALITY_PROFILES.full.renderRadius).toBe(13);
    expect(WORLD_QUALITY_PROFILES.full.shadows).toBe(true);
    expect(WORLD_QUALITY_PROFILES.full.shadowMapSize).toBe(1024);
    expect(WORLD_QUALITY_PROFILES.full.fairyLightCount).toBe(4);
  });

  it("keeps preview-island play out of the infinite terrain path", () => {
    expect(getWorldTerrainBehavior(true, "preview_island")).toEqual({
      usesInfiniteWorld: false,
      followsPlayer: false,
      usesRadialFringe: false,
    });
    expect(getWorldTerrainBehavior(true, "infinite")).toEqual({
      usesInfiniteWorld: true,
      followsPlayer: true,
      usesRadialFringe: true,
    });
  });
});

describe("world quality overrides", () => {
  it("accepts only single, supported quality values", () => {
    expect(parseWorldQualityOverride("full")).toBe("full");
    expect(parseWorldQualityOverride("lite")).toBe("lite");
    expect(parseWorldQualityOverride(undefined)).toBeUndefined();
    expect(parseWorldQualityOverride("unsupported")).toBeUndefined();
    expect(parseWorldQualityOverride(["full", "lite"])).toBeUndefined();
  });
});

describe("world quality policy", () => {
  it("honors lite quality for idle and island previews", () => {
    expect(resolveWorldQuality("lite", false, "preview_island")).toBe("lite");
    expect(resolveWorldQuality("lite", false, "infinite")).toBe("lite");
    expect(resolveWorldQuality("lite", true, "preview_island")).toBe("lite");
  });

  it("preserves the requested quality for interactive infinite terrain", () => {
    expect(resolveWorldQuality("full", true, "infinite")).toBe("full");
    expect(resolveWorldQuality("lite", true, "infinite")).toBe("lite");
  });
});

describe("world performance policy", () => {
  it("downgrades only after a sustained severe frame-time sample", () => {
    const severe = summarizeFrameTimes(Array.from({ length: 40 }, () => 110));
    expect(shouldDowngradeQuality(severe)).toBe(true);

    const short = summarizeFrameTimes(Array.from({ length: 39 }, () => 110));
    expect(shouldDowngradeQuality(short)).toBe(false);
  });
});

describe("resource constraints", () => {
  it("starts low-memory desktops in lite without requiring a memory API", () => {
    expect(getWorldQuality(true, 2)).toBe("lite");
    expect(getWorldQuality(true, 4)).toBe("lite");
    expect(getWorldQuality(true, 8)).toBe("full");
    expect(getWorldQuality(true, undefined)).toBe("full");
    expect(getWorldQuality(false, 8)).toBe("lite");
  });
  it("detects starvation even when fewer than forty frames can render", () => {
    expect(
      shouldDowngradeQuality(summarizeFrameTimes(Array(12).fill(400)))
    ).toBe(true);
    expect(shouldDowngradeQuality(summarizeFrameTimes([500]))).toBe(false);
    expect(
      shouldDowngradeQuality(summarizeFrameTimes(Array(300).fill(16)))
    ).toBe(false);
  });
});
