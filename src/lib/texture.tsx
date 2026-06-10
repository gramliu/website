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
import {
  depthFadeParsGlsl,
  fringeDepthFadeUniforms,
} from "../components/world/fringe/fringe-depth-fade";

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

/**
 * Patches a standard material so its alpha is multiplied by the "solid" band
 * weight of the camera-distance LOD fade. Far-away fragments dissolve,
 * letting the fringe wireframes/tiles show through.
 */
function applyDepthFade(material: MeshStandardMaterial): void {
  material.transparent = true;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, fringeDepthFadeUniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vFringeWorldPos;"
      )
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvFringeWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;"
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vFringeWorldPos;\n${depthFadeParsGlsl}`
      )
      .replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        `vec4 diffuseColor = vec4( diffuse, opacity );
        diffuseColor.a *= fringeDepthBandWeights(vFringeWorldPos).x;
        if (diffuseColor.a < 0.004) discard;`
      );
  };
  material.customProgramCacheKey = () => "fringe-depth-fade";
}

export function useTextureMaterial(
  texture: MaterialTextureProps,
  depthFade = false
): Material {
  const textureMap = useRepeatedTexture(texture);
  return useMemo(() => {
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

    const material = new MeshStandardMaterial(materialProps);
    if (depthFade) {
      applyDepthFade(material);
    }

    return material;
  }, [textureMap, texture.opacity, texture.translucent, depthFade]);
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
