import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { useKeyboardState } from "../../adapters/input/keyboard";
import WorldRenderer from "../../adapters/three/world-renderer";
import { type Vec3 as GameVec3, vec3 } from "../../game/core/math/vec3";
import { createGameState, type GameState } from "../../game/game";
import { InfiniteWorld } from "../../game/world/infinite-world";
import {
  DEFAULT_WORLD_SEED,
  TerrainGenerator,
} from "../../game/world/terrain-generator";
import { VoxelWorld } from "../../game/world/world";
import { loadWorldCellsFromString } from "../../game/world/world-loader";
import { FringeFadeContext } from "./fringe/fringe-fade-context";
import {
  computeFringeLayout,
  computeWindowFringeLayout,
} from "./fringe/fringe-layout";
import FringeRenderer from "./fringe/fringe-renderer";
import Player from "./player";
import worldData from "./world-data";

const staticWorld = new VoxelWorld(loadWorldCellsFromString(worldData));
const ROTATION_SPEED = 0.3;

/**
 * Solid render radius (Chebyshev, in cells) around the player in interactive
 * mode. Sized so the window edge sits past
 * `FRINGE_CONFIG.radialDepthBands.solidFadeEnd` and blocks always
 * mount/unmount fully faded: the window can shift with the player without
 * any visible pop.
 */
const RENDER_RADIUS = 8;
/** Chunks are pre-generated this many blocks ahead of the player. */
const PREFETCH_RADIUS = 24;
/** Per-frame budget for background chunk generation. */
const PREFETCH_CHUNKS_PER_FRAME = 2;
/** Exponential smoothing rate for the camera-follow counter-translation. */
const FOLLOW_SMOOTHING = 6;

// The infinite world is created lazily on the first interactive session and
// reused afterwards; generation is deterministic, so the terrain is identical
// every time.
let infiniteWorldSingleton: InfiniteWorld | null = null;
function getInfiniteWorld(): InfiniteWorld {
  if (!infiniteWorldSingleton) {
    infiniteWorldSingleton = new InfiniteWorld(
      new TerrainGenerator(
        DEFAULT_WORLD_SEED,
        loadWorldCellsFromString(worldData)
      )
    );
  }
  return infiniteWorldSingleton;
}

type Vec3 = [number, number, number];
const DEFAULT_PLAYER_POSITION: Vec3 = [9, 6, 1];
const DEFAULT_PLAYER_STATE_POSITION = vec3(9.5, 6, 1.5);
const DEFAULT_PLAYER_ROTATION: Vec3 = [0, 0, 0];
const DEFAULT_WORLD_ROTATION: Vec3 = [0, 0, 0];

interface WindowCenter {
  x: number;
  z: number;
}

interface Props {
  size?: number;
  rotateWorld?: boolean;
  interactiveMode?: boolean;
  showFringe?: boolean;
}

/**
 * World map
 */
