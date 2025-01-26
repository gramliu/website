import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";
import Player from "./player";
import { World } from "./world";
import { useKeyControls } from "./keycontrols";

const world = new World();
const ROTATION_SPEED = 0.3;

type Vec3 = [number, number, number];
const DEFAULT_PLAYER_POSITION: Vec3 = [9, 6, 1];
// const DEFAULT_PLAYER_POSITION: Vec3 = [9, 3, 5];
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
  const keyControlsRef = useKeyControls();

  function resetPlayer() {
    if (playerRef.current) {
      playerRef.current.position.set(
        DEFAULT_PLAYER_POSITION[0],
        DEFAULT_PLAYER_POSITION[1],
        DEFAULT_PLAYER_POSITION[2]
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
        resetPlayer();
        resetWorld();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        {...world.blocks}
        <Player
          position={DEFAULT_PLAYER_POSITION}
          animate={!interactiveMode}
          world={world}
          ref={playerRef}
          interactiveMode={interactiveMode}
          keyControlsRef={keyControlsRef}
        />
      </group>
    </group>
  );
}
