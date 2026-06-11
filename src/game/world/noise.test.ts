import { describe, expect, it } from "bun:test";
import { createFbmNoise2D, createPerlinNoise2D, hashCell } from "./noise";

describe("createPerlinNoise2D", () => {
  it("is deterministic for the same seed", () => {
    const a = createPerlinNoise2D(42);
    const b = createPerlinNoise2D(42);

    for (let i = 0; i < 50; i++) {
      const x = i * 0.73 - 17.5;
      const z = i * -1.31 + 4.2;
      expect(a(x, z)).toBe(b(x, z));
    }
  });

  it("differs across seeds", () => {
    const a = createPerlinNoise2D(1);
    const b = createPerlinNoise2D(2);

    let identical = true;
    for (let i = 0; i < 20; i++) {
      if (a(i * 0.37, i * 0.59) !== b(i * 0.37, i * 0.59)) {
        identical = false;
        break;
      }
    }
    expect(identical).toBe(false);
  });

  it("stays within [-1, 1] including negative coordinates", () => {
    const noise = createPerlinNoise2D(7);
    for (let i = -200; i <= 200; i++) {
      const value = noise(i * 0.193, -i * 0.317);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe("createFbmNoise2D", () => {
  const options = {
    octaves: 3,
    lacunarity: 2,
    persistence: 0.5,
    frequency: 1 / 24,
  };

  it("is deterministic and normalized to ~[-1, 1]", () => {
    const a = createFbmNoise2D(9, options);
    const b = createFbmNoise2D(9, options);

    for (let i = -100; i <= 100; i++) {
      const value = a(i * 1.7, i * -0.9);
      expect(value).toBe(b(i * 1.7, i * -0.9));
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("is continuous: adjacent samples differ by a small amount", () => {
    const noise = createFbmNoise2D(11, options);
    for (let i = -100; i < 100; i++) {
      const delta = Math.abs(noise(i + 1, 13) - noise(i, 13));
      expect(delta).toBeLessThan(0.3);
    }
  });
});

describe("hashCell", () => {
  it("is deterministic and uniform-ish in [0, 1)", () => {
    let sum = 0;
    const samples = 4000;
    for (let i = 0; i < samples; i++) {
      const value = hashCell(5, i - 2000, i * 31);
      expect(value).toBe(hashCell(5, i - 2000, i * 31));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      sum += value;
    }
    expect(sum / samples).toBeGreaterThan(0.4);
    expect(sum / samples).toBeLessThan(0.6);
  });

  it("decorrelates neighboring cells", () => {
    const a = hashCell(5, 10, 10);
    const b = hashCell(5, 11, 10);
    const c = hashCell(5, 10, 11);
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});
