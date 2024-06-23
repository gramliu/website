import { MaterialTextureProps } from "../../lib/texture";
import { Material } from "three";

const parts = ["left", "right", "top", "bottom", "front", "back"] as const;

export type EntityTextureProps = Record<typeof parts[number], MaterialTextureProps>;
export type EntityTexture = Record<typeof parts[number], Material>;

/**
 * Given a base parent folder path, return an entity texture, i.e. an array of MaterialTextureProps
 * representing the textures for each side of an entity part
 */
function entityTexturesFromPath(
  path: string,
  identifier: string
): EntityTextureProps {
  const textures = parts.map((part) => {
    return {
      path: `${path}/${identifier}_${part}.png`,
    };
  });
  const textureMap = {} as EntityTextureProps;
  parts.forEach((part, index) => {
    textureMap[part] = textures[index];
  });
  return textureMap;
}

export const playerHeadTextures = entityTexturesFromPath(
  "textures",
  "steve_head"
);
export const playerBodyTextures = entityTexturesFromPath(
  "textures",
  "steve_body"
);
export const playerLeftLegTextures = entityTexturesFromPath(
  "textures",
  "steve_left_leg"
);
export const playerRightLegTextures = entityTexturesFromPath(
  "textures",
  "steve_right_leg"
);
export const playerLeftArmTextures = entityTexturesFromPath(
  "textures",
  "steve_left_arm"
);
export const playerRightArmTextures = entityTexturesFromPath(
  "textures",
  "steve_right_arm"
);