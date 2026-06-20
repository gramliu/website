import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  type Group,
  LinearFilter,
  type Mesh,
  type MeshBasicMaterial,
  NormalBlending,
  Vector3,
} from "three";
import type { WorldQuery } from "../../../game/world/world";
import { updateFringeRevealLightUniforms } from "../fringe/fringe-depth-fade";
import {
  FAIRY_LIGHT_CONFIGS,
  type FairyLightConfig,
  MAX_FAIRY_SWARM_RADIUS,
  type PlayerRevealSource,
} from "./player-effects";

interface Props {
  playerRef: React.RefObject<Group | null>;
  world: WorldQuery;
  enabled: boolean;
  configs?: FairyLightConfig[];
  onRevealSourcesChange?: (sources: PlayerRevealSource[]) => void;
}

interface PixieDustParticle {
  position: Vector3;
  seed: number;
  size: number;
}

interface FairySwarmState {
  angle: number;
  currentPosition: Vector3 | null;
  velocity: Vector3;
  anchorOffset: Vector3;
  targetAnchorOffset: Vector3;
  curiosityElapsed: number;
  nextCuriosityChange: number;
  noiseSeed: number;
  previousDustPosition: Vector3 | null;
  trail: PixieDustParticle[];
  trailElapsed: number;
  elapsed: number;
  sampleCount: number;
}

interface HorizontalSample {
  x: number;
  z: number;
}

const FAIRY_COLLIDER_HALF_WIDTH = 0.22;
const FAIRY_COLLIDER_HEIGHT = 0.44;
const FAIRY_SURFACE_CLEARANCE = 1.05;
const PIXIE_DUST_TRAIL_LENGTH = 96;
const PIXIE_DUST_PARTICLES_PER_SAMPLE = 5;
const PIXIE_DUST_SAMPLE_INTERVAL = 0.04;
const PIXIE_DUST_SIDE_SPREAD = 0.48;
const PIXIE_DUST_VERTICAL_SPREAD = 0.32;
const PIXIE_DUST_BACK_SPREAD = 0.72;
const GROUND_GLOW_RADIUS_SCALE = 0.42;
const GROUND_GLOW_BASE_OPACITY = 0.46;
const FAIRY_POINT_LIGHT_DISTANCE_SCALE = 1.35;
const FAIRY_POINT_LIGHT_INTENSITY_SCALE = 0.18;

const scratchCandidate = new Vector3();
const scratchDustDirection = new Vector3();
const scratchDustSide = new Vector3();
const scratchDriftOffset = new Vector3();
const scratchOrbitOffset = new Vector3();
const scratchTrailOffset = new Vector3();
const scratchTarget = new Vector3();
const scratchPlayerVelocity = new Vector3();

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function seededSigned(seed: number): number {
  return seededUnit(seed) * 2 - 1;
}

function createGroundGlowAlphaMap(): CanvasTexture | null {
  if (typeof document === "undefined") {
    return null;
  }

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const center = size / 2;
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.82)");
  gradient.addColorStop(0.58, "rgba(255,255,255,0.28)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function smoothNoise(seed: number, time: number): number {
  const whole = Math.floor(time);
  const fraction = time - whole;
  const eased = fraction * fraction * (3 - 2 * fraction);
  const previous = seededUnit(seed + whole);
  const next = seededUnit(seed + whole + 1);
  return previous + (next - previous) * eased;
}

function clampHorizontalOffset(offset: Vector3): Vector3 {
  const radius = Math.hypot(offset.x, offset.z);
  if (radius <= MAX_FAIRY_SWARM_RADIUS || radius === 0) {
    return offset;
  }

  const scale = MAX_FAIRY_SWARM_RADIUS / radius;
  offset.x *= scale;
  offset.z *= scale;
  return offset;
}

function createAnchorOffset(config: FairyLightConfig, seed: number): Vector3 {
  const angle = config.phase + seededSigned(seed) * 0.42;
  const radius = config.anchorRadius * (0.82 + seededUnit(seed + 1) * 0.36);
  return clampHorizontalOffset(
    new Vector3(
      Math.cos(angle) * radius,
      config.anchorHeight,
      Math.sin(angle) * radius
    )
  );
}

