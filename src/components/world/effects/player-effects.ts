import type { ColorRepresentation, Vector3 } from "three";

export const PLAYER_REVEAL_RADIUS = 5.5;
export const FAIRY_LIGHT_REVEAL_RADIUS = 4.5;
export const MAX_FAIRY_ORBIT_RADIUS = 8.5;
export const MAX_EFFECTIVE_REVEAL_RADIUS =
  MAX_FAIRY_ORBIT_RADIUS + FAIRY_LIGHT_REVEAL_RADIUS;

export type PlayerEffectKind = "fairyLight";
export type FairyLightPathKind = "semiEllipse" | "rose" | "epicycloid";

export interface PlayerRevealSource {
  id: string;
  kind: PlayerEffectKind;
  position: Vector3;
  radius: number;
  intensity: number;
  falloffStart: number;
  color: ColorRepresentation;
}

interface BaseFairyLightPathConfig {
  kind: FairyLightPathKind;
  rotation?: number;
}

export interface SemiEllipsePathConfig extends BaseFairyLightPathConfig {
  kind: "semiEllipse";
  radiusX: number;
  radiusZ: number;
}

export interface RosePathConfig extends BaseFairyLightPathConfig {
  kind: "rose";
  radius: number;
  petalCount: number;
  innerRadiusRatio: number;
}

export interface EpicycloidPathConfig extends BaseFairyLightPathConfig {
  kind: "epicycloid";
  fixedRadius: number;
  rollingRadius: number;
  scale: number;
}

export type FairyLightPathConfig =
  | SemiEllipsePathConfig
  | RosePathConfig
  | EpicycloidPathConfig;

export interface FairyLightConfig {
  id: string;
  color: ColorRepresentation;
  intensity: number;
  revealRadius: number;
  falloffStart: number;
  path: FairyLightPathConfig;
  heightOffset: number;
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
    path: {
      kind: "semiEllipse",
      radiusX: 8.2,
      radiusZ: 4.8,
      rotation: Math.PI / 10,
    },
    heightOffset: 1.35,
    bobAmplitude: 0.28,
    bobFrequency: 2.1,
    speed: 0.72,
    phase: 0,
  },
  {
    id: "fairy-cyan",
    color: "#8ee8ff",
    intensity: 0.82,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.92,
    falloffStart: 0.3,
    path: {
      kind: "rose",
      radius: 8.4,
      petalCount: 3,
      innerRadiusRatio: 0.42,
      rotation: Math.PI / 5,
    },
    heightOffset: 1.55,
    bobAmplitude: 0.32,
    bobFrequency: 1.7,
    speed: -0.46,
    phase: (Math.PI * 2) / 3,
  },
  {
    id: "fairy-violet",
    color: "#d5a3ff",
    intensity: 0.76,
    revealRadius: FAIRY_LIGHT_REVEAL_RADIUS * 0.85,
    falloffStart: 0.4,
    path: {
      kind: "epicycloid",
      fixedRadius: 3,
      rollingRadius: 1,
      scale: 2.05,
      rotation: -Math.PI / 8,
    },
    heightOffset: 1.25,
    bobAmplitude: 0.24,
    bobFrequency: 2.5,
    speed: 0.52,
    phase: (Math.PI * 4) / 3,
  },
];
