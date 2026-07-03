import { memo, useContext, useRef } from "react";
import type { Material, Mesh } from "three";
import {
  getFringeShadowDepthMaterial,
  type MaterialTextureProps,
  useTextureMaterial,
} from "../../lib/texture";
import type { CommonProps } from "../common/types";
import { FringeFadeContext } from "./fringe/fringe-fade-context";

/** True for a face means the neighbor on that side fully hides it. */
export interface FaceOcclusion {
  top: boolean;
  bottom: boolean;
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface BlockProps extends CommonProps {
  texture: {
    top: MaterialTextureProps;
    side: MaterialTextureProps;
  };
  id: number;
  occludedFaces: FaceOcclusion;
}

function Block({
  position = [0, 0, 0],
  size = 1,
  rotation = [0, 0, 0],
  texture: { top, side },
  id: _id,
  occludedFaces,
}: BlockProps) {
  const depthFade = useContext(FringeFadeContext);
  const topTexture = useTextureMaterial(top, depthFade);
  const sideTexture = useTextureMaterial(side, depthFade);
  const meshRef = useRef<Mesh>(null);

  return (
    <group position={position} scale={[size, size, size]} rotation={rotation}>
      <mesh
        ref={meshRef}
        position={[0.5, 0.5, 0.5]}
        castShadow
        receiveShadow
        // Shadow pass discards faded fragments so invisible blocks don't
        // darken the visible terrain.
        customDepthMaterial={
          depthFade ? getFringeShadowDepthMaterial() : undefined
        }
        material={
          // BoxGeometry material order: +x, -x, +y, -y, +z, -z.
          [
            occludedFaces.east ? null : sideTexture,
            occludedFaces.west ? null : sideTexture,
            occludedFaces.top ? null : topTexture,
            occludedFaces.bottom ? null : topTexture,
            occludedFaces.south ? null : sideTexture,
            occludedFaces.north ? null : sideTexture,
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

function occlusionEqual(a: FaceOcclusion, b: FaceOcclusion): boolean {
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
    occlusionEqual(previous.occludedFaces, next.occludedFaces)
  );
});