function scheduleCuriosity(config: FairyLightConfig, seed: number): number {
  return (
    config.curiosityIntervalMin +
    seededUnit(seed) *
      (config.curiosityIntervalMax - config.curiosityIntervalMin)
  );
}

function sampleDriftOffset(
  target: Vector3,
  config: FairyLightConfig,
  state: FairySwarmState
): Vector3 {
  const time = state.elapsed * config.driftSpeed;
  target.set(
    (smoothNoise(state.noiseSeed, time) - 0.5) * 2 * config.driftAmount,
    (smoothNoise(state.noiseSeed + 31, time * 0.85) - 0.5) *
      config.driftAmount *
      0.55,
    (smoothNoise(state.noiseSeed + 67, time * 1.07) - 0.5) *
      2 *
      config.driftAmount
  );
  return target;
}

function sampleWeakOrbitOffset(
  target: Vector3,
  config: FairyLightConfig,
  state: FairySwarmState
): Vector3 {
  target.set(
    Math.cos(state.angle) * config.anchorRadius * config.orbitBias,
    0,
    Math.sin(state.angle) * config.anchorRadius * config.orbitBias
  );
  return target;
}

function createFairySwarmState(
  config: FairyLightConfig,
  index: number
): FairySwarmState {
  const noiseSeed = (index + 1) * 97 + config.phase * 13;
  const anchorOffset = createAnchorOffset(config, noiseSeed);
  return {
    angle: config.phase,
    currentPosition: null,
    velocity: new Vector3(),
    anchorOffset,
    targetAnchorOffset: anchorOffset.clone(),
    curiosityElapsed: 0,
    nextCuriosityChange: scheduleCuriosity(config, noiseSeed + 11),
    noiseSeed,
    previousDustPosition: null,
    trail: [],
    trailElapsed: 0,
    elapsed: 0,
    sampleCount: 0,
  };
}

function appendPixieDustSpray(
  state: FairySwarmState,
  fairyIndex: number
): void {
  const currentPosition = state.currentPosition;
  if (!currentPosition) {
    return;
  }

  const previousDustPosition = state.previousDustPosition ?? currentPosition;
  scratchDustDirection.subVectors(currentPosition, previousDustPosition);
  if (scratchDustDirection.lengthSq() < 0.0001) {
    scratchDustDirection.set(0, 0, 1);
  } else {
    scratchDustDirection.normalize();
  }
  scratchDustSide.set(-scratchDustDirection.z, 0, scratchDustDirection.x);
  if (scratchDustSide.lengthSq() < 0.0001) {
    scratchDustSide.set(1, 0, 0);
  } else {
    scratchDustSide.normalize();
  }

  for (let index = 0; index < PIXIE_DUST_PARTICLES_PER_SAMPLE; index += 1) {
    const speedBoost = Math.min(1.45, state.velocity.length() * 0.28);
    const seed = state.sampleCount * 31 + fairyIndex * 101 + index * 17;
    const backOffset = seededUnit(seed + 1) * PIXIE_DUST_BACK_SPREAD;
    const sideOffset = seededSigned(seed + 2) * PIXIE_DUST_SIDE_SPREAD;
    const yOffset = seededSigned(seed + 3) * PIXIE_DUST_VERTICAL_SPREAD;
    const position = currentPosition
      .clone()
      .addScaledVector(scratchDustDirection, -backOffset)
      .addScaledVector(scratchDustSide, sideOffset);
    position.y += yOffset;

    state.trail.unshift({
      position,
      seed,
      size: 0.55 + seededUnit(seed + 4) * 0.75 + speedBoost,
    });
  }

  state.sampleCount += 1;
  state.trail.length = Math.min(state.trail.length, PIXIE_DUST_TRAIL_LENGTH);
  state.previousDustPosition = currentPosition.clone();
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

function getWaterSurfaceY(
  world: WorldQuery,
  x: number,
  z: number,
  terrainY: number
): number | null {
  for (let y = terrainY + 8; y > terrainY; y -= 1) {
    if (world.isCellFluid(x, y, z)) {
      return y;
    }
  }

  return null;
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

  const surfaceY =
    getWaterSurfaceY(world, Math.floor(x), Math.floor(z), groundY) ?? groundY;
  return surfaceY + FAIRY_SURFACE_CLEARANCE + heightOffset + bob;
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
  sample: HorizontalSample,
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
      config.anchorHeight,
      bob
    );
    if (!collidesAt(world, scratchCandidate)) {
      return scratchCandidate;
    }
  }

  return previousPosition ?? scratchCandidate;
}

