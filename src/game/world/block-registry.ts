import type { CollisionKind } from "../core/types";

export interface BlockDefinition {
  id: number;
  name: string;
  collisionKind: CollisionKind;
  renderKey: string;
  solid: boolean;
  fluid: boolean;
  transparent: boolean;
  climbable: boolean;
  castsShadow: boolean;
}

const AIR_BLOCK: BlockDefinition = {
  id: 0,
  name: "air",
  collisionKind: "empty",
  renderKey: "air",
  solid: false,
  fluid: false,
  transparent: true,
  climbable: false,
  castsShadow: false,
};

export const blockRegistry: Record<number, BlockDefinition> = {
  0: AIR_BLOCK,
  1: {
    id: 1,
    name: "stone",
    collisionKind: "solid",
    renderKey: "stone",
    solid: true,
    fluid: false,
    transparent: false,
    climbable: false,
    castsShadow: true,
  },
  2: {
    id: 2,
    name: "grass",
    collisionKind: "solid",
    renderKey: "grass",
    solid: true,
    fluid: false,
    transparent: false,
    climbable: false,
    castsShadow: true,
  },
  3: {
    id: 3,
    name: "dirt",
    collisionKind: "solid",
    renderKey: "dirt",
    solid: true,
    fluid: false,
    transparent: false,
    climbable: false,
    castsShadow: true,
  },
  9: {
    id: 9,
    name: "water",
    collisionKind: "fluid",
    renderKey: "water",
    solid: false,
    fluid: true,
    transparent: true,
    climbable: false,
    castsShadow: false,
  },
  12: {
    id: 12,
    name: "sand",
    collisionKind: "solid",
    renderKey: "sand",
    solid: true,
    fluid: false,
    transparent: false,
    climbable: false,
    castsShadow: true,
  },
  17: {
    id: 17,
    name: "oak_log",
    collisionKind: "solid",
    renderKey: "log",
    solid: true,
    fluid: false,
    transparent: false,
    climbable: false,
    castsShadow: true,
  },
  18: {
    id: 18,
    name: "oak_leaves",
    collisionKind: "solid",
    renderKey: "leaves",
    solid: true,
    fluid: false,
    transparent: true,
    climbable: false,
    castsShadow: true,
  },
  58: {
    id: 58,
    name: "crafting_table",
    collisionKind: "solid",
    renderKey: "crafting_table",
    solid: true,
    fluid: false,
    transparent: false,
    climbable: false,
    castsShadow: true,
  },
};

export function getBlockDefinition(id: number): BlockDefinition {
  return blockRegistry[id] ?? AIR_BLOCK;
}

export function isBlockSolid(id: number): boolean {
  return getBlockDefinition(id).solid;
}

export function isBlockFluid(id: number): boolean {
  return getBlockDefinition(id).fluid;
}
