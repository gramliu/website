import { useEffect, useMemo } from "react";
import type { Group } from "three";
import { setFringeRadialFade } from "./fringe-depth-fade";
import { FRINGE_CONFIG, type FringeLayout } from "./fringe-layout";
import FringeLineField from "./fringe-line-field";
import FringeParticleField from "./fringe-particles";

interface Props {
  layout: FringeLayout;
  /** Radial (player-centered) fade for the moving interactive window. */
  radialFade?: boolean;
  /** Object whose position the fade focus tracks (the player). */
  focusSourceRef?: React.RefObject<Group | null>;
}

export default function FringeRenderer({
  layout,
  radialFade = false,
  focusSourceRef,
}: Props) {
  useEffect(() => {
    setFringeRadialFade(radialFade);
    return () => {
      setFringeRadialFade(false);
    };
  }, [radialFade]);

  // Grid tiles and particles sit on a fixed y=0 plane. In interactive mode the
  // render window moves in XZ while terrain sits several blocks higher, so that
  // plane projects as detached wireframes at the bottom of the screen. The
  // block wireframe fringe (line kind 0) still covers the solid→wireframe LOD.
  const lineLayout = useMemo(
    () => (radialFade ? { ...layout, gridTiles: [] } : layout),
    [layout, radialFade]
  );

  const particleTiles = useMemo(
    () =>
      radialFade
        ? []
        : layout.gridTiles.filter(
            (tile) => tile.row >= FRINGE_CONFIG.particleMinRow
          ),
    [layout.gridTiles, radialFade]
  );

  return (
    <>
      <FringeLineField layout={lineLayout} focusSourceRef={focusSourceRef} />
      {particleTiles.length > 0 ? (
        <FringeParticleField
          tiles={particleTiles}
          y={layout.gridY}
          focus={layout.focus}
        />
      ) : null}
    </>
  );
}
