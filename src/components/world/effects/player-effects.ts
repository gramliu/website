import type { ColorRepresentation, Vector3 } from "three";

export const PLAYER_REVEAL_RADIUS = 5.5;
export const FAIRY_LIGHT_REVEAL_RADIUS = 4.5;
export const MAX_FAIRY_ORBIT_RADIUS = 8.5;
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
    ellipseX: 8.2,
    ellipseZ: 4.8,
    heightOffset: 1.8,
    bobAmplitude: 0.55,
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
    ellipseX: 5.5,
    ellipseZ: 8.4,
    heightOffset: 2.35,
    bobAmplitude: 0.72,
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
    ellipseX: 7.1,
    ellipseZ: 6.2,
    heightOffset: 1.55,
    bobAmplitude: 0.48,
    bobFrequency: 2.5,
    speed: 0.91,
    phase: (Math.PI * 4) / 3,
    wanderIntervalMs: 4700,
  },
];
