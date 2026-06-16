import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  Vector3,
} from "three";
import type { WorldQuery } from "../../../game/world/world";
import { updateFringeRevealLightUniforms } from "../fringe/fringe-depth-fade";
import {
  FAIRY_LIGHT_CONFIGS,
  type FairyLightConfig,
  type FairyLightPathConfig,
  MAX_FAIRY_ORBIT_RADIUS,
  type PlayerRevealSource,
} from "./player-effects";

interface Props {
  playerRef: React.RefObject<Group | null>;
  world: WorldQuery;
  enabled: boolean;
  configs?: FairyLightConfig[];
}

interface OrbitState {
  angle: number;
  currentPosition: Vector3 | null;
  trail: Vector3[];
  trailElapsed: number;
}

interface PathSample {
  x: number;
  z: number;
}

type FairyLightPathSampler = (
  path: FairyLightPathConfig,
  angle: number
) => PathSample;

const FAIRY_COLLIDER_HALF_WIDTH = 0.22;
const FAIRY_COLLIDER_HEIGHT = 0.44;
const FAIRY_SURFACE_CLEARANCE = 1.05;
const FAIRY_POSITION_SMOOTHING = 7;
const PIXIE_DUST_TRAIL_LENGTH = 18;
const PIXIE_DUST_SAMPLE_INTERVAL = 0.055;

const scratchCandidate = new Vector3();

function clampOrbitRadius(radius: number): number {
  return Math.min(radius, MAX_FAIRY_ORBIT_RADIUS);
}

function rotateSample(sample: PathSample, rotation = 0): PathSample {
  if (rotation === 0) {
    return sample;
  }

  const cosRotation = Math.cos(rotation);
  const sinRotation = Math.sin(rotation);
  return {
    x: sample.x * cosRotation - sample.z * sinRotation,
    z: sample.x * sinRotation + sample.z * cosRotation,
  };
}

function clampSample(sample: PathSample): PathSample {
  const radius = Math.hypot(sample.x, sample.z);
  if (radius <= MAX_FAIRY_ORBIT_RADIUS || radius === 0) {
    return sample;
  }

  const scale = MAX_FAIRY_ORBIT_RADIUS / radius;
  return {
    x: sample.x * scale,
    z: sample.z * scale,
  };
}

const FAIRY_LIGHT_PATHS: Record<
  FairyLightPathConfig["kind"],
  FairyLightPathSampler
> = {
  semiEllipse: (path, angle) => {
    if (path.kind !== "semiEllipse") {
      return { x: 0, z: 0 };
    }

    return rotateSample(
      clampSample({
        x: Math.cos(angle) * clampOrbitRadius(path.radiusX),
        z: Math.sin(angle) * clampOrbitRadius(path.radiusZ),
      }),
      path.rotation
    );
  },
  rose: (path, angle) => {
    if (path.kind !== "rose") {
      return { x: 0, z: 0 };
    }

    const outerRadius = clampOrbitRadius(path.radius);
    const innerRadiusRatio = Math.max(0, Math.min(0.95, path.innerRadiusRatio));
    const wave = (1 + Math.cos(path.petalCount * angle)) / 2;
    const radius =
      outerRadius * (innerRadiusRatio + (1 - innerRadiusRatio) * wave);
    return rotateSample(
      {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
      },
      path.rotation
    );
  },
  epicycloid: (path, angle) => {
    if (path.kind !== "epicycloid") {
      return { x: 0, z: 0 };
    }

    const ratio = (path.fixedRadius + path.rollingRadius) / path.rollingRadius;
    return rotateSample(
      clampSample({
        x:
          path.scale *
          ((path.fixedRadius + path.rollingRadius) * Math.cos(angle) -
            path.rollingRadius * Math.cos(ratio * angle)),
        z:
          path.scale *
          ((path.fixedRadius + path.rollingRadius) * Math.sin(angle) -
            path.rollingRadius * Math.sin(ratio * angle)),
      }),
      path.rotation
    );
  },
};

function sampleFairyPath(path: FairyLightPathConfig, angle: number): PathSample {
  return FAIRY_LIGHT_PATHS[path.kind](path, angle);
}

function createOrbitState(config: FairyLightConfig): OrbitState {
  return {
    angle: config.phase,
    currentPosition: null,
    trail: [],
    trailElapsed: 0,
  };
}

