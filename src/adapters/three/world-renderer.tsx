import Block, { type FaceOcclusion } from "../../components/world/block";
import { getRenderableBlockTextures } from "../../components/world/blocks";
import {
  getBlockDefinition,
  isBlockFluid,
  isBlockOpaque,
} from "../../game/world/block-registry";
import type { WorldQuery } from "../../game/world/world";
import type { LoadedWorldCell } from "../../game/world/world-loader";

interface Props {
  world: WorldQuery;
  /**
   * Cells to render: the full static map in preview mode, or the moving
   * player-centered window (already exposure-culled) in interactive mode.
   */
  cells: LoadedWorldCell[];
}

/**
 * A face is occluded (skipped) when the neighbor on that side is opaque, or,
 * for fluids, when the neighbor is the same fluid. Culling interior faces
 * keeps the fringe fade a surface "shell" instead of an x-ray of block
 * interiors, and removes underwater walls between water and the ground.
 */
function computeOccludedFaces(
  world: WorldQuery,
  cell: LoadedWorldCell,
  isFluid: boolean
): FaceOcclusion {
  const occludes = (x: number, y: number, z: number): boolean => {
    const neighborId = world.getBlockIdAtCell(x, y, z);
    if (isBlockOpaque(neighborId)) {
      return true;
    }
    return isFluid && isBlockFluid(neighborId);
  };

  const { x, y, z } = cell;
  return {
    top: occludes(x, y + 1, z),
    bottom: occludes(x, y - 1, z),
    north: occludes(x, y, z - 1),
    south: occludes(x, y, z + 1),
    east: occludes(x + 1, y, z),
    west: occludes(x - 1, y, z),
  };
}

export default function WorldRenderer({ world, cells }: Props) {
  return (
    <>
      {cells.map((cell) => {
        const block = getBlockDefinition(cell.id);
        const texture = getRenderableBlockTextures(block.renderKey);

        if (!texture) {
          return null;
        }

        return (
          <Block
            key={`${cell.x}-${cell.y}-${cell.z}`}
            position={[cell.x, cell.y, cell.z]}
            texture={texture}
            id={cell.id}
            occludedFaces={computeOccludedFaces(world, cell, block.fluid)}
          />
        );
      })}
    </>
  );
}
