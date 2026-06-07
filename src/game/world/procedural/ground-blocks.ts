export const STONE = 1;
export const GRASS = 2;
export const DIRT = 3;
export const WATER = 9;
export const SAND = 12;

export type GroundBlockId =
  | typeof STONE
  | typeof GRASS
  | typeof DIRT
  | typeof WATER
  | typeof SAND;

export function isGroundBlockId(id: number): id is GroundBlockId {
  return (
    id === STONE || id === GRASS || id === DIRT || id === WATER || id === SAND
  );
}

export function isDryGroundBlockId(id: number): boolean {
  return id === STONE || id === GRASS || id === DIRT || id === SAND;
}
