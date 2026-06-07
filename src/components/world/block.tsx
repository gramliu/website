import { useRef } from "react";
import type { Material, Mesh } from "three";
import {
  type MaterialTextureProps,
  useTextureMaterial,
} from "../../lib/texture";
import type { CommonProps } from "../common/types";
import type { WaterBlockAdjacency } from "./world";

export interface BlockProps extends CommonProps {
  texture: {
    top: MaterialTextureProps;
    side: MaterialTextureProps;
  };
  id: number;
  adjacentBlocks: WaterBlockAdjacency;
  opacity?: number;
}

export default function Block({
  position = [0, 0, 0],
  size = 1,
  rotation = [0, 0, 0],
  texture: { top, side },
  id,
  adjacentBlocks,
  opacity = 1,
}: BlockProps) {
  const isWater = id === 9;
  const renderedTop = {
    ...top,
    translucent: top.translucent || opacity < 1,
    opacity: (top.opacity ?? 1) * opacity,
  };
  const renderedSide = {
    ...side,
    translucent: side.translucent || opacity < 1,
    opacity: (side.opacity ?? 1) * opacity,
  };
  const topTexture = useTextureMaterial(renderedTop);
  const sideTexture = useTextureMaterial(renderedSide);
  const meshRef = useRef<Mesh>(null);

  // Function to determine if a face should be rendered
  const shouldRenderFace = (face: string) => {
    if (!isWater) return true;
    return !adjacentBlocks[face as keyof WaterBlockAdjacency];
  };

  return (
    <group position={position} scale={[size, size, size]} rotation={rotation}>
      <mesh
        ref={meshRef}
        position={[0.5, 0.5, 0.5]}
        castShadow={opacity >= 0.95}
        receiveShadow
        material={
          [
            shouldRenderFace("east") ? sideTexture : null,
            shouldRenderFace("west") ? sideTexture : null,
            shouldRenderFace("top") ? topTexture : null,
            shouldRenderFace("bottom") ? topTexture : null,
            shouldRenderFace("south") ? sideTexture : null,
            shouldRenderFace("north") ? sideTexture : null,
          ] as Material[]
        }
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  );
}
