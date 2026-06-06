import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { useKeyboardState } from "../../adapters/input/keyboard";
import WorldRenderer from "../../adapters/three/world-renderer";
import { vec3 } from "../../game/core/math/vec3";
import { createGameState, type GameState } from "../../game/game";
import type { ProceduralRuntimeMode } from "../../game/world/procedural/lod-policy";
import { ProceduralVoxelWorld } from "../../game/world/procedural/procedural-world";
import { VoxelWorld } from "../../game/world/world";
import { loadWorldCellsFromString } from "../../game/world/world-loader";
import type { RenderableWorldQuery } from "../../game/world/world-query";
import FringeRenderer from "./fringe/fringe-renderer";
import Player from "./player";
import worldData from "./world-data";

const worldCells = loadWorldCellsFromString(worldData);
const world = new VoxelWorld(worldCells);
const ROTATION_SPEED = 0.3;

type Vec3 = [number, number, number];
const DEFAULT_PLAYER_POSITION: Vec3 = [9, 6, 1];
const DEFAULT_PLAYER_STATE_POSITION = vec3(9.5, 6, 1.5);
const DEFAULT_PLAYER_ROTATION: Vec3 = [0, 0, 0];
const DEFAULT_WORLD_ROTATION: Vec3 = [0, 0, 0];

export type WorldMode = "static" | "procedural";

interface Props {
  size?: number;
  rotateWorld?: boolean;
  interactiveMode?: boolean;
  showFringe?: boolean;
  worldMode?: WorldMode;
}

/**
 * World map
 */
export default function Map({
  size = 1,
  rotateWorld,
  interactiveMode = false,
  showFringe = false,
  worldMode = "static",
}: Props) {
  const playerRef = useRef<Group>(null);
  const worldRef = useRef<Group>(null);
  const keyControlsRef = useKeyboardState();
  const [, setRenderVersion] = useState(0);
  const proceduralWorld = useMemo(
    () =>
      new ProceduralVoxelWorld({
        seed: 2026,
        mode: "preview",
        centerX: 5,
        centerZ: 5,
        seedCells: worldCells,
      }),
    []
  );
  const isProcedural = worldMode === "procedural";
  const activeWorld: RenderableWorldQuery = isProcedural
    ? proceduralWorld
    : world;
  const proceduralSpawn = proceduralWorld.findSpawnColumn(0, 0);
  const playerPosition = useMemo<Vec3>(
    () =>
      isProcedural
        ? [proceduralSpawn.x, proceduralSpawn.y, proceduralSpawn.z]
        : DEFAULT_PLAYER_POSITION,
    [isProcedural, proceduralSpawn.x, proceduralSpawn.y, proceduralSpawn.z]
  );
  const playerStatePosition = useMemo(
    () =>
      isProcedural
        ? vec3(
            proceduralSpawn.x + 0.5,
            proceduralSpawn.y,
            proceduralSpawn.z + 0.5
          )
        : DEFAULT_PLAYER_STATE_POSITION,
    [isProcedural, proceduralSpawn.x, proceduralSpawn.y, proceduralSpawn.z]
  );
  const runtimeMode: ProceduralRuntimeMode = interactiveMode
    ? "interactive"
    : "preview";
  const gameStateRef = useRef<GameState>(
    createGameState(activeWorld, playerStatePosition)
  );

  function resetPlayer() {
    gameStateRef.current = createGameState(activeWorld, playerStatePosition);

    if (playerRef.current) {
      playerRef.current.position.set(
        playerStatePosition.x,
        playerStatePosition.y,
        playerStatePosition.z
      );
      playerRef.current.rotation.set(
        DEFAULT_PLAYER_ROTATION[0],
        DEFAULT_PLAYER_ROTATION[1],
        DEFAULT_PLAYER_ROTATION[2]
      );
    }
  }

  function resetWorld() {
    if (worldRef.current) {
      worldRef.current.rotation.set(
        DEFAULT_WORLD_ROTATION[0],
        DEFAULT_WORLD_ROTATION[1],
        DEFAULT_WORLD_ROTATION[2]
      );
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "r") {
        event.preventDefault();
        resetPlayer();
        resetWorld();
      }
    };

    window.addEventListener("keydown", handleKeyDown, {
      capture: true,
    });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
  }, []);

  useFrame((_, delta) => {
    // Rotate the world
    if (worldRef.current && rotateWorld && !interactiveMode) {
      worldRef.current.rotation.y += delta * ROTATION_SPEED;
    }

    if (isProcedural) {
      const { position } = gameStateRef.current.player;
      const changed = proceduralWorld.updateFocus(
        position.x,
        position.z,
        runtimeMode
      );
      if (changed) {
        setRenderVersion((version) => version + 1);
      }
    }
  });

  useEffect(() => {
    // Reset world rotation
    resetWorld();
  }, [interactiveMode]);

  useEffect(() => {
    gameStateRef.current = createGameState(activeWorld, playerStatePosition);
    proceduralWorld.updateFocus(
      playerStatePosition.x,
      playerStatePosition.z,
      runtimeMode
    );
    resetPlayer();
  }, [activeWorld, playerStatePosition, proceduralWorld, runtimeMode]);

  return (
    <group ref={worldRef} scale={[size, size, size]}>
      <group position={[-4.5, 0, -4.5]}>
        <WorldRenderer
          world={activeWorld}
          detail={interactiveMode ? "full" : "preview"}
        />
        {showFringe ? (
          <FringeRenderer
            world={activeWorld}
            enableParticles={interactiveMode}
            procedural={isProcedural}
          />
        ) : null}
        <Player
          position={playerPosition}
          animate={!interactiveMode}
          gameStateRef={gameStateRef}
          ref={playerRef}
          interactiveMode={interactiveMode}
          keyControlsRef={keyControlsRef}
        />
      </group>
    </group>
  );
}
