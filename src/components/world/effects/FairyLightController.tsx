import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, Color, type Group, Vector3 } from "three";
import { updateFringeRevealLightUniforms } from "../fringe/fringe-depth-fade";
import {
  FAIRY_LIGHT_CONFIGS,
  type FairyLightConfig,
  MAX_FAIRY_ORBIT_RADIUS,
  type PlayerRevealSource,
} from "./player-effects";

interface Props {
  playerRef: React.RefObject<Group | null>;
  enabled: boolean;
  configs?: FairyLightConfig[];
}

interface OrbitState {
  angle: number;
  currentEllipseX: number;
  currentEllipseZ: number;
  targetEllipseX: number;
  targetEllipseZ: number;
  currentRotation: number;
  targetRotation: number;
  nextWanderAt: number;
}

function clampOrbitRadius(radius: number): number {
  return Math.min(radius, MAX_FAIRY_ORBIT_RADIUS);
}

function nextOrbitValue(seed: number, base: number, spread: number): number {
  return clampOrbitRadius(base + Math.sin(seed * 12.9898) * spread);
}

function createOrbitState(config: FairyLightConfig, index: number): OrbitState {
  const now = performance.now();
  return {
    angle: config.phase,
    currentEllipseX: clampOrbitRadius(config.ellipseX),
    currentEllipseZ: clampOrbitRadius(config.ellipseZ),
    targetEllipseX: clampOrbitRadius(config.ellipseX),
    targetEllipseZ: clampOrbitRadius(config.ellipseZ),
    currentRotation: (index * Math.PI) / 5,
    targetRotation: (index * Math.PI) / 5,
    nextWanderAt: now + config.wanderIntervalMs * (0.65 + index * 0.2),
  };
}

export default function FairyLightController({
  playerRef,
  enabled,
  configs = FAIRY_LIGHT_CONFIGS,
}: Props) {
  const lightRefs = useRef<(Group | null)[]>([]);
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

    const now = performance.now();
    const playerPosition = playerRef.current.position;

    configs.forEach((config, index) => {
      const state = orbitStates.current[index];
      if (!state) {
        return;
      }

      if (now >= state.nextWanderAt) {
        const seed = now * 0.001 + index * 17;
        state.targetEllipseX = nextOrbitValue(seed, config.ellipseX, 0.9);
        state.targetEllipseZ = nextOrbitValue(seed + 3.7, config.ellipseZ, 0.9);
        state.targetRotation +=
          Math.PI * (0.3 + Math.abs(Math.sin(seed)) * 0.75);
        state.nextWanderAt =
          now +
          config.wanderIntervalMs * (0.75 + Math.abs(Math.cos(seed)) * 0.6);
      }

      const blend = 1 - Math.exp(-delta * 0.8);
      state.currentEllipseX +=
        (state.targetEllipseX - state.currentEllipseX) * blend;
      state.currentEllipseZ +=
        (state.targetEllipseZ - state.currentEllipseZ) * blend;
      state.currentRotation +=
        (state.targetRotation - state.currentRotation) * blend;
      state.angle += config.speed * delta;

      const orbitX = Math.cos(state.angle) * state.currentEllipseX;
      const orbitZ = Math.sin(state.angle) * state.currentEllipseZ;
      const cosRotation = Math.cos(state.currentRotation);
      const sinRotation = Math.sin(state.currentRotation);
      const x = orbitX * cosRotation - orbitZ * sinRotation;
      const z = orbitX * sinRotation + orbitZ * cosRotation;
      const y =
        config.heightOffset +
        config.bobAmplitude * Math.sin(state.angle * config.bobFrequency);

      const light = lightRefs.current[index];
      if (light) {
        light.position.set(
          playerPosition.x + x,
          playerPosition.y + y,
          playerPosition.z + z
        );
        light.getWorldPosition(worldPosition);
        revealSources[index].position.copy(worldPosition);
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
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.38, 16, 16]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color={color}
                depthWrite={false}
                opacity={0.18}
                toneMapped={false}
                transparent
              />
            </mesh>
            <pointLight
              color={color}
              distance={config.revealRadius * 2.5}
              intensity={config.intensity * 0.55}
            />
          </group>
        );
      })}
    </group>
  );
}
