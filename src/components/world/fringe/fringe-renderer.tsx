import { useMemo } from "react";
import type { VoxelWorld } from "../../../game/world/world";
import { computeFringeLayout, FRINGE_CONFIG } from "./fringe-layout";
import FringeLineField from "./fringe-line-field";
import FringeParticleField from "./fringe-particles";

interface Props {
  world: VoxelWorld;
}

export default function FringeRenderer({ world }: Props) {
  const layout = useMemo(() => computeFringeLayout(world), [world]);
  const particleTiles = useMemo(
    () =>
      layout.gridTiles.filter(
        (tile) => tile.row >= FRINGE_CONFIG.particleMinRow
      ),
    [layout.gridTiles]
  );
  return (
    <>
      <FringeLineField layout={layout} />
      <FringeParticleField
        tiles={particleTiles}
        y={layout.gridY}
        focus={layout.focus}
      />
    </>
  );
}
