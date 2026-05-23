import type { FringeGridTile } from "./fringe-layout";

export function computeOutwardVector(
  x: number,
  z: number,
  centerX: number,
  centerZ: number
): [number, number] {
  const dx = x + 0.5 - centerX;
  const dz = z + 0.5 - centerZ;
  const len = Math.hypot(dx, dz) || 1;
  return [dx / len, dz / len];
}

export function randomPointOnTileEdge(
  x: number,
  z: number
): [number, number, number] {
  const edge = Math.floor(Math.random() * 4);
  const t = Math.random();

  switch (edge) {
    case 0:
      return [x + t, 0, z];
    case 1:
      return [x + 1, 0, z + t];
    case 2:
      return [x + 1 - t, 0, z + 1];
    default:
      return [x, 0, z + 1 - t];
  }
}

export function pickWeightedTile(tiles: FringeGridTile[]): FringeGridTile {
  const totalWeight = tiles.reduce((sum, tile) => sum + tile.emissionWeight, 0);
  let roll = Math.random() * totalWeight;

  for (const tile of tiles) {
    roll -= tile.emissionWeight;
    if (roll <= 0) {
      return tile;
    }
  }

  return tiles[tiles.length - 1];
}

export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
