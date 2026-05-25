import { BufferGeometry, Float32BufferAttribute } from "three";

interface Props {
  x: number;
  z: number;
  y: number;
  opacity: number;
}

function createTileGeometry(): BufferGeometry {
  // Bottom face outline of a 1x1 block on the XZ plane (local y = 0).
  const geometry = new BufferGeometry();
  const vertices = new Float32Array([
    0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
  ]);

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  return geometry;
}

const tileGeometry = createTileGeometry();

export default function GridTile({ x, z, y, opacity }: Props) {
  return (
    <lineSegments geometry={tileGeometry} position={[x, y, z]}>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}