function updateCuriosityAnchor(
  config: FairyLightConfig,
  state: FairySwarmState,
  index: number,
  delta: number
): void {
  state.curiosityElapsed += delta;
  if (state.curiosityElapsed < state.nextCuriosityChange) {
    return;
  }

  const seed = state.noiseSeed + state.sampleCount * 19 + index * 7;
  state.targetAnchorOffset.copy(createAnchorOffset(config, seed));
  state.curiosityElapsed = 0;
  state.nextCuriosityChange = scheduleCuriosity(config, seed + 23);
}

function computeHorizontalTargetSample(
  config: FairyLightConfig,
  state: FairySwarmState,
  playerVelocity: Vector3,
  delta: number
): HorizontalSample {
  const anchorBlend = 1 - Math.exp(-0.55 * delta);
  state.anchorOffset.lerp(state.targetAnchorOffset, anchorBlend);

  scratchTarget.copy(state.anchorOffset);
  scratchTarget.add(sampleDriftOffset(scratchDriftOffset, config, state));
  scratchTarget.add(sampleWeakOrbitOffset(scratchOrbitOffset, config, state));

  scratchTrailOffset.set(0, 0, 0);
  const horizontalSpeed = Math.hypot(playerVelocity.x, playerVelocity.z);
  if (horizontalSpeed > 0.001) {
    scratchTrailOffset.set(
      (-playerVelocity.x / horizontalSpeed) * config.trailDistance,
      0,
      (-playerVelocity.z / horizontalSpeed) * config.trailDistance
    );
    scratchTarget.add(scratchTrailOffset);
  }

  clampHorizontalOffset(scratchTarget);
  return { x: scratchTarget.x, z: scratchTarget.z };
}

