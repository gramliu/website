import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { useCameraControls } from "../../adapters/input/camera/context";
import { useKeyboardState } from "../../adapters/input/keyboard";
import WorldRenderer from "../../adapters/three/world-renderer";
import { type Vec3 as GameVec3, vec3 } from "../../game/core/math/vec3";
import { createGameState, type GameState } from "../../game/game";
import { InfiniteWorld } from "../../game/world/infinite-world";
import { TerrainGenerator } from "../../game/world/terrain-generator";
import { VoxelWorld } from "../../game/world/world";
import { loadWorldCellsFromString } from "../../game/world/world-loader";
import FairyLightController from "./effects/FairyLightController";
import { FAIRY_LIGHT_CONFIGS } from "./effects/player-effects";
import { FringeFadeContext } from "./fringe/fringe-fade-context";
import {
  computeFringeLayout,
  computeWindowFringeLayout,
} from "./fringe/fringe-layout";
import FringeRenderer from "./fringe/fringe-renderer";
import Player from "./player";
import {
  getWorldTerrainBehavior,
  WORLD_QUALITY_PROFILES,
  type WorldQuality,
  type WorldTerrainMode,
} from "./quality";
import { useCameraOrbit } from "./useCameraOrbit";
import worldData from "./world-data";

const staticWorld = new VoxelWorld(loadWorldCellsFromString(worldData));
const ROTATION_SPEED = 0.3;

/** Exponential smoothing rate for the camera-follow counter-translation. */
const FOLLOW_SMOOTHING = 6;

// The infinite world is created lazily for an interactive session and released
// when play stops so terrain caches do not survive in the static preview.
let infiniteWorldSingleton: InfiniteWorld | null = null;

function createInfiniteWorld(
  seed = Math.floor(Math.random() * 1_000_000)
): InfiniteWorld {
  return new InfiniteWorld(
    new TerrainGenerator(seed, loadWorldCellsFromString(worldData))
  );
}

function getInfiniteWorld(): InfiniteWorld {
  if (!infiniteWorldSingleton) {
    infiniteWorldSingleton = createInfiniteWorld();
  }
  return infiniteWorldSingleton;
}

function resetInfiniteWorld(): InfiniteWorld {
  infiniteWorldSingleton?.clear();
  infiniteWorldSingleton = createInfiniteWorld();
  return infiniteWorldSingleton;
}

function releaseInfiniteWorld(): void {
  infiniteWorldSingleton?.clear();
  infiniteWorldSingleton = null;
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
  quality?: WorldQuality;
  terrainMode?: WorldTerrainMode;
}

/**
 * World map
 */
