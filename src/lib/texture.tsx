import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import {
  type Material,
  MeshDepthMaterial,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  RepeatWrapping,
  RGBADepthPacking,
  type Texture,
} from "three";
import type {
  EntityTexture,
  EntityTextureProps,
} from "../components/world/entities";
import { fringeDepthFadeUniforms } from "../components/world/fringe/fringe-depth-fade";
import {
  injectTerrainColorFade,
  injectTerrainHashedFade,
  injectTerrainOcclusionFade,
  injectTerrainVisibilityVarying,
} from "../components/world/fringe/fringe-terrain-visibility";

export interface MaterialTextureProps {
  path: string;
  repeat?: number;
  offset?: [number, number];
  translucent?: boolean;
  opacity?: number;
}

const fallbackTexture = "textures/water_still.png";

// Repeated-texture clones and materials are cached module-wide. Blocks mount
// and unmount continuously while the infinite world's render window moves, so
// per-mount clones would leak GPU resources; the cache keeps one instance per
// distinct configuration (a small bounded set) shared by every block.
const repeatedTextureCache = new Map<string, Texture>();
const materialCache = new Map<string, Material>();
const fringeOcclusionMaterialCache = new Map<string, MeshDepthMaterial>();
const fringeShadowMaterialCache = new Map<string, MeshDepthMaterial>();

export function useRepeatedTexture(_texture: MaterialTextureProps): Texture {
  const texture = _texture as MaterialTextureProps;
  const texturePath = texture.path ?? fallbackTexture;
  const baseTexture = useTexture(texturePath);

  const repeat = texture.repeat ?? 1;
  const offsetX = texture.offset?.[0] ?? 0;
  const offsetY = texture.offset?.[1] ?? 0;

  return useMemo(() => {
    const cacheKey = `${texturePath}|${repeat}|${offsetX}|${offsetY}`;
    const cached = repeatedTextureCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const textureMap = baseTexture.clone();
    textureMap.wrapS = RepeatWrapping;
    textureMap.wrapT = RepeatWrapping;
    textureMap.repeat.set(repeat, repeat);
    textureMap.offset.set(offsetX, offsetY);
    textureMap.needsUpdate = true;
    repeatedTextureCache.set(cacheKey, textureMap);
    return textureMap;
  }, [baseTexture, offsetX, offsetY, repeat, texturePath]);
}

/**
 * Depth material for shadow maps that discards fragments the fringe fade has
 * dissolved. Without it, fully invisible blocks would still darken the
 * visible terrain. Cached per texture so alpha-tested leaves keep their
 * cutout shadows.
 */
export function createFringeShadowDepthMaterial(
  texture: MaterialTextureProps,
  textureMap: Texture
): MeshDepthMaterial {
  const material = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking,
    map: textureMap,
    alphaTest: texture.translucent ? 0.2 : 0,
  });
  material.alphaHash = true;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, fringeDepthFadeUniforms);
    injectTerrainVisibilityVarying(shader);
    injectTerrainHashedFade(shader);
  };
  material.customProgramCacheKey = () =>
    `fringe-shadow-hashed-${texture.translucent ? "cutout" : "solid"}`;

  return material;
}

export function useFringeShadowDepthMaterial(
  texture: MaterialTextureProps,
  enabled: boolean
): MeshDepthMaterial | undefined {
  const textureMap = useRepeatedTexture(texture);
  return useMemo(() => {
    if (!enabled) {
      return undefined;
    }
    const cacheKey = [
      texture.path ?? fallbackTexture,
      texture.repeat ?? 1,
      texture.offset?.[0] ?? 0,
      texture.offset?.[1] ?? 0,
      texture.translucent ?? false,
    ].join("|");
    const cached = fringeShadowMaterialCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const material = createFringeShadowDepthMaterial(texture, textureMap);
    fringeShadowMaterialCache.set(cacheKey, material);
    return material;
  }, [enabled, texture, textureMap]);
}

export function shouldOccludeFringe(texture: MaterialTextureProps): boolean {
  return (texture.opacity ?? 1) >= 1;
}

/**
 * A colorless prepass for solid terrain. It establishes an occluding depth
 * buffer before transparent terrain and fringe lines are blended, so lines
 * cannot bleed through a still-visible faded block.
 */
export function createFringeOcclusionMaterial(
  texture: MaterialTextureProps,
  textureMap: Texture
): MeshDepthMaterial {
  const material = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking,
    map: textureMap,
    alphaTest: texture.translucent ? 0.2 : 0,
  });
  material.colorWrite = false;
  material.depthWrite = true;
  material.depthTest = true;
  material.transparent = false;
  material.alphaHash = true;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, fringeDepthFadeUniforms);
    injectTerrainVisibilityVarying(shader);
    injectTerrainOcclusionFade(shader);
  };
  material.customProgramCacheKey = () =>
    `fringe-occlusion-${texture.translucent ? "cutout" : "solid"}`;

  return material;
}

export function useFringeOcclusionMaterial(
  texture: MaterialTextureProps,
  enabled: boolean
): MeshDepthMaterial | null {
  const textureMap = useRepeatedTexture(texture);
  return useMemo(() => {
    if (!enabled || !shouldOccludeFringe(texture)) {
      return null;
    }

    const cacheKey = [
      texture.path ?? fallbackTexture,
      texture.repeat ?? 1,
      texture.offset?.[0] ?? 0,
      texture.offset?.[1] ?? 0,
      texture.translucent ?? false,
      texture.opacity ?? 1,
    ].join("|");
    const cached = fringeOcclusionMaterialCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const material = createFringeOcclusionMaterial(texture, textureMap);
    fringeOcclusionMaterialCache.set(cacheKey, material);
    return material;
  }, [enabled, texture, textureMap]);
}

/**
 * Smoothly fades visible terrain. A separate alpha-hashed depth prepass owns
 * occlusion, so transparent color fragments do not write competing depth.
 */
export function applyTerrainVisibility(material: MeshStandardMaterial): void {
  material.transparent = true;
  material.depthWrite = false;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, fringeDepthFadeUniforms);
    injectTerrainVisibilityVarying(shader);
    injectTerrainColorFade(shader);
  };
  material.customProgramCacheKey = () => "fringe-smooth-visibility";
}

export function useTextureMaterial(
  texture: MaterialTextureProps,
  depthFade = false
): Material {
  const textureMap = useRepeatedTexture(texture);
  return useMemo(() => {
    const cacheKey = [
      texture.path ?? fallbackTexture,
      texture.repeat ?? 1,
      texture.offset?.[0] ?? 0,
      texture.offset?.[1] ?? 0,
      texture.translucent ?? false,
      texture.opacity ?? 1,
      depthFade,
    ].join("|");
    const cached = materialCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const materialProps: MeshStandardMaterialParameters = {
      map: textureMap,
      roughness: 1,
      metalness: 0,
    };

    if (texture.translucent) {
      materialProps.transparent = true;
      materialProps.alphaTest = 0.2;
    }

    // Semi-transparent surfaces (water) must not write depth: they would
    // z-reject the faded terrain behind them and break blending order.
    if ((texture.opacity ?? 1) < 1) {
      materialProps.depthWrite = false;
    }

    if (texture.opacity) {
      materialProps.opacity = texture.opacity;
    }

    const material = new MeshStandardMaterial(materialProps);
    if (depthFade) {
      applyTerrainVisibility(material);
    }

    materialCache.set(cacheKey, material);
    return material;
  }, [
    textureMap,
    texture.path,
    texture.repeat,
    texture.offset,
    texture.opacity,
    texture.translucent,
    depthFade,
  ]);
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
