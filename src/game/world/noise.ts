/**
 * Seeded 2D Perlin gradient noise and fractal Brownian motion used by the
 * infinite terrain generator. Everything here is deterministic for a given
 * seed so chunks can be regenerated identically in any order.
 */

export type Noise2D = (x: number, z: number) => number;

/** Small, fast, seedable PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRADIENTS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [Math.SQRT1_2, Math.SQRT1_2],
  [-Math.SQRT1_2, Math.SQRT1_2],
  [Math.SQRT1_2, -Math.SQRT1_2],
  [-Math.SQRT1_2, -Math.SQRT1_2],
];

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Classic 2D Perlin gradient noise with a seed-shuffled permutation table.
 * Output is roughly in [-1, 1] and zero at integer lattice points.
 */
export function createPerlinNoise2D(seed: number): Noise2D {
  const random = mulberry32(seed);
  const table = Array.from({ length: 256 }, (_, index) => index);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [table[i], table[j]] = [table[j], table[i]];
  }

  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = table[i & 255];
  }

  function gradDot(hash: number, dx: number, dz: number): number {
    const gradient = GRADIENTS[hash & 7];
    return gradient[0] * dx + gradient[1] * dz;
  }

  return (x, z) => {
    const x0 = Math.floor(x);
    const z0 = Math.floor(z);
    const dx = x - x0;
    const dz = z - z0;
    const xi = x0 & 255;
    const zi = z0 & 255;

    const aa = perm[perm[xi] + zi];
    const ba = perm[perm[xi + 1] + zi];
    const ab = perm[perm[xi] + zi + 1];
    const bb = perm[perm[xi + 1] + zi + 1];

    const u = fade(dx);
    const v = fade(dz);

    const n0 = lerp(gradDot(aa, dx, dz), gradDot(ba, dx - 1, dz), u);
    const n1 = lerp(gradDot(ab, dx, dz - 1), gradDot(bb, dx - 1, dz - 1), u);

    // Raw Perlin output is within [-sqrt(2)/2, sqrt(2)/2]; rescale to ~[-1, 1].
    return lerp(n0, n1, v) * Math.SQRT2;
  };
}

export interface FbmOptions {
  octaves: number;
  lacunarity: number;
  persistence: number;
  frequency: number;
}

/**
 * Fractal Brownian motion over seeded Perlin octaves, normalized to ~[-1, 1].
 * Inputs are world-space coordinates; `frequency` scales them per octave.
 */
export function createFbmNoise2D(
  seed: number,
  { octaves, lacunarity, persistence, frequency }: FbmOptions
): Noise2D {
  const octaveNoises = Array.from({ length: octaves }, (_, index) =>
    createPerlinNoise2D(seed + index * 1013)
  );

  let totalAmplitude = 0;
  let amplitude = 1;
  for (let i = 0; i < octaves; i++) {
    totalAmplitude += amplitude;
    amplitude *= persistence;
  }

  return (x, z) => {
    let value = 0;
    let octaveAmplitude = 1;
    let octaveFrequency = frequency;

    for (let i = 0; i < octaves; i++) {
      value +=
        octaveNoises[i](x * octaveFrequency, z * octaveFrequency) *
        octaveAmplitude;
      octaveAmplitude *= persistence;
      octaveFrequency *= lacunarity;
    }

    return value / totalAmplitude;
  };
}

/**
 * Deterministic, decorrelated per-cell hash in [0, 1). Used for sparse
 * feature placement (e.g. trees) where neighboring cells must not correlate.
 */
export function hashCell(seed: number, x: number, z: number): number {
  let h = (seed ^ Math.imul(x, 0x27d4eb2d) ^ Math.imul(z, 0x165667b1)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