export default function Map({
  size = 1,
  rotateWorld,
  interactiveMode = false,
  showFringe = false,
}: Props) {
  const playerRef = useRef<Group>(null);
  const worldRef = useRef<Group>(null);
  const followRef = useRef<Group>(null);
  /** Player position when interactive mode began; the camera anchor. */
  const followOriginRef = useRef<GameVec3 | null>(null);
  const keyControlsRef = useKeyboardState();
  const gameStateRef = useRef<GameState>(
    createGameState(staticWorld, DEFAULT_PLAYER_STATE_POSITION)
  );
  const windowCenterRef = useRef<WindowCenter | null>(null);
  const [windowCenter, setWindowCenter] = useState<WindowCenter | null>(null);

  function resetPlayer() {
    const activeWorld = interactiveMode ? getInfiniteWorld() : staticWorld;
    gameStateRef.current = createGameState(
      activeWorld,
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

    if (interactiveMode) {
      const center = {
        x: Math.floor(DEFAULT_PLAYER_STATE_POSITION.x),
        z: Math.floor(DEFAULT_PLAYER_STATE_POSITION.z),
      };
      windowCenterRef.current = center;
      setWindowCenter(center);
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
  }, [interactiveMode]);

  useFrame((_, delta) => {
    // Rotate the world
    if (worldRef.current && rotateWorld && !interactiveMode) {
      worldRef.current.rotation.y += delta * ROTATION_SPEED;
    }

    if (!interactiveMode) {
      return;
    }

    const playerPosition = gameStateRef.current.player.position;

    // Shift the render window when the player crosses a cell boundary. All
    // visibility is shader-faded from the continuous player position, so the
    // discrete swap only ever touches fully transparent blocks.
    const cellX = Math.floor(playerPosition.x);
    const cellZ = Math.floor(playerPosition.z);
    const center = windowCenterRef.current;
    if (!center || center.x !== cellX || center.z !== cellZ) {
      const next = { x: cellX, z: cellZ };
      windowCenterRef.current = next;
      setWindowCenter(next);
    }

    // Keep a ring of chunks generated well past the fringe so the window
    // never has to generate terrain on the render path.
    getInfiniteWorld().prefetchAround(
      cellX,
      cellZ,
      PREFETCH_RADIUS,
      PREFETCH_CHUNKS_PER_FRAME
    );

    // Counter-translate the world so the camera stays centered on the player.
    const origin = followOriginRef.current;
    if (origin && followRef.current) {
      const followPosition = followRef.current.position;
      const blend = 1 - Math.exp(-FOLLOW_SMOOTHING * delta);
      followPosition.x +=
        (origin.x - playerPosition.x - followPosition.x) * blend;
      followPosition.y +=
        (origin.y - playerPosition.y - followPosition.y) * blend;
      followPosition.z +=
        (origin.z - playerPosition.z - followPosition.z) * blend;
    }
  });

  useEffect(() => {
    if (interactiveMode) {
      // Branch into the infinite world from wherever the player stands; the
      // island terrain is embedded verbatim, so nothing visibly changes.
      gameStateRef.current = {
        ...gameStateRef.current,
        world: getInfiniteWorld(),
      };
      const playerPosition = gameStateRef.current.player.position;
      followOriginRef.current = { ...playerPosition };
      const center = {
        x: Math.floor(playerPosition.x),
        z: Math.floor(playerPosition.z),
      };
      windowCenterRef.current = center;
      setWindowCenter(center);
    } else {
      // Back to the static preview island: reset the player so autoplay's
      // assumptions hold, and undo the camera-follow translation.
      gameStateRef.current = createGameState(
        staticWorld,
        DEFAULT_PLAYER_STATE_POSITION
      );
      if (playerRef.current) {
        playerRef.current.position.set(
          DEFAULT_PLAYER_STATE_POSITION.x,
          DEFAULT_PLAYER_STATE_POSITION.y,
          DEFAULT_PLAYER_STATE_POSITION.z
        );
        playerRef.current.rotation.set(0, 0, 0);
      }
      followOriginRef.current = null;
      followRef.current?.position.set(0, 0, 0);
      windowCenterRef.current = null;
      setWindowCenter(null);
    }

    // Reset world rotation
    resetWorld();
  }, [interactiveMode]);

  const effectiveCenter = useMemo(() => {
    if (!interactiveMode) {
      return null;
    }
    if (windowCenter) {
      return windowCenter;
    }
    // First interactive render before the effect commits the window center.
    const playerPosition = gameStateRef.current.player.position;
    return {
      x: Math.floor(playerPosition.x),
      z: Math.floor(playerPosition.z),
    };
  }, [interactiveMode, windowCenter]);

  const activeWorld = effectiveCenter ? getInfiniteWorld() : staticWorld;

  const renderCells = useMemo(() => {
    if (effectiveCenter) {
      return getInfiniteWorld().getCellsInWindow(
        effectiveCenter.x,
        effectiveCenter.z,
        RENDER_RADIUS
      );
    }
    return staticWorld.getRenderableCells();
  }, [effectiveCenter]);

  const fringeLayout = useMemo(() => {
    if (!showFringe) {
      return null;
    }
    if (effectiveCenter) {
      return computeWindowFringeLayout(
        getInfiniteWorld(),
        effectiveCenter.x,
        effectiveCenter.z,
        RENDER_RADIUS,
        renderCells
      );
    }
    return computeFringeLayout(staticWorld);
  }, [showFringe, effectiveCenter, renderCells]);

  return (
    <FringeFadeContext.Provider value={showFringe}>
      <group ref={worldRef} scale={[size, size, size]}>
        <group ref={followRef}>
          <group position={[-4.5, 0, -4.5]}>
            <WorldRenderer world={activeWorld} cells={renderCells} />
            {fringeLayout ? (
              <FringeRenderer
                layout={fringeLayout}
                radialFade={interactiveMode}
                focusSourceRef={interactiveMode ? playerRef : undefined}
              />
            ) : null}
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
      </group>
    </FringeFadeContext.Provider>
  );
}
