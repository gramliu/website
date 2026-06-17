import type { ColorRepresentation, Vector3 } from "three";

export const PLAYER_REVEAL_RADIUS = 5.5;
export const FAIRY_LIGHT_REVEAL_RADIUS = 4.5;
export const MAX_FAIRY_SWARM_RADIUS = 3.25;
export const MAX_EFFECTIVE_REVEAL_RADIUS =
  MAX_FAIRY_SWARM_RADIUS + FAIRY_LIGHT_REVEAL_RADIUS;

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
  anchorRadius: number;
  anchorHeight: number;
  driftAmount: number;
  driftSpeed: number;
  orbitBias: number;
  spring: number;
  damping: number;
  trailDistance: number;
  curiosityIntervalMin: number;
  curiosityIntervalMax: number;
  bobAmplitude: number;
  bobFrequency: number;
  speed: number;
  phase: number;
}

export const FAIRY_LIGHT_CONFIGS: FairyLightConfig[] = [
  {
    id: "fairy-amber",
    color: "#ffd27a",
    intensity: 0.9,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS,
    falloffStart: 0.35,
    anchorRadius: 1.25,
    anchorHeight: 1.45,
    driftAmount: 0.72,
    driftSpeed: 0.16,
    orbitBias: 0.16,
    spring: 11,
    damping: 5.4,
    trailDistance: 0.38,
    curiosityIntervalMin: 4.5,
    curiosityIntervalMax: 8.5,
    bobAmplitude: 0.07,
    bobFrequency: 1.35,
    speed: 0.18,
    phase: 0,
  },
  {
    id: "fairy-cyan",
    color: "#8ee8ff",
    intensity: 0.82,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.92,
    falloffStart: 0.3,
    anchorRadius: 1.85,
    anchorHeight: 1.9,
    driftAmount: 0.88,
    driftSpeed: 0.11,
    orbitBias: 0.12,
    spring: 8.5,
    damping: 4.7,
    trailDistance: 0.65,
    curiosityIntervalMin: 6,
    curiosityIntervalMax: 10,
    bobAmplitude: 0.06,
    bobFrequency: 1.05,
    speed: -0.12,
    phase: (Math.PI * 2) / 3,
  },
  {
    id: "fairy-violet",
    color: "#d5a3ff",
    intensity: 0.76,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.85,
    falloffStart: 0.4,
    anchorRadius: 1.05,
    anchorHeight: 1.2,
    driftAmount: 0.62,
    driftSpeed: 0.2,
    orbitBias: 0.2,
    spring: 13,
    damping: 6.2,
    trailDistance: 0.28,
    curiosityIntervalMin: 4,
    curiosityIntervalMax: 7.5,
    bobAmplitude: 0.08,
    bobFrequency: 1.55,
    speed: 0.16,
    phase: (Math.PI * 4) / 3,
  },
];
