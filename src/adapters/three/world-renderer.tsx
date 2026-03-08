import Block from "../../components/world/block";
import { getRenderableBlockTextures } from "../../components/world/blocks";
import { getBlockDefinition } from "../../game/world/block-registry";
import type { VoxelWorld } from "../../game/world/world";

interface Props {
  world: VoxelWorld;
}

const emptyFluidAdjacency = {
  top: false,
  bottom: false,
  north: false,
  south: false,
  east: false,
  west: false,
};

export default function WorldRenderer({ world }: Props) {
  return (
    <>
      {world.getRenderableCells().map((cell) => {
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
