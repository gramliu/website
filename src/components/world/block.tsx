import { memo, useContext, useRef } from "react";
import type { Material, Mesh } from "three";
import {
  type MaterialTextureProps,
  useTextureMaterial,
} from "../../lib/texture";
import type { CommonProps } from "../common/types";
import { FringeFadeContext } from "./fringe/fringe-fade-context";
import type { WaterBlockAdjacency } from "./world";

export interface BlockProps extends CommonProps {
  texture: {
    top: MaterialTextureProps;
    side: MaterialTextureProps;
  };
  id: number;
  adjacentBlocks: WaterBlockAdjacency;
}

function Block({
  position = [0, 0, 0],
  size = 1,
  rotation = [0, 0, 0],
  texture: { top, side },
  id,
  adjacentBlocks,
}: BlockProps) {
  const isWater = id === 9;
  const depthFade = useContext(FringeFadeContext);
  const topTexture = useTextureMaterial(top, depthFade);
  const sideTexture = useTextureMaterial(side, depthFade);
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

function vec3Equal(
  a: [number, number, number] = [0, 0, 0],
  b: [number, number, number] = [0, 0, 0]
): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function adjacencyEqual(
  a: WaterBlockAdjacency,
  b: WaterBlockAdjacency
): boolean {
  return (
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.north === b.north &&
    a.south === b.south &&
    a.east === b.east &&
    a.west === b.west
  );
}

/**
 * Memoized so that render-window updates (which recreate the cell list every
 * time the player crosses a cell boundary) only re-render blocks that
 * actually changed.
 */
export default memo(Block, (previous, next) => {
  return (
    previous.id === next.id &&
    previous.size === next.size &&
    previous.texture === next.texture &&
    vec3Equal(previous.position, next.position) &&
    vec3Equal(previous.rotation, next.rotation) &&
    adjacencyEqual(previous.adjacentBlocks, next.adjacentBlocks)
  );
});
