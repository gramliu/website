import { useMemo } from "react";
import type { ProceduralRenderSnapshot } from "../../../game/world/procedural/render-snapshot";
import type { RenderableWorldQuery } from "../../../game/world/world-query";
import { computeFringeLayout, FRINGE_CONFIG } from "./fringe-layout";
import FringeLineField from "./fringe-line-field";
import FringeParticleField from "./fringe-particles";
import { computeProceduralFringeLayout } from "./procedural-fringe-layout";

interface Props {
  world: RenderableWorldQuery;
  enableParticles?: boolean;
  procedural?: boolean;
  snapshot?: ProceduralRenderSnapshot | null;
}

export default function FringeRenderer({
  world,
  enableParticles = true,
  procedural = false,
  snapshot = null,
}: Props) {
  const layout = useMemo(
    () =>
      procedural
        ? computeProceduralFringeLayout(world, snapshot)
        : computeFringeLayout(world),
    [world, procedural, snapshot]
  );
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
      {enableParticles ? (
        <FringeParticleField
          tiles={particleTiles}
          y={layout.gridY}
          focus={layout.focus}
        />
      ) : null}
    </>
  );
}
