import { useCallback, useMemo, useState } from "react";
import { type Vec3 as StateVec3, vec3 } from "../../game/core/math/vec3";
import type { ProceduralRuntimeMode } from "../../game/world/procedural/lod-policy";
import { ProceduralWorldRuntime } from "../../game/world/procedural/procedural-runtime";
import { StarterRegion } from "../../game/world/procedural/starter-region";
import { VoxelWorld } from "../../game/world/world";
import { loadWorldCellsFromString } from "../../game/world/world-loader";
import type { RenderableWorldQuery } from "../../game/world/world-query";
import worldData from "./world-data";

export type WorldMode = "static" | "procedural";
export type Vec3 = [number, number, number];

export const DEFAULT_PLAYER_POSITION: Vec3 = [9, 6, 1];
export const DEFAULT_PLAYER_STATE_POSITION = vec3(9.5, 6, 1.5);
export const DEFAULT_PLAYER_ROTATION: Vec3 = [0, 0, 0];
export const DEFAULT_WORLD_ROTATION: Vec3 = [0, 0, 0];

const staticWorldCells = loadWorldCellsFromString(worldData);
const starterRegion = new StarterRegion(staticWorldCells);
const staticWorld = new VoxelWorld(staticWorldCells);

interface UseWorldRuntimeOptions {
  worldMode: WorldMode;
  interactiveMode: boolean;
}

interface FocusPosition {
  x: number;
  y: number;
  z: number;
}

export function useWorldRuntime({
  worldMode,
  interactiveMode,
}: UseWorldRuntimeOptions) {
  const [snapshotVersion, setSnapshotVersion] = useState(0);
  const proceduralRuntime = useMemo(
    () =>
      new ProceduralWorldRuntime({
        seed: 2026,
        mode: "preview",
        previewCenterX: 5,
        previewCenterZ: 5,
        starterRegion,
      }),
    []
  );
  const isProcedural = worldMode === "procedural";
  const runtimeMode: ProceduralRuntimeMode = interactiveMode
    ? "interactive"
    : "preview";
  const activeWorld: RenderableWorldQuery = isProcedural
    ? proceduralRuntime.world
    : staticWorld;

  const updateFocus = useCallback(
    (position: FocusPosition) => {
      if (!isProcedural) {
        return;
      }

      const changed = proceduralRuntime.updateFocus(position, runtimeMode);
      if (changed) {
        setSnapshotVersion((version) => version + 1);
      }
    },
    [isProcedural, proceduralRuntime, runtimeMode]
  );

  const renderSnapshot = useMemo(
    () => (isProcedural ? proceduralRuntime.createSnapshot() : null),
    [isProcedural, proceduralRuntime, snapshotVersion]
  );

  return {
    activeWorld,
    isProcedural,
    runtimeMode,
    renderSnapshot,
    updateFocus,
    playerPosition: DEFAULT_PLAYER_POSITION,
    playerStatePosition: DEFAULT_PLAYER_STATE_POSITION as StateVec3,
  };
}