export default function Map({
  size = 1,
  rotateWorld,
  interactiveMode = false,
  showFringe = false,
  quality = "full",
  terrainMode = "infinite",
}: Props) {
  const qualityProfile = WORLD_QUALITY_PROFILES[quality];
  const fairyLightConfigs = useMemo(
    () => FAIRY_LIGHT_CONFIGS.slice(0, qualityProfile.fairyLightCount),
    [qualityProfile.fairyLightCount]
  );
  const terrainBehavior = getWorldTerrainBehavior(interactiveMode, terrainMode);
  const playerRef = useRef<Group>(null);
  const worldRef = useRef<Group>(null);
  const followRef = useRef<Group>(null);
  /** Player position when interactive mode began; the camera anchor. */
  const followOriginRef = useRef<GameVec3 | null>(null);
  const cameraInput = useCameraControls();
  const keyControlsRef = useKeyboardState(interactiveMode && !cameraInput);
  const gameStateRef = useRef<GameState>(
    createGameState(staticWorld, DEFAULT_PLAYER_STATE_POSITION)
  );
  const windowCenterRef = useRef<WindowCenter | null>(null);
  const [windowCenter, setWindowCenter] = useState<WindowCenter | null>(null);
  const [worldRevision, setWorldRevision] = useState(0);

  function syncPlayerTransform() {
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

  function resetSession() {
    resetWorld();

    if (terrainBehavior.usesInfiniteWorld) {
      const world = resetInfiniteWorld();
      gameStateRef.current = createGameState(
        world,
        DEFAULT_PLAYER_STATE_POSITION
      );
      followOriginRef.current = { ...DEFAULT_PLAYER_STATE_POSITION };
      followRef.current?.position.set(0, 0, 0);
      const center = {
        x: Math.floor(DEFAULT_PLAYER_STATE_POSITION.x),
        z: Math.floor(DEFAULT_PLAYER_STATE_POSITION.z),
      };
      windowCenterRef.current = center;
      setWindowCenter(center);
      world.prefetchAround(
        center.x,
        center.z,
        qualityProfile.prefetchRadius,
        qualityProfile.prefetchChunksPerFrame
      );
      setWorldRevision((revision) => revision + 1);
    } else {
      gameStateRef.current = createGameState(
        staticWorld,
        DEFAULT_PLAYER_STATE_POSITION
      );
    }

    syncPlayerTransform();
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
        resetSession();
      }
    };

    window.addEventListener("keydown", handleKeyDown, {
      capture: true,
    });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
  }, [interactiveMode, qualityProfile, terrainBehavior.usesInfiniteWorld]);

  useFrame((_, delta) => {
    // Rotate the world
    if (worldRef.current && rotateWorld && !interactiveMode) {
      worldRef.current.rotation.y += delta * ROTATION_SPEED;
    }

    if (!terrainBehavior.usesInfiniteWorld) {
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

    // Keep a bounded ring of chunks ahead of the player so rendering never
    // generates terrain synchronously or retains an unbounded session cache.
    const world = getInfiniteWorld();
    world.prefetchAround(
      cellX,
      cellZ,
      qualityProfile.prefetchRadius,
      qualityProfile.prefetchChunksPerFrame
    );
    world.evictOutsideRadius(cellX, cellZ, qualityProfile.cacheRadius);

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
  }, -1);

  useCameraOrbit(playerRef, interactiveMode);

  useEffect(() => {
    if (terrainBehavior.usesInfiniteWorld) {
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
      // The infinite view starts from a stable orientation before following
      // the player-centered render window.
      resetWorld();
      return;
    }

    if (!interactiveMode) {
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
      releaseInfiniteWorld();
      resetWorld();
      return;
    }

    // Preview-island play freezes the current idle rotation. It retains the
    // static map, camera-relative fringe, and bounded collision world.
    if (gameStateRef.current.world !== staticWorld) {
      gameStateRef.current = createGameState(
        staticWorld,
        DEFAULT_PLAYER_STATE_POSITION
      );
      syncPlayerTransform();
    }
    followOriginRef.current = null;
    followRef.current?.position.set(0, 0, 0);
    windowCenterRef.current = null;
    setWindowCenter(null);
    releaseInfiniteWorld();
  }, [interactiveMode, terrainBehavior.usesInfiniteWorld]);

  const effectiveCenter = useMemo(() => {
    if (!terrainBehavior.usesInfiniteWorld) {
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
  }, [terrainBehavior.usesInfiniteWorld, windowCenter]);

  const activeWorld = terrainBehavior.usesInfiniteWorld
    ? getInfiniteWorld()
    : staticWorld;

  const renderCells = useMemo(() => {
    if (terrainBehavior.usesInfiniteWorld && effectiveCenter) {
      return getInfiniteWorld().getCellsInWindow(
        effectiveCenter.x,
        effectiveCenter.z,
        qualityProfile.renderRadius
      );
    }
    return staticWorld.getRenderableCells();
  }, [
    effectiveCenter,
    qualityProfile.renderRadius,
    terrainBehavior.usesInfiniteWorld,
    worldRevision,
  ]);

  const fringeLayout = useMemo(() => {
    if (!showFringe) {
      return null;
    }
    if (terrainBehavior.usesInfiniteWorld && effectiveCenter) {
      return computeWindowFringeLayout(
        getInfiniteWorld(),
        effectiveCenter.x,
        effectiveCenter.z,
        qualityProfile.renderRadius,
        renderCells
      );
    }
    return computeFringeLayout(staticWorld);
  }, [
    showFringe,
    effectiveCenter,
    qualityProfile.renderRadius,
    renderCells,
    terrainBehavior.usesInfiniteWorld,
    worldRevision,
  ]);

  return (
    <FringeFadeContext.Provider value={showFringe}>
      <group ref={worldRef} scale={[size, size, size]}>
        <group ref={followRef}>
          <group position={[-4.5, 0, -4.5]}>
            <WorldRenderer
              key={worldRevision}
              world={activeWorld}
              cells={renderCells}
            />
            {fringeLayout ? (
              <FringeRenderer
                layout={fringeLayout}
                radialFade={terrainBehavior.usesRadialFringe}
                focusSourceRef={
                  terrainBehavior.usesRadialFringe ? playerRef : undefined
                }
                quality={quality}
              />
            ) : null}
            <FairyLightController
              enabled={
                terrainBehavior.usesInfiniteWorld &&
                showFringe &&
                qualityProfile.fairyLightCount > 0
              }
              configs={fairyLightConfigs}
              playerRef={playerRef}
              world={activeWorld}
            />
            <Player
              position={DEFAULT_PLAYER_POSITION}
              animate={!interactiveMode}
              gameStateRef={gameStateRef}
              ref={playerRef}
              interactiveMode={interactiveMode}
              keyControlsRef={keyControlsRef}
              worldRevision={worldRevision}
            />
          </group>
        </group>
      </group>
    </FringeFadeContext.Provider>
  );
}
