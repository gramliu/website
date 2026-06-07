import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { useKeyboardState } from "../../adapters/input/keyboard";
import WorldRenderer from "../../adapters/three/world-renderer";
import { createGameState, type GameState } from "../../game/game";
import FringeRenderer from "./fringe/fringe-renderer";
import Player from "./player";
import PlayerCameraFollow from "./player-camera-follow";
import {
  DEFAULT_PLAYER_ROTATION,
  DEFAULT_WORLD_ROTATION,
  useWorldRuntime,
  type WorldMode,
} from "./use-world-runtime";

const ROTATION_SPEED = 0.3;

export type { WorldMode } from "./use-world-runtime";

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
  const {
    activeWorld,
    isProcedural,
    runtimeMode,
    updateFocus,
    playerPosition,
    playerStatePosition,
  } = useWorldRuntime({ worldMode, interactiveMode });
  const gameStateRef = useRef<GameState>(
    createGameState(activeWorld, playerStatePosition)
  );

  function resetPlayer() {
    gameStateRef.current = createGameState(activeWorld, playerStatePosition);
    updateFocus(playerStatePosition);

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
  }, [resetPlayer]);

  useFrame((_, delta) => {
    // Rotate the world
    if (worldRef.current && rotateWorld && !interactiveMode) {
      worldRef.current.rotation.y += delta * ROTATION_SPEED;
    }

    if (isProcedural) {
      updateFocus(gameStateRef.current.player.position);
    }
  });

  useEffect(() => {
    // Reset world rotation
    resetWorld();
  }, [interactiveMode]);

  useEffect(() => {
    gameStateRef.current = createGameState(activeWorld, playerStatePosition);
    updateFocus(playerStatePosition);
    resetPlayer();
  }, [activeWorld, playerStatePosition, runtimeMode, updateFocus]);

  return (
    <group ref={worldRef} scale={[size, size, size]}>
      <PlayerCameraFollow
        enabled={interactiveMode}
        gameStateRef={gameStateRef}
      />
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
