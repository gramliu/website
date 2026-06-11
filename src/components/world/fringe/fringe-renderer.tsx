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

  const particleTiles = useMemo(
    () =>
      layout.gridTiles.filter(
        (tile) => tile.row >= FRINGE_CONFIG.particleMinRow
      ),
    [layout.gridTiles]
  );
  return (
    <>
      <FringeLineField layout={layout} focusSourceRef={focusSourceRef} />
      <FringeParticleField
        tiles={particleTiles}
        y={layout.gridY}
        focus={layout.focus}
      />
    </>
  );
}
