import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { useKeyboardState } from "../../adapters/input/keyboard";
import WorldRenderer from "../../adapters/three/world-renderer";
import { vec3 } from "../../game/core/math/vec3";
import { createGameState, type GameState } from "../../game/game";
import { VoxelWorld } from "../../game/world/world";
import { loadWorldCellsFromString } from "../../game/world/world-loader";
import Player from "./player";
import worldData from "./world-data";

const world = new VoxelWorld(loadWorldCellsFromString(worldData));
const ROTATION_SPEED = 0.3;

type Vec3 = [number, number, number];
const DEFAULT_PLAYER_POSITION: Vec3 = [9, 6, 1];
const DEFAULT_PLAYER_STATE_POSITION = vec3(9.5, 6, 1.5);
const DEFAULT_PLAYER_ROTATION: Vec3 = [0, 0, 0];
const DEFAULT_WORLD_ROTATION: Vec3 = [0, 0, 0];

interface Props {
  size?: number;
  rotateWorld?: boolean;
  interactiveMode?: boolean;
}

/**
 * World map
 */
export default function Map({
  size = 1,
  rotateWorld,
  interactiveMode = false,
}: Props) {
  const playerRef = useRef<Group>(null);
  const worldRef = useRef<Group>(null);
  const keyControlsRef = useKeyboardState();
  const gameStateRef = useRef<GameState>(
    createGameState(world, DEFAULT_PLAYER_STATE_POSITION)
  );

  function resetPlayer() {
    gameStateRef.current = createGameState(
      world,
      DEFAULT_PLAYER_STATE_POSITION
    );

    if (playerRef.current) {
      playerRef.current.position.set(
        DEFAULT_PLAYER_STATE_POSITION.x,
        DEFAULT_PLAYER_STATE_POSITION.y,
        DEFAULT_PLAYER_STATE_POSITION.z
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
  });

  useEffect(() => {
    // Reset world rotation
    resetWorld();
  }, [interactiveMode]);

  return (
    <group ref={worldRef} scale={[size, size, size]}>
      <group position={[-4.5, 0, -4.5]}>
        <WorldRenderer world={world} />
        <Player
          position={DEFAULT_PLAYER_POSITION}
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
