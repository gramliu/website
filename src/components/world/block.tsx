import { MaterialTextureProps, useTextureMaterial } from "../../lib/texture";
import { CommonProps } from "../common/types";

export interface BlockProps extends CommonProps {
  texture: {
    top: MaterialTextureProps;
    side: MaterialTextureProps;
  };
}

export default function Block({
  position = [0, 0, 0],
  size = 1,
  rotation = [0, 0, 0],
  texture: { top, side },
}: BlockProps) {
  const topTexture = useTextureMaterial(top);
  const sideTexture = useTextureMaterial(side);

  return (
    <group position={position} scale={[size, size, size]} rotation={rotation}>
      <mesh
        position={[0.5, 0.5, 0.5]}
        castShadow
        receiveShadow
        material={[
          sideTexture,
          sideTexture,
          topTexture,
          topTexture,
          sideTexture,
          sideTexture,
        ]}
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  );
}