function getTerrainGroundY(
  world: WorldQuery,
  x: number,
  z: number
): number | null {
  const groundHeightWorld = world as WorldQuery & {
    getGroundHeight?: (x: number, z: number) => number;
  };

  if (typeof groundHeightWorld.getGroundHeight === "function") {
    return groundHeightWorld.getGroundHeight(x, z);
  }

  const highestSolidY = world.getHighestSolidCell(x, z);
  if (highestSolidY === null) {
    return null;
  }

  for (let y = highestSolidY; y >= 0; y -= 1) {
    const renderKey = world.getBlockAtCell(x, y, z).renderKey;
    if (
      renderKey === "grass" ||
      renderKey === "dirt" ||
      renderKey === "stone" ||
      renderKey === "sand"
    ) {
      return y;
    }
  }

  return highestSolidY;
}

function getGroundFollowingY(
  world: WorldQuery,
  x: number,
  z: number,
  fallbackY: number,
  heightOffset: number,
  bob: number
): number {
  const groundY = getTerrainGroundY(world, Math.floor(x), Math.floor(z));
  if (groundY === null) {
    return fallbackY + heightOffset + bob;
  }

  return groundY + FAIRY_SURFACE_CLEARANCE + heightOffset + bob;
}

function collidesAt(world: WorldQuery, position: Vector3): boolean {
  return world.collidesAABB({
    min: {
      x: position.x - FAIRY_COLLIDER_HALF_WIDTH,
      y: position.y,
      z: position.z - FAIRY_COLLIDER_HALF_WIDTH,
    },
    max: {
      x: position.x + FAIRY_COLLIDER_HALF_WIDTH,
      y: position.y + FAIRY_COLLIDER_HEIGHT,
      z: position.z + FAIRY_COLLIDER_HALF_WIDTH,
    },
  });
}

function setCandidatePosition(
  target: Vector3,
  world: WorldQuery,
  playerPosition: Vector3,
  offsetX: number,
  offsetZ: number,
  heightOffset: number,
  bob: number
): Vector3 {
  const x = playerPosition.x + offsetX;
  const z = playerPosition.z + offsetZ;
  target.set(
    x,
    getGroundFollowingY(world, x, z, playerPosition.y, heightOffset, bob),
    z
  );
  return target;
}

function resolveFairyPosition(
  world: WorldQuery,
  playerPosition: Vector3,
  sample: PathSample,
  config: FairyLightConfig,
  bob: number,
  previousPosition: Vector3 | null
): Vector3 {
  const orbitRadius = Math.hypot(sample.x, sample.z);
  const tangentX = orbitRadius === 0 ? 1 : -sample.z / orbitRadius;
  const tangentZ = orbitRadius === 0 ? 0 : sample.x / orbitRadius;
  const inwardX = orbitRadius === 0 ? 0 : -sample.x / orbitRadius;
  const inwardZ = orbitRadius === 0 ? 0 : -sample.z / orbitRadius;
  const candidateOffsets: [number, number][] = [
    [0, 0],
    [tangentX * 0.75, tangentZ * 0.75],
    [-tangentX * 0.75, -tangentZ * 0.75],
    [tangentX * 1.5, tangentZ * 1.5],
    [-tangentX * 1.5, -tangentZ * 1.5],
    [inwardX * 0.75, inwardZ * 0.75],
    [inwardX * 1.5, inwardZ * 1.5],
  ];

  for (const [slideX, slideZ] of candidateOffsets) {
    setCandidatePosition(
      scratchCandidate,
      world,
      playerPosition,
      sample.x + slideX,
      sample.z + slideZ,
      config.heightOffset,
      bob
    );
    if (!collidesAt(world, scratchCandidate)) {
      return scratchCandidate;
    }
  }

  return previousPosition ?? scratchCandidate;
}

