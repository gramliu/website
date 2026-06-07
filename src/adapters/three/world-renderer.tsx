import Block from "../../components/world/block";
import { getRenderableBlockTextures } from "../../components/world/blocks";
import { getBlockDefinition } from "../../game/world/block-registry";
import type { LoadedWorldCell } from "../../game/world/world-loader";
import type { RenderableWorldQuery } from "../../game/world/world-query";

export type WorldRenderDetail = "full" | "preview";

export interface RenderableCellWithOpacity extends LoadedWorldCell {
  opacity?: number;
}

interface Props {
  world: RenderableWorldQuery;
  detail?: WorldRenderDetail;
  cells?: RenderableCellWithOpacity[];
}

const emptyFluidAdjacency = {
  top: false,
  bottom: false,
  north: false,
  south: false,
  east: false,
  west: false,
};

export default function WorldRenderer({
  world,
  detail = "full",
  cells,
}: Props) {
  const renderedCells: RenderableCellWithOpacity[] =
    cells ??
    (detail === "preview"
      ? world.getExposedRenderableCells()
      : world.getRenderableCells());

  return (
    <>
      {renderedCells.map((cell) => {
        if (cell.opacity !== undefined && cell.opacity <= 0.01) {
          return null;
        }

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
            opacity={cell.opacity}
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
