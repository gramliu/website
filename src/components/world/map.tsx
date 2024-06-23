import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";
import Player from "./player";
import { World } from "./world";

const world = new World();
const ROTATION_SPEED = 0.3;
const ROTATE_WORLD = false;

/**
 * World map
 */
export default function Map() {
  const playerRef = useRef<Group>(null);
  const worldRef = useRef<Group>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "r") {
        if (playerRef.current) {
          // Reset player's position
          playerRef.current.position.set(9, 2, 1);
          playerRef.current.rotation.set(0, 0, 0);
        }
        if (worldRef.current) {
          // Reset world's rotation
          worldRef.current.rotation.set(0, 0, 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
  }, []);

  useFrame((_, delta) => {
    // Rotate the world
    if (worldRef.current && ROTATE_WORLD) {
      worldRef.current.rotation.y += delta * ROTATION_SPEED;
    }
  });

  return (
    <group ref={worldRef}>
      <group position={[-4.5, 0, -4.5]}>
        {...world.blocks}
        <Player
          position={[9, 2, 1]}
          animate={true}
          world={world}
          ref={playerRef}
        />
      </group>
    </group>
  );
}
