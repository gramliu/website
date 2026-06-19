import type { ColorRepresentation, Vector3 } from "three";

export const PLAYER_REVEAL_RADIUS = 5.5;
export const FAIRY_LIGHT_REVEAL_RADIUS = 5.8;
export const MAX_FAIRY_SWARM_RADIUS = 6;
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
    intensity: 1.05,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS,
    falloffStart: 0.52,
    anchorRadius: 3,
    anchorHeight: 1.45,
    driftAmount: 0.95,
    driftSpeed: 0.26,
    orbitBias: 0.14,
    spring: 14,
    damping: 5.6,
    trailDistance: 0.75,
    curiosityIntervalMin: 3.8,
    curiosityIntervalMax: 7,
    bobAmplitude: 0.07,
    bobFrequency: 1.45,
    speed: 0.28,
    phase: 0,
  },
  {
    id: "fairy-violet",
    color: "#d5a3ff",
    intensity: 0.94,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.88,
    falloffStart: 0.5,
    anchorRadius: 3.15,
    anchorHeight: 1.2,
    driftAmount: 0.9,
    driftSpeed: 0.32,
    orbitBias: 0.18,
    spring: 15,
    damping: 6.1,
    trailDistance: 0.7,
    curiosityIntervalMin: 3.5,
    curiosityIntervalMax: 6.5,
    bobAmplitude: 0.08,
    bobFrequency: 1.65,
    speed: -0.3,
    phase: (Math.PI * 2) / 5,
  },
  {
    id: "fairy-cyan",
    color: "#8ee8ff",
    intensity: 1.0,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS,
    falloffStart: 0.48,
    anchorRadius: 4.1,
    anchorHeight: 1.9,
    driftAmount: 1.15,
    driftSpeed: 0.22,
    orbitBias: 0.1,
    spring: 10,
    damping: 4.4,
    trailDistance: 0.95,
    curiosityIntervalMin: 4.5,
    curiosityIntervalMax: 8,
    bobAmplitude: 0.06,
    bobFrequency: 1.1,
    speed: 0.22,
    phase: (Math.PI * 4) / 5,
  },
  {
    id: "fairy-mint",
    color: "#9effb8",
    intensity: 0.96,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.95,
    falloffStart: 0.5,
    anchorRadius: 4.9,
    anchorHeight: 1.55,
    driftAmount: 1.35,
    driftSpeed: 0.2,
    orbitBias: 0.09,
    spring: 9,
    damping: 4.1,
    trailDistance: 1.15,
    curiosityIntervalMin: 5,
    curiosityIntervalMax: 9,
    bobAmplitude: 0.07,
    bobFrequency: 1.25,
    speed: -0.2,
    phase: (Math.PI * 6) / 5,
  },
  {
    id: "fairy-rose",
    color: "#ff9ccf",
    intensity: 0.92,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.9,
    falloffStart: 0.5,
    anchorRadius: 5.6,
    anchorHeight: 1.7,
    driftAmount: 1.45,
    driftSpeed: 0.18,
    orbitBias: 0.08,
    spring: 8,
    damping: 3.8,
    trailDistance: 1.25,
    curiosityIntervalMin: 5.5,
    curiosityIntervalMax: 10,
    bobAmplitude: 0.06,
    bobFrequency: 1,
    speed: 0.18,
    phase: (Math.PI * 8) / 5,
  },
];
