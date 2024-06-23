import { MaterialTextureProps } from "../../lib/texture";

export interface BlockType {
  top: MaterialTextureProps;
  side: MaterialTextureProps;
}

function textureFromPath(path: string, translucent = false): MaterialTextureProps {
  return {
    path,
    translucent,
  };
}

function blockTypeFromTexture(top: MaterialTextureProps, side?: MaterialTextureProps): BlockType {
  return {
    top,
    side: side ?? top,
  };
}

const waterStillTexture = textureFromPath("textures/water_still.png");
const waterFlowTexture = textureFromPath("textures/water_flow.png");
const sandTexture = textureFromPath("textures/sand.png");
const dirtTexture = textureFromPath("textures/dirt.png");
const grassTextureTop = textureFromPath("textures/grass_top.png");
const grassTextureSide = textureFromPath("textures/grass_side.png");
const logTextureTop = textureFromPath("textures/oak_log_top.png");
const logTextureSide = textureFromPath("textures/oak_log.png");
const leafTexture = textureFromPath("textures/oak_leaves.png", true);
const craftingTableTextureTop = textureFromPath("textures/crafting_table_top.png");
const craftingTableTextureSide = textureFromPath("textures/crafting_table_side.png");

export const waterBlock = blockTypeFromTexture(waterStillTexture, waterFlowTexture);
export const sandBlock = blockTypeFromTexture(sandTexture);
export const dirtBlock = blockTypeFromTexture(dirtTexture);
export const grassBlock = blockTypeFromTexture(grassTextureTop, grassTextureSide);
export const logBlock = blockTypeFromTexture(logTextureTop, logTextureSide);
export const leafBlock = blockTypeFromTexture(leafTexture);
export const craftingTableBlock = blockTypeFromTexture(craftingTableTextureTop, craftingTableTextureSide);

export const blockMap: Record<string, BlockType | null> = {
  "2": grassBlock,
  "3": dirtBlock,
  "9": waterBlock,
  "12": sandBlock,
  "17": logBlock,
  "18": leafBlock,
  "58": craftingTableBlock,
}