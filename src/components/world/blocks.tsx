import { MaterialTextureProps } from "../../lib/texture";

export interface BlockType {
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
): BlockType {
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

export const waterBlock = blockTypeFromTexture(
  waterStillTexture,
  waterFlowTexture
);
export const stoneBlock = blockTypeFromTexture(stoneTexture);
export const sandBlock = blockTypeFromTexture(sandTexture);
export const dirtBlock = blockTypeFromTexture(dirtTexture);
export const grassBlock = blockTypeFromTexture(
  grassTextureTop,
  grassTextureSide
);
export const logBlock = blockTypeFromTexture(logTextureTop, logTextureSide);
export const leafBlock = blockTypeFromTexture(leafTexture);
export const craftingTableBlock = blockTypeFromTexture(
  craftingTableTextureTop,
  craftingTableTextureSide
);

export const blockMap: Record<string, BlockType | null> = {
  "1": stoneBlock,
  "2": grassBlock,
  "3": dirtBlock,
  "9": waterBlock,
  "12": sandBlock,
  "17": logBlock,
  "18": leafBlock,
  "58": craftingTableBlock,
};
