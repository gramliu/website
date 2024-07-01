import { EntityTexture, EntityTextureProps } from "../components/world/entities";
import { useTexture } from "@react-three/drei";
import {
  Material,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
  RepeatWrapping,
  Texture
} from "three";

export interface MaterialTextureProps {
  path: string;
  repeat?: number;
  offset?: [number, number];
  translucent?: boolean;
  opacity?: number;
}

const fallbackTexture = "textures/water_still.png";

export function useRepeatedTexture(_texture: MaterialTextureProps): Texture {
  const texture = _texture as MaterialTextureProps;
  const texturePath = texture.path ?? fallbackTexture;
  const textureMap = useTexture(texturePath);

  const repeat = texture.repeat ?? 1;
  const offsetX = texture.offset?.[0] ?? 0;
  const offsetY = texture.offset?.[1] ?? 0;

  textureMap.wrapS = RepeatWrapping;
  textureMap.wrapT = RepeatWrapping;
  textureMap.repeat.set(repeat, repeat);
  textureMap.offset.set(offsetX, offsetY);

  return textureMap;
}

export function useTextureMaterial(texture: MaterialTextureProps): Material {
  const textureMap = useRepeatedTexture(texture);

  const materialProps: MeshStandardMaterialParameters = {
    map: textureMap,
    roughness: 1,
    metalness: 0,
  };

  if (texture.translucent) {
    materialProps.transparent = true;
    materialProps.alphaTest = 0.2;
  }

  if (texture.opacity) {
    materialProps.opacity = texture.opacity;
  }
  return new MeshStandardMaterial(materialProps);
}

export function useEntityTexture(
  entityTexture: EntityTextureProps
): EntityTexture {
  return {
    left: useTextureMaterial(entityTexture.left),
    right: useTextureMaterial(entityTexture.right),
    top: useTextureMaterial(entityTexture.top),
    bottom: useTextureMaterial(entityTexture.bottom),
    front: useTextureMaterial(entityTexture.front),
    back: useTextureMaterial(entityTexture.back),
  };
}
