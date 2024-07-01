import { MaterialTextureProps, useTextureMaterial } from "../../lib/texture";
import { useRef } from "react";
import { Material, Mesh } from "three";
import { CommonProps } from "../common/types";
import { WaterBlockAdjacency } from "./world";

export interface BlockProps extends CommonProps {
  texture: {
    top: MaterialTextureProps;
    side: MaterialTextureProps;
  };
  id: number;
  adjacentBlocks: WaterBlockAdjacency;
}

export default function Block({
  position = [0, 0, 0],
  size = 1,
  rotation = [0, 0, 0],
  texture: { top, side },
  id,
  adjacentBlocks,
}: BlockProps) {
  const isWater = id === 9;
  const topTexture = useTextureMaterial(top);
  const sideTexture = useTextureMaterial(side);
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
        castShadow
        receiveShadow
        material={
          [
            shouldRenderFace("east") ? sideTexture : null,
            shouldRenderFace("west") ? sideTexture : null,
            shouldRenderFace("top")? topTexture : null,
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
