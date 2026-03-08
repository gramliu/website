import { useFrame, type Vector3 } from "@react-three/fiber";
import { forwardRef, type Ref } from "react";
import type { Group } from "three";
import { useTextureMaterial } from "../../lib/texture";
import type { EntityTextureProps } from "./entities";

export interface EntityPartRefProps {
  size: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  pivotOffset?: [number, number, number];
}

export interface EntityPartProps extends EntityPartRefProps {
  texture: EntityTextureProps;
}

export const EntityPart = forwardRef(function EntityPartInner(
  {
    position = [0, 0, 0],
    size,
    rotation,
    texture: { top, left, right, front, back, bottom },
    pivotOffset,
  }: EntityPartProps,
  ref: Ref<Group>
) {
  const topTexture = useTextureMaterial(top);
  const leftTexture = useTextureMaterial(left);
  const rightTexture = useTextureMaterial(right);
  const frontTexture = useTextureMaterial(front);
  const backTexture = useTextureMaterial(back);
  const bottomTexture = useTextureMaterial(bottom);

  useFrame(() => {
    if (position[0] === -2) {
    }
  });

  if (!pivotOffset) {
    return (
      <mesh
        position={position}
        castShadow
        rotation={rotation}
        material={[
          leftTexture,
          rightTexture,
          topTexture,
          bottomTexture,
          frontTexture,
          backTexture,
        ]}
      >
        <boxGeometry args={size} />
      </mesh>
    );
  } else {
    const offsetPosition: Vector3 = [
      position[0] + pivotOffset[0],
      position[1] + pivotOffset[1],
      position[2] + pivotOffset[2],
    ];

    // Negate pivot offset to get offset of entity
    const trueOffset: Vector3 = [
      -pivotOffset[0],
      -pivotOffset[1],
      -pivotOffset[2],
    ];

    return (
      <group position={offsetPosition} rotation={rotation} ref={ref}>
        <group position={trueOffset}>
          <mesh
            castShadow
            material={[
              leftTexture,
              rightTexture,
              topTexture,
              bottomTexture,
              frontTexture,
              backTexture,
            ]}
          >
            <boxGeometry args={size} />
          </mesh>
        </group>
      </group>
    );
  }
});
