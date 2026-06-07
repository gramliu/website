import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import {
  type Material,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  RepeatWrapping,
  type Texture,
} from "three";
import type {
  EntityTexture,
  EntityTextureProps,
} from "../components/world/entities";

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
  const baseTexture = useTexture(texturePath);

  const repeat = texture.repeat ?? 1;
  const offsetX = texture.offset?.[0] ?? 0;
  const offsetY = texture.offset?.[1] ?? 0;

  return useMemo(() => {
    const textureMap = baseTexture.clone();
    textureMap.wrapS = RepeatWrapping;
    textureMap.wrapT = RepeatWrapping;
    textureMap.repeat.set(repeat, repeat);
    textureMap.offset.set(offsetX, offsetY);
    textureMap.needsUpdate = true;
    return textureMap;
  }, [baseTexture, offsetX, offsetY, repeat]);
}

export function useTextureMaterial(texture: MaterialTextureProps): Material {
  const textureMap = useRepeatedTexture(texture);
  return useMemo(() => {
    const materialProps: MeshStandardMaterialParameters = {
      map: textureMap,
      roughness: 1,
      metalness: 0,
    };

    const opacity = texture.opacity ?? 1;

    if (texture.translucent || opacity < 1) {
      materialProps.transparent = true;
      materialProps.alphaTest = opacity < 1 ? 0 : 0.2;
      materialProps.depthWrite = opacity >= 0.95;
    }

    if (texture.opacity !== undefined) {
      materialProps.opacity = texture.opacity;
    }

    return new MeshStandardMaterial(materialProps);
  }, [textureMap, texture.opacity, texture.translucent]);
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
