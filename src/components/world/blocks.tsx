import type { MaterialTextureProps } from "../../lib/texture";

export interface BlockTextureSet {
  top: MaterialTextureProps;
  side: MaterialTextureProps;
}

interface TexturePathOptionalProps {
  translucent?: boolean;
  opacity?: number;
  repeat?: number;
}

function textureFromPath(
  path: string,
  options?: TexturePathOptionalProps
): MaterialTextureProps {
  const { translucent = false, opacity = 1, repeat = 1 } = options ?? {};
  return {
    path,
    translucent,
    opacity,
    repeat,
  };
}

function blockTypeFromTexture(
  top: MaterialTextureProps,
  side?: MaterialTextureProps
): BlockTextureSet {
  return {
    top,
    side: side ?? top,
  };
}

export const waterStillTexture = textureFromPath("textures/water_still.png", {
  translucent: true,
  opacity: 0.7,
});
const waterFlowTexture = textureFromPath("textures/water_flow.png", {
  translucent: true,
  opacity: 0.7,
});

const stoneTexture = textureFromPath("textures/stone.png");
const sandTexture = textureFromPath("textures/sand.png");
const dirtTexture = textureFromPath("textures/dirt.png");
const grassTextureTop = textureFromPath("textures/grass_top.png");
const grassTextureSide = textureFromPath("textures/grass_side.png");
const logTextureTop = textureFromPath("textures/oak_log_top.png");
const logTextureSide = textureFromPath("textures/oak_log.png");
const leafTexture = textureFromPath("textures/oak_leaves.png", {
  translucent: true,
});
const craftingTableTextureTop = textureFromPath(
  "textures/crafting_table_top.png"
);
const craftingTableTextureSide = textureFromPath(
  "textures/crafting_table_side.png"
);

export const waterBlockTextures = blockTypeFromTexture(
  waterStillTexture,
  waterFlowTexture
);
export const stoneBlockTextures = blockTypeFromTexture(stoneTexture);
export const sandBlockTextures = blockTypeFromTexture(sandTexture);
export const dirtBlockTextures = blockTypeFromTexture(dirtTexture);
export const grassBlockTextures = blockTypeFromTexture(
  grassTextureTop,
  grassTextureSide
);
export const logBlockTextures = blockTypeFromTexture(
  logTextureTop,
  logTextureSide
);
export const leafBlockTextures = blockTypeFromTexture(leafTexture);
export const craftingTableBlockTextures = blockTypeFromTexture(
  craftingTableTextureTop,
  craftingTableTextureSide
);

const renderableBlocks: Record<string, BlockTextureSet> = {
  stone: stoneBlockTextures,
  grass: grassBlockTextures,
  dirt: dirtBlockTextures,
  water: waterBlockTextures,
  sand: sandBlockTextures,
  log: logBlockTextures,
  leaves: leafBlockTextures,
  crafting_table: craftingTableBlockTextures,
};

export function getRenderableBlockTextures(
  renderKey: string
): BlockTextureSet | null {
  return renderableBlocks[renderKey] ?? null;
}