export default function FairyLightController({
  playerRef,
  world,
  enabled,
  configs = FAIRY_LIGHT_CONFIGS,
}: Props) {
  const lightRefs = useRef<(Group | null)[]>([]);
  const dustRefs = useRef<(Mesh | null)[][]>([]);
  const dustMaterialRefs = useRef<(MeshBasicMaterial | null)[][]>([]);
  const orbitStates = useRef(configs.map(createOrbitState));
  const worldPosition = useMemo(() => new Vector3(), []);
  const revealSources = useMemo<PlayerRevealSource[]>(
    () =>
      configs.map((config) => ({
        id: config.id,
        kind: "fairyLight",
        position: new Vector3(),
        radius: config.revealRadius,
        intensity: config.intensity,
        falloffStart: config.falloffStart,
        color: config.color,
      })),
    [configs]
  );

  useEffect(() => {
    if (!enabled) {
      updateFringeRevealLightUniforms([]);
    }
    return () => updateFringeRevealLightUniforms([]);
  }, [enabled]);

  useFrame((_, delta) => {
    if (!enabled || !playerRef.current) {
      updateFringeRevealLightUniforms([]);
      return;
    }

    const playerPosition = playerRef.current.position;

    configs.forEach((config, index) => {
      const state = orbitStates.current[index];
      if (!state) {
        return;
      }

      state.angle += config.speed * delta;
      const sample = sampleFairyPath(config.path, state.angle);
      const bob =
        config.bobAmplitude * Math.sin(state.angle * config.bobFrequency);
      const targetPosition = resolveFairyPosition(
        world,
        playerPosition,
        sample,
        config,
        bob,
        state.currentPosition
      );

      if (!state.currentPosition) {
        state.currentPosition = targetPosition.clone();
        state.trail = [state.currentPosition.clone()];
      } else {
        const blend = 1 - Math.exp(-FAIRY_POSITION_SMOOTHING * delta);
        state.currentPosition.lerp(targetPosition, blend);
      }

      const currentPosition = state.currentPosition;
      if (!currentPosition) {
        return;
      }

      state.trailElapsed += delta;
      if (state.trailElapsed >= PIXIE_DUST_SAMPLE_INTERVAL) {
        state.trailElapsed = 0;
        state.trail.unshift(currentPosition.clone());
        state.trail.length = Math.min(
          state.trail.length,
          PIXIE_DUST_TRAIL_LENGTH
        );
      }

      const light = lightRefs.current[index];
      if (light) {
        light.position.copy(currentPosition);
        light.getWorldPosition(worldPosition);
        revealSources[index].position.copy(worldPosition);

        const dustMeshes = dustRefs.current[index] ?? [];
        const dustMaterials = dustMaterialRefs.current[index] ?? [];
        for (
          let dustIndex = 0;
          dustIndex < PIXIE_DUST_TRAIL_LENGTH;
          dustIndex += 1
        ) {
          const dust = dustMeshes[dustIndex];
          const dustMaterial = dustMaterials[dustIndex];
          const trailPosition = state.trail[dustIndex];
          if (!dust || !dustMaterial || !trailPosition) {
            if (dust) {
              dust.visible = false;
            }
            continue;
          }

          const age = dustIndex / PIXIE_DUST_TRAIL_LENGTH;
          const twinkle = 0.72 + 0.28 * Math.sin(state.angle * 5 + dustIndex);
          dust.visible = true;
          dust.position.copy(trailPosition).sub(currentPosition);
          dust.scale.setScalar((0.28 - age * 0.18) * twinkle);
          dustMaterial.opacity = Math.max(
            0,
            (1 - age) ** 1.7 * 0.72 * twinkle
          );
        }
      }
    });

    updateFringeRevealLightUniforms(revealSources);
  });

  if (!enabled) {
    return null;
  }

  return (
    <group>
      {configs.map((config, index) => {
        const color = new Color(config.color);
        return (
          <group
            key={config.id}
            ref={(group) => {
              lightRefs.current[index] = group;
            }}
          >
            <mesh>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color={color}
                depthWrite={false}
                opacity={0.14}
                toneMapped={false}
                transparent
              />
            </mesh>
            {Array.from({ length: PIXIE_DUST_TRAIL_LENGTH }, (_, dustIndex) => (
              <mesh
                key={`${config.id}-dust-${dustIndex}`}
                ref={(mesh) => {
                  dustRefs.current[index] ??= [];
                  dustRefs.current[index][dustIndex] = mesh;
                }}
                visible={false}
              >
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshBasicMaterial
                  ref={(material) => {
                    dustMaterialRefs.current[index] ??= [];
                    dustMaterialRefs.current[index][dustIndex] = material;
                  }}
                  blending={AdditiveBlending}
                  color={color}
                  depthWrite={false}
                  opacity={0}
                  toneMapped={false}
                  transparent
                />
              </mesh>
            ))}
            <pointLight
              color={color}
              distance={config.revealRadius * 2.2}
              intensity={config.intensity * 0.32}
            />
          </group>
        );
      })}
    </group>
  );
}
