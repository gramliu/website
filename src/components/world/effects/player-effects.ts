import type { ColorRepresentation, Vector3 } from "three";

export const PLAYER_REVEAL_RADIUS = 6;
export const FAIRY_LIGHT_REVEAL_RADIUS = 3;
export const MAX_FAIRY_ORBIT_RADIUS = 4;
export const MAX_EFFECTIVE_REVEAL_RADIUS =
  MAX_FAIRY_ORBIT_RADIUS + FAIRY_LIGHT_REVEAL_RADIUS;

export type PlayerEffectKind = "fairyLight";

export interface PlayerRevealSource {
  id: string;
  kind: PlayerEffectKind;
  position: Vector3;
  radius: number;
  intensity: number;
  falloffStart: number;
  color: ColorRepresentation;
}

export interface FairyLightConfig {
  id: string;
  color: ColorRepresentation;
  intensity: number;
  revealRadius: number;
  falloffStart: number;
  ellipseX: number;
  ellipseZ: number;
  heightOffset: number;
  bobAmplitude: number;
  bobFrequency: number;
  speed: number;
  phase: number;
  wanderIntervalMs: number;
}

export const FAIRY_LIGHT_CONFIGS: FairyLightConfig[] = [
  {
    id: "fairy-amber",
    color: "#ffd27a",
    intensity: 0.9,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS,
    falloffStart: 0.35,
    ellipseX: 3.8,
    ellipseZ: 2.1,
    heightOffset: 1.65,
    bobAmplitude: 0.22,
    bobFrequency: 2.1,
    speed: 0.72,
    phase: 0,
    wanderIntervalMs: 4100,
  },
  {
    id: "fairy-cyan",
    color: "#8ee8ff",
    intensity: 0.82,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.92,
    falloffStart: 0.3,
    ellipseX: 2.5,
    ellipseZ: 3.6,
    heightOffset: 2.1,
    bobAmplitude: 0.28,
    bobFrequency: 1.7,
    speed: -0.58,
    phase: (Math.PI * 2) / 3,
    wanderIntervalMs: 5300,
  },
  {
    id: "fairy-violet",
    color: "#d5a3ff",
    intensity: 0.76,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.85,
    falloffStart: 0.4,
    ellipseX: 3.1,
    ellipseZ: 2.8,
    heightOffset: 1.35,
    bobAmplitude: 0.18,
    bobFrequency: 2.5,
    speed: 0.91,
    phase: (Math.PI * 4) / 3,
    wanderIntervalMs: 4700,
  },
];
