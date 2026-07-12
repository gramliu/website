import { describe, expect, it } from "bun:test";
import { FAIRY_LIGHT_CONFIGS } from "./player-effects";

describe("fairy light configuration", () => {
  it("configures terrain reveal and physical illumination independently", () => {
    for (const config of FAIRY_LIGHT_CONFIGS) {
      expect(config.revealStrength).toBeGreaterThan(0);
      expect(config.pointLightIntensity).toBeGreaterThan(0);
      expect(config.pointLightDistance).toBeGreaterThan(config.revealRadius);
    }

    const fairy = FAIRY_LIGHT_CONFIGS[0];
    expect(fairy?.revealStrength).not.toBe(fairy?.pointLightIntensity);
  });
});