export default function FairyLightController({
  playerRef,
  world,
  enabled,
  configs = FAIRY_LIGHT_CONFIGS,
  onRevealSourcesChange,
}: Props) {
  const lightRefs = useRef<(Group | null)[]>([]);
  const groundGlowRefs = useRef<(Mesh | null)[]>([]);
  const groundGlowMaterialRefs = useRef<(MeshBasicMaterial | null)[]>([]);
  const dustRefs = useRef<(Mesh | null)[][]>([]);
  const dustMaterialRefs = useRef<(MeshBasicMaterial | null)[][]>([]);
  const swarmStates = useRef(configs.map(createFairySwarmState));
  const previousPlayerPosition = useRef<Vector3 | null>(null);
  const worldPosition = useMemo(() => new Vector3(), []);
  const groundGlowAlphaMap = useMemo(createGroundGlowAlphaMap, []);
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
      onRevealSourcesChange?.([]);
    }
    return () => {
      updateFringeRevealLightUniforms([]);
      onRevealSourcesChange?.([]);
    };
  }, [enabled, onRevealSourcesChange]);

  useFrame((_, delta) => {
    if (!enabled || !playerRef.current) {
      previousPlayerPosition.current = null;
      updateFringeRevealLightUniforms([]);
      onRevealSourcesChange?.([]);
      return;
    }

    const playerPosition = playerRef.current.position;
    if (previousPlayerPosition.current) {
      scratchPlayerVelocity
        .copy(playerPosition)
        .sub(previousPlayerPosition.current)
        .multiplyScalar(delta > 0 ? 1 / delta : 0);
    } else {
      scratchPlayerVelocity.set(0, 0, 0);
    }
    previousPlayerPosition.current = playerPosition.clone();

    configs.forEach((config, index) => {
      const state = swarmStates.current[index];
      if (!state) {
        return;
      }

      state.elapsed += delta;
      state.angle += config.speed * delta;
      updateCuriosityAnchor(config, state, index, delta);
      const sample = computeHorizontalTargetSample(
        config,
        state,
        scratchPlayerVelocity,
        delta
      );
      const bob =
        config.bobAmplitude *
        Math.sin(state.elapsed * config.bobFrequency + config.phase);
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
        state.previousDustPosition = state.currentPosition.clone();
        appendPixieDustSpray(state, index);
      } else {
        const springTarget = scratchTarget.copy(targetPosition);
        state.velocity.addScaledVector(
          springTarget.sub(state.currentPosition),
          config.spring * delta
        );
        state.velocity.multiplyScalar(Math.exp(-config.damping * delta));
        state.currentPosition.addScaledVector(state.velocity, delta);
      }

      const currentPosition = state.currentPosition;
      if (!currentPosition) {
        return;
      }

      state.trailElapsed += delta;
      if (state.trailElapsed >= PIXIE_DUST_SAMPLE_INTERVAL) {
        state.trailElapsed = 0;
        appendPixieDustSpray(state, index);
      }

      const light = lightRefs.current[index];
      if (light) {
        light.position.copy(currentPosition);
        light.getWorldPosition(worldPosition);
        revealSources[index].position.copy(worldPosition);

        const dustMeshes = dustRefs.current[index] ?? [];
        const dustMaterials = dustMaterialRefs.current[index] ?? [];
        const groundGlow = groundGlowRefs.current[index];
        const groundGlowMaterial = groundGlowMaterialRefs.current[index];
        if (groundGlow && groundGlowMaterial) {
          const groundY = getTerrainGroundY(
            world,
            Math.floor(currentPosition.x),
            Math.floor(currentPosition.z)
          );
          if (groundY === null) {
            groundGlow.visible = false;
          } else {
            const surfaceY =
              getWaterSurfaceY(
                world,
                Math.floor(currentPosition.x),
                Math.floor(currentPosition.z),
                groundY
              ) ?? groundY;
            const pulse =
              0.82 + 0.18 * Math.sin(state.elapsed * 2.6 + config.phase);
            groundGlow.visible = true;
            groundGlow.position.set(0, surfaceY + 1.012 - currentPosition.y, 0);
            groundGlow.scale.setScalar(
              config.revealRadius * GROUND_GLOW_RADIUS_SCALE * pulse
            );
            groundGlowMaterial.opacity =
              GROUND_GLOW_BASE_OPACITY * config.intensity * pulse;
          }
        }

        for (
          let dustIndex = 0;
          dustIndex < PIXIE_DUST_TRAIL_LENGTH;
          dustIndex += 1
        ) {
          const dust = dustMeshes[dustIndex];
          const dustMaterial = dustMaterials[dustIndex];
          const particle = state.trail[dustIndex];
          if (!dust || !dustMaterial || !particle) {
            if (dust) {
              dust.visible = false;
            }
            continue;
          }

          const age = dustIndex / PIXIE_DUST_TRAIL_LENGTH;
          const twinkle =
            0.62 + 0.38 * Math.sin(state.elapsed * 3.3 + particle.seed);
          const speedGlow = Math.min(0.28, state.velocity.length() * 0.028);
          dust.visible = true;
          dust.position.copy(particle.position).sub(currentPosition);
          dust.scale.setScalar((0.16 - age * 0.1) * particle.size * twinkle);
          dustMaterial.opacity = Math.max(
            0,
            (1 - age) ** 1.45 * (0.82 + speedGlow) * twinkle
          );
        }
      }
    });

    updateFringeRevealLightUniforms(revealSources);
    onRevealSourcesChange?.(revealSources);
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
            <mesh
              ref={(mesh) => {
                groundGlowRefs.current[index] = mesh;
              }}
              renderOrder={-1}
              rotation={[-Math.PI / 2, 0, 0]}
              visible={false}
            >
              <circleGeometry args={[1, 40]} />
              <meshBasicMaterial
                ref={(material) => {
                  groundGlowMaterialRefs.current[index] = material;
                }}
                alphaMap={groundGlowAlphaMap}
                alphaTest={0.01}
                blending={NormalBlending}
                color={color}
                depthWrite={false}
                opacity={0}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
                side={DoubleSide}
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
                <sphereGeometry args={[0.08, 6, 6]} />
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
              distance={config.revealRadius * FAIRY_POINT_LIGHT_DISTANCE_SCALE}
              intensity={config.intensity * FAIRY_POINT_LIGHT_INTENSITY_SCALE}
            />
          </group>
        );
      })}
    </group>
  );
}
