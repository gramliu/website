import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { VoxelWorld } from "../../../game/world/world";
import { computeFringeLayout, FRINGE_CONFIG } from "./fringe-layout";
import FringeParticleField from "./fringe-particles";
import GridTile from "./grid-tile";
import WireframeBlock from "./wireframe-block";

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
  const dashOffsetRef = useRef(0);

  useFrame((_, delta) => {
    dashOffsetRef.current += delta * FRINGE_CONFIG.dashSpeed;
  });

  return (
    <>
      {layout.wireframes.map(({ x, y, z, opacity }) => (
        <WireframeBlock
          key={`wf-${x}-${y}-${z}`}
          x={x}
          y={y}
          z={z}
          opacity={opacity}
        />
      ))}
      {layout.gridTiles.map(({ x, z, opacity, row }) => (
        <GridTile
          key={`gt-${x}-${z}`}
          x={x}
          z={z}
          y={layout.gridY}
          opacity={opacity}
          row={row}
          dashOffsetRef={dashOffsetRef}
          rowDashStagger={FRINGE_CONFIG.rowDashStagger}
        />
      ))}
      <FringeParticleField tiles={particleTiles} y={layout.gridY} />
    </>
  );
}
