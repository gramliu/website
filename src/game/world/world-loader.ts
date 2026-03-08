export interface LoadedWorldCell {
  x: number;
  y: number;
  z: number;
  id: number;
}

export function loadWorldCellsFromString(source: string): LoadedWorldCell[] {
  const cells: LoadedWorldCell[] = [];
  const layers = source.trimEnd().split("\n");

  let y = 0;
  let z = 0;

  for (const line of layers) {
    if (line.length === 0) {
      y++;
      z = 0;
      continue;
    }

    const blockIds = line.split(" ");
    for (let x = 0; x < blockIds.length; x++) {
      const rawId = blockIds[x];
      const id = Number.parseInt(rawId, 10);

      if (Number.isNaN(id) || id === 0) {
        continue;
      }

      cells.push({ x, y, z, id });
    }

    z++;
  }

  return cells;
}
