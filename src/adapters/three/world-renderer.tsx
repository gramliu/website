import Block from "../../components/world/block";
import { getRenderableBlockTextures } from "../../components/world/blocks";
import { getBlockDefinition } from "../../game/world/block-registry";
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

const emptyFluidAdjacency = {
  top: false,
  bottom: false,
  north: false,
  south: false,
  east: false,
  west: false,
};

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
            adjacentBlocks={
              block.renderKey === "water"
                ? world.getFluidAdjacency(cell.x, cell.y, cell.z)
                : emptyFluidAdjacency
            }
          />
        );
      })}
    </>
  );
}
